"use server";

/**
 * app/actions/data.ts
 * Supabase 데이터 조회를 서버에서 실행하는 Server Actions
 * 브라우저가 아닌 서버에서 실행되므로 환경변수가 항상 안정적으로 로드됩니다.
 */

import { createClient } from "@supabase/supabase-js";
import type { Product, Review, Score } from "../types";

// 서버 액션 내에서 매번 fresh한 클라이언트를 생성
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// 공통 SELECT 쿼리 (products JOIN 포함)
const REVIEW_SELECT = `
  id, product_id, source, reviewer_type, review_text,
  rating, review_date, sentiment, sentiment_score,
  keywords, issue_type, ai_summary, created_at, review_id,
  products (id, brand_name, product_name, category, target_skin)
`.trim();

// ──────────────────────────────────────────────────────────
// 제품 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchProductsAction(): Promise<Product[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("id, brand_name, product_name, category, target_skin, created_at")
    .order("product_name", { ascending: true });

  if (error) {
    throw new Error("[fetchProductsAction] " + error.message);
  }
  return (data as Product[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// 최신 리뷰 조회
// ──────────────────────────────────────────────────────────
export async function fetchLatestReviewsAction(limit = 20): Promise<Review[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("[fetchLatestReviewsAction] " + error.message);
  }
  return (data as Review[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// 키워드 기반 리뷰 검색
// ──────────────────────────────────────────────────────────
export async function fetchReviewsByKeywordsAction(
  keywords: string[],
  limit = 20
): Promise<Review[]> {
  if (!keywords || keywords.length === 0) {
    return fetchLatestReviewsAction(limit);
  }

  const supabase = getSupabase();
  const orFilter = keywords.map((kw) => `review_text.ilike.%${kw}%`).join(",");

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .or(orFilter)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("[fetchReviewsByKeywordsAction] " + error.message);
  }
  return (data as Review[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// 특정 제품 리뷰만 조회
// ──────────────────────────────────────────────────────────
export async function fetchReviewsByProductAction(
  productId: string,
  limit = 20
): Promise<Review[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("[fetchReviewsByProductAction] " + error.message);
  }
  return (data as Review[]) ?? [];
}

