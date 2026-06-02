"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Plus,
  Package,
  MonitorCheck,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MessageSquareText,
} from "lucide-react";

const PRODUCT_STYLE_MAP: {
  keyword: string;
  imgSrc: string;
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
    bg: "#262624",
    activeColor: "#d4cbb3",
  },
  {
    keyword: "복숭아",
    imgSrc: "/images/peach.png",
    bg: "#2c1e22",
    activeColor: "#ff99bb",
  },
  {
    keyword: "레몬그라스",
    imgSrc: "/images/niac.png",
    bg: "#1a2622",
    activeColor: "#7accb5",
  },
  {
    keyword: "블루 캐모마일",
    imgSrc: "/images/blue.png",
    bg: "#18202c",
    activeColor: "#7fb2f0",
  },
  {
    keyword: "샤인머스캣",
    imgSrc: "/images/cica.png",
    bg: "#1e261e",
    activeColor: "#90c95c",
  },
  {
    keyword: "아스파라거스",
    imgSrc: "/images/clut.png",
    bg: "#20261c",
    activeColor: "#a6c478",
  },
  {
    keyword: "핑크자몽",
    imgSrc: "/images/aha.png",
    bg: "#2c1c1c",
    activeColor: "#ff8270",
  },
];

const getProductStyle = (name: string) => {
  const matched = PRODUCT_STYLE_MAP.find((item) => name.includes(item.keyword));
  if (matched) return matched;
  if (name.includes("캐롯") || name.includes("carrot")) {
    return PRODUCT_STYLE_MAP.find((item) => item.keyword === "당근");
  }
  if (name.includes("파슬리") || name.includes("parsley")) {
    return PRODUCT_STYLE_MAP.find((item) => item.keyword === "미나리");
  }
  if (name.includes("자몽") || name.includes("grapefruit")) {
    return PRODUCT_STYLE_MAP.find((item) => item.keyword === "핑크자몽");
  }
  return null;
};

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "캐롯 카로틴 카밍 워터 패드",
      category: "패드",
      reviews: "1,243",
      updated: "10분 전",
      active: true,
    },
    {
      id: 2,
      name: "도토리 모공 타이트닝 패드",
      category: "패드",
      reviews: "620",
      updated: "2시간 전",
      active: true,
    },
    {
      id: 3,
      name: "감자 맑은 진정 패드",
      category: "패드",
      reviews: "450",
      updated: "5시간 전",
      active: true,
    },
    {
      id: 4,
      name: "판토테닉 워터 파슬리 클리어 패드",
      category: "패드",
      reviews: "825",
      updated: "25분 전",
      active: true,
    },
    {
      id: 5,
      name: "백아율 라이스 브랜 패드",
      category: "패드",
      reviews: "310",
      updated: "1일 전",
      active: true,
    },
    {
      id: 6,
      name: "복숭아 수분 진정 패드",
      category: "패드",
      reviews: "195",
      updated: "3일 전",
      active: true,
    },
    {
      id: 7,
      name: "레몬그라스 모공 패드",
      category: "패드",
      reviews: "280",
      updated: "4일 전",
      active: true,
    },
    {
      id: 8,
      name: "블루 캐모마일 카밍 패드",
      category: "패드",
      reviews: "518",
      updated: "2시간 전",
      active: false,
    },
    {
      id: 9,
      name: "샤인머스캣 시카 비타 패드",
      category: "패드",
      reviews: "140",
      updated: "5일 전",
      active: true,
    },
    {
      id: 10,
      name: "아스파라거스 필링 클리어 패드",
      category: "패드",
      reviews: "95",
      updated: "6일 전",
      active: true,
    },
    {
      id: 11,
      name: "핑크자몽 AHA 브라이트닝 패드",
      category: "패드",
      reviews: "215",
      updated: "1주일 전",
      active: true,
    },
  ]);

  const toggleActive = (id: number) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  return (
    <div className="flex-1 flex flex-col p-10 bg-[#f4f5f7] h-screen overflow-hidden w-full">
      {/* 1. Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            상품 관리
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* 상품명 검색창 */}
          <div className="relative w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="상품명을 검색하세요."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] font-bold text-gray-800 outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all placeholder-gray-400 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-[14px] cursor-pointer">
            <RefreshCw size={16} />
            <span>데이터 동기화</span>
          </button>
          <button className="flex items-center gap-2 bg-[#F9A2C0] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#F9A2C0]/90 transition-colors text-[14px] cursor-pointer">
            <Plus size={16} />
            <span>상품 등록</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 등록 상품 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border border-pink-100 shrink-0">
            <Package className="text-[#ff477e]" size={40} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-gray-500 leading-tight">
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
            <MonitorCheck className="text-[#ff477e]" size={40} />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-gray-500 leading-tight">
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
            <MessageSquareText
              className="text-[#ff477e]"
              size={38}
              strokeWidth={2}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold text-gray-500 leading-tight">
              누적 리뷰
            </span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              4,286건
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 pb-8 overflow-hidden">
        {/* Title & Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight">
            전체 상품
          </h2>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 text-gray-800 font-bold text-[14px] px-5 py-2.5 pr-10 rounded-xl outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-all shadow-sm cursor-pointer min-w-[160px]">
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
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-bold text-[16px] text-gray-800 w-[45%]">
                  상품 정보
                </th>
                <th className="py-4 text-center font-bold text-[16px] text-gray-800">
                  카테고리
                </th>
                <th className="py-4 text-center font-bold text-[16px] text-gray-800">
                  누적 리뷰
                </th>
                <th className="py-4 text-center font-bold text-[16px] text-gray-800">
                  최근 업데이트
                </th>
                <th className="py-4 text-center font-bold text-[16px] text-gray-800 w-[140px]">
                  분석 활성
                </th>
              </tr>
            </thead>
            <tbody>
              {products
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE,
                )
                .map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-5">
                        {(() => {
                          const style = getProductStyle(prod.name);
                          return (
                            <>
                              <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-transparent">
                                {style?.imgSrc ? (
                                  <img
                                    src={style.imgSrc}
                                    alt={prod.name}
                                    className="w-14 h-14 object-contain"
                                  />
                                ) : (
                                  <ImageIcon
                                    className="text-black/10"
                                    size={36}
                                  />
                                )}
                              </div>
                              <span
                                style={
                                  {
                                    "--hover-color":
                                      style?.activeColor || "#F9A2C0",
                                  } as React.CSSProperties
                                }
                                className="font-extrabold text-[20px] text-gray-900 group-hover:text-[var(--hover-color)] transition-colors cursor-pointer"
                              >
                                {prod.name}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-[20px] text-gray-600 font-bold">
                      {prod.category}
                    </td>
                    <td className="py-2.5 text-center text-[20px] text-gray-600 font-bold">
                      {prod.reviews}건
                    </td>
                    <td className="py-2.5 text-center text-[20px] text-gray-600 font-bold">
                      {prod.updated}
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-center">
                        <div
                          onClick={() => toggleActive(prod.id)}
                          className={`w-[46px] h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${prod.active ? "bg-[#F9A2C0]" : "bg-gray-200"}`}
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
        {(() => {
          const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
          return (
            <div className="flex justify-center items-center gap-2 mt-auto pt-8 pb-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[14px] transition-colors cursor-pointer ${
                      currentPage === page
                        ? "text-[#F9A2C0] bg-[#F9A2C0]/10"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
