import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TONES",
  description: "스킨케어 브랜드를 위한 AI 기반 리뷰 분석 및 인사이트 관제 대시보드",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
