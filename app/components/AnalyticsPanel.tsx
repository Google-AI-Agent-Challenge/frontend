/**
 * ============================================================
 * app/components/AnalyticsPanel.tsx
 * ============================================================
 * 우측 데이터 관제 패널 컴포넌트.
 *
 * 변경사항:
 *   - 패드 라인업: 하드코딩 → products[] props 기반 동적 렌더링
 *   - 리뷰 카드: products JOIN 데이터로 제품명 표시
 *   - 필터 뱃지: 선택된 제품의 product_name으로 표시
 *   - 패드 클릭 → onPadSelect 콜백으로 page.tsx에 알림
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import type { Review, Score, Product } from "../types";

// ----------------------------------------------------------------
// Props 정의
// ----------------------------------------------------------------
interface AnalyticsPanelProps {
  reviews: Review[];
  scores: Score[];
  products: Product[]; // DB에서 가져온 제품 목록
  isLoading?: boolean;
  onPadSelect?: (product: Product) => void; // 패드 클릭 시 page.tsx에 알림
}

// ----------------------------------------------------------------
// 제품명 기반 이모지 매핑 (product_name에 키워드가 포함되면 해당 이모지)
// ----------------------------------------------------------------
const EMOJI_MAP: {
  keyword: string;
  emoji: string;
  bg: string;
  activeColor: string;
}[] = [
  { keyword: "당근", emoji: "🥕", bg: "#3a1820", activeColor: "#FF5E84" },
  { keyword: "carrot", emoji: "🥕", bg: "#3a1820", activeColor: "#FF5E84" },
  { keyword: "도토리", emoji: "🌰", bg: "#2a2520", activeColor: "#b07840" },
  { keyword: "acorn", emoji: "🌰", bg: "#2a2520", activeColor: "#b07840" },
  { keyword: "감자", emoji: "🥔", bg: "#28281e", activeColor: "#c8b060" },
  { keyword: "potato", emoji: "🥔", bg: "#28281e", activeColor: "#c8b060" },
  { keyword: "미나리", emoji: "🌿", bg: "#1e2820", activeColor: "#60a870" },
  { keyword: "parsley", emoji: "🌿", bg: "#1e2820", activeColor: "#60a870" },
];

/**
 * 제품명에서 이모지와 색상을 찾아 반환합니다.
 * 매칭되는 키워드가 없으면 기본값을 반환합니다.
 */
function getProductStyle(product: Product) {
  const name = product.product_name.toLowerCase();
  const match = EMOJI_MAP.find((m) => name.includes(m.keyword.toLowerCase()));
  return match ?? { emoji: "💊", bg: "#222228", activeColor: "#9999aa" };
}

// ----------------------------------------------------------------
// 별점 렌더링 서브컴포넌트
// ----------------------------------------------------------------
function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          color={i < count ? " #f9a2c0" : "#3a3a45"}
          fill={i < count ? " #f9a2c0" : "none"}
        />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------
// 날짜 포맷 헬퍼
// ----------------------------------------------------------------
function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "방금 전";
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return "어제";
    return `${diffDays}일 전`;
  } catch {
    return "";
  }
}

// ----------------------------------------------------------------
// 리뷰 본문 키워드 하이라이트 서브컴포넌트
// ----------------------------------------------------------------
const TROUBLE_KEYWORDS = [
  "붉은기",
  "트러블",
  "여드름",
  "좁쌀",
  "따가움",
  "불량",
];

function HighlightedText({ text }: { text: string }) {
  const regex = new RegExp(`(${TROUBLE_KEYWORDS.join("|")})`, "g");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        TROUBLE_KEYWORDS.includes(part) ? (
          <span
            key={i}
            style={{
              color: " #ff5e84",
              fontWeight: 600,
              background: "#FFC1DA",
            }}
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ================================================================
// 컴포넌트 본체
// ================================================================
export default function AnalyticsPanel({
  reviews,
  scores,
  products,
  isLoading = false,
  onPadSelect,
}: AnalyticsPanelProps) {
  // 현재 선택된 제품 (첫 번째 제품이 기본 선택)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null,
  );

  // 비동기로 제품 목록이 로드되면 첫 번째 제품을 자동으로 기본 선택
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // 선택된 제품 객체
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // 부정 리뷰만 표시 (이미 page.tsx에서 필터됨)
  const negativeReviews = reviews;

  // 패드 클릭 핸들러
  const handlePadClick = (product: Product) => {
    setSelectedProductId(product.id);
    onPadSelect?.(product); // page.tsx에 선택 이벤트 전달
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        width: "340px",
        minWidth: "340px",
        background: "#121214",
        borderLeft: "1px solid #2a2a2e",
      }}
    >
      {/* ---- 인사이트 알림 헤더 ---- */}
      <div
        style={{
          background: "#f9a2c0",
          padding: "13px 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#1a1a1f",
            fontWeight: 700,
            fontSize: "13.5px",
            letterSpacing: "0.3px",
          }}
        >
          리뷰 분석
        </span>
      </div>

      {/* ---- 스킨케어 속성 점수 위젯 ---- */}
      <div
        style={{
          margin: "16px 16px 0 16px",
          background: "#1a1a1f",
          border: "1px solid #2a2a2e",
          borderRadius: "10px",
          padding: "16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#e8e8ec" }}>
            스킨케어 속성 점수
          </span>
          <ArrowUpRight size={15} color="#9999aa" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {scores.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#9999aa" }}>
                  {s.label}
                </span>
                <span style={{ fontSize: "12px", color: "#9999aa" }}>
                  {s.value}/{s.max}
                </span>
              </div>
              <div
                style={{
                  height: "5px",
                  background: "#242428",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(s.value / s.max) * 100}%`,
                    height: "100%",
                    background: " #f9a2c0",
                    borderRadius: "3px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- 부정 트러블 리뷰 헤더 ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 16px 10px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#e8e8ec" }}>
            {isLoading ? "..." : negativeReviews.length}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#e8e8ec" }}>
            부정 트러블 리뷰
          </span>
        </div>
        {/* 선택된 제품의 product_name을 필터 뱃지에 표시 */}
        <span
          style={{
            background: "#2a1820",
            border: "1px solid #FF5E8440",
            color: "#FF5E84",
            fontSize: "11px",
            padding: "3px 8px",
            borderRadius: "6px",
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedProduct
            ? `필터: ${selectedProduct.product_name}`
            : "필터: 전체"}
        </span>
      </div>

      {/* ---- 리뷰 카드 목록 ---- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {/* 로딩 중 스켈레톤 */}
        {isLoading &&
          [0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: "#1a1a1f",
                border: "1px solid #2a2a2e",
                borderRadius: "10px",
                padding: "14px",
                height: "120px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}

        {/* 리뷰 없음 안내 */}
        {!isLoading && negativeReviews.length === 0 && (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#6b6b7a",
              fontSize: "12.5px",
              lineHeight: "1.7",
            }}
          >
            조건에 맞는 리뷰가 없습니다.
            <br />
            질문을 입력하면 관련 리뷰를 불러옵니다.
          </div>
        )}

        {/* 실제 리뷰 카드 */}
        {!isLoading &&
          negativeReviews.slice(0, 5).map((review) => {
            // JOIN으로 가져온 제품 정보
            const product = review.products;

            return (
              <div
                key={review.id}
                style={{
                  background: "#1a1a1f",
                  border: "1px solid #2a2a2e",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                {/* 별점 + 피부타입 + 시간 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <StarRow count={review.rating} />
                    {review.reviewer_type && (
                      <span
                        style={{
                          background: "#242428",
                          color: "#9999aa",
                          fontSize: "10.5px",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          border: "1px solid #2a2a2e",
                        }}
                      >
                        {review.reviewer_type}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: "#6b6b7a" }}>
                    {formatRelativeTime(
                      review.created_at ?? review.review_date,
                    )}
                  </span>
                </div>

                {/* 제품명 (products JOIN 데이터) */}
                {product && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "7px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#6b6b7a" }}>
                      {product.brand_name}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6b6b7a" }}>
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: " #f9a2c0",
                        fontWeight: 500,
                      }}
                    >
                      {product.product_name}
                    </span>
                  </div>
                )}

                {/* AI 요약 (있을 때만) */}
                {review.ai_summary && (
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "#FF5E84",
                      fontWeight: 500,
                      marginBottom: "6px",
                      lineHeight: "1.5",
                    }}
                  >
                    💡 {review.ai_summary}
                  </p>
                )}

                {/* 리뷰 본문 */}
                <p
                  style={{
                    fontSize: "12.5px",
                    color: "#c8c8d4",
                    lineHeight: "1.6",
                    margin: "0 0 10px 0",
                  }}
                >
                  <HighlightedText text={review.review_text} />
                </p>

                {/* 태그: issue_type + keywords */}
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {review.issue_type && (
                    <span
                      style={{
                        color: "#f9a2c0",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      # {review.issue_type}
                    </span>
                  )}
                  {(review.keywords ?? []).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        color: "#9999aa",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* ---- 리뷰 더보기 버튼 ---- */}
      <div style={{ padding: "14px 16px", flexShrink: 0 }}>
        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "none",
            border: "1px solid #2a2a2e",
            borderRadius: "8px",
            color: "#9999aa",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#e8e8ec";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#FF5E84";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#9999aa";
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "#2a2a2e";
          }}
        >
          리뷰 더보기
        </button>
      </div>

      {/* ---- 패드 레시피 라인업 (DB products 기반 동적 렌더링) ---- */}
      <div style={{ padding: "0 16px 20px 16px", flexShrink: 0 }}>
        <div style={{ borderTop: "1px solid #2a2a2e", paddingTop: "16px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#e8e8ec",
              marginBottom: "12px",
            }}
          >
            제품 라인업
          </div>

          {/* 제품이 로딩 중이거나 없을 때 */}
          {products.length === 0 ? (
            <div
              style={{
                color: "#6b6b7a",
                fontSize: "12px",
                textAlign: "center",
                padding: "12px 0",
              }}
            >
              {isLoading ? "로딩 중..." : "등록된 제품이 없습니다."}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                // 제품 수에 따라 자동으로 열 수 결정 (최대 4열)
                gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)`,
                gap: "8px",
              }}
            >
              {products.map((product) => {
                const isActive = selectedProductId === product.id;
                const style = getProductStyle(product);

                return (
                  <button
                    key={product.id}
                    onClick={() => handlePadClick(product)}
                    title={`${product.brand_name} ${product.product_name}`} // 호버 시 전체 이름 툴팁
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "14px 8px",
                      borderRadius: "10px",
                      background: style.bg,
                      border: isActive
                        ? `1px solid ${style.activeColor}`
                        : "1px solid #2a2a2e",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>{style.emoji}</span>
                    {/* product_name을 짧게 잘라 표시 (공간 제한) */}
                    <span
                      style={{
                        fontSize: "11px",
                        color: isActive ? style.activeColor : "#9999aa",
                        fontWeight: isActive ? 600 : 400,
                        textAlign: "center",
                        lineHeight: "1.3",
                        // 긴 이름은 말줄임표 처리
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {product.product_name.replace(/패드|pad/gi, "").trim() ||
                        product.product_name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
