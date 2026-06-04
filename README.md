# 💄 TONES Frontend

> **우연최연우** 팀의 H&B 입점 뷰티 브랜드를 위한 AI 대화형 리뷰 관제 솔루션 — 프론트엔드

---

## 🔗 배포 링크

| 구분 | URL |
| :--- | :--- |
| **프론트엔드** | https://tones-frontend-257637179317.us-central1.run.app |
| **백엔드 (API)** | https://tones-server-257637179317.us-central1.run.app |
| **API 문서 (Swagger)** | https://tones-server-257637179317.us-central1.run.app/docs |

---

## 📖 프로젝트 소개

하루 수만 건씩 쌓이는 고객 리뷰,<br>
아직도 실무자가 직접 읽고 계신가요?
<br>

**TONES**는 H&B 스토어 입점 뷰티 브랜드사를 위한<br>
B2B 특화 AI 리뷰 감성 분석 대시보드입니다.<br>
<br>
리뷰 원문·별점·제품 정보를 기반으로 고객 VOC를 분석하고,<br>
감성 분류·핵심 키워드·이슈 유형·변동 추이를 한 화면에서 시각화합니다.<br>
<br>
단순 키워드 검색이 아닌,<br>
"수분감은 좋지만 트러블이 발생했다"와 같은 양가감정 리뷰까지 분석할 수 있도록<br>
화장품 도메인 특화 ABSA(속성 기반 감성 분석) 구조를 적용했습니다.

---

## 🛠️ 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| **프레임워크** | Next.js 16.2.6 (App Router) |
| **언어** | TypeScript 5+ |
| **UI 라이브러리** | React 19.2.4 |
| **스타일링** | Tailwind CSS v4 (`@tailwindcss/postcss` PostCSS 통합) |
| **데이터 시각화** | Recharts v3.8.1 |
| **아이콘** | Lucide React v1.16.0 |
| **AI / 생성** | Google Gemini `gemini-2.5-flash` (Server Actions 직접 호출) |
| **문서 내보내기** | docx v9.7.1, exceljs v4.4.0, file-saver v2.0.5 |
| **정적 분석** | ESLint 9 + eslint-config-next |
| **배포** | Docker (멀티 스테이지 빌드, `output: 'standalone'`), GCP Cloud Run |
| **CI** | GitHub Actions (TypeScript 타입 검사 → ESLint → Docker 빌드 검증) |

---

## 🏗️ 아키텍처

### App Router 기반 Server Actions 구조

백엔드 API 호출은 `app/actions/` 하위 Server Actions 레이어에 격리하여, 환경변수 및 API 엔드포인트가 클라이언트 번들에 노출되지 않도록 설계되었습니다.

```text
frontend/
├── app/
│   ├── actions/                    # "use server" — 백엔드 API 호출 전담 격리 레이어
│   │   ├── data.ts                 # TONES_Server REST API 전체 호출 함수
│   │   └── chat.ts                 # Gemini 2.5-flash 직접 호출 (필터 파라미터 생성)
│   ├── components/                 # 공용 UI 컴포넌트 ("use client")
│   │   ├── Sidebar.tsx
│   │   ├── KpiCards.tsx
│   │   ├── MiddleCharts.tsx
│   │   ├── BottomSection.tsx
│   │   ├── ReviewModal.tsx
│   │   ├── ReviewAnalysisBoard.tsx
│   │   ├── ReviewAiPanel.tsx
│   │   ├── AnalyticsPanel.tsx
│   │   └── ChatPanel.tsx
│   ├── home/                       # /home — 대시보드 홈
│   ├── review/                     # /review — 리뷰 분석
│   ├── products/                   # /products — 제품 관리
│   ├── settings/                   # /settings — 제어센터
│   ├── types/index.ts              # 프로젝트 전역 TypeScript 인터페이스
│   ├── utils/exportDocx.ts         # 클라이언트 사이드 VOC 리포트 DOCX 빌드 유틸리티
│   ├── layout.tsx                  # 전역 루트 레이아웃 (Noto Sans KR, Sidebar)
│   └── globals.css                 # Tailwind CSS v4 전역 스타일시트
├── public/                         # 정적 자산 (로고, 아이콘, 제품 이미지)
├── asset/                          # 기술 의사결정 문서
├── .env.example
├── Dockerfile
└── next.config.ts
```

### ⚙️ 시스템 아키텍처 다이어그램

<img src="./asset/시스템%20아키텍처.png" width="500"/>

---

## 🔑 핵심 설계 특징

### 1. Server Actions 기반 API 격리
모든 백엔드 API 호출을 `"use server"` 지시어가 선언된 Server Actions 파일에 집중하여, `API_URL` 등 서버 전용 환경변수가 클라이언트에 노출되지 않습니다.

### 2. 이중 AI 아키텍처 (Dual AI Layer)
- **프론트엔드 직접 호출**: `chat.ts`에서 Gemini 2.5-flash를 직접 호출하여 사용자 자연어 입력을 필터 파라미터(JSON)로 변환합니다.
- **백엔드 RAG 경유 호출**: 챗봇 답변은 `TONES_Server`의 pgvector 시맨틱 검색 + Gemini RAG 파이프라인을 경유하여 근거 리뷰 데이터와 함께 반환받습니다.

### 3. 병렬 청크 로딩
전체 리뷰 수를 먼저 `/api/reviews/count`로 조회한 후 50건 단위 청크로 분할 요청하여, 대용량 데이터의 초기 렌더링 성능과 안정성을 확보합니다.

### 4. 클라이언트 사이드 문서 내보내기
`docx` 라이브러리를 통해 VOC 분석 리포트를 브라우저 메모리에서 직접 빌드하여 서버 왕복 없이 즉시 다운로드합니다.

### 5. Standalone 컨테이너 빌드
`next.config.ts`의 `output: 'standalone'` 설정으로 `node_modules` 전체 복사 없이 독립 실행 가능한 최소 컨테이너 이미지를 생성합니다.

---

## 🚀 로컬 실행 방법

### 1. 저장소 클론

```shell
git clone https://github.com/Google-AI-Agent-Challenge/frontend.git

cd frontend
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 값을 채운다.

```shell
cp .env.example .env.local
```

```env
# Backend API Config
API_URL="http://localhost:8080"

# Google Gemini Config
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. 패키지 설치

```shell
npm install
```

### 4. 개발 서버 실행

```shell
npm run dev
```

> 실행 후 http://localhost:3000 에서 확인할 수 있다.

---

## 🐳 Docker 빌드 및 배포

```shell
# 로컬 Docker 빌드
docker build -t tones-frontend .
docker run -p 3000:3000 -e API_URL=http://localhost:8080 -e GEMINI_API_KEY=your-key tones-frontend
```

> GCP Cloud Run 배포는 `.github/workflows/frontend-ci.yml` CI 파이프라인을 통해 자동화되어 있다.

---

## 📋 페이지 구성

| 경로 | 페이지 | 주요 기능 |
| :--- | :--- | :--- |
| `/home` | 홈 대시보드 | KPI 카드, 부정 리뷰 추이 차트, 급상승 키워드, AI 브리핑 |
| `/review` | 리뷰 분석 | 리뷰 필터링·검색, AI 챗봇, 인사이트 패널, CSV 내보내기 |
| `/products` | 제품 관리 | 제품 목록 조회·등록, 분석 활성화 토글, 크롤러 동기화 |
| `/settings` | 제어센터 | 관리자 계정 CRUD, 알림·환경 설정, 외부 연동 상태 확인 |
