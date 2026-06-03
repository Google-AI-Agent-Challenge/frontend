"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import type { DashboardSummary, Product } from "../types";
import { fetchProductsAction } from "../actions/data";

interface KpiCardsProps {
  summary: DashboardSummary | null;
  period: number;
  setPeriod: (val: number) => void;
  productId: string;
  setProductId: (val: string) => void;
  onCardClick?: (type: "negative" | "priority") => void;
}

function formatDiff(value: number, unit = "건"): string {
  const sign = value >= 0 ? "+" : "";
  return `(${sign}${value}${unit})`;
}

export default function KpiCards({
  summary,
  period,
  setPeriod,
  productId,
  setProductId,
  onCardClick,
}: KpiCardsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProductsAction();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const getProductName = () => {
    if (productId === "all") return "전체 제품";
    const found = products.find(p => p.id === productId);
    if (found) return found.product_name;
    return productId;
  };

  const totalReviews = summary?.total_reviews ?? 0;
  const avgRating = summary ? summary.average_rating.toFixed(2) : "0.00";
  const negativeReviews = summary?.negative_reviews_count ?? 0;
  const priorityReviews = summary?.priority_reviews_count ?? 0;

  const totalDiff = summary?.total_reviews_diff ?? 0;
  const ratingDiff = summary?.average_rating_diff ?? 0;
  const negativeDiff = summary?.negative_reviews_rate_diff ?? 0;

  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* 타이틀 및 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight pl-1">
          리뷰 종합 요약
        </h2>
        <div className="flex gap-4">
          {/* 기간 설정 필터 */}
          <div className="relative inline-block">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
            >
              <option value={7}>최근 7일</option>
              <option value={30}>최근 30일</option>
              <option value={9999}>전체기간</option>
            </select>
            <div className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors duration-200 text-[16px] flex items-center gap-3 relative z-0">
              <Calendar size={18} className="text-gray-400" />
              <span>{period === 9999 ? "전체기간" : period === 7 ? "7일" : "30일"}</span>
              <span className="text-[11px] text-gray-400">▼</span>
            </div>
          </div>

          {/* 제품 필터링 필터 */}
          <div className="relative inline-block">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
              disabled={loadingProducts}
            >
              <option value="all">전체 제품</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>
            <div className={`bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-colors duration-200 text-[16px] flex items-center gap-3 relative z-0 ${loadingProducts ? 'opacity-50' : 'hover:bg-gray-50'}`}>
              <Filter size={18} className="text-gray-400" />
              <span>{loadingProducts ? "불러오는 중..." : getProductName()}</span>
              <span className="text-[11px] text-gray-400">▼</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* 전체 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">전체 리뷰</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {totalReviews.toLocaleString()}건
            </span>
            <span className="text-sm font-semibold text-gray-500">
              {formatDiff(totalDiff)}
            </span>
          </div>
        </div>

        {/* 평균 별점 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">평균 별점</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {avgRating}
            </span>
            <span className="text-[15px] font-semibold text-gray-400">/ 5.00</span>
            <span className="text-sm font-semibold text-gray-500">
              {formatDiff(ratingDiff, "점")}
            </span>
          </div>
        </div>

        {/* 부정 리뷰 */}
        <div
          onClick={() => onCardClick?.("negative")}
          className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_8px_20px_rgba(239,68,68,0.08)] active:scale-[0.98] select-none"
        >
          <div className="flex justify-between items-start">
            <span className="text-[24px] font-semibold text-gray-800">부정 리뷰</span>
            <span className="text-[11px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              자세히 보기 →
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#B22121] tracking-tight">
              {negativeReviews.toLocaleString()}건
            </span>
            <span className="text-sm font-bold text-[#B22121]">
              ({negativeDiff >= 0 ? "+" : ""}{negativeDiff}%p)
            </span>
          </div>
        </div>

        {/* 우선 확인 리뷰 */}
        <div
          onClick={() => onCardClick?.("priority")}
          className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_8px_20px_rgba(245,158,11,0.08)] active:scale-[0.98] select-none"
        >
          <div className="flex justify-between items-start">
            <span className="text-[24px] font-semibold text-gray-800">우선 확인 리뷰</span>
            <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              자세히 보기 →
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#E88700] tracking-tight">
              {priorityReviews.toLocaleString()}건
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
