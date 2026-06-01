"use client";

import { useState, useEffect } from "react";

import ChatPanel from "../components/ChatPanel";
import AnalyticsPanel from "../components/AnalyticsPanel";
import KpiCards from "../components/KpiCards";
import MiddleCharts from "../components/MiddleCharts";
import BottomSection from "../components/BottomSection";

import { sendMessage } from "../actions/chat";

import {
  fetchLatestReviewsAction,
  fetchReviewsByKeywordsAction,
  fetchProductsAction,
  fetchReviewsByProductAction,
  fetchReviewsByIdsAction,
} from "../actions/data";

// 순수 함수 (클라이언트 번들 크기 최적화 및 모듈 로드 에러 방지용 내장)

function calculateScores(reviews: Review[]): Score[] {
  const attributes = [
    { label: "성분 / 트러블", keywords: ["트러블", "성분", "붉은기", "여드름", "좁쌀", "따가움", "자극"], issueTypes: ["트러블", "성분", "자극"] },
    { label: "제형 / 발림성", keywords: ["발림성", "제형", "흡수", "촉촉", "텍스처", "밀림", "끈적"], issueTypes: ["발림성", "제형"] },
    { label: "용기 / 디자인", keywords: ["용기", "디자인", "패키지", "포장", "뚜껑", "불량"], issueTypes: ["용기불량", "용기", "디자인"] },
  ];

  return attributes.map(({ label, keywords, issueTypes }) => {
    const related = reviews.filter((r) => {
      if (r.issue_type && issueTypes.some((t) => r.issue_type!.includes(t))) return true;
      return keywords.some((kw) => r.review_text?.toLowerCase().includes(kw.toLowerCase()));
    });

    if (related.length === 0) return { label, value: 50, max: 100 };

    const avgScore = related.reduce((sum, r) => {
      if (r.sentiment_score !== null && r.sentiment_score !== undefined) return sum + Number(r.sentiment_score);
      return sum + (r.rating - 1) / 4;
    }, 0) / related.length;

    return { label, value: Math.max(1, Math.min(100, Math.round(avgScore * 100))), max: 100 };
  });
}

import type { Message, Review, Score, Product } from "../types";

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
  // 초기 데이터 로드
  useEffect(() => {
    async function init() {
      try {
        const [prodData, reviewData] = await Promise.all([
          fetchProductsAction(),
          fetchLatestReviewsAction(2000),
        ]);
        
        if (prodData.length > 0) setProducts(prodData);
        if (reviewData.length > 0) {
          setReviews(reviewData);
          setScores(calculateScores(reviewData));
        }
      } catch (err: any) {
        console.error("초기 데이터 로드 오류:", err);
      }
    }
    init();
  }, []);

  // 채팅 전송 핸들러
  const handleSend = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    // 즉시 메시지 렌더링
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userInput, createdAt: new Date() },
    ]);
    setIsLoading(true);

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
        setScores(calculateScores(filtered));
        fetchedReviewCount = filtered.length;
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
        },
      ]);
    } catch (err: any) {
      console.error("채팅 전송 오류:", err);
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
      console.error("엑셀 다운로드 중 오류 발생:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 패드 선택 핸들러
  const handlePadSelect = async (product: Product) => {
    setIsLoading(true);
    try {
      const productReviews = await fetchReviewsByProductAction(product.id, 2000);
      setReviews(productReviews);
      setScores(productReviews.length > 0 ? calculateScores(productReviews) : DEFAULT_SCORES);
    } catch (err: any) {
      console.error("패드 필터 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>


      {/* 홈(대시보드) 영역 */}
      <div className="flex-1 flex flex-col p-10 overflow-y-auto w-full h-full">
        {/* Phase 2: 상단 KPI 카드 컴포넌트 */}
        <KpiCards reviews={reviews} />

        {/* Phase 3: 중앙 차트 영역 */}
        <MiddleCharts />

        {/* Phase 4: 하단 분석 리스트 & AI 우측 패널 */}
        <BottomSection />
      </div>

      {/* 로직 보존을 위해 기존 컴포넌트 임시 숨김 처리 */}
      <div style={{ display: "none" }}>
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
        />
      </div>
    </>
  );
}
