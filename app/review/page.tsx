"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeAiMessage, setActiveAiMessage] = useState<Message | null>(null);

  const displayReviews = useMemo(() => {
    if (activeAiMessage?.matchedReviewIds && activeAiMessage.matchedReviewIds.length > 0) {
      const validFiltered = reviews.filter((r) => activeAiMessage.matchedReviewIds?.includes(r.id));
      if (validFiltered.length === 0 && activeAiMessage.matchedReviewIds.some((id) => id.startsWith("doc_"))) {
        return reviews.slice(0, activeAiMessage.matchedReviewIds.length);
      }
      return validFiltered;
    }
    return reviews;
  }, [reviews, activeAiMessage]);

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const [prodData, reviewData] = await Promise.all([
          fetchProductsAction(),
          fetchLatestReviewsAction(5000),
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

  const handleExportExcel = async (filtered?: Review[], msg?: Message) => {
    try {
      setIsLoading(true);
      let exportReviews: Review[] = reviews;

      if (msg?.matchedReviewIds && msg.matchedReviewIds.length > 0) {
        exportReviews = await fetchReviewsByIdsAction(msg.matchedReviewIds);
      } else if (msg?.keywords && msg.keywords.length > 0) {
        exportReviews = await fetchReviewsByKeywordsAction(msg.keywords, 100);
      } else if (filtered && filtered.length > 0) {
        exportReviews = filtered;
      }

      if (exportReviews.length === 0) {
        alert("출력할 리뷰가 없습니다.");
        return;
      }

      // ExcelJS 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("리뷰 데이터");

      // 맞춤형 열 너비(Column Width) 설정
      worksheet.columns = [
        { header: "제품명", key: "product", width: 25 },
        { header: "작성자", key: "reviewer", width: 15 },
        { header: "별점", key: "rating", width: 15 },
        { header: "작성일", key: "date", width: 25 },
        { header: "감성", key: "sentiment", width: 15 },
        { header: "이슈타입", key: "issue", width: 15 },
        { header: "리뷰내용", key: "reviewText", width: 75 },
      ];

      // 헤더(첫 번째 행) 디자인 설정
      const headerRow = worksheet.getRow(1);
      headerRow.height = 30; // 행 높이 25~30
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9D9D9" }, // 옅은 회색 배경
        };
        cell.font = {
          name: "맑은 고딕",
          bold: true,
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });

      // 데이터 추가 및 줄바꿈 속성 적용
      exportReviews.forEach((r: Review) => {
        // 감성 번역
        const sentimentMap: Record<string, string> = {
          positive: "긍정",
          neutral: "중립",
          negative: "부정",
        };
        const sentimentKor = r.sentiment ? sentimentMap[r.sentiment] || r.sentiment : "-";

        const row = worksheet.addRow({
          product: r.products?.product_name || "-",
          reviewer: r.reviewer_type || "-",
          rating: r.rating,
          date: r.review_date,
          sentiment: sentimentKor,
          issue: r.issue_type || "-",
          reviewText: r.review_text || "-",
        });

        // 텍스트 줄바꿈(Wrap Text) 및 글꼴 설정
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "맑은 고딕" };
          if (colNumber === 7) {
            cell.alignment = { wrapText: true, vertical: "top" };
          } else {
            cell.alignment = { vertical: "top", horizontal: "left" };
          }
        });
      });

      // 파일 생성 및 다운로드 (xlsx)
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `tones_reviews_${new Date().getTime()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
          reviews={displayReviews}
          products={products}
          isLoading={isLoading}
          onExportExcel={(filtered) => handleExportExcel(filtered, activeAiMessage || undefined)}
          onProductSelect={(id) => {
            setSelectedProductId(id);
            setActiveAiMessage(null);
          }}
        />
        <ReviewAiPanel
          productId={selectedProductId}
          onMessageReceived={(msg) => setActiveAiMessage(msg)}
          activeAiMessage={activeAiMessage}
        />
      </div>
    </>
  );
}
