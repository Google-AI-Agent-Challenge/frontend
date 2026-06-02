"use client";

import { useState, useEffect } from "react";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";

import { fetchReviewsCountAction, fetchReviewsPageAction } from "../actions/data";
import type { Review } from "../types";

const CHUNK_SIZE = 500;

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function loadAllReviews() {
      try {
        const { total } = await fetchReviewsCountAction();
        if (total === 0) return;

        const totalChunks = Math.ceil(total / CHUNK_SIZE);
        const chunkRequests = Array.from({ length: totalChunks }, (_, i) =>
          fetchReviewsPageAction(i + 1, CHUNK_SIZE)
        );

        const chunks = await Promise.all(chunkRequests);
        setReviews(chunks.flat());
      } catch (err: unknown) {
        console.error("리뷰 데이터 로드 오류:", err);
      }
    }
    loadAllReviews();
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
