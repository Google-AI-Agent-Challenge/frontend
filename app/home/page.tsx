"use client";

import { useState, useEffect } from "react";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";

import {
  fetchDashboardSummaryAction,
  fetchTrendingKeywordsAction,
  fetchNegativeTrendAction,
  fetchDashboardInsightsAction,
  fetchAiBriefingAction,
} from "../actions/data";
import type {
  DashboardSummary,
  TrendingKeyword,
  NegativeTrendEntry,
  DashboardInsights,
} from "../types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<number>(30);
  const [productId, setProductId] = useState<string>("all");

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [negativeTrend, setNegativeTrend] = useState<NegativeTrendEntry[]>([]);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string>("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const apiProductId = productId === "all" ? undefined : productId;
        const [summaryData, keywordsData, trendData, insightsData, briefingData] =
          await Promise.all([
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

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
      {/* Phase 2: 상단 KPI 카드 컴포넌트 */}
      <KpiCards
        summary={summary}
        period={period}
        setPeriod={setPeriod}
        productId={productId}
        setProductId={setProductId}
      />

      {/* Phase 3: 중앙 차트 영역 */}
      <MiddleCharts keywords={keywords} negativeTrend={negativeTrend} />

      {/* Phase 4: 하단 분석 리스트 & AI 우측 패널 */}
      <BottomSection insights={insights} aiBriefing={aiBriefing} />
    </div>
  );
}
