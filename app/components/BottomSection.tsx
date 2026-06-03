"use client";

import React from "react";
import type { DashboardInsights } from "../types";

interface BottomSectionProps {
  insights: DashboardInsights | null;
  aiBriefing: string;
}

interface InsightCard {
  label: string;
  score: number;
  change: number;
  positiveColor: string;
  negativeColor: string;
}

function buildInsightCards(insights: DashboardInsights): InsightCard[] {
  return [
    {
      label: "성분 및 피부 진정",
      score: insights.ingredients.score,
      change: insights.ingredients.change,
      positiveColor: "#3B8026",
      negativeColor: "#B7064B",
    },
    {
      label: "제형 흡수력 및 발림성",
      score: insights.formulation.score,
      change: insights.formulation.change,
      positiveColor: "#3B8026",
      negativeColor: "#B7064B",
    },
    {
      label: "용기 불량 및 편리성",
      score: insights.container.score,
      change: insights.container.change,
      positiveColor: "#3B8026",
      negativeColor: "#B22121",
    },
  ];
}

export default function BottomSection({ insights, aiBriefing }: BottomSectionProps) {
  const cards = insights ? buildInsightCards(insights) : null;

  return (
    <div className="flex gap-6 pb-12">
      {/* 좌측: 주요 분석 리스트 */}
      <div className="flex-[2.2] flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          주요 분석 리스트
        </h3>
        <div className="flex flex-col gap-5">
          {!cards ? (
            <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
              <p className="text-gray-400 text-[18px]">데이터 로딩 중...</p>
            </div>
          ) : (
            cards.map((card) => {
              const isPositive = card.change >= 0;
              const accentColor = isPositive ? card.positiveColor : card.negativeColor;
              const changeSign = isPositive ? "+" : "";
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300 cursor-pointer"
                >
                  <div className="flex gap-2">
                    <span
                      className="text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      #{card.label}
                    </span>
                  </div>
                  <h4 className="text-[24px] font-bold text-gray-900 mt-2 tracking-tight">
                    {card.label} 만족도{" "}
                    <span style={{ color: accentColor }}>
                      {changeSign}{card.change.toFixed(1)}%p
                    </span>
                  </h4>
                  <p className="text-[20px] text-gray-700 leading-[1.6] font-medium tracking-tight">
                    현재 점수{" "}
                    <span className="font-bold" style={{ color: accentColor }}>
                      {card.score.toFixed(1)}%
                    </span>
                    {" — "}
                    전기 대비{" "}
                    <span className="font-bold" style={{ color: accentColor }}>
                      {changeSign}{card.change.toFixed(1)}%p
                    </span>{" "}
                    변동했습니다.
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 우측: AI 브리핑 요약 */}
      <div className="flex-[1] flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          AI 브리핑 요약
        </h3>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[200px]">
            <h5 className="text-[24px] font-bold text-gray-900 tracking-tight mb-3">
              ✨ AI 종합 브리핑
            </h5>
            <p className="text-[20px] text-gray-500 leading-[1.6] font-medium whitespace-pre-wrap">
              {aiBriefing || "AI가 대시보드 데이터를 분석하여 요약하고 있습니다..."}
            </p>
          </div>

          {/* 리포트 만들기 버튼 */}
          <button className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-[24px] tracking-tight flex justify-center items-center gap-2 cursor-pointer">
            리포트 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
