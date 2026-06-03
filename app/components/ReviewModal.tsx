"use client";

import React, { useEffect } from "react";
import { X, Star, AlertCircle, MessageSquare } from "lucide-react";
import type { Review } from "../types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reviews: Review[];
  isLoading: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  title,
  reviews,
  isLoading,
}: ReviewModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-3xl max-h-[85vh] flex flex-col z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-500">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                총 {reviews.length}개의 관련 리뷰가 조회되었습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 min-h-[200px] pink-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
              <span className="text-sm font-bold text-gray-400">데이터를 분석 및 로딩 중입니다...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <AlertCircle size={40} className="text-gray-300" />
              <span className="text-sm font-bold text-gray-400">조건에 일치하는 리뷰 데이터가 존재하지 않습니다.</span>
            </div>
          ) : (
            reviews.map((review, i) => (
              <div
                key={review.id || `modal-r-${i}`}
                className="bg-slate-50 hover:bg-slate-100/70 border border-gray-100 hover:border-gray-200 rounded-2xl p-6 transition-all duration-200 flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {/* Rating Stars */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={
                              idx < (review.rating ?? 5)
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-200 fill-gray-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        {review.review_date}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      {review.reviewer_type && (
                        <span className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                          {review.reviewer_type}
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-700">
                        {review.products?.product_name || "알 수 없는 제품"}
                      </span>
                    </div>
                  </div>

                  {review.sentiment && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        review.sentiment === "negative"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : review.sentiment === "positive"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-100"
                      }`}
                    >
                      {review.sentiment === "negative" ? "부정" : review.sentiment === "positive" ? "긍정" : "중립"}
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
                  {review.review_text.split(/(붉어지고|트러블|자극적|수분감|진정|따갑|따가움|아쉬|아쉽|불편)/).map((part, index) => {
                    if (['붉어지고', '트러블', '자극적', '수분감', '진정', '따갑', '따가움', '아쉬', '아쉽', '불편'].includes(part)) {
                      return (
                        <span
                          key={index}
                          className="bg-red-100/60 text-red-600 px-1 rounded font-bold"
                        >
                          {part}
                        </span>
                      );
                    }
                    return part;
                  })}
                </p>

                {/* AI Summary / Issue Type (if present) */}
                {(review.ai_summary || review.issue_type) && (
                  <div className="mt-1 pt-3 border-t border-dashed border-gray-200 flex flex-col gap-1 bg-white/40 p-3 rounded-xl">
                    {review.issue_type && (
                      <div className="flex gap-2 items-center">
                        <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                          이슈유형: {review.issue_type}
                        </span>
                      </div>
                    )}
                    {review.ai_summary && (
                      <p className="text-[12px] text-gray-500 leading-normal">
                        <strong className="text-gray-600">AI 요약:</strong> {review.ai_summary}
                      </p>
                    )}
                  </div>
                )}

                {/* Hashtags / Keywords */}
                {review.keywords && review.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {review.keywords.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full transition-all duration-200 hover:bg-pink-100/50"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
