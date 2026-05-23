/**
 * ============================================================
 * app/components/ChatPanel.tsx
 * ============================================================
 * AI 어시스턴트 채팅 패널 컴포넌트입니다.
 *
 * 변경사항 (하드코딩 → 동적):
 *   - messages: page.tsx의 state에서 내려받아 동적 렌더링
 *   - isLoading: AI 응답 대기 중 로딩 버블 표시
 *   - onSend: 메시지 전송 시 page.tsx의 handleSend 호출
 *   - onChipClick: 추천 칩 클릭 시 자동 입력 + 전송
 * ============================================================
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { MoreHorizontal, Send, TrendingUp } from "lucide-react";
import type { Message } from "../types";
import Image from "next/image";
// ----------------------------------------------------------------
// 추천 질문 칩 목록 (고정값 - 자주 묻는 질문)
// ----------------------------------------------------------------
const SUGGESTION_CHIPS = [
  "이번달 당근 패드 트러블 부정 리뷰 추이",
  "미나리 패드 데일리 진정 효과 및 수분감 만족도",
  "블루 캐모마일 패드 쿨링 및 진정 효과 VOC 요약",
];

// ----------------------------------------------------------------
// ChatPanel이 부모(page.tsx)에게서 받는 Props 타입 정의
// ----------------------------------------------------------------
interface ChatPanelProps {
  /** 채팅 메시지 배열 (user/ai 메시지 모두 포함) */
  messages: Message[];

  /** true이면 AI가 응답을 생성 중 (로딩 인디케이터 표시) */
  isLoading: boolean;

  /**
   * 사용자가 메시지를 전송할 때 호출되는 콜백 함수
   * page.tsx의 handleSend()를 받아서 실행합니다.
   * @param text - 사용자 입력 텍스트
   */
  onSend: (text: string) => void;
}

// ----------------------------------------------------------------
// 메시지 역할별 버블 스타일 정의
// ----------------------------------------------------------------
const bubbleStyle = {
  user: {
    border: "1px solid #FF5E84",
    borderRadius: "12px 12px 2px 12px",
    background: "#1a1a1f",
    alignSelf: "flex-end" as const,
  },
  ai: {
    border: "1px solid #2a2a2e",
    borderRadius: "12px 12px 12px 2px",
    background: "#1a1a1f",
    alignSelf: "flex-start" as const,
  },
};

// ================================================================
// 컴포넌트 본체
// ================================================================
export default function ChatPanel({
  messages,
  isLoading,
  onSend,
}: ChatPanelProps) {
  // 입력창 텍스트 상태 (이 컴포넌트 내부에서만 관리)
  const [inputValue, setInputValue] = useState("");

  // 메시지 목록 맨 아래로 자동 스크롤하기 위한 ref
  const bottomRef = useRef<HTMLDivElement>(null);

  // messages가 업데이트될 때마다 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ----------------------------------------------------------------
  // 전송 핸들러
  // ----------------------------------------------------------------
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return; // 빈 입력이거나 로딩 중이면 무시

    onSend(trimmed); // 부모(page.tsx)의 handleSend 호출
    setInputValue(""); // 입력창 초기화
  };

  // Enter 키로 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 추천 칩 클릭: 해당 텍스트를 바로 전송
  const handleChipClick = (text: string) => {
    if (isLoading) return;
    onSend(text);
  };

  // ================================================================
  // 렌더링
  // ================================================================
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#121214", flex: 1, minWidth: 0 }}
    >
      {/* ---- 상단 헤더 ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 16px 24px",
          borderBottom: "1px solid #2a2a2e",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* AI 아바타 아이콘 */}

          <Image
            src="/favicon.png" // public 폴더 안에 있는 이미지 이름으로 변경하세요! (예: /trend-icon.png)
            alt="트렌드 아이콘"
            width={35} // 기존 아이콘 사이즈(16)와 비슷하게 유지
            height={35}
          />

          <div>
            <div
              style={{ fontWeight: 600, fontSize: "16px", color: "#e8e8ec" }}
            >
              AI 어시스턴트
            </div>
            <div
              style={{ fontSize: "14px", color: "#f9a2c0", marginTop: "2px" }}
            >
              {/* 로딩 중이면 상태 텍스트 변경 */}
              {isLoading ? "분석 중..." : "리뷰 분석 모드"}
            </div>
          </div>
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#9999aa",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* ---- 메시지 목록 영역 ---- */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 메시지가 없을 때 안내 메시지 */}
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b6b7a",
              fontSize: "13px",
              textAlign: "center",
              lineHeight: "1.7",
            }}
          >
            아래 추천 질문을 클릭하거나
            <br />
            직접 명령어를 입력해보세요.
          </div>
        )}

        {/* ---- 메시지 버블 렌더링 ---- */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...bubbleStyle[msg.role],
                padding: "10px 15px",
                maxWidth: msg.role === "user" ? "72%" : "82%",
                fontSize: "13.5px",
                color: "#c8c8d4",
                lineHeight: "1.65",
                // 줄바꿈 처리
                whiteSpace: "pre-wrap",
              }}
            >
              {/* 사용자 메시지는 그대로, AI 메시지는 하이라이트 처리 */}
              {msg.role === "ai" ? (
                <>
                  <AiMessageContent content={msg.content} />
                  {(msg.risingKeyword || (msg.tags && msg.tags.length > 0)) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {msg.risingKeyword && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4.5px",
                          background: "rgba(255, 94, 132, 0.1)",
                          border: "1px solid #FF5E84",
                          borderRadius: "20px",
                          padding: "4px 10px",
                          color: "#FF5E84",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}>
                          <span style={{ display: "inline-flex", alignItems: "center" }}>⚠️</span>
                          급상승 키워드: {msg.risingKeyword}
                        </div>
                      )}
                      {msg.tags?.map((tag, tIdx) => (
                        <div key={tIdx} style={{
                          background: "#2a2a2e",
                          borderRadius: "20px",
                          padding: "4.5px 11px",
                          color: "#9999aa",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}>
                          #{tag}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ color: "#e8e8ec" }}>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {/* ---- AI 응답 대기 중 로딩 버블 ---- */}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                ...bubbleStyle.ai,
                padding: "14px 18px",
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              {/* 세 개의 점이 순서대로 깜빡이는 로딩 인디케이터 */}
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#FF5E84",
                    display: "inline-block",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 자동 스크롤 앵커 */}
        <div ref={bottomRef} />
      </div>

      {/* ---- 추천 질문 칩 영역 ---- */}
      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid #2a2a2e",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {SUGGESTION_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            style={{
              flexShrink: 0,
              background: "#1a1a1f",
              border: "1px solid #2a2a2e",
              borderRadius: "20px",
              color: "#9999aa",
              fontSize: "12px",
              padding: "6px 13px",
              cursor: isLoading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: isLoading ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.color = "#e8e8ec";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#3a3a45";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#9999aa";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#2a2a2e";
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ---- 하단 입력창 ---- */}
      <div style={{ padding: "12px 24px 20px 24px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1a1a1f",
            border: `1px solid ${isLoading ? "#2a2a2e" : "#3a3a45"}`,
            borderRadius: "10px",
            padding: "10px 12px 10px 16px",
            gap: "10px",
            transition: "border-color 0.15s ease",
          }}
        >
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isLoading
                ? "AI가 분석 중입니다..."
                : "명령어를 입력하거나 질문을 하세요..."
            }
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#e8e8ec",
              fontSize: "13.5px",
              cursor: isLoading ? "not-allowed" : "text",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background:
                isLoading || !inputValue.trim() ? "#3a3a45" : "#FF5E84",
              border: "none",
              cursor:
                isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s ease, opacity 0.15s ease",
            }}
          >
            <Send size={14} color="#fff" />
          </button>
        </div>
      </div>

      {/* 로딩 애니메이션 CSS */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ----------------------------------------------------------------
// AI 메시지 내용 렌더링 서브컴포넌트
// 특정 키워드를 핑크색으로 강조합니다.
// ----------------------------------------------------------------
const HIGHLIGHT_KEYWORDS = [
  "붉은기",
  "트러블",
  "여드름",
  "좁쌀",
  "따가움",
  "급상승",
  "발림성",
  "제형",
  "용기",
  "증가",
  "감소",
];

function AiMessageContent({ content }: { content: string }) {
  // 키워드를 찾아 강조 처리
  // 정규식으로 키워드를 분리한 뒤 span으로 감쌉니다.
  const regex = new RegExp(`(${HIGHLIGHT_KEYWORDS.join("|")})`, "g");
  const parts = content.split(regex);

  return (
    <span style={{ color: "#e8e8ec" }}>
      {parts.map((part, i) =>
        HIGHLIGHT_KEYWORDS.includes(part) ? (
          <span key={i} style={{ color: "#FF5E84", fontWeight: 600 }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}
