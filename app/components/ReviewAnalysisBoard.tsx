"use client";

import React, { useState, useMemo } from "react";
import { Download, Search, Star, Filter } from "lucide-react";
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

  // 필터링된 리뷰 계산
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchProduct = selectedProductId === "all" || r.product_id === selectedProductId;
      const matchSentiment = sentimentFilter === "all" || r.sentiment === sentimentFilter;
      const matchSearch =
        !searchQuery ||
        r.review_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProduct && matchSentiment && matchSearch;
    });
  }, [reviews, selectedProductId, sentimentFilter, searchQuery]);

  // 통계 계산
  const totalCount = filteredReviews.length;
  const positiveCount = filteredReviews.filter((r) => r.sentiment === "positive").length;
  const negativeCount = filteredReviews.filter((r) => r.sentiment === "negative").length;
  
  const positiveRatio = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;
  const negativeRatio = totalCount > 0 ? Math.round((negativeCount / totalCount) * 100) : 0;
  
  // AI 분석 신뢰도 (임의의 고정값 또는 계산값)
  const aiConfidence = 92.4;

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProductId(val);
    onProductSelect?.(val === "all" ? null : val);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-8 overflow-y-auto" style={{ flex: 6.5 }}>
      {/* 1. 헤더 & 컨트롤 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">리뷰 분석</h2>
          <p className="text-sm text-gray-500 mt-1">리뷰 원문과 AI 분석 태그를 함께 확인해보세요.</p>
        </div>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 bg-white border border-pink-200 text-pink-600 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-pink-50 transition-colors"
        >
          <Download size={18} />
          <span>CSV 내보내기</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</label>
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all appearance-none"
            >
              <option value="all">전체 제품</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand_name} - {p.product_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Period</label>
            <select className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all appearance-none">
              <option>최근 30일</option>
              <option>최근 3개월</option>
              <option>최근 6개월</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-[1.5]">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sentiment</label>
            <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
              {[
                { id: "all", label: "전체" },
                { id: "positive", label: "긍정" },
                { id: "neutral", label: "중립" },
                { id: "negative", label: "부정" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSentimentFilter(tab.id as any)}
                  className={`flex-1 text-sm font-semibold py-1.5 rounded-lg transition-all ${
                    sentimentFilter === tab.id
                      ? "bg-pink-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">주요 속성:</span>
            <div className="flex gap-2">
              <span className="text-xs font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full cursor-pointer hover:bg-pink-100 transition-colors">성분/효과</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">제형/감촉</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">보습/수분</span>
            </div>
          </div>
          <div className="flex-1 relative ml-auto max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="리뷰 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full pl-9 pr-4 py-2 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* 2. 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400">분석 리뷰 총계</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{isLoading ? "-" : totalCount.toLocaleString()}건</div>
          <span className="text-[11px] font-semibold text-pink-500 mt-1">~12% 증가 (전월대비)</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400">긍정 비율</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{isLoading ? "-" : `${positiveRatio}%`}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${positiveRatio}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-400">부정 비율</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{isLoading ? "-" : `${negativeRatio}%`}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-pink-500 h-full rounded-full" style={{ width: `${negativeRatio}%` }}></div>
          </div>
        </div>
        <div className="bg-pink-500 rounded-2xl p-5 shadow-sm border border-pink-600 flex flex-col gap-1">
          <span className="text-xs font-bold text-pink-100">AI 분석 신뢰도</span>
          <div className="text-2xl font-extrabold text-white mt-1">{aiConfidence}%</div>
          <span className="text-[11px] font-semibold text-pink-200 mt-1 uppercase">TONES LLM 4.0</span>
        </div>
      </div>

      {/* 3. 리뷰 리스트 */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Reviews</h3>
          <span className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 transition-colors">최신순 정렬</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {isLoading && <div className="text-center text-gray-400 py-10 text-sm font-medium">데이터를 불러오는 중입니다...</div>}
          
          {!isLoading && filteredReviews.length === 0 && (
            <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border border-dashed border-gray-200 text-sm font-medium">
              조건에 맞는 리뷰가 없습니다.
            </div>
          )}

          {!isLoading && filteredReviews.slice(0, 10).map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "text-pink-500 fill-pink-500" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {review.products?.product_name || "알 수 없는 제품"} · {new Date(review.review_date || review.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {review.reviewer_type && (
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
                      {review.reviewer_type}
                    </span>
                  )}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    review.sentiment === 'positive' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                    review.sentiment === 'negative' ? 'text-pink-600 bg-pink-50 border-pink-100' :
                    'text-gray-600 bg-gray-50 border-gray-200'
                  }`}>
                    {review.sentiment === 'positive' ? 'Positive' : review.sentiment === 'negative' ? 'Negative' : 'Neutral'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {review.review_text}
              </p>

              <div className="flex flex-wrap gap-2 mt-1">
                {review.issue_type && (
                  <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">
                    {review.issue_type}
                  </span>
                )}
                {(review.keywords || []).map((tag, idx) => (
                  <span key={idx} className="text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                    # {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
