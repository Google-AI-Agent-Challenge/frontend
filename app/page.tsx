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
} from "./actions/data";

// 순수 함수 (클라이언트 번들 크기 최적화 및 모듈 로드 에러 방지용 내장)
function filterNegativeReviews(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.sentiment === "negative" || r.rating <= 2);
}

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
  // 초기 데이터 로드
  useEffect(() => {
    async function init() {
      try {
        const [prodData, reviewData] = await Promise.all([
          fetchProductsAction(),
          fetchLatestReviewsAction(20),
        ]);
        
        if (prodData.length > 0) setProducts(prodData);
        if (reviewData.length > 0) {
          setReviews(reviewData);
          setScores(calculateScores(reviewData));
        }
      } catch (err: any) {
        setPageError(err.message || "초기 데이터 로드 중 알 수 없는 오류가 발생했습니다.");
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
    setPageError(null);

    try {
      const aiResponse = await sendMessage(userInput);

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: aiResponse.answer, createdAt: new Date() },
      ]);

      if (aiResponse.keywords && aiResponse.keywords.length > 0) {
        const filtered = await fetchReviewsByKeywordsAction(aiResponse.keywords, 20);
        setReviews(filtered);
        setScores(filtered.length > 0 ? calculateScores(filtered) : DEFAULT_SCORES);
      }
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

  // 패드 선택 핸들러
  const handlePadSelect = async (product: Product) => {
    setIsLoading(true);
    setPageError(null);
    try {
      const productReviews = await fetchReviewsByProductAction(product.id, 20);
      setReviews(productReviews);
      setScores(productReviews.length > 0 ? calculateScores(productReviews) : DEFAULT_SCORES);
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
      <ChatPanel messages={messages} isLoading={isLoading} onSend={handleSend} />
      <AnalyticsPanel
        reviews={filterNegativeReviews(reviews)}
        scores={scores}
        products={products}
        isLoading={isLoading}
        onPadSelect={handlePadSelect}
      />
    </main>
  );
}
