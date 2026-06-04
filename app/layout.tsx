import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={`${notoSansKr.className} flex h-full w-full overflow-hidden bg-background`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
