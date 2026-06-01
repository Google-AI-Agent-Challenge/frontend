"use client";

import React from "react";

export default function MiddleCharts() {
  const trendingKeywords = [
    {
      rank: 1,
      keyword: "트러블",
      increase: "+45%",
      width: "70%",
      color: "bg-[#e11d48]",
      textColor: "text-[#e11d48]",
    },
    {
      rank: 2,
      keyword: "진정",
      increase: "+22%",
      width: "45%",
      color: "bg-[#e11d48]/80",
      textColor: "text-gray-500",
    },
    {
      rank: 3,
      keyword: "성분",
      increase: "+15%",
      width: "30%",
      color: "bg-[#e11d48]/60",
      textColor: "text-gray-500",
    },
    {
      rank: 4,
      keyword: "가격",
      increase: "+8%",
      width: "20%",
      color: "bg-gray-300",
      textColor: "text-gray-500",
    },
    {
      rank: 5,
      keyword: "배송",
      increase: "+4%",
      width: "12%",
      color: "bg-gray-300",
      textColor: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* 좌측: Top 5 급상승 키워드 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[17px] font-bold text-gray-900 tracking-tight pl-1">
          Top 5 급상승 키워드
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          <div className="flex flex-col gap-5">
            {trendingKeywords.map((item) => (
              <div key={item.rank} className="flex items-center gap-4">
                <div className="w-4 text-center font-bold text-gray-800 text-[15px]">
                  {item.rank}
                </div>
                <div className="w-12 font-semibold text-gray-800 text-[15px]">
                  {item.keyword}
                </div>
                <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                    style={{ width: item.width }}
                  />
                </div>
                <div
                  className={`w-12 text-right font-bold text-[15px] ${item.textColor}`}
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
        <h3 className="text-[17px] font-bold text-gray-900 tracking-tight pl-1">
          부정 리뷰 추이
        </h3>
        <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col justify-center">
          <div className="w-full relative pt-6 pb-2 pr-4 pl-8">
            <svg
              className="w-full h-[160px] overflow-visible"
              viewBox="0 0 400 150"
              preserveAspectRatio="none"
            >
              {/* Y축 가이드 라인 */}
              <path d="M 0 0 L 400 0" stroke="#f3f4f6" strokeWidth="1.5" />
              <path d="M 0 37.5 L 400 37.5" stroke="#f3f4f6" strokeWidth="1.5" />
              <path d="M 0 75 L 400 75" stroke="#f3f4f6" strokeWidth="1.5" />
              <path d="M 0 112.5 L 400 112.5" stroke="#f3f4f6" strokeWidth="1.5" />
              <path d="M 0 150 L 400 150" stroke="#f3f4f6" strokeWidth="1.5" />

              {/* 라인 차트 선 */}
              <path
                d="M 50 100 L 150 85 L 250 65 L 350 30"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-md"
              />

              {/* 1주차 */}
              <circle
                cx="50"
                cy="100"
                r="4.5"
                fill="white"
                stroke="#e11d48"
                strokeWidth="2.5"
              />
              <text
                x="50"
                y="85"
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
                fontWeight="700"
              >
                9.8%
              </text>
              <text
                x="50"
                y="175"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
                fontWeight="600"
              >
                1주차
              </text>

              {/* 2주차 */}
              <circle
                cx="150"
                cy="85"
                r="4.5"
                fill="white"
                stroke="#e11d48"
                strokeWidth="2.5"
              />
              <text
                x="150"
                y="70"
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
                fontWeight="700"
              >
                10.7%
              </text>
              <text
                x="150"
                y="175"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
                fontWeight="600"
              >
                2주차
              </text>

              {/* 3주차 */}
              <circle
                cx="250"
                cy="65"
                r="4.5"
                fill="white"
                stroke="#e11d48"
                strokeWidth="2.5"
              />
              <text
                x="250"
                y="50"
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
                fontWeight="700"
              >
                12.6%
              </text>
              <text
                x="250"
                y="175"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
                fontWeight="600"
              >
                3주차
              </text>

              {/* 4주차 */}
              <circle
                cx="350"
                cy="30"
                r="4.5"
                fill="white"
                stroke="#e11d48"
                strokeWidth="2.5"
              />
              <text
                x="350"
                y="15"
                textAnchor="middle"
                fill="#4b5563"
                fontSize="12"
                fontWeight="700"
              >
                14.7%
              </text>
              <text
                x="350"
                y="175"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
                fontWeight="600"
              >
                4주차
              </text>

              {/* Y축 라벨 */}
              <text x="-15" y="4" textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                20%
              </text>
              <text x="-15" y="41.5" textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                15%
              </text>
              <text x="-15" y="79" textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                10%
              </text>
              <text x="-15" y="116.5" textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                5%
              </text>
              <text x="-15" y="154" textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                0%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
