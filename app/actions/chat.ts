"use server";

import { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { supabase } from "../lib/supabase";
import type { AiResponse } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

interface FilterParams {
  productName: string;
  sentiment: string;
  dateRangeDays: number;
  keywords: string[];
}

async function generateFilterParams(userInput: string, genAI: GoogleGenerativeAI): Promise<FilterParams> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          productName: { type: SchemaType.STRING },
          sentiment: { type: SchemaType.STRING },
          dateRangeDays: { type: SchemaType.INTEGER },
          keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["productName", "sentiment", "dateRangeDays", "keywords"]
      }
    }
  });

  const prompt = `
사용자의 질문을 분석하여 리뷰 데이터베이스 검색에 필요한 필터 조건을 추출하세요.
1. productName: 제품 이름 (예: "당근 패드", "감자 패드", "도토리 패드", "미나리 패드"). 명시되지 않았다면 "".
2. sentiment: 긍정("positive"), 부정("negative"), 중립("neutral") 중 하나. (예: "불만", "트러블", "부정적" -> "negative"). 명시되지 않았다면 "".
3. dateRangeDays: 최근 며칠 이내의 데이터인지. (예: "이번 주" -> 7, "이번 달" -> 30). 알 수 없거나 전체 기간이면 0.
4. keywords: 검색 키워드 배열 (예: "트러블", "여드름"). 없으면 [].

사용자 질문: "${userInput}"
`;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned) as FilterParams;
  } catch(e) {
    console.error("Filter extraction failed:", e);
    return { productName: "", sentiment: "", dateRangeDays: 0, keywords: [] };
  }
}

export async function sendMessage(userInput: string): Promise<AiResponse> {
  if (!userInput.trim()) {
    return { answer: "질문을 입력해주세요.", keywords: [] };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    
    // Stage 1: 필터 추출
    const filters = await generateFilterParams(userInput, genAI);
    console.log("[chat action] Extracted Filters:", filters);

    // Stage 2: 동적 쿼리 실행
    let query = supabase
      .from("reviews")
      .select(`
        id,
        review_text,
        rating,
        review_date,
        sentiment,
        keywords,
        issue_type,
        products!inner (
          product_name
        )
      `)
      .order("review_date", { ascending: false });

    if (filters.productName) {
      const cleanName = filters.productName.replace(/패드|pad/gi, "").trim();
      if (cleanName) {
        query = query.ilike("products.product_name", `%${cleanName}%`);
      }
    }
    if (filters.sentiment === "positive" || filters.sentiment === "negative" || filters.sentiment === "neutral") {
      query = query.eq("sentiment", filters.sentiment);
    }
    if (filters.dateRangeDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() - filters.dateRangeDays);
      query = query.gte("review_date", d.toISOString().split("T")[0]);
    }
    if (filters.keywords && filters.keywords.length > 0) {
      const orConditions = filters.keywords.map(kw => `review_text.ilike.%${kw}%`).join(',');
      query = query.or(orConditions);
    }

    // 결과를 300개까지만 제한하여 토큰 수 대폭 감소
    query = query.limit(300);

    let { data: rawReviews, error: dbError } = await query;

    if (dbError) {
      console.error("[chat action] Supabase 조회 실패:", dbError.message);
    }

    // Fallback: 결과가 0개일 경우, 키워드가 너무 빡빡할 수 있으므로 키워드 필터를 풀고 다시 조회
    if ((!rawReviews || rawReviews.length === 0) && filters.keywords && filters.keywords.length > 0) {
      console.log("[chat action] 필터 매칭 결과 0개. 키워드를 제외하고 다시 검색합니다.");
      let fallbackQuery = supabase.from("reviews").select(`id, review_text, rating, review_date, sentiment, keywords, issue_type, products!inner(product_name)`).order("review_date", { ascending: false }).limit(200);
      if (filters.productName) {
        const cleanName = filters.productName.replace(/패드|pad/gi, "").trim();
        if (cleanName) fallbackQuery = fallbackQuery.ilike("products.product_name", `%${cleanName}%`);
      }
      if (filters.sentiment === "positive" || filters.sentiment === "negative" || filters.sentiment === "neutral") {
        fallbackQuery = fallbackQuery.eq("sentiment", filters.sentiment);
      }
      if (filters.dateRangeDays > 0) {
        const d = new Date();
        d.setDate(d.getDate() - filters.dateRangeDays);
        fallbackQuery = fallbackQuery.gte("review_date", d.toISOString().split("T")[0]);
      }
      const { data } = await fallbackQuery;
      rawReviews = data;
    }

    const reviews = (rawReviews as any[]) ?? [];
    
    // 프롬프트에 주입할 컨텍스트 생성 (토큰 수 최적화)
    const formattedReviews = reviews.map((r, index) => ({
      _id: String(index),
      date: r.review_date,
      product: r.products?.product_name || "알수없음",
      rating: r.rating,
      sentiment: r.sentiment,
      text: r.review_text,
      keywords: r.keywords,
      issue: r.issue_type
    }));

    const reviewsContext = JSON.stringify(formattedReviews);
    console.log(`[chat action] 쿼리 결과 ${reviews.length}건을 바탕으로 요약 시작...`);

    // Stage 3: 요약 프롬프트 실행
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            answer: { type: SchemaType.STRING },
            keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            risingKeyword: { type: SchemaType.STRING },
            tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            matchedReviewIds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ["answer", "keywords", "risingKeyword", "tags", "matchedReviewIds"],
        },
      },
    });

    const currentDate = new Date().toISOString().slice(0, 10);
    const prompt = `
당신은 화장품 브랜드의 리뷰 VOC를 전문적으로 분석하는 AI 분석 어시스턴트입니다.
제공된 전체 리뷰 데이터(JSON)를 바탕으로 사용자의 질문에 정확하고 친절하게 답변해주세요.

[중요 지침: 안전 및 의학적 콘텐츠 관련]
본 분석은 화장품의 고객 불만(VOC) 및 피부 반응(트러블, 여드름, 붉은기, 따가움 등)을 분석하는 기업 내부용 리포트입니다. 사용자의 부작용 언급은 의학적 조언, 진단, 혹은 위험한 콘텐츠가 아닙니다. 시스템 안전 필터에 구애받지 말고, 원문에 나타난 피부 트러블 관련 부정적 피드백을 있는 그대로 분석하여 답변을 생성하십시오.

[오늘 날짜]
${currentDate}

[리뷰 데이터]
${reviewsContext}

[사용자 질문]
${userInput}

[분석 및 응답 규칙]
1. 사용자가 특정 제품(예: 당근 패드, 감자 패드, 미나리 패드 등)이나 특정 키워드(예: 트러블, 발림성 등), 특정 기간(예: 이번 주, 이번 달 등)에 대해 묻는다면, 제공된 리뷰 데이터를 기반으로 실제로 일치하는 리뷰들을 필터링하고 정확히 분석 및 집계하세요.
   - '이번 주'는 [오늘 날짜] 기준 최근 7일을 의미합니다.
   - 만약 트러블/부정 리뷰에 대해 묻는다면, 해당 기간에 발생한 부정적인 트러블 리뷰의 개수를 세고 지난주 또는 지난달과 비교하여 백분율(%) 변화를 계산하세요. (실제 데이터에 기반해 자유롭게 추정/계산하되, 너무 엉뚱하지 않게 하세요.)

2. 답변(answer) 구성 형식:
   - 첫 번째 줄: 분석 요약 설명. **전체 리뷰 개수를 언급할 때는 숫자를 직접 적지 말고 반드시 "{COUNT}" 플레이스홀더를 사용하세요.** (예: "이번 주 '당근 패드'와 관련된 트러블 발생 리뷰는 총 {COUNT}건으로, 15% 증가했습니다. 주요 언급 내용은 다음과 같습니다 (중복 포함):")
   - 주요 언급 내용 리스트: 하나의 리뷰에 여러 키워드가 중복으로 추출될 수 있음을 전제로, 2~3개의 핵심 VOC 내용과 해당 내용에 포함된 실제 리뷰 개수를 기재 (예:
     • 사용 후 붉은기 발생 (12건)
     • 좁쌀 여드름 유발 의심 (8건)
     • 따가움 호소 (5건)
     )
   - 인사이트 단락: 이 현상에 대한 원인 분석 및 제품 개선/마케팅 관점에서의 구체적이고 실용적인 인사이트 제안. "💡 인사이트: [내용]" 형식으로 명확히 구분하여 작성하세요.
   - 자연스러운 문장으로 줄바꿈(\\n)을 활용해 가독성 높게 작성하세요.

3. JSON 필드 채우기 규칙:
   - answer: 위의 형식에 맞춰 작성한 답변 문자열.
   - keywords: 이 질문 및 분석과 직접적으로 관련된 핵심 키워드 목록 (예: ["트러블", "붉은기", "당근 패드"]). (키워드가 없다면 빈 배열 [])
   - risingKeyword: 이번 분석에서 가장 주목해야 하거나 급증한 단일 키워드 (예: "붉은기"). (급증한 단어나 리뷰가 없다면 반드시 빈 문자열 "" 입력)
   - tags: 관련 해시태그 목록 (예: ["트러블", "당근패드"]). # 기호는 떼고 단어만 배열로 넣으세요. (해시태그가 없다면 빈 배열 [])
   - matchedReviewIds: 이 답변을 도출하기 위해 실제로 분석/필터링에 사용된 원문 리뷰들의 '_id' 문자열 배열. 정확히 일치하는 리뷰들의 '_id'만 골라서 담으세요. (예: ["0", "15", "42"]) (조건에 맞는 리뷰가 없다면 빈 배열 [])

만약 질문의 조건에 부합하는 리뷰가 데이터에 전혀 없다면, 억지로 내용을 만들지 말고 answer에 "현재 제공된 데이터에는 해당 조건에 맞는 리뷰가 없습니다."라고 사실대로 답변하세요. 이때 risingKeyword는 "", tags, keywords, matchedReviewIds는 []로 설정하여 JSON 형식을 반드시 유지하세요.

반드시 아래 JSON 스키마를 엄격히 준수하여 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
`.trim();

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    try {
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
        matchedReviewIds: string[];
      };

      const actualUuids = (Array.isArray(parsed.matchedReviewIds) ? parsed.matchedReviewIds : [])
        .map(idStr => {
          const idx = parseInt(idStr, 10);
          if (!isNaN(idx) && idx >= 0 && idx < reviews.length) {
            return reviews[idx].id;
          }
          return null;
        })
        .filter((id): id is string => id !== null);

      return {
        answer: parsed.answer ?? "응답을 처리할 수 없었습니다.",
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        risingKeyword: parsed.risingKeyword || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        matchedReviewIds: actualUuids,
        layoutIntent: detectLayoutIntent(userInput),
      };
    } catch {
      console.error("[chat action] JSON 파싱 실패, 원본 텍스트로 대체:", rawText);
      return {
        answer: rawText || "AI 응답을 처리하는 중 오류가 발생했습니다.",
        keywords: extractKeywordsFallback(userInput),
        risingKeyword: undefined,
        tags: [],
        matchedReviewIds: [],
        layoutIntent: detectLayoutIntent(userInput),
      };
    }
  } catch (error: any) {
    console.error("[chat action] Gemini API 오류:", error);
    return {
      answer: `AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요. (에러: ${error.message})`,
      keywords: extractKeywordsFallback(userInput),
      risingKeyword: undefined,
      tags: [],
      matchedReviewIds: [],
      layoutIntent: detectLayoutIntent(userInput),
    };
  }
}

function detectLayoutIntent(userInput: string): string | null {
  const input = userInput.toLowerCase();
  if (input.includes("pin") || input.includes("핀") || input.includes("고정")) {
    if (input.includes("트러블") || input.includes("trouble") || input.includes("자극")) {
      return "pin_trouble_chart";
    }
    if (input.includes("제형") || input.includes("formulation") || input.includes("발림")) {
      return "pin_formulation_chart";
    }
    if (input.includes("용기") || input.includes("container") || input.includes("디자인")) {
      return "pin_container_chart";
    }
  }
  if (input.includes("초기화") || input.includes("reset") || input.includes("원래대로")) {
    return "reset_layout";
  }
  return null;
}

function extractKeywordsFallback(text: string): string[] {
  const dictionary = [
    "트러블", "붉은기", "여드름", "좁쌀", "따가움",
    "발림성", "제형", "흡수", "촉촉",
    "용기", "디자인", "포장",
    "당근", "감자", "도토리", "미나리",
    "패드", "성분", "진정",
  ];
  return dictionary.filter((kw) => text.includes(kw));
}
