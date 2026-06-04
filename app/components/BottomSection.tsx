"use client";

import React, { useState } from "react";
import type { DashboardInsights, TrendingKeyword, Review } from "../types";
import { saveAs } from "file-saver";
import { generateVocReport } from "../utils/exportDocx";

interface BottomSectionProps {
  insights: DashboardInsights | null;
  keywords: TrendingKeyword[];
  aiBriefing: string;
  period: number;
  productId: string;
  reviews: Review[];
}

interface InsightCard {
  label: string;
  score: number;
  change: number;
  positiveColor: string;
  negativeColor: string;
  insight_text: string;
  related_keywords: { keyword: string; count: number }[];
}

function buildInsightCards(keywords: TrendingKeyword[]): InsightCard[] {
  const kw1 = keywords[0]?.keyword || "재구매";
  const kw2 = keywords[1]?.keyword || "만족";
  const kw3 = keywords[2]?.keyword || "피부결 개선";

  return [
    {
      label: kw1,
      score: 95.2,
      change: 4.5,
      positiveColor: "#3B8026",
      negativeColor: "#B7064B",
      insight_text:
        "대부분의 사용자가 뛰어난 보습력과 진정 효과에 만족하며 재구매 의사를 적극적으로 밝히고 있습니다. 특히 한 달 이상 꾸준히 사용한 고객들의 재구매율이 높습니다.",
      related_keywords: [
        { keyword: "정착템", count: 124 },
        { keyword: "대용량", count: 85 },
        { keyword: "가성비", count: 62 },
      ],
    },
    {
      label: kw2,
      score: 92.8,
      change: 2.1,
      positiveColor: "#3B8026",
      negativeColor: "#B7064B",
      insight_text:
        "제품의 발림성과 빠른 흡수력에 대한 전반적인 만족도가 매우 높게 나타났습니다. 끈적임 없는 마무리감이 긍정적인 평가의 주요 요인입니다.",
      related_keywords: [
        { keyword: "촉촉함", count: 98 },
        { keyword: "발림성", count: 76 },
        { keyword: "빠른흡수", count: 54 },
      ],
    },
    {
      label: kw3,
      score: 88.5,
      change: 5.3,
      positiveColor: "#3B8026",
      negativeColor: "#B22121",
      insight_text:
        "사용 후 피부결이 매끄러워지고 요철이 줄어들었다는 후기가 급증하고 있습니다. 화장이 잘 먹는다는 긍정적인 반응이 이어지고 있습니다.",
      related_keywords: [
        { keyword: "매끈함", count: 112 },
        { keyword: "화장잘먹음", count: 89 },
        { keyword: "요철", count: 45 },
      ],
    },
  ];
}

export default function BottomSection({
  insights,
  keywords,
  aiBriefing,
  period,
  productId,
  reviews,
}: BottomSectionProps) {
  const cards = buildInsightCards(keywords);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Review 객체를 ReviewDocData 인터페이스에 맞게 매핑하여 전달
      const docReviews = reviews.map(r => ({
        rating: r.rating,
        review_date: r.review_date,
        review_text: r.review_text
      }));
      
      const blob = await generateVocReport(cards, aiBriefing, docReviews);
      saveAs(blob, "2026-06_화장품_VOC_분석_리포트.docx");
    } catch (err) {
      console.error(err);
      alert("리포트 생성 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

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
            cards.map((card, index) => {
              const isPositive = card.change >= 0;
              const accentColor = isPositive
                ? card.positiveColor
                : card.negativeColor;
              const changeSign = isPositive ? "+" : "";
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300 cursor-pointer"
                >
                  {/* 상단 타이틀 영역 */}
                  <div className="flex items-center gap-3">
                    <img
                      src="/king.png"
                      alt="King Icon"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-2xl font-bold text-gray-900">
                      TOP {index + 1} : {card.label}
                    </span>
                  </div>

                  {/* 수치 요약 영역 */}
                  <p className="text-lg text-gray-900 font-medium tracking-tight mt-1">
                    현재 만족도{" "}
                    <span className="font-bold" style={{ color: accentColor }}>
                      {card.score.toFixed(1)}%p
                    </span>
                    {" ─ "}
                    전기 대비{" "}
                    <span className="font-bold" style={{ color: accentColor }}>
                      {changeSign}
                      {card.change.toFixed(1)}%p
                    </span>
                  </p>

                  {(card.insight_text ||
                    (card.related_keywords &&
                      card.related_keywords.length > 0)) && (
                    <div className="mt-2 p-5 bg-gray-50 rounded-2xl flex flex-col gap-3">
                      {card.insight_text && (
                        <p className="text-[18px] text-gray-700 leading-relaxed font-medium">
                          {card.insight_text}
                        </p>
                      )}

                      {card.related_keywords &&
                        card.related_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {card.related_keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="bg-[#3B8026] border border-gray-200 text-white px-3 py-1.5 rounded-full text-[16px] font-medium shadow-sm"
                              >
                                # {kw.keyword}{" "}
                                <span className="text-white">{kw.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
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
              {aiBriefing ||
                "AI가 대시보드 데이터를 분석하여 요약하고 있습니다..."}
            </p>
          </div>

          {/* 리포트 만들기 버튼 */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-[24px] tracking-tight flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? "리포트 생성 중..." : "📄 리포트 만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}
