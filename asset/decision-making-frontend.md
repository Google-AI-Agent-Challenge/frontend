# 📋 프론트엔드 기술 의사결정 문서 (Decision Making)

우리 프로젝트의 **프론트엔드 기술 의사결정** 문서에 오신 것을 환영합니다. 이 문서는 사용자 경험 중심의 견고한 프론트엔드 시스템을 정의하는 기술적 맥락, 주요 아키텍처 결정 사항 및 디렉터리 구조를 설명합니다.

---

## 🛠️ 프론트엔드 개발 환경 및 기술 스택 (Context)

우리의 프론트엔드 스택은 Next.js 16.2.6 App Router와 React 19 에코시스템을 기반으로 구축되었으며, Server Actions 기반 API 격리 레이어, 이중 AI 아키텍처, 클라이언트 사이드 문서 내보내기 및 GCP Cloud Run 컨테이너 배포 파이프라인이 설계되어 있습니다.

| 구분 | 기술 스택 | 주요 상세 정보 및 버전 |
| :--- | :--- | :--- |
| **핵심 프레임워크** | **Next.js 16.2.6** | App Router 기반 RSC(React Server Component) + Server Actions 아키텍처 |
| **언어** | **TypeScript 5+** | 정적 타입 검증 기반의 인터페이스 중심 개발 환경 구축 |
| **UI 라이브러리** | **React 19.2.4** | 최신 동시 렌더링(Concurrent Rendering) 및 훅 기반 상태 관리 |
| **스타일링** | **Tailwind CSS v4** | `@tailwindcss/postcss` 기반의 PostCSS 파이프라인 직접 통합 방식 채택 (v3의 `tailwind.config.js` 방식 미사용) |
| **폰트** | **Noto Sans KR** | `next/font/google`을 통한 서버 사이드 폰트 최적화 (레이아웃 시프트 방지) |
| **아이콘** | **Lucide React v1.16.0** | 트리 쉐이킹(Tree-shaking) 완전 지원 SVG 아이콘 패키지 |
| **데이터 시각화** | **Recharts v3.8.1** | React 생태계 호환 선언형 SVG 차트 라이브러리 (부정 리뷰 추이 시계열, KPI 시각화 등) |
| **AI 통합** | **@google/generative-ai v0.21.0** | 프론트엔드 Server Action 레이어에서 Gemini 2.5-flash 직접 호출 (리뷰 검색 필터 파라미터 생성 및 RAG 챗봇 보조) |
| **문서 내보내기** | **docx v9.7.1** | 클라이언트 사이드 DOCX 파일 빌드 (서버 왕복 없는 VOC 리포트 다운로드) |
| | **exceljs v4.4.0** | 클라이언트 사이드 엑셀 데이터 구성 및 스타일링 지원 |
| | **file-saver v2.0.5** | Blob 기반 브라우저 파일 다운로드 트리거 |
| **빌드 도구** | **Webpack** (`next dev --webpack`) | Turbopack 미사용, Webpack 번들러 명시 고정 |
| **정적 분석** | **ESLint 9 + eslint-config-next** | Next.js 최적화 룰셋 적용 코드 품질 자동 검사 |
| **컨테이너** | **Docker Multi-stage Build (node:20-alpine)** | 3단계 멀티 스테이지 빌드로 최소 이미지 크기 달성 |
| **배포** | **GCP Cloud Run** | `output: 'standalone'` 기반 독립 Node.js 서버 컨테이너 배포 |
| **CI** | **GitHub Actions** | PR 단위 TypeScript 타입 검사 → ESLint → Docker 빌드 검증 3단계 파이프라인 |

---

## 🏗️ 주요 아키텍처 결정 사항 (Architectural Decisions)

### 1. Next.js App Router + Server Actions 기반 API 격리 레이어

- **Server Actions 전담 파일 분리**: 백엔드(`TONES_Server`) API를 호출하는 모든 함수는 `app/actions/data.ts` 단일 파일에 `"use server"` 지시어 하에 집중 관리됩니다. 이 레이어는 Node.js 서버에서만 실행되므로 API 키 등 민감 정보가 클라이언트 번들에 노출되지 않습니다.
- **환경변수 주입 전략**: 과거에 사용하던 `NEXT_PUBLIC_API_URL`은 빌드 타임에 번들에 인라인되어 API 엔드포인트가 클라이언트에 노출되는 문제가 있었습니다. 현재는 런타임 주입 서버 전용 환경변수인 `API_URL`로 완전히 전환하여 Server Actions 내에서만 참조하도록 구성하였습니다.
- **Client/Server 컴포넌트 명시적 구분**: 상태(`useState`), 이벤트 핸들러, 브라우저 API가 필요한 컴포넌트에는 `"use client"` 지시어를 명시하고, 나머지는 기본 Server Component로 처리하여 번들 크기를 최소화합니다.

### 2. 이중 AI 아키텍처 (Dual AI Layer)

- **프론트엔드 직접 호출 (chat.ts)**: `@google/generative-ai` SDK를 통해 `gemini-2.5-flash` 모델을 Server Action에서 직접 호출합니다. 사용자 자연어 입력을 `FilterParams` JSON 스키마로 변환하는 구조화된 출력(Structured Output)에 특화하여 사용합니다.
- **백엔드 RAG 경유 호출 (data.ts → /api/ai/chat)**: 리뷰 분석 챗봇 응답은 `TONES_Server`의 pgvector 시맨틱 검색 + Gemini RAG 파이프라인을 경유하여 근거 리뷰 데이터(referenced_reviews)와 함께 반환받습니다.
- **역할 분리 기준**: 필터 파라미터 추출처럼 DB 컨텍스트가 불필요한 경우는 프론트엔드 직접 호출, DB 기반 근거 답변이 필요한 경우는 백엔드 RAG를 통한 호출로 역할을 명확히 분리하였습니다.

### 3. Standalone 컨테이너 빌드 및 GCP Cloud Run 배포

- **`output: 'standalone'` 설정**: `next.config.ts`에서 `output: 'standalone'`을 활성화하여 Next.js 빌드 결과물이 `node_modules` 전체 복사 없이 독립 실행 가능한 `server.js` 단일 엔트리포인트를 생성하도록 설정했습니다. 이를 통해 컨테이너 이미지 크기를 대폭 절감합니다.
- **3단계 멀티 스테이지 빌드**: `deps`(의존성 설치) → `builder`(빌드) → `runner`(최소 실행 이미지) 단계로 분리하여 최종 이미지에 소스 코드와 개발 의존성이 포함되지 않도록 설계하였습니다.
- **런타임 환경변수 주입**: `API_URL` 환경변수를 Dockerfile의 실행 이미지(`runner`) 단계에서 런타임으로 주입하도록 구성하여, GCP Cloud Run 배포 시점에 동적으로 설정할 수 있도록 하였습니다. 과거 빌드 ARG 방식으로 사용하던 `NEXT_PUBLIC_API_URL`은 번들 인라인 문제로 인해 제거하였습니다.

### 4. 리뷰 데이터 병렬 청크 로딩 (Parallel Chunk Loading)

- **청크 기반 페이징**: 전체 리뷰 수를 먼저 `/api/reviews/count`로 조회한 후, `page` 단위 50건씩 반복 요청하는 방식으로 대용량 리뷰 데이터를 점진적으로 적재합니다.
- **도입 배경**: 단일 대량 요청 시 서버 응답 타임아웃 및 JSON 파싱 부하가 발생할 수 있어, 청크 분할 로딩으로 안정성을 높이고 초기 화면 렌더링 속도를 개선하였습니다.

### 5. 클라이언트 사이드 문서 내보내기 (Client-side Export)

- **DOCX 생성**: `docx` 라이브러리를 통해 VOC 분석 리포트를 브라우저 메모리에서 직접 빌드하여 다운로드합니다. 서버 왕복이 없으므로 응답 지연 없이 즉시 파일이 생성됩니다.
- **Excel 내보내기**: 백엔드의 `/api/reviews/export` CSV 스트리밍과 병행하여, 클라이언트에서도 `exceljs`를 통한 엑셀 파일 생성이 가능하도록 이중 경로를 지원합니다.
- **Google Docs 연동 제거**: 초기 설계에서 고려했던 Google Docs API 연동은 OAuth 인증 복잡성과 외부 의존성 문제로 제거하고, 백엔드에서 Markdown을 직접 반환하는 방식으로 전환하였습니다.

### 6. Tailwind CSS v4 PostCSS 통합

- **`tailwind.config.js` 미사용**: v3 방식의 별도 설정 파일 대신, `postcss.config.mjs`에 `@tailwindcss/postcss` 플러그인을 등록하는 v4 방식을 채택하였습니다. 빌드 설정 파일 수를 줄이고 Next.js의 PostCSS 파이프라인과 직접 통합하여 불필요한 설정 중복을 제거하였습니다.

### 7. CI 3단계 파이프라인 (GitHub Actions)

- **단계별 의존성 설계**: TypeScript 타입 검사(`tsc --noEmit`)와 ESLint 검사는 독립적으로 병렬 실행되고, Docker 빌드 검증은 두 단계가 모두 통과한 이후에만 실행(`needs: [type-check, lint]`)되도록 순서를 설계하였습니다.
- **Dry-Run 빌드 검증**: Docker 이미지를 레지스트리에 Push하지 않고 `docker build --no-cache`만 수행하는 검증 단계를 두어, PR 병합 전에 컨테이너 빌드 오류를 사전 차단합니다.

---

## 📂 프론트엔드 폴더 구조 (App Router Architecture)

프로젝트는 **Next.js App Router**의 파일 시스템 기반 라우팅 아키텍처로 구성되어 있습니다. 페이지별 컴포넌트와 공용 레이어가 명확히 분리되며, Server Actions 격리 레이어를 통해 백엔드 API 호출 경계가 일관되게 유지됩니다.

```text
frontend/
├── app/                            # Next.js App Router 핵심 소스 디렉토리
│   │
│   ├── actions/                    # "use server" Server Actions — 백엔드 API 호출 전담 격리 레이어
│   │   ├── data.ts                 # TONES_Server REST API 전체 호출 함수 집합 (fetchDashboard*, fetchReviews* 등)
│   │   └── chat.ts                 # Gemini 2.5-flash 직접 호출 — 자연어 → FilterParams 구조화 출력 생성
│   │
│   ├── components/                 # 공용 UI 컴포넌트 (재사용 가능한 "use client" 선언 컴포넌트)
│   │   ├── Sidebar.tsx             # 전역 좌측 내비게이션 사이드바 (Active 경로 하이라이팅 포함)
│   │   ├── KpiCards.tsx            # 홈 대시보드 KPI 카드 그룹 (총 리뷰 수, 평균 별점, 부정 리뷰율 등)
│   │   ├── MiddleCharts.tsx        # 홈 대시보드 중간 차트 영역 (부정 리뷰 추이 Recharts 연동)
│   │   ├── BottomSection.tsx       # 홈 대시보드 하단 섹션 (급상승 키워드, 속성 인사이트, AI 브리핑)
│   │   ├── ReviewModal.tsx         # 리뷰 상세 모달 (부정/우선 리뷰 목록 팝업)
│   │   ├── ReviewAnalysisBoard.tsx # 리뷰 분석 페이지 메인 보드 컴포넌트
│   │   ├── ReviewAiPanel.tsx       # 리뷰 분석 AI 인사이트 패널
│   │   ├── AnalyticsPanel.tsx      # 분석 패널 공용 컴포넌트
│   │   └── ChatPanel.tsx           # AI 어시스턴트 챗봇 패널 UI
│   │
│   ├── home/                       # /home 페이지 — 대시보드 홈
│   │   ├── page.tsx                # 대시보드 상태 관리 및 데이터 로딩 조율 (Client Component)
│   │   └── reviewService.ts        # 홈 전용 리뷰 데이터 처리 유틸리티
│   │
│   ├── review/                     # /review 페이지 — 리뷰 분석
│   │   └── page.tsx                # 리뷰 필터링, 검색, AI 분석 통합 페이지
│   │
│   ├── products/                   # /products 페이지 — 제품 관리
│   │   └── page.tsx                # 제품 목록 조회, 등록, 동기화 관리 페이지
│   │
│   ├── settings/                   # /settings 페이지 — 제어센터
│   │   └── page.tsx                # 관리자 계정 관리, 알림·환경 설정, 연동 상태 확인 페이지
│   │
│   ├── types/
│   │   └── index.ts                # 프로젝트 전역 TypeScript 인터페이스 정의 (Product, Review, DashboardSummary 등)
│   │
│   ├── utils/
│   │   └── exportDocx.ts           # docx 라이브러리 기반 클라이언트 사이드 VOC 리포트 DOCX 빌드 유틸리티
│   │
│   ├── layout.tsx                  # 전역 루트 레이아웃 — Noto Sans KR 폰트, Sidebar, HTML 메타데이터 설정
│   ├── page.tsx                    # 루트 경로(/) — /home으로 리다이렉트 처리
│   └── globals.css                 # Tailwind CSS v4 전역 스타일시트 및 CSS 변수 정의
│
├── public/                         # 정적 자산 (이미지, 아이콘)
│   ├── favicon.png                 # 브라우저 탭 파비콘
│   ├── logo-black.png              # TONES 로고 (다크 버전)
│   ├── home.png / home-white.png   # 사이드바 내비게이션 아이콘 (기본/활성 상태)
│   ├── profile.png                 # 사이드바 사용자 프로필 기본 아바타
│   └── images/                     # 제품 대표 이미지 (carrot.png, potato.png 등)
│
├── asset/                          # 프로젝트 문서 자산
│   └── decision-making-frontend.md # 현재 문서 — 프론트엔드 기술 의사결정 공식 안내서
│
├── .github/
│   └── workflows/
│       └── frontend-ci.yml         # GitHub Actions CI — TypeScript 타입 검사 → ESLint → Docker 빌드 검증
│
├── .dockerignore                   # Docker 빌드 시 제외 파일 목록
├── .gitignore                      # Git 버전 관리 제외 목록
├── Dockerfile                      # 3단계 멀티 스테이지 빌드 (deps → builder → runner) 컨테이너 명세
├── next.config.ts                  # Next.js 설정 (output: 'standalone' 활성화)
├── postcss.config.mjs              # PostCSS 설정 (@tailwindcss/postcss v4 통합)
├── tsconfig.json                   # TypeScript 컴파일러 설정
├── package.json                    # npm 의존성 및 스크립트 정의
└── README.md                       # 프로젝트 소개 및 로컬 개발 환경 구축 가이드
```


---

> [!NOTE]
> 본 설계 문서는 Google AI Agent Challenge 프로젝트의 프론트엔드 아키텍처 및 핵심 엔지니어링 의사결정을 정의한 공식 안내서입니다. 신규 페이지 또는 컴포넌트 추가 시 Server/Client 컴포넌트 경계 원칙을 준수하고, 모든 백엔드 API 호출은 반드시 `app/actions/data.ts` 레이어를 통해 처리해 주시기 바랍니다.
