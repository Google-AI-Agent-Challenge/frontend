/**
 * ============================================================
 * app/services/reviewService.ts
 * ============================================================
 * Supabase 'reviews' + 'products' 테이블 데이터 조회 서비스 레이어
 *
 * Supabase FK JOIN 방식:
 *   reviews 테이블의 product_id 컬럼이 products.id를 참조(FOREIGN KEY)하므로
 *   select("*, products(...)") 로 한 번의 쿼리에 제품 정보를 함께 가져올 수 있습니다.
 *   별도의 JOIN SQL 문 없이 Supabase가 자동으로 처리해줍니다.
 * ============================================================
 */

import { supabase } from "../lib/supabase";
import type { Review, Product, Score } from "../types";

// ----------------------------------------------------------------
// 공통 SELECT 구문 (reviews + products 정보 JOIN)
// ----------------------------------------------------------------
// products(...) 부분은 FK 관계를 통해 연결된 products 테이블 컬럼을 함께 가져옵니다.
const REVIEW_SELECT = `
  id,
  product_id,
  source,
  reviewer_type,
  review_text,
  rating,
  review_date,
  sentiment,
  sentiment_score,
  keywords,
  issue_type,
  ai_summary,
  created_at,
  review_id,
  products (
    id,
    brand_name,
    product_name,
    category,
    target_skin
  )
`.trim();

// ----------------------------------------------------------------
// 1. 키워드 기반 리뷰 검색 (products JOIN 포함)
// ----------------------------------------------------------------

/**
 * AI가 추출한 키워드 배열로 관련 리뷰를 검색합니다.
 * review_text 본문에서 OR 조건으로 키워드를 검색하며,
 * 각 리뷰에 연결된 제품(products) 정보도 함께 가져옵니다.
 *
 * @param keywords - 검색 키워드 배열 (예: ['트러블', '붉은기'])
 * @param limit    - 최대 반환 건수 (기본 20)
 */
export async function fetchReviewsByKeywords(
  keywords: string[],
  limit: number = 20
): Promise<Review[]> {
  if (!keywords || keywords.length === 0) {
    return fetchLatestReviews(limit);
  }

  // 각 키워드를 review_text에서 대소문자 무시(ilike)로 OR 검색
  const orFilter = keywords
    .map((kw) => `review_text.ilike.%${kw}%`)
    .join(",");

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)           // products 테이블 JOIN 포함
    .or(orFilter)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviewService] fetchReviewsByKeywords 오류:", error.message);
    return [];
  }

  return (data as unknown as Review[]) ?? [];
}

// ----------------------------------------------------------------
// 2. 최신 리뷰 조회 (초기 로드)
// ----------------------------------------------------------------

/**
 * 최신 리뷰를 가져옵니다 (products JOIN 포함).
 * 페이지 첫 로드 시 AnalyticsPanel 초기값으로 사용합니다.
 *
 * @param limit - 최대 건수 (기본 20)
 */
export async function fetchLatestReviews(limit: number = 20): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviewService] fetchLatestReviews 오류:", error.message);
    return [];
  }

  return (data as unknown as Review[]) ?? [];
}

// ----------------------------------------------------------------
// 3. 전체 제품 목록 조회 (AnalyticsPanel 패드 라인업용)
// ----------------------------------------------------------------

/**
 * products 테이블에서 전체 제품 목록을 가져옵니다.
 * AnalyticsPanel 하단의 "패드 레시피 라인업" 버튼을 동적으로 렌더링하는 데 씁니다.
 *
 * @param category - 카테고리 필터 (예: 'pad'). 없으면 전체 제품 반환
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, brand_name, product_name, category, target_skin, created_at")
    .order("product_name", { ascending: true });

  // 카테고리 필터가 있으면 적용
  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[reviewService] fetchProducts 오류:", error.message);
    return [];
  }

  return (data as Product[]) ?? [];
}

// ----------------------------------------------------------------
// 4. 특정 제품의 리뷰만 조회
// ----------------------------------------------------------------

/**
 * 특정 product_id에 해당하는 리뷰만 가져옵니다.
 * 패드 라인업 버튼 클릭 시 해당 제품의 리뷰로 필터링할 때 사용합니다.
 *
 * @param productId - 조회할 제품의 UUID
 * @param limit     - 최대 건수 (기본 20)
 */
export async function fetchReviewsByProduct(
  productId: string,
  limit: number = 20
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)           // product_id가 일치하는 리뷰만
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviewService] fetchReviewsByProduct 오류:", error.message);
    return [];
  }

  return (data as unknown as Review[]) ?? [];
}

// ----------------------------------------------------------------
// 5. 부정 리뷰 필터링
// ----------------------------------------------------------------

/**
 * sentiment 컬럼이 'negative'이거나 rating이 2 이하인 리뷰를 반환합니다.
 *
 * @param reviews - 전체 리뷰 배열
 */
export function filterNegativeReviews(reviews: Review[]): Review[] {
  return reviews.filter(
    (r) => r.sentiment === "negative" || r.rating <= 2
  );
}

// ----------------------------------------------------------------
// 6. 속성 점수 계산 (sentiment_score 우선 사용)
// ----------------------------------------------------------------

/**
 * 리뷰 배열을 분석해 스킨케어 속성별 점수를 계산합니다.
 *
 * 우선순위:
 *   1) sentiment_score (0~1) 값이 있으면 그대로 100점 환산
 *   2) rating (1~5) → (rating-1)/4 → 100점 환산
 *
 * @param reviews - 분석할 리뷰 배열
 */
export function calculateScores(reviews: Review[]): Score[] {
  const attributes: {
    label: string;
    keywords: string[];
    issueTypes: string[];
  }[] = [
    {
      label: "성분 / 트러블",
      keywords: ["트러블", "성분", "붉은기", "여드름", "좁쌀", "따가움", "자극"],
      issueTypes: ["트러블", "성분", "자극"],
    },
    {
      label: "제형 / 발림성",
      keywords: ["발림성", "제형", "흡수", "촉촉", "텍스처", "밀림", "끈적"],
      issueTypes: ["발림성", "제형"],
    },
    {
      label: "용기 / 디자인",
      keywords: ["용기", "디자인", "패키지", "포장", "뚜껑", "불량"],
      issueTypes: ["용기불량", "용기", "디자인"],
    },
  ];

  return attributes.map(({ label, keywords, issueTypes }) => {
    const related = reviews.filter((r) => {
      if (r.issue_type && issueTypes.some((t) => r.issue_type!.includes(t))) {
        return true;
      }
      return keywords.some((kw) =>
        r.review_text?.toLowerCase().includes(kw.toLowerCase())
      );
    });

    if (related.length === 0) {
      return { label, value: 50, max: 100 };
    }

    const avgScore =
      related.reduce((sum, r) => {
        if (r.sentiment_score !== null && r.sentiment_score !== undefined) {
          return sum + Number(r.sentiment_score);
        }
        return sum + (r.rating - 1) / 4;
      }, 0) / related.length;

    const score = Math.round(avgScore * 100);
    return { label, value: Math.max(1, Math.min(100, score)), max: 100 };
  });
}
