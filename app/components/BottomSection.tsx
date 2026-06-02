"use client";

import React from "react";

export default function BottomSection() {
  return (
    <div className="flex gap-6 pb-12">
      {/* 좌측: 주요 분석 리스트 (가로 비율을 더 넓게) */}
      <div className="flex-[2.2] flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          주요 분석 리스트
        </h3>
        <div className="flex flex-col gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="flex gap-2">
              <span className="bg-[#B7064B] text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm">
                #따가움
              </span>
              <span className="bg-[#B7064B] text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm">
                #좁쌀
              </span>
              <span className="bg-[#B7064B] text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm">
                #민감성피부
              </span>
            </div>
            <h4 className="text-[24px] font-bold text-gray-900 mt-2 tracking-tight">
              당근 패드 트러블 언급 증가{" "}
              <span className="text-[#B7064B]">+12.8%</span>
            </h4>
            <p className="text-[20px] text-gray-700 leading-[1.6] font-medium tracking-tight">
              지난 3일간 민감성 피부 타입을 가진 사용자들 사이에서{" "}
              <span className="text-[#B7064B] font-bold">따가움</span>과{" "}
              <span className="text-[#B7064B] font-bold">좁쌀</span> 키워드
              언급이 급증했습니다.
              <br />
              주로 환절기 외부 환경 변화와 관련된 피드백으로 분석됩니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="flex gap-2">
              <span className="bg-[#3B8026] text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm">
                #진정
              </span>
              <span className="bg-[#3B8026] text-white text-[16px] font-bold px-4 py-1 rounded-full shadow-sm">
                #수부지피부
              </span>
            </div>
            <h4 className="text-[24px] font-bold text-gray-900 mt-2 tracking-tight">
              미나리 패드 진정 효과 만족도 상승{" "}
              <span className="text-[#3B8026]">+21.6%</span>
            </h4>
            <p className="text-[20px] text-gray-700 leading-[1.6] font-medium tracking-tight">
              붉은기 <span className="text-[#3B8026] font-bold">진정</span> 및{" "}
              <span className="text-[#3B8026] font-bold">쿨링</span> 효과에 대한
              구체적인 칭찬 리뷰가 다수 포착되었습니다. 인플루언서 마케팅 캠페인
              시점과 맞물려 긍정 바이럴이 형성되고 있습니다
            </p>
          </div>
        </div>
      </div>

      {/* 우측: AI 브리핑 요약 */}
      <div className="flex-[1] flex flex-col gap-3">
        <h3 className="text-[24px] font-bold text-gray-900 tracking-tight pl-1">
          AI 브리핑 요약
        </h3>

        <div className="flex flex-col gap-4 h-full justify-between">
          {/* 긍정 시그널 */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-center flex-1">
            <h5 className="text-[24px] font-bold text-gray-900 tracking-tight">
              긍정 시그널
            </h5>
            <p className="text-[20px] text-gray-500 leading-[1.6] font-medium mt-1">
              여름 시즌을 맞아 쿨링 효과를 강조한 제품군의 리뷰 참여율이 전주
              대비 15% 상승했습니다.
            </p>
          </div>

          {/* 오늘의 핵심 이슈 */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-center flex-1">
            <h5 className="text-[24px] font-bold text-gray-900 tracking-tight">
              오늘의 핵심 이슈
            </h5>
            <p className="text-[20px] text-gray-500 leading-[1.6] font-medium mt-1">
              '당근 패드' 라인의 초기 트러블 반응 모니터링이 시급합니다. CS 대응
              매뉴얼 점검을 권장합니다.
            </p>
          </div>

          {/* 리포트 만들기 버튼 */}
          <button className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-gray-50 hover:shadow-md transition-all duration-200 text-[24px] tracking-tight flex justify-center items-center gap-2 cursor-pointer">
            리포트 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
