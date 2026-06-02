"use server";

/**
 * app/actions/data.ts
 * API 서버를 통한 데이터 조회 Server Actions
 */

import type {
  Product,
  Review,
  DashboardSummary,
  TrendingKeyword,
  NegativeTrendEntry,
  DashboardInsights,
} from "../types";

// "use server" Server Action은 Node.js 서버에서만 실행되므로
// 빌드 타임에 번들에 인라인되는 NEXT_PUBLIC_* 대신
// 런타임에 주입되는 서버 전용 환경변수를 사용한다.
const API_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ──────────────────────────────────────────────────────────
// 제품 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchProductsAction(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/list`);
    if (!res.ok) {
      console.error(`fetchProductsAction Error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data as Product[];
  } catch (error) {
    console.error("[fetchProductsAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 리뷰 전체 건수 조회 (병렬 청크 로딩용)
// ──────────────────────────────────────────────────────────
export async function fetchReviewsCountAction(): Promise<{ total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/count`);
    if (!res.ok) {
      console.error(`fetchReviewsCountAction Error: ${res.status} ${res.statusText}`);
      return { total: 0 };
    }
    const data = await res.json();
    return data as { total: number };
  } catch (error) {
    console.error("[fetchReviewsCountAction]", error);
    return { total: 0 };
  }
}

// ──────────────────────────────────────────────────────────
// 페이지별 리뷰 조회 (병렬 청크 로딩용)
// ──────────────────────────────────────────────────────────
export async function fetchReviewsPageAction(page = 1, limit = 500): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews?page=${page}&limit=${limit}`);
    if (!res.ok) {
      console.error(`fetchReviewsPageAction Error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data as Review[];
  } catch (error) {
    console.error("[fetchReviewsPageAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 최신 리뷰 조회
// ──────────────────────────────────────────────────────────
export async function fetchLatestReviewsAction(limit = 20): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews?limit=${limit}`);
    if (!res.ok) {
      console.error(`fetchLatestReviewsAction Error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data as Review[];
  } catch (error) {
    console.error("[fetchLatestReviewsAction]", error);
    return [];
  }
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

  try {
    const params = new URLSearchParams();
    params.append("keywords", keywords.join(","));
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`);
    if (!res.ok) {
      console.error(`fetchReviewsByKeywordsAction Error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data as Review[];
  } catch (error) {
    console.error("[fetchReviewsByKeywordsAction]", error);
    return [];
  }
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

  try {
    const params = new URLSearchParams();
    params.append("ids", ids.join(","));

    const res = await fetch(`${API_BASE_URL}/api/reviews/batch?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`fetchReviewsByIdsAction Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Review[];
  } catch (error) {
    console.error("[fetchReviewsByIdsAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 특정 제품 리뷰만 조회
// ──────────────────────────────────────────────────────────
export async function fetchReviewsByProductAction(
  productId: string,
  limit = 20
): Promise<Review[]> {
  try {
    const params = new URLSearchParams();
    params.append("product_id", productId);
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`fetchReviewsByProductAction Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Review[];
  } catch (error) {
    console.error("[fetchReviewsByProductAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 대시보드 요약 (KPI 카드용)
// ──────────────────────────────────────────────────────────
export async function fetchDashboardSummaryAction(
  productId?: string,
  period = 7
): Promise<DashboardSummary | null> {
  try {
    const params = new URLSearchParams({ period: period.toString() });
    if (productId) params.append("product_id", productId);
    const res = await fetch(
      `${API_BASE_URL}/api/dashboard/summary?${params.toString()}`
    );
    if (!res.ok) {
      console.error(`fetchDashboardSummaryAction Error: ${res.status}`);
      return null;
    }
    return (await res.json()) as DashboardSummary;
  } catch (error) {
    console.error("[fetchDashboardSummaryAction]", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Top 5 급상승 키워드
// ──────────────────────────────────────────────────────────
export async function fetchTrendingKeywordsAction(
  productId?: string,
  period = 7
): Promise<TrendingKeyword[]> {
  try {
    const params = new URLSearchParams({ period: period.toString() });
    if (productId) params.append("product_id", productId);
    const res = await fetch(
      `${API_BASE_URL}/api/dashboard/trending-keywords?${params.toString()}`
    );
    if (!res.ok) {
      console.error(`fetchTrendingKeywordsAction Error: ${res.status}`);
      return [];
    }
    return (await res.json()) as TrendingKeyword[];
  } catch (error) {
    console.error("[fetchTrendingKeywordsAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 부정 리뷰 추이 시계열
// ──────────────────────────────────────────────────────────
export async function fetchNegativeTrendAction(
  productId?: string,
  period = 7
): Promise<NegativeTrendEntry[]> {
  try {
    const params = new URLSearchParams({ period: period.toString() });
    if (productId) params.append("product_id", productId);
    const res = await fetch(
      `${API_BASE_URL}/api/dashboard/negative-trend?${params.toString()}`
    );
    if (!res.ok) {
      console.error(`fetchNegativeTrendAction Error: ${res.status}`);
      return [];
    }
    return (await res.json()) as NegativeTrendEntry[];
  } catch (error) {
    console.error("[fetchNegativeTrendAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// 속성 점수 인사이트 (성분/제형/용기)
// ──────────────────────────────────────────────────────────
export async function fetchDashboardInsightsAction(
  productId?: string,
  period = 7
): Promise<DashboardInsights | null> {
  try {
    const params = new URLSearchParams({ period: period.toString() });
    if (productId) params.append("product_id", productId);
    const res = await fetch(
      `${API_BASE_URL}/api/dashboard/insights?${params.toString()}`
    );
    if (!res.ok) {
      console.error(`fetchDashboardInsightsAction Error: ${res.status}`);
      return null;
    }
    return (await res.json()) as DashboardInsights;
  } catch (error) {
    console.error("[fetchDashboardInsightsAction]", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// AI 브리핑 텍스트
// ──────────────────────────────────────────────────────────
export async function fetchAiBriefingAction(
  productId?: string,
  period = 7
): Promise<string> {
  try {
    const params = new URLSearchParams({ period: period.toString() });
    if (productId) params.append("product_id", productId);
    const res = await fetch(
      `${API_BASE_URL}/api/dashboard/ai-briefing?${params.toString()}`
    );
    if (!res.ok) {
      console.error(`fetchAiBriefingAction Error: ${res.status}`);
      return "";
    }
    const data = await res.json();
    return (data as { ai_briefing: string }).ai_briefing ?? "";
  } catch (error) {
    console.error("[fetchAiBriefingAction]", error);
    return "";
  }
}
