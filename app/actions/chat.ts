/**
 * ============================================================
 * app/actions/chat.ts
 * ============================================================
 * Gemini AI API를 호출하는 Server Action(서버 함수)입니다.
 *
 * "Server Action"이란?
 *   Next.js 13+ App Router에서 제공하는 기능으로,
 *   이 파일의 함수들은 서버에서만 실행됩니다.
 *   덕분에 GEMINI_API_KEY 같은 비밀 키가 브라우저에 노출되지 않습니다.
 *
 *   클라이언트 컴포넌트(use client)에서 이 함수를 import해서 호출하면,
 *   Next.js가 자동으로 HTTP 요청으로 변환해서 서버에 보내줍니다.
 *   마치 API Route처럼 동작하지만, 코드는 훨씬 간결합니다.
 *
 * "use server" 지시어:
 *   파일 맨 위에 이 한 줄을 쓰면, 파일 전체가 서버 전용이 됩니다.
 * ============================================================
 */

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiResponse } from "../types";

// ----------------------------------------------------------------
// Gemini 클라이언트 초기화
// ----------------------------------------------------------------

// 사용할 Gemini 모델
const MODEL_NAME = "gemini-2.5-flash";

// ----------------------------------------------------------------
// 메인 Server Action: 사용자 메시지 처리
// ----------------------------------------------------------------

/**
 * 사용자의 채팅 입력을 받아 Gemini AI에 전달하고 응답을 반환합니다.
 *
 * 이 함수의 역할:
 *   1. 사용자 질문을 Gemini에게 보내 AI 답변 생성
 *   2. 같은 요청에서 핵심 키워드도 함께 추출
 *   3. { answer, keywords } 객체를 클라이언트에 반환
 *
 * @param userInput - 사용자가 입력한 텍스트 (예: "이번 주 트러블 리뷰 보여줘")
 * @returns AiResponse - { answer: string; keywords: string[] }
 */
export async function sendMessage(userInput: string): Promise<AiResponse> {
  // 입력 유효성 검사: 빈 문자열이면 바로 반환
  if (!userInput.trim()) {
    return { answer: "질문을 입력해주세요.", keywords: [] };
  }

  try {
    // 함수 내부에서 클라이언트 초기화 (모듈 로드 시점의 환경변수 누락 방지)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // ----------------------------------------------------------------
    // AI에게 보낼 프롬프트 구성
    //
    // Gemini에게 두 가지를 동시에 요청합니다:
    //   1) 사용자 질문에 대한 자연스러운 한국어 답변
    //   2) 질문에서 추출한 핵심 키워드 (JSON 형식)
    //
    // JSON을 함께 요청하는 이유:
    //   별도 API 호출 없이 한 번에 키워드와 답변을 모두 받기 위해서입니다.
    // ----------------------------------------------------------------
    const prompt = `
당신은 스킨케어 브랜드의 AI 분석 어시스턴트입니다.
아래 사용자의 질문에 대해 답변하고, 질문에서 핵심 키워드를 추출해주세요.

[사용자 질문]
${userInput}

[응답 규칙]
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "answer": "여기에 친절하고 자연스러운 한국어 분석 답변을 작성하세요. 2~4문장 분량.",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}

[키워드 추출 규칙]
- 리뷰 검색에 유용한 한국어 단어만 추출하세요 (최대 5개)
- 예시: "트러블", "붉은기", "당근 패드", "발림성", "용기"
- 조사(이/가/을/를)는 제거하고 명사형으로 추출하세요
`.trim();

    // Gemini API 호출 (generateContent = 단발성 요청)
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // ----------------------------------------------------------------
    // 응답 파싱: Gemini가 반환한 JSON 텍스트를 파싱합니다.
    // ----------------------------------------------------------------
    try {
      // Gemini가 ```json ... ``` 마크다운 블록으로 감쌀 수도 있으므로 제거
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned) as {
        answer: string;
        keywords: string[];
      };

      return {
        answer: parsed.answer ?? "응답을 처리할 수 없었습니다.",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch {
      // JSON 파싱 실패 시 전체 텍스트를 answer로 사용
      console.error("[chat action] JSON 파싱 실패, 원본 텍스트로 대체:", rawText);
      return {
        answer: rawText || "AI 응답을 처리하는 중 오류가 발생했습니다.",
        keywords: extractKeywordsFallback(userInput),
      };
    }
  } catch (error) {
    // Gemini API 호출 자체가 실패한 경우 (네트워크 오류, 키 만료 등)
    console.error("[chat action] Gemini API 오류:", error);
    return {
      answer: "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      keywords: extractKeywordsFallback(userInput),
    };
  }
}

// ----------------------------------------------------------------
// 폴백 키워드 추출 (AI 실패 시 사용)
// ----------------------------------------------------------------

/**
 * Gemini API 실패 시 사용하는 간단한 키워드 추출 함수입니다.
 * 미리 정의된 키워드 사전과 사용자 입력을 비교해 매칭되는 단어를 반환합니다.
 *
 * @param text - 사용자 입력 텍스트
 */
function extractKeywordsFallback(text: string): string[] {
  // 스킨케어 관련 주요 키워드 사전
  const dictionary = [
    "트러블", "붉은기", "여드름", "좁쌀", "따가움",
    "발림성", "제형", "흡수", "촉촉",
    "용기", "디자인", "포장",
    "당근", "감자", "도토리", "미나리",
    "패드", "성분", "진정",
  ];

  return dictionary.filter((kw) => text.includes(kw));
}
