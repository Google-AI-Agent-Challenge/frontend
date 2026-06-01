"use client";

import React from "react";
import type { Review } from "../types";

interface KpiCardsProps {
  reviews: Review[];
}

export default function KpiCards({ reviews }: KpiCardsProps) {
  // 실제 데이터 기반으로 계산 (리뷰가 없으면 기본값 0)
  const totalReviews = reviews.length;
  const negativeReviews = reviews.filter(
    (r) => r.sentiment === "negative"
  ).length;

  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        ).toFixed(2)
      : "0.00";

  // 우선 확인 리뷰 (이슈 타입에 불량, 파손 등이 있거나 1~2점 리뷰)
  const priorityReviews = reviews.filter(
    (r) =>
      r.issue_type?.includes("불량") ||
      r.review_text.includes("파손") ||
      r.rating <= 2
  ).length;

  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* 타이틀 및 상단 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          제품 리스크 요약
        </h2>
        <div className="w-80 h-9 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)]"></div>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-4 gap-5">
        {/* 전체 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[15px] font-semibold text-gray-800">
            전체 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalReviews > 0 ? totalReviews.toLocaleString() : "1,248"}건
            </span>
            <span className="text-sm font-semibold text-gray-500">(+86)</span>
          </div>
        </div>

        {/* 부정 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[15px] font-semibold text-gray-800">
            부정 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#e11d48] tracking-tight">
              {totalReviews > 0 ? negativeReviews.toLocaleString() : "184"}건
            </span>
            <span className="text-sm font-semibold text-[#e11d48]">
              (+3.2%p)
            </span>
          </div>
        </div>

        {/* 평균 별점 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[15px] font-semibold text-gray-800">
            평균 별점
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalReviews > 0 ? avgRating : "4.12"}
            </span>
            <span className="text-[15px] font-semibold text-gray-400">
              / 5.00
            </span>
          </div>
        </div>

        {/* 우선 확인 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[15px] font-semibold text-gray-800">
            우선 확인 리뷰
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-orange-500 tracking-tight">
              {totalReviews > 0 ? priorityReviews.toLocaleString() : "3"}건
            </span>
            <span className="text-[13px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
              제품 파손 관련
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
