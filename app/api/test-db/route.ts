/**
 * 진단용 API 라우트 — Supabase 연결 상태 확인
 * 브라우저에서 http://localhost:3000/api/test-db 로 접속하면
 * DB 연결 결과가 JSON으로 출력됩니다.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. 환경변수 존재 여부 확인
  if (!url || !key) {
    return NextResponse.json({
      status: "❌ 환경변수 누락",
      NEXT_PUBLIC_SUPABASE_URL: url ?? "없음",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? "존재함" : "없음 ← 이게 문제!",
      solution: "서버를 Ctrl+C로 종료한 후 npm run dev 로 재시작하세요.",
    });
  }

  // 2. Supabase 클라이언트 직접 생성 (서버 사이드)
  const supabase = createClient(url, key);

  // 3. products 테이블 조회 시도
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, brand_name, product_name, category")
    .limit(5);

  // 4. reviews 테이블 조회 시도
  const { data: reviews, error: reviewError } = await supabase
    .from("reviews")
    .select("id, review_text, rating")
    .limit(3);

  return NextResponse.json({
    status: "연결 시도 완료",
    env: {
      url: url,
      keyPrefix: key.substring(0, 20) + "...",
    },
    products: {
      data: products,
      count: products?.length ?? 0,
      error: prodError?.message ?? null,
    },
    reviews: {
      data: reviews,
      count: reviews?.length ?? 0,
      error: reviewError?.message ?? null,
    },
  });
}
