"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendingKeyword, NegativeTrendEntry } from "../types";

interface MiddleChartsProps {
  keywords: TrendingKeyword[];
  negativeTrend: NegativeTrendEntry[];
}

interface ChartEntry {
  name: string;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartEntry }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
        <p className="text-[#B22121] font-bold text-[13px] tracking-tight">
          {data.count}건
        </p>
      </div>
    );
  }
  return null;
}

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export default function MiddleCharts({ keywords, negativeTrend }: MiddleChartsProps) {
  const maxCount = keywords.length > 0 ? Math.max(...keywords.map((k) => k.count)) : 1;

  const chartData: ChartEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    let count = 0;
    negativeTrend.forEach(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate >= weekStart && entryDate <= weekEnd) {
        count += entry.count;
      }
    });
    
    const name = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
    chartData.push({ name, count });
  }

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* 좌측: Top 5 급상승 키워드 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          Top 5 급상승 키워드
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          {keywords.length === 0 ? (
            <p className="text-gray-400 text-center text-[18px]">데이터 로딩 중...</p>
          ) : (
            <div className="flex flex-col gap-5">
              {keywords.map((item, idx) => {
                const widthPct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.keyword} className="flex items-center gap-4">
                    <div className="w-4 text-center font-bold text-gray-800 text-[20px]">
                      {idx + 1}
                    </div>
                    <div className="w-16 whitespace-nowrap font-semibold text-gray-800 text-[20px]">
                      {item.keyword}
                    </div>
                    <div className="flex-1 max-w-[70%] mr-4 bg-gray-100 h-4 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full bg-[#848484] transition-all duration-700 ease-out"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="w-12 text-right font-bold text-[20px] text-[#848484]">
                      {item.count}회
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 우측: 부정 리뷰 추이 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          부정 리뷰 추이
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          {negativeTrend.length === 0 ? (
            <p className="text-gray-400 text-center text-[18px]">데이터 로딩 중...</p>
          ) : (
            <div className="w-full relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 16, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#f3f4f6", strokeWidth: 2 }}
                  />
                  <Line
                    type="linear"
                    dataKey="count"
                    stroke="#B22121"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#B22121", stroke: "#B22121" }}
                    activeDot={{
                      r: 6,
                      fill: "#B22121",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
