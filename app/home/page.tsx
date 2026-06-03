"use client";

import { useState, useEffect } from "react";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";
import ReviewModal from "../components/ReviewModal";

import {
  fetchDashboardSummaryAction,
  fetchTrendingKeywordsAction,
  fetchNegativeTrendAction,
  fetchDashboardInsightsAction,
  fetchAiBriefingAction,
  fetchReviewsWithFilterAction,
  fetchReviewsByIdsAction,
} from "../actions/data";
import type {
  DashboardSummary,
  TrendingKeyword,
  NegativeTrendEntry,
  DashboardInsights,
  Review,
} from "../types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<number>(30);
  const [productId, setProductId] = useState<string>("all");

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [negativeTrend, setNegativeTrend] = useState<NegativeTrendEntry[]>([]);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"negative" | "priority">("negative");
  const [modalReviews, setModalReviews] = useState<Review[]>([]);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const apiProductId = productId === "all" ? undefined : productId;
        const [
          summaryData,
          keywordsData,
          trendData,
          insightsData,
          briefingData,
        ] = await Promise.all([
          fetchDashboardSummaryAction(apiProductId, period),
          fetchTrendingKeywordsAction(apiProductId, period),
          fetchNegativeTrendAction(apiProductId, period),
          fetchDashboardInsightsAction(apiProductId, period),
          fetchAiBriefingAction(apiProductId, period),
        ]);

        setSummary(summaryData);
        setKeywords(keywordsData);
        setNegativeTrend(trendData);
        setInsights(insightsData);
        setAiBriefing(briefingData);
      } catch (err: unknown) {
        console.error("대시보드 데이터 로드 오류:", err);
      }
    }
    loadDashboard();
  }, [period, productId]);

  // Close modal when filters change
  useEffect(() => {
    setIsModalOpen(false);
    setModalReviews([]);
  }, [period, productId]);

  const handleCardClick = async (type: "negative" | "priority") => {
    setModalType(type);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalReviews([]);

    try {
      const apiProductId = productId === "all" ? undefined : productId;
      
      if (type === "negative") {
        const allData = await fetchReviewsWithFilterAction(apiProductId, undefined, period, 500);
        const negativeData = allData.filter(r => r.sentiment === "negative" || r.rating <= 2);
        setModalReviews(negativeData);
      } else {
        if (summary?.urgent_reviews_summary && summary.urgent_reviews_summary.length > 0) {
          const ids = summary.urgent_reviews_summary.map((item) => item.id);
          const data = await fetchReviewsByIdsAction(ids);
          // If fetch by ids fails to return items, try to match locally from recent reviews
          if (!data || data.length === 0) {
             const allData = await fetchReviewsWithFilterAction(apiProductId, undefined, period, 500);
             const matched = allData.filter(r => ids.includes(r.id) || (r.review_id && ids.includes(r.review_id)));
             setModalReviews(matched);
          } else {
             setModalReviews(data);
          }
        } else {
          setModalReviews([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews for modal:", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
      {/* Phase 2: 상단 KPI 카드 컴포넌트 */}
      <KpiCards
        summary={summary}
        period={period}
        setPeriod={setPeriod}
        productId={productId}
        setProductId={setProductId}
        onCardClick={handleCardClick}
      />

      {/* Phase 3: 중앙 차트 영역 */}
      <MiddleCharts keywords={keywords} negativeTrend={negativeTrend} period={period} />

      {/* Phase 4: 하단 분석 리스트 & AI 우측 패널 */}
      <BottomSection insights={insights} aiBriefing={aiBriefing} period={period} productId={productId} />

      {/* Review Details Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "negative" ? "부정 리뷰 목록" : "우선 확인 리뷰 목록"}
        reviews={modalReviews}
        isLoading={isModalLoading}
      />
    </div>
  );
}
