"use client";

import React, { useState } from "react";
import { MoreHorizontal, RefreshCw } from "lucide-react";

function Toggle({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${active ? "bg-[#F9A2C0]" : "bg-gray-200"}`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${active ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [notifyRisk, setNotifyRisk] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  const [lang, setLang] = useState<"ko" | "en">("ko");

  return (
    <div className="flex-1 flex flex-col p-10 bg-[#f4f5f7] w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 w-full h-full mx-auto min-h-0">
        {/* Left Column */}
        <div className="flex flex-col gap-5 h-full min-h-0">
          {/* Admin Accounts Card */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm flex flex-col border border-gray-100 flex-1 min-h-0">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                관리자 계정 관리
              </h2>
              <button className="bg-[#F9A2C0] text-white px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm hover:bg-[#f472b6] transition-colors">
                + 계정 추가
              </button>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 text-[13px] font-bold text-gray-400 pb-3">
                <div>이름</div>
                <div>권한</div>
                <div>최근 접속</div>
                <div>상태</div>
                <div className="text-center">작업</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col flex-1 overflow-hidden gap-8 py-1">
                {/* 1. 홍한희 (Admin) */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 items-center border-b border-gray-50 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[15px] font-bold text-gray-600 shrink-0">
                      홍
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] font-bold text-gray-900">
                        홍한희
                      </span>
                      <span className="text-[16px] text-gray-400">
                        hanhui1823@gmail.com
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-[#F9A2C0] text-white px-3.5 py-1 rounded-md text-[16px] font-bold">
                      관리자
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-500 font-medium">
                    2023.10.27 14:22
                  </div>
                  <div className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                {/* 2. 허진수 (분석가 -> 관리자) */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 items-center border-b border-gray-50 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[15px] font-bold text-gray-600 shrink-0">
                      허
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] font-bold text-gray-900">
                        허진수
                      </span>
                      <span className="text-[16px] text-gray-400">
                        js.heo@tones.io
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-[#F9A2C0] text-white px-3.5 py-1 rounded-md text-[16px] font-bold">
                      관리자
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-500 font-medium">
                    2023.10.26 18:05
                  </div>
                  <div className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                {/* 3. 최연우 (관리자 -> 분석가, 3번째 위치) */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 items-center border-b border-gray-50 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[15px] font-bold text-gray-600 shrink-0">
                      최
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] font-bold text-gray-900">
                        최연우
                      </span>
                      <span className="text-[16px] text-gray-400">
                        yw.choi@tones.io
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-gray-100 text-gray-600 px-3.5 py-1 rounded-md text-[16px] font-bold">
                      분석가
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-500 font-medium">
                    2023.10.28 11:00
                  </div>
                  <div className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                {/* 4. 이채민 */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 items-center border-b border-gray-50 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[15px] font-bold text-gray-600 shrink-0">
                      이
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] font-bold text-gray-900">
                        이채민
                      </span>
                      <span className="text-[16px] text-gray-400">
                        cm.lee@tones.io
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-gray-100 text-gray-600 px-3.5 py-1 rounded-md text-[16px] font-bold">
                      분석가
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-500 font-medium">
                    2023.10.28 10:30
                  </div>
                  <div className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                {/* 5. 김윤진 (이민호의 변경된 이름, 맨 아래로) */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-3 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[15px] font-bold text-gray-600 shrink-0">
                      김
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] font-bold text-gray-900">
                        김윤진
                      </span>
                      <span className="text-[16px] text-gray-400">
                        yj.kim@tones.io
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-gray-100 text-gray-600 px-3.5 py-1 rounded-md text-[16px] font-bold">
                      매니저
                    </span>
                  </div>
                  <div className="text-[14px] text-gray-500 font-medium">
                    2023.10.20 09:15
                  </div>
                  <div className="text-[14px] font-bold text-gray-400 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 휴면
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Cards Row */}
          <div className="grid grid-cols-2 gap-5 shrink-0 h-44">
            {/* Naver Shopping API */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[24px] font-bold text-gray-900 tracking-tight">
                    네이버 쇼핑 API
                  </h3>
                  <span className="text-[14px] font-medium text-gray-400">
                    리뷰 데이터 동기화 상태
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-[14px] font-bold text-gray-500">
                    연동 상태: <span className="text-gray-700">정상</span>
                  </span>
                  <span className="text-[17px] font-bold text-[#F9A2C0]">
                    98%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F9A2C0] h-full rounded-full"
                    style={{ width: "98%" }}
                  ></div>
                </div>
                <span className="text-[12px] text-gray-400 italic mt-0.5">
                  마지막 동기화: 5분 전
                </span>
              </div>
            </div>

            {/* Olive Young API */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[24px] font-bold text-gray-900 tracking-tight">
                    올리브영 API
                  </h3>
                  <span className="text-[14px] font-medium text-gray-400">
                    리뷰 데이터 동기화 상태
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-[14px] font-bold text-gray-500">
                    연동 상태: <span className="text-gray-700">정상</span>
                  </span>
                  <span className="text-[17px] font-bold text-[#F9A2C0]">
                    100%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#F9A2C0] h-full rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <span className="text-[12px] text-gray-400 italic mt-0.5">
                  마지막 동기화: 1분 전
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5 h-full min-h-0">
          {/* Notification Settings */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
            <h2 className="text-[22px] font-bold text-gray-900 mb-6 shrink-0">
              알림 설정
            </h2>

            <div className="flex flex-col justify-around flex-1">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[20px] font-bold text-gray-900">
                    긴급 리스크 알림
                  </span>
                  <span className="text-[18px] text-gray-600 mt-1">
                    부정 리뷰 급증 시 즉시 알림
                  </span>
                </div>
                <Toggle
                  active={notifyRisk}
                  onClick={() => setNotifyRisk(!notifyRisk)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[20px] font-bold text-gray-900">
                    일간 브리핑 레포트
                  </span>
                  <span className="text-[18px] text-gray-600 mt-1">
                    매일 오전 9시 요약본 발송
                  </span>
                </div>
                <Toggle
                  active={notifyDaily}
                  onClick={() => setNotifyDaily(!notifyDaily)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[20px] font-bold text-gray-900">
                    시스템 상태 알림
                  </span>
                  <span className="text-[18px] text-gray-600 mt-1">
                    API 연동 장애 및 서버 상태
                  </span>
                </div>
                <Toggle
                  active={notifySystem}
                  onClick={() => setNotifySystem(!notifySystem)}
                />
              </div>
            </div>
          </div>

          {/* System Environment Settings */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col shrink-0 h-auto">
            <h2 className="text-[22px] font-bold text-gray-900 mb-5">
              시스템 환경 설정
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500">
                  데이터 업데이트 주기
                </label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-[15px] font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 appearance-none cursor-pointer">
                    <option>실시간 (권장)</option>
                    <option>1시간마다</option>
                    <option>12시간마다</option>
                    <option>수동 업데이트</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500">
                  분석 언어 설정
                </label>
                <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setLang("ko")}
                    className={`flex-1 py-2.5 rounded-lg text-[15px] font-bold transition-colors ${lang === "ko" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`flex-1 py-2.5 rounded-lg text-[15px] font-bold transition-colors ${lang === "en" ? "bg-gray-900 text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <RefreshCw size={18} />
                전체 설정 초기화
              </button>
              <span className="text-center text-[12px] font-medium text-gray-400 italic">
                마지막 백업: 2023.10.27 02:00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
