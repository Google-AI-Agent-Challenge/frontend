"use client";

import React, { useState } from "react";
import { MoreHorizontal, CheckSquare, RefreshCw, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [notifyRisk, setNotifyRisk] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);
  
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${active ? "bg-[#8A1538]" : "bg-gray-200"}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${active ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-[#f4f5f7] w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 max-w-[1400px] w-full mx-auto">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Admin Accounts Card */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">관리자 계정 관리</h2>
              <button className="bg-[#8A1538] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#70102d] transition-colors">
                + 계정 추가
              </button>
            </div>

            <div className="flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 text-xs font-bold text-gray-400 pb-4 border-b border-gray-100 ml-2">
                <div>이름</div>
                <div>권한</div>
                <div>최근 접속</div>
                <div>상태</div>
                <div className="text-center">작업</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col">
                {/* Row 1 */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 items-center py-5 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      홍
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-gray-900">홍한희</span>
                      <span className="text-[12px] text-gray-400">hanhui1823@gmail.com</span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-[#8A1538] text-white px-2.5 py-1 rounded-md text-[11px] font-bold">슈퍼 관리자</span>
                  </div>
                  <div className="text-[13px] text-gray-500 font-medium">
                    2023.10.27 14:22
                  </div>
                  <div className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={20} /></button>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 items-center py-5 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      김
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-gray-900">김지수</span>
                      <span className="text-[12px] text-gray-400">js.kim@tones.io</span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold">분석가</span>
                  </div>
                  <div className="text-[13px] text-gray-500 font-medium">
                    2023.10.26 18:05
                  </div>
                  <div className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 활성
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={20} /></button>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_0.5fr] gap-4 items-center py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                      이
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-gray-900">이민호</span>
                      <span className="text-[12px] text-gray-400">minho.lee@tones.io</span>
                    </div>
                  </div>
                  <div>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold">매니저</span>
                  </div>
                  <div className="text-[13px] text-gray-500 font-medium">
                    2023.10.20 09:15
                  </div>
                  <div className="text-[13px] font-bold text-gray-400 flex items-center gap-1.5">
                    <span className="text-[8px]">●</span> 휴면
                  </div>
                  <div className="flex justify-center">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API Cards Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Naver Shopping API */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">네이버 쇼핑 API</h3>
                  <span className="text-[13px] font-medium text-gray-400">리뷰 데이터 동기화 상태</span>
                </div>
                <div className="text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                  <CheckSquare size={24} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex justify-between items-end">
                  <span className="text-[13px] font-bold text-gray-500">연동 상태: <span className="text-gray-700">정상</span></span>
                  <span className="text-[15px] font-bold text-[#8A1538]">98%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#8A1538] h-full rounded-full" style={{ width: "98%" }}></div>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 italic">마지막 동기화: 5분 전</span>
              </div>
            </div>

            {/* Olive Young API */}
            <div className="bg-white rounded-[24px] p-7 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">올리브영 API</h3>
                  <span className="text-[13px] font-medium text-gray-400">외부 몰 데이터 인터페이스</span>
                </div>
                <div className="relative text-[#6a4c41] bg-[#f0eceb] p-2 rounded-xl flex items-center justify-center">
                  <RefreshCw size={24} strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 bg-white rounded-full">
                    <AlertCircle size={14} className="text-red-500 fill-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex justify-between items-end">
                  <span className="text-[13px] font-bold text-gray-500">연동 상태: <span className="text-gray-700">점검 필요</span></span>
                  <span className="text-[13px] font-bold text-red-500">오류</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: "15%" }}></div>
                </div>
                <span className="text-[12px] font-medium text-red-500 mt-1">네트워크 타임아웃 발생 (408)</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Notification Settings */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-8">알림 설정</h2>
            
            <div className="flex flex-col gap-7">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-gray-900">긴급 리스크 알림</span>
                  <span className="text-[12px] text-gray-400 mt-0.5">부정 리뷰 급증 시 즉시 알림</span>
                </div>
                <Toggle active={notifyRisk} onClick={() => setNotifyRisk(!notifyRisk)} />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-gray-900">일간 브리핑 레포트</span>
                  <span className="text-[12px] text-gray-400 mt-0.5">매일 오전 9시 요약본 발송</span>
                </div>
                <Toggle active={notifyDaily} onClick={() => setNotifyDaily(!notifyDaily)} />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-gray-900">시스템 상태 알림</span>
                  <span className="text-[12px] text-gray-400 mt-0.5">API 연동 장애 및 서버 상태</span>
                </div>
                <Toggle active={notifySystem} onClick={() => setNotifySystem(!notifySystem)} />
              </div>
            </div>
          </div>

          {/* System Environment Settings */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-8">시스템 환경 설정</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-500">데이터 업데이트 주기</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-100 text-gray-800 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 appearance-none cursor-pointer">
                    <option>실시간 (권장)</option>
                    <option>1시간마다</option>
                    <option>12시간마다</option>
                    <option>수동 업데이트</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-500">분석 언어 설정</label>
                <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
                  <button 
                    onClick={() => setLang("ko")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${lang === "ko" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    한국어
                  </button>
                  <button 
                    onClick={() => setLang("en")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${lang === "en" ? "bg-gray-900 text-white shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <RefreshCw size={18} />
                전체 설정 초기화
              </button>
              <span className="text-center text-[11px] font-medium text-gray-400 italic">
                마지막 백업: 2023.10.27 02:00
              </span>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
}
