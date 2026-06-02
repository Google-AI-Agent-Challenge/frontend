/**
 * ============================================================
 * app/home/reviewService.ts
 * ============================================================
 * 백엔드 서버(API)를 통한 데이터 조회 서비스 레이어
 * ============================================================
 */

import type { Review, Product, Score } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchReviewsByKeywords(
  keywords: string[],
  limit: number = 20
): Promise<Review[]> {
  if (!keywords || keywords.length === 0) {
    return fetchLatestReviews(limit);
  }

  try {
    const params = new URLSearchParams();
    params.append("keywords", keywords.join(","));
    params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching reviews: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Review[];
  } catch (error: unknown) {
    console.error("[reviewService] fetchReviewsByKeywords 오류:", error.message);
    return [];
  }
}

export async function fetchLatestReviews(limit: number = 20): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error fetching latest reviews: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Review[];
  } catch (error: unknown) {
    console.error("[reviewService] fetchLatestReviews 오류:", error.message);
    return [];
  }
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category) {
      params.append("category", category);
    }
    const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Product[];
  } catch (error: unknown) {
    console.error("[reviewService] fetchProducts 오류:", error.message);
    return [];
  }
}

export async function fetchReviewsByProduct(
  productId: string,
  limit: number = 20
): Promise<Review[]> {
  try {
    const params = new URLSearchParams();
    params.append("product_id", productId);
    params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/reviews?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching reviews by product: ${response.statusText}`);
    }
    const data = await response.json();
    return data as Review[];
  } catch (error: unknown) {
    console.error("[reviewService] fetchReviewsByProduct 오류:", error.message);
    return [];
  }
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
