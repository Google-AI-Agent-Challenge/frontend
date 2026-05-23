"use client";
import Image from "next/image";
import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquareText,
  AlignJustify,
  SlidersHorizontal,
  Sparkles,
  HeadphonesIcon,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "대시보드", active: true },
  { icon: BrainCircuit, label: "AI 인사이트", active: false },
  { icon: MessageSquareText, label: "리뷰 분석", active: false },
  { icon: AlignJustify, label: "패드 레시피 라인업", active: false },
  { icon: SlidersHorizontal, label: "제어 센터", active: false },
];

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#1a1a1f",
        borderRight: "1px solid #2a2a2e",
        padding: "28px 0 24px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 20px 28px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/logo.png" // public 폴더 기준 경로
            alt="브랜드 로고"
            width={130}
            height={20}
            priority // 화면에 가장 먼저 렌더링되도록 우선순위 부여
          />
        </div>
      </div>

      {/* Nav Items */}
      <nav
        className="flex flex-col gap-1"
        style={{ padding: "0 12px", flex: 1 }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 12px",
                borderRadius: "8px",
                border: item.active
                  ? "1px solid transparent"
                  : "1px solid transparent",
                background: item.active ? "#f9a2c0" : "transparent",
                color: item.active ? "#1a1a1f" : "#9999aa",
                fontSize: "13.5px",
                fontWeight: item.active ? 700 : 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#e8e8ec";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#2a2a2e";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#9999aa";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="flex flex-col gap-1" style={{ padding: "0 12px" }}>
        {[
          { icon: HeadphonesIcon, label: "고객 지원" },
          { icon: Settings, label: "설정" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid transparent",
                background: "transparent",
                color: "#9999aa",
                fontSize: "13px",
                fontWeight: 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#e8e8ec";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#2a2a2e";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#9999aa";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
