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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [negativeTrend, setNegativeTrend] = useState<NegativeTrendEntry[]>([]);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string>("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryData, keywordsData, trendData, insightsData, briefingData] =
          await Promise.all([
            fetchDashboardSummaryAction(),
            fetchTrendingKeywordsAction(),
            fetchNegativeTrendAction(),
            fetchDashboardInsightsAction(),
            fetchAiBriefingAction(),
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
  }, []);

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
      <KpiCards summary={summary} />
      <MiddleCharts keywords={keywords} negativeTrend={negativeTrend} />
      <BottomSection insights={insights} aiBriefing={aiBriefing} />
    </div>
  );
}
