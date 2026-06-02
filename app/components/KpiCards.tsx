"use client";

import { Calendar, Filter } from "lucide-react";
import type { DashboardSummary } from "../types";

interface KpiCardsProps {
  summary: DashboardSummary | null;
}

function formatDiff(value: number, unit = "건"): string {
  const sign = value >= 0 ? "+" : "";
  return `(${sign}${value}${unit})`;
}

export default function KpiCards({ summary }: KpiCardsProps) {
  const totalReviews = summary?.total_reviews ?? 0;
  const avgRating = summary ? summary.average_rating.toFixed(2) : "0.00";
  const negativeReviews = summary?.negative_reviews_count ?? 0;
  const priorityReviews = summary?.priority_reviews_count ?? 0;

  const totalDiff = summary?.total_reviews_diff ?? 0;
  const ratingDiff = summary?.average_rating_diff ?? 0;
  const negativeDiff = summary?.negative_reviews_rate_diff ?? 0;

  return (
    <div className="flex flex-col gap-5 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight pl-1">
          리뷰 종합 요약
        </h2>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors duration-200 text-[14px] flex items-center gap-2 cursor-pointer">
            <Calendar size={15} className="text-gray-400" />
            <span>30일</span>
            <span className="text-[9px] text-gray-400">▼</span>
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors duration-200 text-[14px] flex items-center gap-2 cursor-pointer">
            <Filter size={14} className="text-gray-400" />
            <span>전체 제품</span>
            <span className="text-[9px] text-gray-400">▼</span>
          </button>
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">부정 리뷰</span>
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300">
          <span className="text-[24px] font-semibold text-gray-800">우선 확인 리뷰</span>
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
