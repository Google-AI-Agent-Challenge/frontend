"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/home",
    iconBlack: "/home.png",
    iconWhite: "/home-white.png",
    label: "홈",
  },
  {
    href: "/review",
    iconBlack: "/review.png",
    iconWhite: "/review-white.png",
    label: "리뷰분석",
  },
  {
    href: "/products",
    iconBlack: "/product.png",
    iconWhite: "/product-white.png",
    label: "제품관리",
  },
  {
    href: "/settings",
    iconBlack: "/setting.png",
    iconWhite: "/setting-white.png",
    label: "제어센터",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)] z-10"
      style={{
        width: "200px",
        minWidth: "200px",
        height: "calc(100vh - 32px)",
        padding: "32px 0 24px 0",
        borderRadius: "32px",
        margin: "16px 8px 16px 16px",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6 px-4">
        <div className="flex items-center justify-center mb-6 h-8 w-full">
          <Image
            src="/logo-black.png"
            alt="TONES Logo"
            width={160}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-3 shadow-inner">
            <img
              src="/profile.png"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="bg-[#F9A2C0] text-white text-[12px] font-bold px-2 py-0.5 rounded-full">
              관리자
            </span>
            <span className="text-[18px] font-bold text-gray-900">홍한희</span>
          </div>
          <span className="text-[12px] text-gray-400 scale-90 origin-top">
            hanhui1823@gmail.com
          </span>
        </div>
      </div>

      {/* Icons */}
      <nav className="flex flex-col justify-around px-6 flex-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center justify-center relative w-full py-4.5 rounded-3xl transition-all duration-200"
            >
              {/* Background Card Layer */}
              <div
                className={`absolute inset-0 rounded-3xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#111827] shadow-lg shadow-black/10 scale-105 z-0"
                    : "bg-transparent scale-95 group-hover:bg-[#111827] group-hover:scale-85 z-0"
                }`}
              />

              {/* Content Container (z-10 to stay on top of the background layer) */}
              <div
                className={`z-10 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                  isActive ? "text-white" : "text-gray-900 group-hover:text-white"
                }`}
              >
                {/* 1. 검은색 아이콘 (평소 상태) */}
                <img
                  src={item.iconBlack}
                  alt={`${item.label} 기본`}
                  className={`w-13 h-13 transition-all duration-200 ${
                    isActive ? "hidden" : "block group-hover:hidden"
                  }`}
                />

                {/* 2. 흰색 아이콘 (Hover 상태이거나 Active 상태일 때) */}
                <img
                  src={item.iconWhite}
                  alt={`${item.label} 활성`}
                  className={`w-13 h-13 transition-all duration-200 ${
                    isActive ? "block" : "hidden group-hover:block"
                  }`}
                />

                <span className="text-[15px] font-bold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
