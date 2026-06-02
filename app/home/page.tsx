"use client";

import { useState, useEffect } from "react";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";

import { fetchLatestReviewsAction } from "../actions/data";
import type { Review } from "../types";

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  // 초기 리뷰 데이터 로드 (최대 10000건)
  useEffect(() => {
    async function init() {
      try {
        const reviewData = await fetchLatestReviewsAction(200);
        if (reviewData.length > 0) {
          setReviews(reviewData);
        }
      } catch (err: any) {
        console.error("초기 데이터 로드 오류:", err);
      }
    }
    init();
  }, []);

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
      {/* Phase 2: 상단 KPI 카드 컴포넌트 */}
      <KpiCards reviews={reviews} />

      {/* Phase 3: 중앙 차트 영역 */}
      <MiddleCharts />

      {/* Phase 4: 하단 분석 리스트 & AI 우측 패널 */}
      <BottomSection />
    </div>
  );
}
