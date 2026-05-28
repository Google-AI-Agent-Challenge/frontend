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
// FastAPI 하이브리드 리다이렉트 연동부
// ──────────────────────────────────────────────────────────
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

let cachedToken: string | null = null;

async function getAccessToken(): Promise<string> {
  // 프로토타입 단계: JWT 인증 비활성화로 빈 토큰 반환
  return "";
}

function isFastAPIEnabled(): boolean {
  return !!FASTAPI_URL && !FASTAPI_URL.startsWith("your-") && FASTAPI_URL !== "";
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${FASTAPI_URL}/api/v1${path}`;
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    throw new Error(`[FastAPI Request Failed] ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface StatisticsData {
  product_id: string | null;
  period: number;
  total_reviews: number;
  average_rating: number;
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  attribute_scores: { ingredients: number; formulation: number; container: number };
  ai_briefing: string;
}

// ──────────────────────────────────────────────────────────
// 제품 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchProductsAction(): Promise<Product[]> {
  if (isFastAPIEnabled()) {
    try {
      console.log("[fetchProductsAction] Redirecting to FastAPI...");
      return await apiFetch<Product[]>("/dashboard/products");
    } catch (e) {
      console.warn("[fetchProductsAction] FastAPI failed, falling back to Supabase:", e);
    }
  }

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
  if (isFastAPIEnabled()) {
    try {
      console.log("[fetchLatestReviewsAction] Redirecting to FastAPI...");
      return await apiFetch<Review[]>(`/dashboard/reviews/latest?limit=${limit}`);
    } catch (e) {
      console.warn("[fetchLatestReviewsAction] FastAPI failed, falling back to Supabase:", e);
    }
  }

  const supabase = getSupabase();
  let allData: any[] = [];
  let offset = 0;
  const step = 1000;

  while (allData.length < limit) {
    const fetchCount = Math.min(step, limit - allData.length);
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .order("review_date", { ascending: false })
      .range(offset, offset + fetchCount - 1);

    if (error) {
      throw new Error("[fetchLatestReviewsAction] " + error.message);
    }
    if (!data || data.length === 0) break;

    allData = allData.concat(data);
    offset += fetchCount;
  }

  return (allData as unknown as Review[]) ?? [];
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

  if (isFastAPIEnabled()) {
    try {
      console.log("[fetchReviewsByKeywordsAction] Redirecting to FastAPI...");
      const kwParams = keywords.map(kw => `keywords=${encodeURIComponent(kw)}`).join("&");
      return await apiFetch<Review[]>(`/dashboard/reviews/search?${kwParams}&limit=${limit}`);
    } catch (e) {
      console.warn("[fetchReviewsByKeywordsAction] FastAPI failed, falling back to Supabase:", e);
    }
  }

  const supabase = getSupabase();
  const orFilter = keywords.map((kw) => `review_text.ilike.%${kw}%`).join(",");

  let allData: any[] = [];
  let offset = 0;
  const step = 1000;

  while (allData.length < limit) {
    const fetchCount = Math.min(step, limit - allData.length);
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .or(orFilter)
      .order("review_date", { ascending: false })
      .range(offset, offset + fetchCount - 1);

    if (error) {
      throw new Error("[fetchReviewsByKeywordsAction] " + error.message);
    }
    if (!data || data.length === 0) break;

    allData = allData.concat(data);
    offset += fetchCount;
  }

  return (allData as unknown as Review[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// ID 배열 기반 리뷰 검색
// ──────────────────────────────────────────────────────────
export async function fetchReviewsByIdsAction(
  ids: string[]
): Promise<Review[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .in("id", ids)
    .order("review_date", { ascending: false });

  if (error) {
    throw new Error("[fetchReviewsByIdsAction] " + error.message);
  }
  return (data as unknown as Review[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// 특정 제품 리뷰만 조회
// ──────────────────────────────────────────────────────────
export async function fetchReviewsByProductAction(
  productId: string,
  limit = 20
): Promise<Review[]> {
  if (isFastAPIEnabled()) {
    try {
      console.log("[fetchReviewsByProductAction] Redirecting to FastAPI...");
      return await apiFetch<Review[]>(`/dashboard/reviews/product/${productId}?limit=${limit}`);
    } catch (e) {
      console.warn("[fetchReviewsByProductAction] FastAPI failed, falling back to Supabase:", e);
    }
  }

  const supabase = getSupabase();
  
  let allData: any[] = [];
  let offset = 0;
  const step = 1000;

  while (allData.length < limit) {
    const fetchCount = Math.min(step, limit - allData.length);
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("product_id", productId)
      .order("review_date", { ascending: false })
      .range(offset, offset + fetchCount - 1);

    if (error) {
      throw new Error("[fetchReviewsByProductAction] " + error.message);
    }
    if (!data || data.length === 0) break;

    allData = allData.concat(data);
    offset += fetchCount;
  }

  return (allData as unknown as Review[]) ?? [];
}

// ──────────────────────────────────────────────────────────
// 대시보드 통계 및 AI 요약 브리핑 조회 (GET /statistics)
// ──────────────────────────────────────────────────────────
export async function fetchDashboardStatisticsAction(
  productId: string | null,
  period = 7
): Promise<StatisticsData> {
  if (isFastAPIEnabled()) {
    try {
      console.log("[fetchDashboardStatisticsAction] Redirecting to FastAPI...");
      const path = productId
        ? `/dashboard/statistics?product_id=${productId}&period=${period}`
        : `/dashboard/statistics?period=${period}`;
      return await apiFetch<StatisticsData>(path);
    } catch (e) {
      console.warn("[fetchDashboardStatisticsAction] FastAPI statistics failed, returning local mock:", e);
    }
  }
  
  // 로컬/오프라인 모드용 기본 통계 반환
  return {
    product_id: productId,
    period: period,
    total_reviews: 15,
    average_rating: 4.2,
    sentiment_breakdown: { positive: 10, neutral: 3, negative: 2 },
    attribute_scores: { ingredients: 0.85, formulation: 0.90, container: 0.45 },
    ai_briefing: "로컬 오프라인 대체용 트렌드 요약입니다. 성분 및 제형 만족도는 우수하나 일부 용기 파손 불만이 수집되었습니다."
  };
}

// ──────────────────────────────────────────────────────────
// UI 레이아웃 상태 저장 및 불러오기 (UI Persistence)
// ──────────────────────────────────────────────────────────
export async function saveLayoutStateAction(
  token: string,
  pinnedWidget: string | null
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_layouts")
      .upsert(
        { user_token: token, pinned_widget: pinnedWidget, updated_at: new Date().toISOString() },
        { onConflict: "user_token" }
      );
    if (error) {
      console.warn("[saveLayoutStateAction] Supabase upsert error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[saveLayoutStateAction] Failed to save layout in Supabase:", err.message || err);
    return false;
  }
}

export async function loadLayoutStateAction(
  token: string
): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_layouts")
      .select("pinned_widget")
      .eq("user_token", token)
      .maybeSingle();
      
    if (error) {
      console.warn("[loadLayoutStateAction] Supabase fetch error:", error.message);
      return null;
    }
    return data?.pinned_widget ?? null;
  } catch (err: any) {
    console.warn("[loadLayoutStateAction] Failed to load layout from Supabase:", err.message || err);
    return null;
  }
}
