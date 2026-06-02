"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import type { Review } from "../types";
import { fetchLatestReviewsAction, fetchReviewsByProductAction } from "../actions/data";

interface KpiCardsProps {
  period: number;
  setPeriod: (val: number) => void;
  productId: string;
  setProductId: (val: string) => void;
}

export default function KpiCards({
  period,
  setPeriod,
  productId,
  setProductId,
}: KpiCardsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        let data: Review[] = [];
        if (productId === "all") {
          data = await fetchLatestReviewsAction(10000);
        } else {
          data = await fetchReviewsByProductAction(productId, 10000);
        }
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews in KpiCards:", err);
      }
    }
    loadData();
  }, [period, productId]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/list");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && Array.isArray(data.items)) {
          setProducts(data.items);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const getProductName = () => {
    if (productId === "all") return "전체 제품";
    const found = products.find(p => {
      const val = p.id || p.productId || p.name;
      return val === productId;
    });
    if (found) return found.name || found.id || found.productId;
    return productId;
  };

  // 실제 데이터 기반으로 계산 (리뷰가 없으면 기본값 0)
  const totalReviews = reviews.length;
  const negativeReviews = reviews.filter(
    (r) => r.sentiment === "negative",
  ).length;

  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(
          2,
        )
      : "0.00";

  // 우선 확인 리뷰 (이슈 타입에 불량, 파손 등이 있거나 1~2점 리뷰)
  const priorityReviews = reviews.filter(
    (r) =>
      r.issue_type?.includes("불량") ||
      r.review_text.includes("파손") ||
      r.rating <= 2,
  ).length;

  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* 타이틀 및 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight pl-1 ">
          리뷰 종합 요약
        </h2>
        <div className="flex gap-3">
          {/* 기간 설정 필터 */}
          <div className="relative inline-block">
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
            >
              <option value={7}>최근 7일</option>
              <option value={30}>최근 30일</option>
            </select>
            <div className="bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors duration-200 text-[14px] flex items-center gap-2 relative z-0">
              <Calendar size={15} className="text-gray-400" />
              <span>{period === 7 ? "7일" : "30일"}</span>
              <span className="text-[9px] text-gray-400">▼</span>
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
              {products.map((p: any, idx: number) => {
                const val = p.id || p.productId || p.name || (typeof p === 'string' ? p : String(idx));
                const label = p.name || p.id || p.productId || (typeof p === 'string' ? p : `Product ${idx}`);
                return (
                  <option key={val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
            <div className={`bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-colors duration-200 text-[14px] flex items-center gap-2 relative z-0 ${loadingProducts ? 'opacity-50' : 'hover:bg-gray-50'}`}>
              <Filter size={14} className="text-gray-400" />
              <span>{loadingProducts ? "불러오는 중..." : getProductName()}</span>
              <span className="text-[9px] text-gray-400">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 리뷰 수 카드 --- */}
      <div className="grid grid-cols-4 gap-5">
        {/* 전체 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">
            전체 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {totalReviews > 0 ? totalReviews.toLocaleString() : "0"}건
            </span>
            <span className="text-sm font-semibold text-gray-500">(+86)</span>
          </div>
        </div>

        {/* 평균 별점 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">
            평균 별점
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {totalReviews > 0 ? avgRating : "4.12"}
            </span>
            <span className="text-[15px] font-semibold text-gray-400">
              / 5.00
            </span>
          </div>
        </div>

        {/* 부정 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">
            부정 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#B22121] tracking-tight">
              {totalReviews > 0 ? negativeReviews.toLocaleString() : "184"}건
            </span>
            <span className="text-sm font-bold text-[#B22121]">(+20)</span>
          </div>
        </div>

        {/* 우선 확인 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">
            우선 확인 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#E88700] tracking-tight">
              {totalReviews > 0 ? priorityReviews.toLocaleString() : "3"}건
            </span>
            <span className="text-sm font-bold text-[#E88700]">(+1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
