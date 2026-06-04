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
  const [period, setPeriod] = useState<number>(9999);
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

  const [prefetchedNegative, setPrefetchedNegative] = useState<Review[] | null>(null);
  const [prefetchedPriority, setPrefetchedPriority] = useState<Review[] | null>(null);

  // Helper function to fetch and format priority reviews
  const loadPriorityReviews = async (summaryData: DashboardSummary) => {
    if (summaryData.urgent_reviews_summary && summaryData.urgent_reviews_summary.length > 0) {
      const ids = summaryData.urgent_reviews_summary.map((item) => item.id);
      const data = await fetchReviewsByIdsAction(ids);
      
      const fetchedIds = data.map((r) => r.id);
      const missingReviews: Review[] = summaryData.urgent_reviews_summary
        .filter((item) => !fetchedIds.includes(item.id))
        .map((item) => ({
          id: item.id,
          product_id: "unknown",
          source: "mock",
          reviewer_type: "general",
          review_text: "💡 원문 데이터를 찾을 수 없어 AI 요약본으로 대체합니다:\n\n" + item.summary,
          rating: item.rating,
          review_date: new Date().toISOString().split("T")[0],
          sentiment: "negative",
          sentiment_score: 0,
          keywords: [],
          issue_type: "other",
          ai_summary: item.summary,
          created_at: new Date().toISOString(),
          review_id: item.id,
        }));
        
      return [...data, ...missingReviews];
    }
    return [];
  };

  useEffect(() => {
    const apiProductId = productId === "all" ? undefined : productId;

    // 모달용 프리페치 상태 초기화
    setPrefetchedNegative(null);
    setPrefetchedPriority(null);

    // 각 API를 독립적으로 호출하여, 먼저 도착하는 데이터부터 즉시 렌더링
    fetchDashboardSummaryAction(apiProductId, period)
      .then((data) => {
        setSummary(data);
        if (data) {
          loadPriorityReviews(data).then(res => setPrefetchedPriority(res));
        }
      })
      .catch((err) => console.error("summary 로드 오류:", err));

    fetchTrendingKeywordsAction(apiProductId, period)
      .then((data) => setKeywords(data))
      .catch((err) => console.error("keywords 로드 오류:", err));

    fetchNegativeTrendAction(apiProductId, period)
      .then((data) => setNegativeTrend(data))
      .catch((err) => console.error("negativeTrend 로드 오류:", err));

    fetchDashboardInsightsAction(apiProductId, period)
      .then((data) => setInsights(data))
      .catch((err) => console.error("insights 로드 오류:", err));

    fetchAiBriefingAction(apiProductId, period)
      .then((data) => setAiBriefing(data))
      .catch((err) => console.error("aiBriefing 로드 오류:", err));

    // 부정 리뷰 프리페칭
    fetchReviewsWithFilterAction(apiProductId, "negative", period, 5000, false)
      .then((data) => setPrefetchedNegative(data))
      .catch((err) => console.error("negative reviews 프리페치 오류:", err));
  }, [period, productId]);

  // Close modal when filters change
  useEffect(() => {
    setIsModalOpen(false);
    setModalReviews([]);
  }, [period, productId]);

  const handleCardClick = async (type: "negative" | "priority") => {
    setModalType(type);
    setIsModalOpen(true);
    setModalReviews([]);

    if (type === "negative") {
      if (prefetchedNegative) {
        setModalReviews(prefetchedNegative);
      } else {
        setIsModalLoading(true);
        const apiProductId = productId === "all" ? undefined : productId;
        const data = await fetchReviewsWithFilterAction(apiProductId, "negative", period, 5000, false);
        setModalReviews(data);
        setPrefetchedNegative(data);
        setIsModalLoading(false);
      }
    } else {
      if (prefetchedPriority) {
        setModalReviews(prefetchedPriority);
      } else {
        setIsModalLoading(true);
        if (summary) {
          const data = await loadPriorityReviews(summary);
          setModalReviews(data);
          setPrefetchedPriority(data);
        }
        setIsModalLoading(false);
      }
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

      {/* Phase 4: 하단 주요 분석 및 브리핑 영역 */}
      <BottomSection
        insights={insights}
        keywords={keywords}
        aiBriefing={aiBriefing}
        period={period}
        productId={productId}
        reviews={prefetchedPriority || []}
      />

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
