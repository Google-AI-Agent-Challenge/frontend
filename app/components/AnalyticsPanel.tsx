/**
 * ============================================================
 * app/components/AnalyticsPanel.tsx
 * ============================================================
 * 우측 데이터 관제 패널 컴포넌트.
 *
 * 변경사항:
 * - 패드 라인업: 이모지 → Next.js <Image /> 동적 렌더링 적용
 * - 패드 이미지 경로: public/images/[제품명].png 매핑
 * ============================================================
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image"; // ⭐️ Image 컴포넌트 추가
import type { Review, Score, Product } from "../types";

// ----------------------------------------------------------------
// Props 정의
// ----------------------------------------------------------------
interface AnalyticsPanelProps {
  reviews: Review[];
  scores: Score[];
  products: Product[];
  isLoading?: boolean;
  onPadSelect?: (product: Product | null) => void;
  aiBriefing?: string;
  pinnedWidget?: string | null;
  onPinWidget?: (widget: string | null) => void;
}

// ----------------------------------------------------------------
// ⭐️ 제품명 기반 이미지 및 스타일 매핑 (이모지 대신 imgSrc 추가)
// ----------------------------------------------------------------
const PRODUCT_STYLE_MAP: {
  keyword: string;
  imgSrc: string; // ⭐️ 이미지 파일 경로
  bg: string;
  activeColor: string;
}[] = [
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
    bg: "#262624", // 어두운 웜그레이
    activeColor: "#d4cbb3", // 부드러운 쌀겨/베이지색
  },
  {
    keyword: "복숭아",
    imgSrc: "/images/peach.png",
    bg: "#2c1e22", // 어두운 핑크브라운
    activeColor: "#ff99bb", // 화사한 피치 핑크
  },
  {
    keyword: "레몬그라스",
    imgSrc: "/images/niac.png",
    bg: "#1a2622", // 어두운 청록/티트리 계열
    activeColor: "#7accb5", // 산뜻한 민트/그린
  },
  {
    keyword: "블루 캐모마일",
    imgSrc: "/images/blue.png",
    bg: "#18202c", // 어두운 네이비
    activeColor: "#7fb2f0", // 부드러운 스카이블루
  },
  {
    keyword: "샤인머스캣",
    imgSrc: "/images/cica.png",
    bg: "#1e261e", // 어두운 올리브
    activeColor: "#90c95c", // 상큼한 연두색
  },
  {
    keyword: "아스파라거스",
    imgSrc: "/images/clut.png",
    bg: "#20261c", // 어두운 뮤트 그린
    activeColor: "#a6c478", // 차분한 라이트 그린
  },
  {
    keyword: "핑크자몽",
    imgSrc: "/images/aha.png",
    bg: "#2c1c1c", // 어두운 적갈색
    activeColor: "#ff8270", // 코랄/자몽 핑크
  },
];

/**
 * 제품명에서 매칭되는 이미지와 스타일셋을 반환합니다.
 */
function getProductStyle(product: Product) {
  const name = product.product_name.toLowerCase();
  const match = PRODUCT_STYLE_MAP.find((m) =>
    name.includes(m.keyword.toLowerCase()),
  );
  // 매칭되는 게 없을 때 보여줄 기본 대체 이미지 설정
  return (
    match ?? {
      imgSrc: "/images/default-pad.png",
      bg: "#222228",
      activeColor: "#9999aa",
    }
  );
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
  aiBriefing,
  pinnedWidget,
  onPinWidget,
  totalReviews = 0,
  sentimentCounts = { positive: 0, neutral: 0, negative: 0 },
}: AnalyticsPanelProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // 초기 렌더링 시 자동으로 첫 번째 패드를 선택하던 로직 제거
  // (전체 리뷰 모드일 때는 '제품: 전체' 로 표시되도록 함)

  const [sentimentFilter, setSentimentFilter] = useState<
    "all" | "positive" | "neutral" | "negative"
  >("all");
  const [visibleCount, setVisibleCount] = useState<number>(5);

  // 필터가 변경되거나 제품이 변경될 때마다 보이는 개수 초기화
  useEffect(() => {
    setVisibleCount(5);
  }, [sentimentFilter, selectedProductId, reviews]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredReviews = reviews.filter((r) => {
    // 최근 3개월간 (90일) 날짜 필터링 적용
    const reviewDateObj = new Date(r.review_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
    if (reviewDateObj < threeMonthsAgo) return false;

    if (sentimentFilter === "all") return true;
    return r.sentiment === sentimentFilter;
  });

  // 최신 리뷰가 가장 먼저 보이도록 명시적 내림차순(최근 순) 정렬 적용
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  const handlePadClick = (product: Product) => {
    const isAlreadySelected = selectedProductId === product.id;
    if (isAlreadySelected) {
      setSelectedProductId(null);
      onPadSelect?.(null);
    } else {
      setSelectedProductId(product.id);
      onPadSelect?.(product);
    }
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        flex: 1.2,
        minWidth: "480px",
        background: "#121214",
        borderLeft: "1px solid #2a2a2e",
      }}
    >
      {/* ---- 인사이트 알림 헤더 ---- */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "16px",
            letterSpacing: "0.3px",
          }}
        >
          리뷰 분석
        </span>
      </div>

      {/* ---- AI Briefing Section ---- */}
      {aiBriefing && (
        <div style={{ padding: "0 16px", marginTop: "16px", flexShrink: 0 }}>
          <div
            className="glass-card"
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 94, 132, 0.2) !important",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#FF5E84" }}>
                ✨ 실시간 AI 트렌드 브리핑
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#e8e8ec", lineHeight: "1.6", margin: 0 }}>
              {aiBriefing}
            </p>
          </div>
        </div>
      )}

      {/* ---- 스킨케어 속성 점수 위젯 ---- */}
      <div
        style={{
          margin: "16px 16px 0 16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
            padding: "0 4px"
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#e8e8ec" }}>
            스킨케어 속성 점수
          </span>
          <span style={{ fontSize: "11px", color: "#6b6b7a" }}>
            (클릭하여 차트 고정/해제)
          </span>
        </div>
        
        {scores.map((s) => {
          let widgetKey = "";
          if (s.label.includes("성분") || s.label.includes("트러블")) {
            widgetKey = "trouble";
          } else if (s.label.includes("제형") || s.label.includes("발림성")) {
            widgetKey = "formulation";
          } else if (s.label.includes("용기") || s.label.includes("디자인")) {
            widgetKey = "container";
          }
          
          const isPinned = pinnedWidget === widgetKey;
          const cardClass = isPinned ? "glass-card-pinned" : "glass-card";
          
          return (
            <div
              key={s.label}
              className={cardClass}
              onClick={() => {
                if (onPinWidget) {
                  onPinWidget(isPinned ? null : widgetKey);
                }
              }}
              style={{
                borderRadius: "10px",
                padding: "14px 16px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "12px", color: isPinned ? "#fff" : "#9999aa", fontWeight: isPinned ? 600 : 500 }}>
                  {s.label} {isPinned && "📌"}
                </span>
                <span style={{ fontSize: "12px", color: isPinned ? "#FF5E84" : "#9999aa", fontWeight: "600" }}>
                  {s.value}/{s.max}
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: isPinned ? "rgba(255, 94, 132, 0.15)" : "#242428",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(s.value / s.max) * 100}%`,
                    height: "100%",
                    background: isPinned ? "#FF5E84" : " #f9a2c0",
                    borderRadius: "3px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- 리뷰 필터 및 개수 헤더 ---- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "20px 16px 10px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#e8e8ec" }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3.5px",
                    height: "24px",
                    marginRight: "4px",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#FF5E84",
                        display: "inline-block",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
              ) : (
                filteredReviews.length
              )}
            </span>
            <span
              style={{ fontSize: "13px", fontWeight: 600, color: "#e8e8ec" }}
            >
              {sentimentFilter === "all"
                ? "최근 3개월간 전체 리뷰"
                : sentimentFilter === "positive"
                  ? "최근 3개월간 긍정 리뷰"
                  : sentimentFilter === "neutral"
                    ? "최근 3개월간 중립 리뷰"
                    : "최근 3개월간 부정 리뷰"}
            </span>
          </div>
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
              ? `제품: ${selectedProduct.product_name}`
              : "제품: 전체"}
          </span>
        </div>

        {/* 필터 칩 */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "all", label: "전체" },
            { id: "positive", label: "긍정" },
            { id: "neutral", label: "중립" },
            { id: "negative", label: "부정" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() =>
                setSentimentFilter(
                  f.id as "all" | "positive" | "neutral" | "negative",
                )
              }
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: "11px",
                fontWeight: 600,
                color: sentimentFilter === f.id ? "#fff" : "#9999aa",
                background:
                  sentimentFilter === f.id ? "#FF5E84" : "transparent",
                border: `1px solid ${sentimentFilter === f.id ? "#FF5E84" : "#2a2a2e"}`,
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
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
        {isLoading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: "#1a1a1f",
                border: "1px solid #2a2a2e",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                animation: "pulse 1.8s ease-in-out infinite",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Header row: stars and date placeholder */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* 5 stars placeholders */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#2a2a35",
                      }}
                    />
                  ))}
                </div>
                {/* Date placeholder */}
                <div
                  style={{
                    width: "45px",
                    height: "12px",
                    borderRadius: "4px",
                    background: "#222228",
                  }}
                />
              </div>

              {/* Product and Skin Type placeholder tags */}
              <div style={{ display: "flex", gap: "6px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "16px",
                    borderRadius: "4px",
                    background: "#24242e",
                  }}
                />
                <div
                  style={{
                    width: "60px",
                    height: "16px",
                    borderRadius: "4px",
                    background: "#24242e",
                  }}
                />
              </div>

              {/* Summary line skeleton */}
              <div
                style={{
                  width: "90%",
                  height: "14px",
                  borderRadius: "4px",
                  background: "#FF5E8422",
                  border: "1px dashed #FF5E8444",
                }}
              />

              {/* Long text content skeletons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "4px",
                    background: "#202026",
                  }}
                />
                <div
                  style={{
                    width: "95%",
                    height: "12px",
                    borderRadius: "4px",
                    background: "#202026",
                  }}
                />
                <div
                  style={{
                    width: "70%",
                    height: "12px",
                    borderRadius: "4px",
                    background: "#202026",
                  }}
                />
              </div>
            </div>
          ))}

        {!isLoading && filteredReviews.length === 0 && (
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

        {!isLoading &&
          visibleReviews.map((review) => {
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
      {!isLoading && filteredReviews.length > visibleCount && (
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
            onClick={() => setVisibleCount((prev) => prev + 5)}
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
            리뷰 5개 더보기 ({filteredReviews.length - visibleCount}개 남음)
          </button>
        </div>
      )}

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
                gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)`,
                gap: "8px",
              }}
            >
              {products.map((product) => {
                const isActive = selectedProductId === product.id;
                const style = getProductStyle(product); // ⭐️ 바뀐 이미지 맵에서 정보 로드

                return (
                  <button
                    key={product.id}
                    onClick={() => handlePadClick(product)}
                    title={`${product.brand_name} ${product.product_name}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px", // 가로 세로 밸런스를 위해 8px로 소폭 조정
                      padding: "12px 4px",
                      borderRadius: "10px",
                      background: "#1a1a1f", // 하나로 예쁘게 통일된 배경색
                      border: isActive
                        ? `1px solid ${style.activeColor}`
                        : "1px solid #2a2a2e",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)", // 더 부드럽고 텐션 있는 애니메이션
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.02)";
                      (e.currentTarget as HTMLButtonElement).style.background = "#24242a";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.4)";
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a4a55";
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
                      (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1f";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e";
                      }
                    }}
                  >
                    {/* ⭐️ 이모지 대신 Next.js <Image /> 컴포넌트로 렌더링 */}
                    <div
                      style={{
                        position: "relative",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={style.imgSrc}
                        alt={product.product_name}
                        width={32}
                        height={32}
                        style={{
                          objectFit: "contain",
                          width: "100%",
                          height: "auto",
                        }} // 이미지 비율 유지 및 Next.js 경고 방지
                      />
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        color: "#ffffff", // 모든 글자를 흰색으로 통일
                        fontWeight: isActive ? 600 : 400,
                        textAlign: "center",
                        lineHeight: "1.3",
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
