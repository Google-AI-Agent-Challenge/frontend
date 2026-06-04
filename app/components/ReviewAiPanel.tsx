"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ReviewAiPanelProps {
  productId?: string | null;
}

export default function ReviewAiPanel({ productId }: ReviewAiPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [aiBriefing, setAiBriefing] = useState(
    "명령어를 입력하거나 하단의 추천 명령어를 클릭해 보세요. AI가 선택된 제품의 리뷰를 분석하여 인사이트를 제공합니다."
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || chatInput;
    if (!messageToSend.trim()) return;

    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          product_id: productId || "all",
        }),
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      setAiBriefing(data.answer || "응답 내용이 없습니다.");
      setChatInput("");
    } catch (error) {
      console.error(error);
      setAiBriefing("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-white border-l border-gray-100 p-8 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10"
      style={{ flex: 3.5 }}
    >
      {/* 1. Header & Profile */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/favicon.png"
          alt="TONES Logo"
          width={60}
          height={60}
          className="ai-img"
          priority
        />
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
      <div className="bg-pink-50/60 rounded-2xl p-6 border border-pink-100 shadow-sm mb-6 flex flex-col gap-3 relative overflow-hidden transition-all hover:bg-pink-50 min-h-[140px]">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-400"></div>
        <div className="flex items-center">
          <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
            AI Insight Briefing
          </h3>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 animate-pulse mt-1">
            <p className="text-[13.5px] font-bold text-pink-500 tracking-tight">
              AI가 리뷰 데이터를 심층 분석하고 있습니다...
            </p>
            <div className="h-3 bg-pink-200/50 rounded w-full mt-2"></div>
            <div className="h-3 bg-pink-200/50 rounded w-5/6"></div>
            <div className="h-3 bg-pink-200/50 rounded w-4/6"></div>
          </div>
        ) : (
          <p className="text-[13.5px] text-gray-700 leading-relaxed font-medium tracking-tight whitespace-pre-wrap">
            {aiBriefing}
          </p>
        )}
      </div>

      {/* 3. Suggestion Chips */}
      <div className="flex flex-col gap-2 mb-auto">
        <div className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">
          추천 명령어
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "이번달 당근 패드 트러블 부정 리뷰 분석해줘",
            "미나리 패드 데일리 진정 효과 및 수분감 만족도",
            "블루 캐모마일 패드 쿨링 및 진정 효과",
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              disabled={isLoading}
              className={`bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-4 py-2.5 rounded-full text-left leading-snug transition-all
                ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 hover:shadow-sm"}
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Input Field */}
      <div className="mt-6 relative">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          placeholder="명령어를 입력하거나 질문을 하세요..."
          className={`w-full bg-gray-50 border border-gray-200 text-[14px] font-medium rounded-2xl pl-5 pr-20 py-4 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-inner
            ${isLoading ? "opacity-50 cursor-not-allowed" : "focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-50"}
          `}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center transition-all text-xs
            ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-500 hover:shadow-md cursor-pointer"}
          `}
        >
          전송
        </button>
      </div>
    </div>
  );
}
