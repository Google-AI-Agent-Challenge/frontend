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

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabase } from "../lib/supabase";
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
    // 1. 전체 리뷰 데이터 (최대 1000개) Supabase에서 조회
    const { data: rawReviews, error: dbError } = await supabase
      .from("reviews")
      .select(`
        review_text,
        rating,
        review_date,
        sentiment,
        keywords,
        issue_type,
        products (
          product_name
        )
      `)
      .order("review_date", { ascending: false })
      .limit(1000);

    if (dbError) {
      console.error("[chat action] Supabase 조회 실패:", dbError.message);
    }

    const reviews = (rawReviews as any[]) ?? [];
    const formattedReviews = reviews.map((r) => ({
      date: r.review_date,
      product: r.products?.product_name || "알수없음",
      rating: r.rating,
      sentiment: r.sentiment,
      text: r.review_text,
      keywords: r.keywords,
      issue: r.issue_type
    }));

    const reviewsContext = JSON.stringify(formattedReviews);

    // 함수 내부에서 클라이언트 초기화 (모듈 로드 시점의 환경변수 누락 방지)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            answer: { type: SchemaType.STRING },
            keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            risingKeyword: { type: SchemaType.STRING },
            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ["answer", "keywords", "risingKeyword", "tags"],
        },
      },
    });

    const currentDate = new Date().toISOString().slice(0, 10);
    const prompt = `
당신은 화장품 브랜드의 리뷰 VOC를 전문적으로 분석하는 AI 분석 어시스턴트입니다.
제공된 전체 리뷰 데이터(JSON)를 바탕으로 사용자의 질문에 정확하고 친절하게 답변해주세요.

[오늘 날짜]
${currentDate}

[리뷰 데이터]
${reviewsContext}

[사용자 질문]
${userInput}

[분석 및 응답 규칙]
1. 사용자가 특정 제품(예: 당근 패드, 감자 패드, 미나리 패드 등)이나 특정 키워드(예: 트러블, 발림성 등), 특정 기간(예: 이번 주, 이번 달 등)에 대해 묻는다면, 제공된 리뷰 데이터를 기반으로 실제로 일치하는 리뷰들을 필터링하고 정확히 분석 및 집계하세요.
   - '이번 주'는 [오늘 날짜] 기준 최근 7일(5월 17일 ~ 5월 23일)을 의미합니다.
   - '이번 달'은 5월 1일 ~ 5월 23일을 의미합니다.
   - 만약 트러블/부정 리뷰에 대해 묻는다면, 해당 기간에 발생한 부정적인 트러블 리뷰의 개수를 세고 지난주 또는 지난달과 비교하여 백분율(%) 변화를 계산하세요. (실제 데이터에 기반해 자유롭게 추정/계산하되, 너무 엉뚱하지 않게 하세요.)

2. 답변(answer) 구성 형식:
   - 첫 번째 줄: 분석 요약 설명 (예: "이번 주 '당근 패드'와 관련된 트러블 발생 리뷰가 15% 증가했습니다. 주요 언급 내용은 다음과 같습니다:")
   - 주요 언급 내용 리스트: 2~3개의 핵심 VOC 내용과 해당 내용에 포함된 실제 리뷰 개수 기재 (예:
     • 사용 후 붉은기 발생 (12건)
     • 좁쌀 여드름 유발 의심 (8건)
     • 따가움 호소 (5건)
     )
   - 인사이트 단락: 이 현상에 대한 원인 분석 및 제품 개선/마케팅 관점에서의 구체적이고 실용적인 인사이트 제안. "💡 인사이트: [내용]" 형식으로 명확히 구분하여 작성하세요.
   - 자연스러운 문장으로 줄바꿈(\n)을 활용해 가독성 높게 작성하세요.

3. JSON 필드 채우기 규칙:
   - answer: 위의 형식에 맞춰 작성한 답변 문자열.
   - keywords: 이 질문 및 분석과 직접적으로 관련된 핵심 키워드 목록 (예: ["트러블", "붉은기", "당근 패드"]).
   - risingKeyword: 이번 분석에서 가장 주목해야 하거나 급증한 단일 키워드 (예: "붉은기").
   - tags: 관련 해시태그 목록 (예: ["트러블", "당근패드"]). # 기호는 떼고 단어만 배열로 넣으세요.

반드시 아래 JSON 스키마를 엄격히 준수하여 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
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
        risingKeyword: string;
        tags: string[];
      };

      return {
        answer: parsed.answer ?? "응답을 처리할 수 없었습니다.",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        risingKeyword: parsed.risingKeyword || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    } catch {
      // JSON 파싱 실패 시 전체 텍스트를 answer로 사용
      console.error("[chat action] JSON 파싱 실패, 원본 텍스트로 대체:", rawText);
      return {
        answer: rawText || "AI 응답을 처리하는 중 오류가 발생했습니다.",
        keywords: extractKeywordsFallback(userInput),
        risingKeyword: undefined,
        tags: [],
      };
    }
  } catch (error) {
    // Gemini API 호출 자체가 실패한 경우 (네트워크 오류, 키 만료 등)
    console.error("[chat action] Gemini API 오류:", error);
    return {
      answer: "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      keywords: extractKeywordsFallback(userInput),
      risingKeyword: undefined,
      tags: [],
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
