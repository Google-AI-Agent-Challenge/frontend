"use client";

import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";

import { sendMessage } from "./actions/chat";

import {
  fetchLatestReviewsAction,
  fetchReviewsByKeywordsAction,
  fetchProductsAction,
  fetchReviewsByProductAction,
  fetchReviewsByIdsAction,
  fetchDashboardStatisticsAction,
  saveLayoutStateAction,
  loadLayoutStateAction,
} from "./actions/data";

// 순수 함수 (클라이언트 번들 크기 최적화 및 모듈 로드 에러 방지용 내장)

import type { Message, Review, Score, Product } from "./types";

const DEFAULT_SCORES: Score[] = [
  { label: "성분 / 트러블", value: 42, max: 100 },
  { label: "제형 / 발림성", value: 85, max: 100 },
  { label: "용기 / 디자인", value: 92, max: 100 },
];

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [scores, setScores]     = useState<Score[]>(DEFAULT_SCORES);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // 대시보드 백엔드 연동 및 레이아웃 상태
  const [aiBriefing, setAiBriefing] = useState<string | undefined>(undefined);
  const [pinnedWidget, setPinnedWidget] = useState<string | null>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [sentimentCounts, setSentimentCounts] = useState<{ positive: number; neutral: number; negative: number }>({ positive: 0, neutral: 0, negative: 0 });
  const userToken = "demo_user_token"; // 로컬/데모용 영구 저장 토큰

  // 초기 데이터 로드 (레이아웃 복원 및 백엔드 통계 바인딩)
  useEffect(() => {
    async function init() {
      try {
        // 1. 레이아웃 상태 DB에서 불러오기 (자가 치유 폴백 포함)
        let dbPinned: string | null = null;
        try {
          dbPinned = await loadLayoutStateAction(userToken);
        } catch (dbErr) {
          console.warn("[DashboardPage] Supabase load layout failed:", dbErr);
        }

        if (dbPinned) {
          setPinnedWidget(dbPinned);
        } else {
          const localPinned = localStorage.getItem("pinnedWidget");
          if (localPinned) {
            setPinnedWidget(localPinned);
          }
        }

        // 2. 제품 목록, 최신 리뷰, 대시보드 통계 병렬 로드
        const [prodData, reviewData, statsData] = await Promise.all([
          fetchProductsAction(),
          fetchLatestReviewsAction(2000),
          fetchDashboardStatisticsAction(null, 90), // 전체 제품 통계 (최근 3개월)
        ]);
        
        if (prodData.length > 0) setProducts(prodData);
        if (reviewData.length > 0) setReviews(reviewData);
        
        if (statsData) {
          setAiBriefing(statsData.ai_briefing);
          setTotalReviews(statsData.total_reviews);
          setSentimentCounts(statsData.sentiment_breakdown);
          const mappedScores: Score[] = [
            { label: "성분 / 트러블", value: Math.round(statsData.attribute_scores.ingredients * 100), max: 100 },
            { label: "제형 / 발림성", value: Math.round(statsData.attribute_scores.formulation * 100), max: 100 },
            { label: "용기 / 디자인", value: Math.round(statsData.attribute_scores.container * 100), max: 100 },
          ];
          setScores(mappedScores);
        }
      } catch (err: any) {
        setPageError(err.message || "초기 데이터 로드 중 알 수 없는 오류가 발생했습니다.");
      }
    }
    init();
  }, []);

  // 수동 위젯 고정/해제 핸들러
  const handlePinWidget = async (widgetKey: string | null) => {
    setPinnedWidget(widgetKey);
    if (widgetKey) {
      localStorage.setItem("pinnedWidget", widgetKey);
    } else {
      localStorage.removeItem("pinnedWidget");
    }
    try {
      await saveLayoutStateAction(userToken, widgetKey);
    } catch (err) {
      console.warn("[handlePinWidget] Failed to save layout to DB:", err);
    }
  };

  // 채팅 전송 핸들러 (자연어 레이아웃 명령 감지 및 통계 실시간 동기화)
  const handleSend = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    // 즉시 메시지 렌더링
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userInput, createdAt: new Date() },
    ]);
    setIsLoading(true);
    setPageError(null);

    try {
      const aiResponse = await sendMessage(userInput);

      let fetchedReviewCount = 0;
      let filtered: Review[] = [];

      if (aiResponse.matchedReviewIds && aiResponse.matchedReviewIds.length > 0) {
        filtered = await fetchReviewsByIdsAction(aiResponse.matchedReviewIds);
      } else if (aiResponse.keywords && aiResponse.keywords.length > 0) {
        filtered = await fetchReviewsByKeywordsAction(aiResponse.keywords, 2000);
      }

      if (filtered.length > 0) {
        setReviews(filtered);
        fetchedReviewCount = filtered.length;
      }

      // 자연어 레이아웃 제어 명령 인터셉트 및 UI 제어
      if (aiResponse.layoutIntent) {
        let mappedWidget: string | null = null;
        if (aiResponse.layoutIntent === "pin_trouble_chart") {
          mappedWidget = "trouble";
        } else if (aiResponse.layoutIntent === "pin_formulation_chart") {
          mappedWidget = "formulation";
        } else if (aiResponse.layoutIntent === "pin_container_chart") {
          mappedWidget = "container";
        } else if (aiResponse.layoutIntent === "reset_layout") {
          mappedWidget = null;
        }

        setPinnedWidget(mappedWidget);
        if (mappedWidget) {
          localStorage.setItem("pinnedWidget", mappedWidget);
        } else {
          localStorage.removeItem("pinnedWidget");
        }
        try {
          await saveLayoutStateAction(userToken, mappedWidget);
        } catch (dbErr) {
          console.warn("[handleSend] Failed to save layout intent to DB:", dbErr);
        }
      }

      // 검색 결과 또는 제품별 실시간 백엔드 통계 동기화
      const matchedProductId = filtered.length > 0 ? filtered[0].product_id : null;
      try {
        const statsData = await fetchDashboardStatisticsAction(matchedProductId, 90);
        if (statsData) {
          setAiBriefing(statsData.ai_briefing);
          setTotalReviews(statsData.total_reviews);
          setSentimentCounts(statsData.sentiment_breakdown);
          const mappedScores: Score[] = [
            { label: "성분 / 트러블", value: Math.round(statsData.attribute_scores.ingredients * 100), max: 100 },
            { label: "제형 / 발림성", value: Math.round(statsData.attribute_scores.formulation * 100), max: 100 },
            { label: "용기 / 디자인", value: Math.round(statsData.attribute_scores.container * 100), max: 100 },
          ];
          setScores(mappedScores);
        }
      } catch (err) {
        console.warn("[handleSend] Failed to fetch updated statistics:", err);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: aiResponse.answer,
          createdAt: new Date(),
          risingKeyword: aiResponse.risingKeyword,
          tags: aiResponse.tags,
          keywords: aiResponse.keywords,
          matchedReviewIds: aiResponse.matchedReviewIds,
          reviewCount: fetchedReviewCount,
          layoutIntent: aiResponse.layoutIntent,
        },
      ]);
    } catch (err: any) {
      setPageError("채팅 전송 오류: " + err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "AI 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 리뷰 엑셀(CSV) 다운로드 핸들러
  const handleExportExcel = async (msg: Message) => {
    try {
      setIsLoading(true);
      let exportReviews: Review[] = reviews;

      if (msg.matchedReviewIds && msg.matchedReviewIds.length > 0) {
        exportReviews = await fetchReviewsByIdsAction(msg.matchedReviewIds);
      } else if (msg.keywords && msg.keywords.length > 0) {
        exportReviews = await fetchReviewsByKeywordsAction(msg.keywords, 100);
      }
      
      if (exportReviews.length === 0) {
        alert("출력할 리뷰가 없습니다.");
        return;
      }

      // CSV 생성 (BOM 추가로 엑셀에서 한글 깨짐 방지)
      const header = ["제품명", "작성자", "별점", "작성일", "감성", "이슈타입", "리뷰내용"];
      const rows = exportReviews.map((r: Review) => [
        r.products?.product_name || "-",
        r.reviewer_type || "-",
        r.rating,
        r.review_date,
        r.sentiment,
        r.issue_type || "-",
        `"${(r.review_text || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ]);

      const csvContent = "\uFEFF" + [header, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tones_reviews_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setPageError("엑셀 다운로드 중 오류 발생: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 패드 선택 핸들러 (토글 선택 해제 시 product = null 수신)
  const handlePadSelect = async (product: Product | null) => {
    setIsLoading(true);
    setPageError(null);
    try {
      const [productReviews, statsData] = await Promise.all([
        product
          ? fetchReviewsByProductAction(product.id, 2000)
          : fetchLatestReviewsAction(2000),
        fetchDashboardStatisticsAction(product ? product.id : null, 90),
      ]);
      setReviews(productReviews);
      if (statsData) {
        setAiBriefing(statsData.ai_briefing);
        setTotalReviews(statsData.total_reviews);
        setSentimentCounts(statsData.sentiment_breakdown);
        const mappedScores: Score[] = [
          { label: "성분 / 트러블", value: Math.round(statsData.attribute_scores.ingredients * 100), max: 100 },
          { label: "제형 / 발림성", value: Math.round(statsData.attribute_scores.formulation * 100), max: 100 },
          { label: "용기 / 디자인", value: Math.round(statsData.attribute_scores.container * 100), max: 100 },
        ];
        setScores(mappedScores);
      }
    } catch (err: any) {
      setPageError("패드 필터 오류: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#121214",
        position: "relative",
      }}
    >
      {/* 화면 중앙 오류 표시창 */}
      {pageError && (
        <div style={{
          position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#FF5E84", color: "#fff", padding: "12px 24px",
          borderRadius: "8px", zIndex: 9999, fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          ⚠️ 오류 발생: {pageError}
        </div>
      )}

      <Sidebar />
      <ChatPanel 
        messages={messages} 
        isLoading={isLoading} 
        onSend={handleSend} 
        onExportExcel={handleExportExcel} 
      />
      <AnalyticsPanel
        reviews={reviews}
        scores={scores}
        products={products}
        isLoading={isLoading}
        onPadSelect={handlePadSelect}
        aiBriefing={aiBriefing}
        pinnedWidget={pinnedWidget}
        onPinWidget={handlePinWidget}
        totalReviews={totalReviews}
        sentimentCounts={sentimentCounts}
      />
    </main>
  );
}
