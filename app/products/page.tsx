"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Plus,
  Package,
  MessageSquare,
  Clock,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "캐롯 카로틴 카밍 워터 패드",
      category: "패드",
      reviews: "1,243",
      updated: "10분 전",
      active: true,
      color: "bg-orange-100",
    },
    {
      id: 2,
      name: "판토테닉 워터 파슬리 클리어 패드",
      category: "패드",
      reviews: "825",
      updated: "25분 전",
      active: true,
      color: "bg-green-100",
    },
    {
      id: 3,
      name: "블루 캐모마일 패드",
      category: "패드",
      reviews: "518",
      updated: "2시간 전",
      active: false,
      color: "bg-blue-100",
    },
    {
      id: 4,
      name: "어성초 진정 패드",
      category: "패드",
      reviews: "472",
      updated: "3시간 전",
      active: true,
      color: "bg-emerald-100",
    },
  ]);

  const toggleActive = (id: number) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  return (
    <div className="flex-1 flex flex-col p-10 bg-[#f4f5f7] overflow-y-auto w-full h-full">
      {/* 1. Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            상품 관리
          </h1>
          <p className="text-[14px] text-gray-500 mt-2 font-medium">
            등록된 상품과 리뷰 데이터를 관리하세요.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-[14px]">
            <RefreshCw size={16} />
            <span>데이터 동기화</span>
          </button>
          <button className="flex items-center gap-2 bg-[#ff477e] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#ff477e]/90 transition-colors text-[14px]">
            <Plus size={16} />
            <span>상품 등록</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 등록 상품 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
            <Package className="text-[#ff477e]" size={24} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-500 mb-1">
              등록 상품
            </span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              11개
            </span>
          </div>
        </div>

        {/* 분석 활성 상품 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
            <MessageSquare
              className="text-[#ff477e]"
              size={24}
              strokeWidth={2}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-500 mb-1">
              분석 활성 상품
            </span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              11개
            </span>
          </div>
        </div>

        {/* 누적 리뷰 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
            <Clock className="text-[#ff477e]" size={24} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-500 mb-1">
              누적 리뷰
            </span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              4,286건
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main List */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 pb-12">
        <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight mb-6">
          전체 상품
        </h2>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="상품명을 검색하세요."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all placeholder-gray-400 shadow-sm"
            />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 text-gray-800 font-bold text-[14px] px-5 py-3 pr-10 rounded-xl outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all shadow-sm cursor-pointer min-w-[160px]">
              <option>최근 업데이트순</option>
              <option>리뷰 많은 순</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-bold text-[14px] text-gray-800 w-[45%]">
                  상품 정보
                </th>
                <th className="py-4 text-center font-bold text-[14px] text-gray-800">
                  카테고리
                </th>
                <th className="py-4 text-center font-bold text-[14px] text-gray-800">
                  누적 리뷰
                </th>
                <th className="py-4 text-center font-bold text-[14px] text-gray-800">
                  최근 업데이트
                </th>
                <th className="py-4 text-center font-bold text-[14px] text-gray-800 w-[140px]">
                  분석 활성
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr
                  key={prod.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="py-5">
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-16 h-16 ${prod.color} border border-gray-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        <ImageIcon className="text-black/10" size={28} />
                      </div>
                      <span className="font-extrabold text-[15px] text-gray-900 group-hover:text-pink-600 transition-colors cursor-pointer">
                        {prod.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 text-center text-[14px] text-gray-600 font-bold">
                    {prod.category}
                  </td>
                  <td className="py-5 text-center text-[14px] text-gray-600 font-bold">
                    {prod.reviews}건
                  </td>
                  <td className="py-5 text-center text-[14px] text-gray-600 font-bold">
                    {prod.updated}
                  </td>
                  <td className="py-5">
                    <div className="flex justify-center">
                      <div
                        onClick={() => toggleActive(prod.id)}
                        className={`w-[46px] h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${prod.active ? "bg-[#ff477e]" : "bg-gray-200"}`}
                      >
                        <div
                          className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${prod.active ? "translate-x-[20px]" : "translate-x-0"}`}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#ff477e] bg-pink-50 font-bold text-[14px] transition-colors">
            1
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// ⭐️ 제품명 기반 이미지 및 스타일 매핑 (이모지 대신 imgSrc 추가)
// ----------------------------------------------------------------
// const PRODUCT_STYLE_MAP: {
//   keyword: string;
//   imgSrc: string; // ⭐️ 이미지 파일 경로
//   bg: string;
//   activeColor: string;
// }[] = [
//   {
//     keyword: "당근",
//     imgSrc: "/images/carrot.png",
//     bg: "#3a1820",
//     activeColor: "#FF5E84",
//   },
//   {
//     keyword: "도토리",
//     imgSrc: "/images/acorn.png",
//     bg: "#2a2520",
//     activeColor: "#b07840",
//   },
//   {
//     keyword: "감자",
//     imgSrc: "/images/potato.png",
//     bg: "#28281e",
//     activeColor: "#c8b060",
//   },
//   {
//     keyword: "미나리",
//     imgSrc: "/images/parsley.png",
//     bg: "#1e2820",
//     activeColor: "#60a870",
//   },
//   {
//     keyword: "라이스",
//     imgSrc: "/images/rice.png",
//     bg: "#262624", // 어두운 웜그레이
//     activeColor: "#d4cbb3", // 부드러운 쌀겨/베이지색
//   },
//   {
//     keyword: "복숭아",
//     imgSrc: "/images/peach.png",
//     bg: "#2c1e22", // 어두운 핑크브라운
//     activeColor: "#ff99bb", // 화사한 피치 핑크
//   },
//   {
//     keyword: "레몬그라스",
//     imgSrc: "/images/niac.png",
//     bg: "#1a2622", // 어두운 청록/티트리 계열
//     activeColor: "#7accb5", // 산뜻한 민트/그린
//   },
//   {
//     keyword: "블루 캐모마일",
//     imgSrc: "/images/blue.png",
//     bg: "#18202c", // 어두운 네이비
//     activeColor: "#7fb2f0", // 부드러운 스카이블루
//   },
//   {
//     keyword: "샤인머스캣",
//     imgSrc: "/images/cica.png",
//     bg: "#1e261e", // 어두운 올리브
//     activeColor: "#90c95c", // 상큼한 연두색
//   },
//   {
//     keyword: "아스파라거스",
//     imgSrc: "/images/clut.png",
//     bg: "#20261c", // 어두운 뮤트 그린
//     activeColor: "#a6c478", // 차분한 라이트 그린
//   },
//   {
//     keyword: "핑크자몽",
//     imgSrc: "/images/aha.png",
//     bg: "#2c1c1c", // 어두운 적갈색
//     activeColor: "#ff8270", // 코랄/자몽 핑크
//   },
// ];
