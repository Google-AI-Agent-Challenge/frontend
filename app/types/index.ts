/**
 * ============================================================
 * app/types/index.ts
 * ============================================================
 */

// ----------------------------------------------------------------
// 채팅 메시지 타입
// ----------------------------------------------------------------
export interface Message {
  role: "user" | "ai";
  content: string;
  createdAt?: Date;
  risingKeyword?: string;
  tags?: string[];
  keywords?: string[];
  matchedReviewIds?: string[];
  reviewCount?: number;
}

// ----------------------------------------------------------------
// 'products' 테이블/API 타입
// ----------------------------------------------------------------
export interface Product {
  /** UUID PK */
  id: string;

  /** 브랜드명 (예: 'IUNIK', 'Some By Mi') */
  brand_name: string;

  /** 제품명 (예: '당근 패드', '감자 패드') */
  product_name: string;

  /**
   * 카테고리 (예: 'pad', 'toner', 'cream')
   */
  category: string;

  /**
   * 타겟 피부 타입 (예: '민감성', '지성')
   * nullable
   */
  target_skin: string | null;

  /** 레코드 생성 시각, nullable */
  created_at: string | null;
}

// ----------------------------------------------------------------
// 'reviews' 테이블/API 타입 (products 정보 포함)
// ----------------------------------------------------------------
export interface Review {
  id: string;
  product_id: string;
  source: string;
  reviewer_type: string | null;
  review_text: string;
  rating: number;
  review_date: string;
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number | null;
  keywords: string[];
  issue_type: string | null;
  ai_summary: string | null;
  created_at: string | null;
  review_id: string | null;

  /**
   * DB FK 관계 혹은 API를 통해 포함되는 제품 정보
   * reviews.product_id → products.id
   */
  products?: Product | null;
}

// ----------------------------------------------------------------
// 스킨케어 속성 점수 타입
// ----------------------------------------------------------------
export interface Score {
  label: string;
  value: number;
  max: number;
}

// ----------------------------------------------------------------
// Gemini AI 응답 타입
// ----------------------------------------------------------------
export interface AiResponse {
  answer: string;
  keywords: string[];
  risingKeyword?: string;
  tags?: string[];
  matchedReviewIds?: string[];
}
