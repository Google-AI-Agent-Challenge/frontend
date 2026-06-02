"use client";

import React, { useState, useMemo } from "react";
import { Download, Search, Star, Sparkles, Image as ImageIcon } from "lucide-react";
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
  const [selectedProductId, setSelectedProductId] = useState<string | "all">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchProduct = selectedProductId === "all" || r.product_id === selectedProductId;
      const matchSentiment = sentimentFilter === "all" || r.sentiment === sentimentFilter;
      const matchSearch =
        !searchQuery ||
        r.review_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProduct && matchSentiment && matchSearch;
    });
  }, [reviews, selectedProductId, sentimentFilter, searchQuery]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProductId(val);
    onProductSelect?.(val === "all" ? null : val);
  };

  const totalCount = filteredReviews.length > 0 ? filteredReviews.length : 1842;

  const dummyReviews = [
    {
      id: "d1",
      rating: 5,
      skinType: "민감성 피부",
      productName: "스킨푸드 - 캐롯 카로틴 카밍 워터 패드 (당근 패드)",
      text: "피부가 얇고 붉어지는 편인데, 이거 쓰고 붉은기가 많이 진정됐어요! 패드도 도톰해서 피부 마찰도 덜하고 팩처럼 올려두기 너무 좋아요.",
      hashtags: ["#진정", "#도톰한패드", "#수분감"],
      date: "2023.10.15",
    },
    {
      id: "d2",
      rating: 4,
      skinType: "건성 피부",
      productName: "스킨푸드 - 캐롯 카로틴 카밍 워터 패드 (당근 패드)",
      text: "수분감은 진짜 최고예요. 근데 용기 뚜껑이 좀 부실해서 꽉 안 닫히는 느낌이 있어요. 제품 자체는 너무 만족합니다.",
      hashtags: ["#수분감", "#용기개선"],
      date: "2023.10.12",
    },
    {
      id: "d3",
      rating: 2,
      skinType: "지성 피부",
      productName: "에센허브 - 티트리 수딩 인 카밍 패드",
      text: "트러블 때문에 샀는데, 제 피부에는 좀 따갑고 자극적이었어요. 티트리 특유의 향도 너무 강해서 호불호가 갈릴 듯합니다.",
      hashtags: ["#트러블", "#자극", "#향호불호"],
      date: "2023.10.10",
    },
    {
      id: "d4",
      rating: 5,
      skinType: "복합성 피부",
      productName: "아누아 - 어성초 77 클리어 패드",
      text: "매일 아침 저녁으로 쓰는데 수분감도 좋고 진정 효과도 확실해요. 재구매 의사 100% 입니다.",
      hashtags: ["#진정", "#수분감", "#재구매"],
      date: "2023.10.09",
    },
    {
      id: "d5",
      rating: 3,
      skinType: "건성 피부",
      productName: "더마토리 - 시카 레스큐 진정 패드",
      text: "진정 효과는 나쁘지 않은데, 건성인 저한테는 수분감이 살짝 부족한 느낌이에요. 에센스가 더 듬뿍 들어있으면 좋겠어요.",
      hashtags: ["#진정", "#건성피부", "#수분감부족"],
      date: "2023.10.08",
    },
    {
      id: "d6",
      rating: 5,
      skinType: "민감성 피부",
      productName: "스킨푸드 - 캐롯 카로틴 카밍 워터 패드 (당근 패드)",
      text: "인생 패드입니다! 너무 자극적이지 않고 부드러워서 트러블 났을 때 올려두면 금방 가라앉아요.",
      hashtags: ["#인생템", "#트러블", "#무자극"],
      date: "2023.10.05",
    }
  ];

  const displayReviews = filteredReviews.length > 0 ? filteredReviews.slice(0, 50).map((r, i) => ({
    id: r.id || `r-${i}`,
    rating: r.rating || 5,
    skinType: r.reviewer_type || "복합성 피부",
    productName: r.products?.product_name || "알 수 없는 제품",
    text: r.review_text || "",
    hashtags: r.keywords || [],
    date: r.review_date || new Date().toLocaleDateString(),
  })) : dummyReviews;

  const productLineup = [
    { name: "당근 카밍 워터 패드", brand: "스킨푸드" },
    { name: "티트리 수딩 인 카밍 패드", brand: "에센허브" },
    { name: "어성초 77 클리어 패드", brand: "아누아" },
    { name: "시카 레스큐 진정 패드", brand: "더마토리" },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-8 overflow-y-auto pink-scrollbar" style={{ flex: 6.5 }}>
      {/* 1. Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">리뷰 분석</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">리뷰 데이터와 AI 분석 결과를 한눈에 확인하세요.</p>
        </div>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 bg-white border border-pink-200 text-pink-600 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-pink-50 transition-colors"
        >
          <Download size={18} />
          <span>데이터 내보내기</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-6 items-end mb-8">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product</label>
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
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Period</label>
          <select className="bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all appearance-none">
            <option>최근 30일 (Last 30 Days)</option>
            <option>최근 3개월</option>
            <option>최근 6개월</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-[1.5]">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sentiment</label>
          <div className="flex bg-gray-50 rounded-xl p-1.5 border border-gray-200">
            {(
              [
                { id: "all", label: "전체" },
                { id: "positive", label: "긍정" },
                { id: "neutral", label: "중립" },
                { id: "negative", label: "부정" },
              ] as { id: "all" | "positive" | "neutral" | "negative"; label: string }[]
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

      <div className="flex flex-col gap-6 mb-8">
        {/* 2. Skincare Attribute Score Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-pink-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">스킨케어 속성 점수</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {[
              { label: "성분 / 트러블", score: 85 },
              { label: "수분 / 보습", score: 90 },
              { label: "용기 / 디자인", score: 45 },
            ].map((attr, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-700">{attr.label}</span>
                  <span className="text-sm font-bold text-pink-500">{attr.score}<span className="text-gray-400 text-xs">/100</span></span>
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
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">전체 리뷰</h3>
              <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full">{totalCount.toLocaleString()}건</span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="리뷰 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-sm font-medium rounded-full pl-9 pr-4 py-2 outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="text-center text-gray-400 py-10 text-sm font-medium">데이터를 불러오는 중입니다...</div>
            ) : (
              <>
                {displayReviews.slice(0, visibleCount).map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-3 transition-colors hover:bg-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "text-pink-500 fill-pink-500" : "text-gray-200 fill-gray-200"} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                            {review.skinType}
                          </span>
                          <span className="text-xs font-bold text-gray-700">{review.productName}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                      {review.text.split(/(붉어지고|트러블|자극적|수분감|진정)/).map((part, i) => {
                        if (['붉어지고', '트러블', '자극적', '수분감', '진정'].includes(part)) {
                          return <span key={i} className="bg-pink-100/50 text-pink-600 px-1 rounded">{part}</span>;
                        }
                        return part;
                      })}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
                          {tag.startsWith('#') ? tag : `#${tag}`}
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

        {/* 4. Bottom Product Lineup Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="text-pink-500" size={20} />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">제품 라인업</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productLineup.map((prod, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-3 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs text-gray-400 font-bold">IMG</span>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-pink-500 mb-0.5">{prod.brand}</div>
                  <div className="text-xs font-bold text-gray-700 line-clamp-1">{prod.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
