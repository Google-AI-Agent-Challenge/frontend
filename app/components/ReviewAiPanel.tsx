"use client";

import React from "react";
import { Sparkles, Send } from "lucide-react";

export default function ReviewAiPanel() {
  return (
    <div
      className="flex flex-col w-full h-full bg-white border-l border-gray-100 p-8 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10"
      style={{ flex: 3.5 }}
    >
      {/* 1. Header & Profile */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-pink-300 shadow-[0_4px_12px_rgba(236,72,153,0.3)] flex items-center justify-center">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            AI 어시스턴트
          </h2>
          <p className="text-xs font-bold text-pink-500 mt-0.5">
            리뷰 분석 모드
          </p>
        </div>
      </div>

      {/* 2. Insight Briefing Card */}
      <div className="bg-pink-50/60 rounded-2xl p-6 border border-pink-100 shadow-sm mb-6 flex flex-col gap-3 relative overflow-hidden transition-all hover:bg-pink-50">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-400"></div>
        <div className="flex items-center gap-2">
          <Sparkles className="text-pink-500" size={16} />
          <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
            AI Insight Briefing
          </h3>
        </div>
        <p className="text-[13.5px] text-gray-700 leading-relaxed font-medium tracking-tight">
          최근 30일간의 리뷰 분석 결과,{" "}
          <span className="font-bold text-pink-600">수분감</span>과{" "}
          <span className="font-bold text-pink-600">진정 효과</span>에 대한
          긍정적인 언급이 85%를 차지합니다. 패드의{" "}
          <span className="font-bold text-pink-600">두께감</span>에 대한
          만족도가 높으나, 일부 건성 피부 사용자들이 에센스 양 부족을 지적하고
          있습니다.
        </p>
      </div>

      {/* 3. Suggestion Chips */}
      <div className="flex flex-col gap-2 mb-auto">
        <div className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">
          추천 명령어
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-4 py-2.5 rounded-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 hover:shadow-sm transition-all text-left leading-snug">
            이번달 당근 패드 트러블 부정 리뷰 분석해줘
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-4 py-2.5 rounded-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 hover:shadow-sm transition-all text-left leading-snug">
            마나리 패드 데일리 진정 효과 및 수분감 만족도
          </button>
          <button className="bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-4 py-2.5 rounded-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 hover:shadow-sm transition-all text-left leading-snug">
            블루 캐모마일 패드 쿨링 및 진정 효과
          </button>
        </div>
      </div>

      {/* 4. Input Field */}
      <div className="mt-6 relative">
        <input
          type="text"
          placeholder="명령어를 입력하거나 질문을 하세요..."
          className="w-full bg-gray-50 border border-gray-200 text-[14px] font-medium rounded-2xl pl-5 pr-14 py-4 outline-none focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all text-gray-900 placeholder-gray-400 shadow-inner"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-pink-500 hover:shadow-md transition-all cursor-pointer group">
          <Send
            size={16}
            className="text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
