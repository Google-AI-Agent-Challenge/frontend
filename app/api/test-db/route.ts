import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      status: "❌ 환경변수 누락",
      NEXT_PUBLIC_SUPABASE_URL: url ?? "없음",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? "존재함" : "없음",
    });
  }

  const supabase = createClient(url, key);

  const { data: products } = await supabase
    .from("products")
    .select("product_name");

  const { data: issueTypes } = await supabase
    .from("reviews")
    .select("issue_type")
    .not("issue_type", "is", null);

  const { data: keywordsList } = await supabase
    .from("reviews")
    .select("keywords")
    .not("keywords", "is", null);

  const { count: totalReviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const prodStats: Record<string, number> = {};
  const { data: reviewsWithProduct } = await supabase
    .from("reviews")
    .select("products(product_name)");
  
  if (reviewsWithProduct) {
    reviewsWithProduct.forEach((r: any) => {
      const pName = r.products?.product_name || "알수없음";
      prodStats[pName] = (prodStats[pName] || 0) + 1;
    });
  }

  const issueStats: Record<string, number> = {};
  if (issueTypes) {
    issueTypes.forEach((r) => {
      if (r.issue_type) {
        issueStats[r.issue_type] = (issueStats[r.issue_type] || 0) + 1;
      }
    });
  }

  const keywordStats: Record<string, number> = {};
  if (keywordsList) {
    keywordsList.forEach((r) => {
      if (Array.isArray(r.keywords)) {
        r.keywords.forEach((kw: string) => {
          keywordStats[kw] = (keywordStats[kw] || 0) + 1;
        });
      }
    });
  }

  return NextResponse.json({
    totalReviews,
    prodStats,
    issueStats: Object.entries(issueStats).sort((a,b) => b[1]-a[1]).slice(0, 10),
    keywordStats: Object.entries(keywordStats).sort((a,b) => b[1]-a[1]).slice(0, 20),
  });
}
