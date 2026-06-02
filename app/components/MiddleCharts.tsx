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
import type { TooltipProps } from "recharts";

interface TrendEntry {
  name: string;
  percent: number;
  count: number;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TrendEntry;
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
        <p className="text-[#B22121] font-bold text-[13px] tracking-tight">
          {data.percent}%{" "}
          <span className="text-gray-500 font-medium ml-1">
            (총 {data.count}건)
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export default function MiddleCharts() {
  const negativeReviewTrend: TrendEntry[] = [
    { name: "05/11", percent: 9.8, count: 32 },
    { name: "05/18", percent: 10.7, count: 38 },
    { name: "05/25", percent: 12.6, count: 45 },
    { name: "06/01", percent: 14.7, count: 53 },
  ];

  const trendingKeywords = [
    {
      rank: 1,
      keyword: "트러블",
      increase: "+45%",
      width: "70%",
      color: "bg-[#848484]",
      textColor: "text-[#848484]",
    },
    {
      rank: 2,
      keyword: "진정",
      increase: "+22%",
      width: "45%",
      color: "bg-[#848484]",
      textColor: "text-[#848484]",
    },
    {
      rank: 3,
      keyword: "성분",
      increase: "+15%",
      width: "30%",
      color: "bg-[#848484]",
      textColor: "text-[#848484]",
    },
    {
      rank: 4,
      keyword: "가격",
      increase: "+8%",
      width: "20%",
      color: "bg-[#848484]",
      textColor: "text-[#848484]",
    },
    {
      rank: 5,
      keyword: "배송",
      increase: "+4%",
      width: "12%",
      color: "bg-[#848484]",
      textColor: "text-[#848484]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* 좌측: Top 5 급상승 키워드 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          Top 5 급상승 키워드
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          <div className="flex flex-col gap-5">
            {trendingKeywords.map((item) => (
              <div key={item.rank} className="flex items-center gap-4">
                <div className="w-4 text-center font-bold text-gray-800 text-[20px]">
                  {item.rank}
                </div>
                <div className="w-16 whitespace-nowrap font-semibold text-gray-800 text-[20px]">
                  {item.keyword}
                </div>
                <div className="flex-1 max-w-[70%] mr-4 bg-gray-100 h-4 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                    style={{ width: item.width }}
                  />
                </div>
                <div
                  className={`w-12 text-right font-bold text-[20px] ${item.textColor}`}
                >
                  {item.increase}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 우측: 부정 리뷰 추이 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          부정 리뷰 추이
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          <div className="w-full relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={negativeReviewTrend}
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
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#f3f4f6", strokeWidth: 2 }}
                />
                <Line
                  type="linear"
                  dataKey="percent"
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
        </div>
      </div>
    </div>
  );
}
