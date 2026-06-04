"use client";

import React, { useState, useMemo } from "react";
import type { Review, Product } from "../types";

interface ReviewAnalysisBoardProps {
  reviews: Review[];
  products: Product[];
  isLoading?: boolean;
  onExportExcel?: () => void;
  onProductSelect?: (productId: string | null) => void;
}

export default function ReviewAnalysisBoard({
  reviews,
  products,
  isLoading = false,
  onExportExcel,
  onProductSelect,
}: ReviewAnalysisBoardProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | "all">(
    "all",
  );
  const [sentimentFilter, setSentimentFilter] = useState<
    "all" | "positive" | "neutral" | "negative"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | "7" | "30">("all");
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchProduct =
        selectedProductId === "all" || r.product_id === selectedProductId;
      const matchSentiment =
        sentimentFilter === "all" || r.sentiment === sentimentFilter;
      const matchSearch =
        !searchQuery ||
        r.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.keywords?.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      let matchPeriod = true;
      if (periodFilter !== "all" && r.review_date) {
        const reviewDate = new Date(r.review_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchPeriod = diffDays <= parseInt(periodFilter);
      }

      return matchProduct && matchSentiment && matchSearch && matchPeriod;
    });
  }, [reviews, selectedProductId, sentimentFilter, searchQuery, periodFilter]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProductId(val);
    onProductSelect?.(val === "all" ? null : val);
  };

  const totalCount = filteredReviews.length;

  const displayReviews =
    filteredReviews.length > 0
      ? filteredReviews.map((r, i) => ({
          id: r.id || `r-${i}`,
          rating: r.rating || 5,
          skinType: r.reviewer_type || "복합성 피부",
          productName: r.products?.product_name || "알 수 없는 제품",
          text: r.review_text || "",
          hashtags: r.keywords || [],
          date: r.review_date || new Date().toLocaleDateString(),
        }))
      : [];

  const PRODUCT_STYLE_MAP = [
    {
      keyword: "당근",
      imgSrc: "/images/carrot.png",
      bg: "#3a1820",
      activeColor: "#FF5E84",
    },
    {
      keyword: "도토리",
      imgSrc: "/images/acorn.png",
      bg: "#2a2520",
      activeColor: "#b07840",
    },
    {
      keyword: "감자",
      imgSrc: "/images/potato.png",
      bg: "#28281e",
      activeColor: "#c8b060",
    },
    {
      keyword: "미나리",
      imgSrc: "/images/parsley.png",
      bg: "#1e2820",
      activeColor: "#60a870",
    },
    {
      keyword: "라이스",
      imgSrc: "/images/rice.png",
      bg: "#262624",
      activeColor: "#d4cbb3",
    },
    {
      keyword: "복숭아",
      imgSrc: "/images/peach.png",
      bg: "#2c1e22",
      activeColor: "#ff99bb",
    },
    {
      keyword: "레몬그라스",
      imgSrc: "/images/niac.png",
      bg: "#1a2622",
      activeColor: "#7accb5",
    },
    {
      keyword: "블루 캐모마일",
      imgSrc: "/images/blue.png",
      bg: "#18202c",
      activeColor: "#7fb2f0",
    },
    {
      keyword: "샤인머스캣",
      imgSrc: "/images/cica.png",
      bg: "#1e261e",
      activeColor: "#90c95c",
    },
    {
      keyword: "아스파라거스",
      imgSrc: "/images/clut.png",
      bg: "#20261c",
      activeColor: "#a6c478",
    },
    {
      keyword: "핑크자몽",
      imgSrc: "/images/aha.png",
      bg: "#2c1c1c",
      activeColor: "#ff8270",
    },
  ];

  return (
    <div
      className="flex flex-col w-full h-full bg-slate-50 p-8 overflow-y-auto pink-scrollbar"
      style={{ flex: 6.5 }}
    >
      {/* 1. Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          리뷰 분석
        </h2>
        <button
          onClick={onExportExcel}
          className="flex items-center bg-white border border-pink-200 text-pink-600 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-pink-50 transition-colors"
        >
          <span>데이터 내보내기</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-6 items-end mb-8">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Product
          </label>
          <select
            value={selectedProductId}
            onChange={handleProductChange}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all appearance-none"
          >
            <option value="all">전체 제품 (All Products)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand_name} - {p.product_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Period
          </label>
          <select
            value={periodFilter}
            onChange={(e) =>
              setPeriodFilter(e.target.value as "all" | "7" | "30")
            }
            className="bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all appearance-none"
          >
            <option value="all">전체 (All)</option>
            <option value="7">최근 7일 (Last 7 Days)</option>
            <option value="30">최근 30일 (Last 30 Days)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-[1.5]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Sentiment
          </label>
          <div className="flex bg-gray-50 rounded-xl p-1.5 border border-gray-200">
            {(
              [
                { id: "all", label: "전체" },
                { id: "positive", label: "긍정" },
                { id: "neutral", label: "중립" },
                { id: "negative", label: "부정" },
              ] as {
                id: "all" | "positive" | "neutral" | "negative";
                label: string;
              }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSentimentFilter(tab.id)}
                className={`flex-1 text-sm font-bold py-2 rounded-lg transition-all ${
                  sentimentFilter === tab.id
                    ? "bg-[#F9A2C0] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 4. Bottom Product Lineup Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            제품 라인업
          </h3>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {PRODUCT_STYLE_MAP.map((prod, idx) => {
            const matchedProduct = products.find(
              (p) =>
                p.product_name?.includes(prod.keyword) ||
                (prod.keyword === "당근" && p.product_name?.includes("캐롯")) ||
                (prod.keyword === "미나리" &&
                  p.product_name?.includes("파슬리")),
            );
            const isSelected =
              matchedProduct && selectedProductId === matchedProduct.id;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (matchedProduct) {
                    const newId = isSelected ? "all" : matchedProduct.id;
                    setSelectedProductId(newId);
                    onProductSelect?.(newId === "all" ? null : newId);
                  }
                }}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-pink-50 border-pink-400 shadow-md scale-105"
                    : "bg-white border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 hover:-translate-y-1"
                }`}
              >
                <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.imgSrc}
                    alt={prod.keyword}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>
                <span
                  className={`text-[13px] font-bold ${
                    isSelected ? "text-pink-600" : "text-gray-700"
                  }`}
                >
                  {prod.keyword}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-6 mb-8">
        {/* 2. Skincare Attribute Score Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              스킨케어 속성 점수
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {[
              { label: "성분 / 트러블", score: 85 },
              { label: "수분 / 보습", score: 90 },
              { label: "용기 / 디자인", score: 45 },
            ].map((attr, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-700">
                    {attr.label}
                  </span>
                  <span className="text-sm font-bold text-pink-500">
                    {attr.score}
                    <span className="text-gray-400 text-xs">/100</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-300 h-full rounded-full"
                    style={{ width: `${attr.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Full Review List Area */}
        <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                전체 리뷰
              </h3>
              <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                {totalCount.toLocaleString()}건
              </span>
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="리뷰 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-sm font-medium rounded-full pl-4 pr-4 py-2 outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="text-center text-gray-400 py-10 text-sm font-medium">
                데이터를 불러오는 중입니다...
              </div>
            ) : (
              <>
                {displayReviews.slice(0, visibleCount).map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5 text-pink-500 text-sm">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                            {review.skinType}
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {review.productName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                      {review.text
                        .split(/(붉어지고|트러블|자극적|수분감|진정)/)
                        .map((part, i) => {
                          if (
                            [
                              "붉어지고",
                              "트러블",
                              "자극적",
                              "수분감",
                              "진정",
                            ].includes(part)
                          ) {
                            return (
                              <span
                                key={i}
                                className="bg-pink-100/50 text-pink-600 px-1 rounded"
                              >
                                {part}
                              </span>
                            );
                          }
                          return part;
                        })}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {visibleCount < displayReviews.length && (
                  <button
                    onClick={handleLoadMore}
                    className="w-full mt-2 mb-2 bg-white border border-pink-200 text-pink-500 font-bold py-3 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm"
                  >
                    더보기 ({visibleCount} / {displayReviews.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
