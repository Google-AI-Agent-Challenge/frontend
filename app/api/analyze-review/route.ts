import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// 환경 변수 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// .env.local에 저장된 키를 사용하도록 수정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALLOWED_SENTIMENTS = ["positive", "neutral", "negative"];

function clampScore(value: any) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0.5;
  if (number < 0) return 0;
  if (number > 1) return 1;
  return Number(number.toFixed(3));
}

function normalizeKeywords(keywords: any) {
  if (!Array.isArray(keywords)) return ["일반 의견"];
  const cleaned = keywords
    .map((k) => String(k).trim())
    .filter((k) => k.length > 0);
  const unique = [...new Set(cleaned)];
  return unique.length > 0 ? unique.slice(0, 5) : ["일반 의견"];
}

function normalizeAnalysis(analysis: any) {
  const sentiment = ALLOWED_SENTIMENTS.includes(analysis?.sentiment)
    ? analysis.sentiment
    : "neutral";

  return {
    sentiment,
    sentiment_score: clampScore(analysis?.sentiment_score),
    keywords: normalizeKeywords(analysis?.keywords),
    issue_type: analysis?.issue_type ? String(analysis.issue_type).trim() : "일반 의견",
    ai_summary: analysis?.ai_summary
      ? String(analysis.ai_summary).trim()
      : "리뷰 내용을 기반으로 자동 분석한 결과입니다.",
  };
}

function fallbackAnalyze(reviewText: string, rating: number) {
  const text = String(reviewText);
  const score = Number(rating);

  const negativeContext =
    text.includes("트러블") || text.includes("따가") || text.includes("붉") ||
    text.includes("홍조") || text.includes("자극") || text.includes("안 맞") ||
    text.includes("뒤집") || text.includes("가려");

  const positiveContext =
    text.includes("촉촉") || text.includes("보습") || text.includes("진정") ||
    text.includes("만족") || text.includes("재구매") || text.includes("인생템") ||
    text.includes("찐템") || text.includes("좋");

  const fragranceContext = text.includes("향") || text.includes("냄새") || text.includes("인공향");
  const textureContext = text.includes("끈적") || text.includes("답답") || text.includes("흡수");

  if (negativeContext && score <= 3) {
    const keywords = [];
    if (text.includes("트러블")) keywords.push("트러블");
    if (text.includes("홍조") || text.includes("붉")) keywords.push("홍조/붉어짐");
    if (text.includes("따가")) keywords.push("따가움");
    if (text.includes("자극")) keywords.push("피부 자극");
    if (text.includes("뒤집")) keywords.push("피부 뒤집어짐");
    if (text.includes("가려")) keywords.push("가려움");

    return {
      sentiment: "negative",
      sentiment_score: 0.18,
      keywords: keywords.length > 0 ? keywords : ["피부 반응"],
      issue_type: "피부 트러블",
      ai_summary: "피부 반응이나 낮은 평점이 포함된 부정 리뷰입니다.",
    };
  }

  if (fragranceContext && score <= 3) {
    return {
      sentiment: "negative",
      sentiment_score: 0.3,
      keywords: ["향", "냄새"],
      issue_type: "향 불만",
      ai_summary: "향이나 냄새에 대한 불만이 포함된 리뷰입니다.",
    };
  }

  if (textureContext && score <= 3) {
    return {
      sentiment: "negative",
      sentiment_score: 0.35,
      keywords: ["사용감", "흡수", "끈적임"],
      issue_type: "사용감 불만",
      ai_summary: "흡수감이나 끈적임 등 사용감 불만이 포함된 리뷰입니다.",
    };
  }

  if (positiveContext && score >= 4) {
    const keywords = [];
    if (text.includes("촉촉")) keywords.push("촉촉함");
    if (text.includes("보습")) keywords.push("보습");
    if (text.includes("진정")) keywords.push("진정");
    if (text.includes("재구매")) keywords.push("재구매");
    if (text.includes("만족")) keywords.push("만족");

    return {
      sentiment: "positive",
      sentiment_score: 0.86,
      keywords: keywords.length > 0 ? keywords : ["만족"],
      issue_type: "긍정 사용감",
      ai_summary: "제품 사용감이나 효과에 대한 만족이 포함된 긍정 리뷰입니다.",
    };
  }

  return {
    sentiment: "neutral",
    sentiment_score: 0.5,
    keywords: ["일반 의견"],
    issue_type: "일반 의견",
    ai_summary: "긍정과 부정이 뚜렷하지 않은 중립 리뷰입니다.",
  };
}

async function analyzeWithGemini(reviewText: string, rating: number) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          sentiment: { type: SchemaType.STRING, enum: ["positive", "neutral", "negative"] },
          sentiment_score: { type: SchemaType.NUMBER },
          keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          issue_type: { type: SchemaType.STRING },
          ai_summary: { type: SchemaType.STRING },
        },
        required: ["sentiment", "sentiment_score", "keywords", "issue_type", "ai_summary"],
      },
    },
  });

  const prompt = `
너는 H&B 스토어 입점 화장품 브랜드사를 위한 리뷰 VOC 분석 엔진이다.
아래 리뷰 원문과 사용자 평점을 함께 보고 분석해라.
단어 하나만 보고 기계적으로 판단하지 말고, 문맥과 별점을 함께 고려해라.

리뷰 원문: ${reviewText}
사용자 평점: ${rating}

판단 기준:
1. sentiment는 positive, neutral, negative 중 하나만 선택한다.
2. 별점 1~2점은 부정 가능성이 높지만, 리뷰 문맥을 함께 확인한다.
3. 별점 4~5점은 긍정 가능성이 높지만, 명확한 부작용이나 불만이 있으면 neutral 또는 negative가 될 수 있다.
4. "홍조가 생겼다", "얼굴이 붉어졌다", "따갑다", "트러블이 올라왔다"는 부정 VOC로 본다.
5. "홍조가 진정됐다", "트러블이 줄었다", "붉은기가 가라앉았다"는 긍정 효과로 본다.
6. "향은 좋은데 끈적임이 있다"처럼 장단점이 섞이면 neutral로 분류한다.
7. keywords는 리뷰 원문에서 중요한 한국어 키워드 2~5개를 추출한다.
8. issue_type은 아래 후보 중 가장 가까운 하나로 선택한다.
   - 피부 트러블, 홍조/붉어짐, 피부 자극, 향 불만, 사용감 불만, 보습력 부족, 패키징 불량, 가격 불만, 긍정 보습감, 긍정 진정 효과, 긍정 재구매, 일반 의견
9. ai_summary는 브랜드 담당자가 바로 이해할 수 있게 한 문장으로 작성한다.
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, review_text, rating, reviewer_type } = body;

    if (!product_id || !review_text || !rating) {
      return NextResponse.json({ error: "product_id, review_text, rating are required" }, { status: 400 });
    }

    let engine = "gemini_api";
    let rawAnalysis;

    try {
      rawAnalysis = await analyzeWithGemini(review_text, rating);
    } catch (geminiError) {
      console.error("Gemini API 실패:", geminiError);
      engine = "rule_based_fallback";
      rawAnalysis = fallbackAnalyze(review_text, rating);
    }

    const analysis = normalizeAnalysis(rawAnalysis);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id,
        source: engine,
        reviewer_type: reviewer_type || "일반 사용자",
        review_text,
        rating: Number(rating),
        review_date: new Date().toISOString().slice(0, 10),
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        keywords: analysis.keywords,
        issue_type: analysis.issue_type,
        ai_summary: analysis.ai_summary,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Supabase insert failed", detail: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "review analyzed and saved",
      engine,
      analysis,
      saved_review: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "server error", detail: error.message }, { status: 500 });
  }
}
