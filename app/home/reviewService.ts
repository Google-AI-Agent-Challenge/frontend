/**
 * ============================================================
 * app/home/reviewService.ts
 * ============================================================
 * Supabase 'reviews' + 'products' 테이블 데이터 조회 서비스 레이어
 * ============================================================
 */

import { supabase } from "../lib/supabase";
import type { Review, Product, Score } from "../types";

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

export async function fetchReviewsByKeywords(
  keywords: string[],
  limit: number = 20
): Promise<Review[]> {
  if (!keywords || keywords.length === 0) {
    return fetchLatestReviews(limit);
  }

  const orFilter = keywords
    .map((kw) => `review_text.ilike.%${kw}%`)
    .join(",");

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .or(orFilter)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviewService] fetchReviewsByKeywords 오류:", error.message);
    return [];
  }

  return (data as unknown as Review[]) ?? [];
}

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

export async function fetchProducts(category?: string): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, brand_name, product_name, category, target_skin, created_at")
    .order("product_name", { ascending: true });

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

export async function fetchReviewsByProduct(
  productId: string,
  limit: number = 20
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[reviewService] fetchReviewsByProduct 오류:", error.message);
    return [];
  }

  return (data as unknown as Review[]) ?? [];
}

export function filterNegativeReviews(reviews: Review[]): Review[] {
  return reviews.filter(
    (r) => r.sentiment === "negative" || r.rating <= 2
  );
}

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
