"use server";

/**
 * app/actions/data.ts
 * API 서버를 통한 데이터 조회 Server Actions
 */

import type { Product, Review } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ──────────────────────────────────────────────────────────
// 제품 목록 조회
// ──────────────────────────────────────────────────────────
export async function fetchProductsAction(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) {
      throw new Error(`fetchProductsAction Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Product[];
  } catch (error: any) {
    throw new Error("[fetchProductsAction] " + error.message);
  }
}

// ──────────────────────────────────────────────────────────
// 최신 리뷰 조회
// ──────────────────────────────────────────────────────────
export async function fetchLatestReviewsAction(limit = 20): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`fetchLatestReviewsAction Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Review[];
  } catch (error: any) {
    throw new Error("[fetchLatestReviewsAction] " + error.message);
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
      throw new Error(`fetchReviewsByKeywordsAction Error: ${res.statusText}`);
    }
    const data = await res.json();
    return data as Review[];
  } catch (error: any) {
    throw new Error("[fetchReviewsByKeywordsAction] " + error.message);
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
  } catch (error: any) {
    // If backend doesn't support batch, fallback or error out. 
    // Usually API endpoints can handle this via query params or a POST.
    throw new Error("[fetchReviewsByIdsAction] " + error.message);
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
  } catch (error: any) {
    throw new Error("[fetchReviewsByProductAction] " + error.message);
  }
}
