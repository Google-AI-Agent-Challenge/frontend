"use client";

import { useState, useEffect } from "react";
import ReviewAnalysisBoard from "../components/ReviewAnalysisBoard";
import ReviewAiPanel from "../components/ReviewAiPanel";

import {
  fetchLatestReviewsAction,
  fetchProductsAction,
  fetchReviewsByKeywordsAction,
  fetchReviewsByIdsAction,
} from "../actions/data";

import type { Review, Product, Message } from "../types";

export default function ReviewPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const [prodData, reviewData] = await Promise.all([
          fetchProductsAction(),
          fetchLatestReviewsAction(200),
        ]);
        
        if (prodData.length > 0) setProducts(prodData);
        if (reviewData.length > 0) {
          setReviews(reviewData);
        }
      } catch (err: unknown) {
        console.error("초기 데이터 로드 오류:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleExportExcel = async (msg?: Message) => {
    try {
      setIsLoading(true);
      let exportReviews: Review[] = reviews;

      if (msg?.matchedReviewIds && msg.matchedReviewIds.length > 0) {
        exportReviews = await fetchReviewsByIdsAction(msg.matchedReviewIds);
      } else if (msg?.keywords && msg.keywords.length > 0) {
        exportReviews = await fetchReviewsByKeywordsAction(msg.keywords, 100);
      }
      
      if (exportReviews.length === 0) {
        alert("출력할 리뷰가 없습니다.");
        return;
      }

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
    } catch (err: unknown) {
      console.error("엑셀 다운로드 중 오류 발생:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="flex-1 flex h-full overflow-hidden bg-white w-full">
        <ReviewAnalysisBoard 
          reviews={reviews} 
          products={products} 
          isLoading={isLoading} 
          onExportExcel={() => handleExportExcel()} 
        />
        <ReviewAiPanel />
      </div>
    </>
  );
}
