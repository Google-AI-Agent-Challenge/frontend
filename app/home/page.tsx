"use client";

import { useState } from "react";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";

export default function DashboardPage() {
  const [period, setPeriod] = useState<number>(30);
  const [productId, setProductId] = useState<string>("all");

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
      {/* Phase 2: 상단 KPI 카드 컴포넌트 */}
      <KpiCards
        period={period}
        setPeriod={setPeriod}
        productId={productId}
        setProductId={setProductId}
      />

      {/* Phase 3: 중앙 차트 영역 */}
      <MiddleCharts period={period} productId={productId} />

      {/* Phase 4: 하단 분석 리스트 & AI 우측 패널 */}
      <BottomSection period={period} productId={productId} />
    </div>
  );
}
