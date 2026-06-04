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
const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

// ──────────────────────────────────────────────────────────
// 제품 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchProductsAction(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/list`);
    if (!res.ok) {
      console.error(
        `fetchProductsAction Error: ${res.status} ${res.statusText}`,
      );
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
      console.error(
        `fetchReviewsCountAction Error: ${res.status} ${res.statusText}`,
      );
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
export async function fetchReviewsPageAction(
  page = 1,
  limit = 500,
): Promise<Review[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/reviews?page=${page}&limit=${limit}`,
    );
    if (!res.ok) {
      console.error(
        `fetchReviewsPageAction Error: ${res.status} ${res.statusText}`,
      );
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
      console.error(
        `fetchLatestReviewsAction Error: ${res.status} ${res.statusText}`,
      );
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
  limit = 20,
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
      console.error(
        `fetchReviewsByKeywordsAction Error: ${res.status} ${res.statusText}`,
      );
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
  ids: string[],
): Promise<Review[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    // 백엔드에 /api/reviews/batch 엔드포인트가 없으므로,
    // priority=true 인 전체 리뷰를 가져와서 ID로 필터링합니다.
    const allPriorityReviews = await fetchReviewsWithFilterAction(undefined, undefined, undefined, 5000, true);
    
    const filteredReviews = allPriorityReviews.filter(review => ids.includes(review.id));
    
    // 요청한 ID 순서대로 정렬
    return filteredReviews.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
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
  limit = 20,
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
  period: number = 30,
): Promise<DashboardSummary | null> {
  try {
    let url = `${API_BASE_URL}/api/dashboard/summary?period=${period}`;
    if (productId && productId !== "all") {
      url += `&product_id=${productId}`;
    }
    const res = await fetch(url);
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
  period: number = 30,
): Promise<TrendingKeyword[]> {
  try {
    let url = `${API_BASE_URL}/api/dashboard/trending-keywords?period=${period}`;
    if (productId && productId !== "all") {
      url += `&product_id=${productId}`;
    }
    const res = await fetch(url);
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
  period: number = 30,
): Promise<NegativeTrendEntry[]> {
  try {
    let url = `${API_BASE_URL}/api/dashboard/negative-trend?period=${period}`;
    if (productId && productId !== "all") {
      url += `&product_id=${productId}`;
    }
    const res = await fetch(url);
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
  period: number = 30,
): Promise<DashboardInsights | null> {
  try {
    let url = `${API_BASE_URL}/api/dashboard/insights?period=${period}`;
    if (productId && productId !== "all") {
      url += `&product_id=${productId}`;
    }
    const res = await fetch(url);
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
  period: number = 30,
): Promise<string> {
  try {
    let url = `${API_BASE_URL}/api/dashboard/ai-briefing?period=${period}`;
    if (productId && productId !== "all") {
      url += `&product_id=${productId}`;
    }
    const res = await fetch(url);
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

// ──────────────────────────────────────────────────────────
// 필터 조건 기반 리뷰 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchReviewsWithFilterAction(
  productId?: string,
  sentiment?: string,
  period?: number,
  limit = 50,
  priority = false
): Promise<Review[]> {
  try {
    const params = new URLSearchParams();
    if (productId && productId !== "all") {
      params.append("product", productId);
    }
    if (sentiment) {
      params.append("sentiment", sentiment);
    }
    if (period && period < 9999) {
      params.append("period", period.toString());
    }
    if (priority) {
      params.append("priority", "true");
    }

    let allReviews: Review[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      params.set("page", page.toString());
      // 백엔드가 한 번에 반환할 수 있는 최대치가 50일 수 있으므로 50으로 청크 요청
      params.set("limit", "50");

      const res = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`);
      if (!res.ok) {
        console.error(`fetchReviewsWithFilterAction Error: ${res.status}`);
        break;
      }
      
      const data = await res.json() as Review[];
      allReviews = allReviews.concat(data);

      if (data.length < 50 || allReviews.length >= limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allReviews.slice(0, limit);
  } catch (error) {
    console.error("[fetchReviewsWithFilterAction]", error);
    return [];
  }
}

// ──────────────────────────────────────────────────────────
// Google Docs 리포트 생성 및 내보내기
// ──────────────────────────────────────────────────────────
export interface ExportDocsResponse {
  success: boolean;
  message?: string;
  document_id?: string;
  document_url?: string;
  detail?: string;
}

export async function exportToGoogleDocsAction(
  title: string,
  period: number,
  productId: string = "all",
  reportMarkdown?: string,
): Promise<ExportDocsResponse> {
  try {
    const url = `${API_BASE_URL}/api/dashboard/export/docs`;

    // API 명세서에 맞춘 Request Body 구성
    const bodyData: Record<string, any> = {
      title,
      period,
      product_id: productId,
    };

    // 마크다운 데이터가 있을 경우에만 추가
    if (reportMarkdown) {
      bodyData.report_markdown = reportMarkdown;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 🚨 명세서에 [인증: 🔑] 표시가 있으므로 실제 요청 시 토큰이 필요합니다.
        // "Authorization": `Bearer ${토큰}`
      },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();

    // 500 Internal Server Error 등 에러 발생 시 처리
    if (!res.ok) {
      console.error(`exportToGoogleDocsAction Error: ${res.status}`);
      return {
        success: false,
        detail: data.detail || "Google Docs API 호출 중 오류가 발생했습니다.",
      };
    }

    // 200 OK 성공 시 응답 반환
    return data as ExportDocsResponse;
  } catch (error) {
    console.error("[exportToGoogleDocsAction]", error);
    return { success: false, detail: "네트워크 오류가 발생했습니다." };
  }
}
