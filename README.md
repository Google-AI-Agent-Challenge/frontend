# 💄 TONES

> **우연최연우** 팀과 함께하는 H&B 입점 뷰티 브랜드를 위한 AI 대화형 리뷰 관제 솔루션


## 🎥 배포 링크

> [👉 구경하러 가기~!](https://frontend-eight-orcin-70.vercel.app/)

## 📖 프로젝트 소개

하루 수만 건씩 쌓이는 고객 리뷰,  
아직도 실무자가 직접 읽고 계신가요?

**TONES**는 H&B 스토어 입점 뷰티 브랜드사를 위한  
B2B 특화 AI 리뷰 감성 분석 대시보드입니다.

리뷰 원문, 별점, 제품 정보를 기반으로 고객 VOC를 분석하고,  
감성 분류·핵심 키워드·이슈 유형·변동 추이를 한 화면에서 시각화합니다.

또한 단순 키워드 검색이 아닌,  
“수분감은 좋지만 트러블이 발생했다”와 같은 양가감정 리뷰까지 분석할 수 있도록  
화장품 도메인 특화 감성 분석 구조를 적용했습니다.

## 🖥️ TONES Frontend

본 프론트엔드 웹은 **React 19**와 **Next.js 16 (App Router)**을 핵심 아키텍처로 채택하여 높은 보안성, 빠른 사용자 피드백, 그리고 완벽한 반응형 시각 자료를 제공하며, 다음과 같은 핵심 비즈니스 및 UI 로직을 처리합니다.

- **실시간 AI RAG 검색 및 대화형 VOC 채팅 인터페이스**: `app/components/ChatPanel.tsx`와 `app/actions/chat.ts`를 연동하여, 사용자와의 다차원 피드백 대화를 수행하고 Gemini AI 응답과 분석 결과에 따른 리뷰 목록을 동기화합니다.

- **다차원 통계 시각화 및 제품 필터링**: `app/components/AnalyticsPanel.tsx`에서 제품별 스코어를 렌더링하고, 평점 분석, 부정적인 피드백 상세 보기 등을 완벽한 UI 레이아웃으로 시각화합니다.

- **클라이언트 측 실시간 속성 스코어링**: `calculateScores` 연산 엔진을 내장하여 성분/트러블, 제형/발림성, 용기/디자인 스코어를 리뷰 텍스트 및 감성 스코어에 기반하여 실시간으로 계산하고 갱신합니다.

- **한글 깨짐 방지 엑셀(CSV) 리포트 다운로드**: BOM(Byte Order Mark, `\uFEFF`)을 적용하여 엑셀 뷰어에서 한글이 깨지지 않는 원스톱 오프라인 리포트 다운로드 기능을 제공합니다.

- **하이브리드 백엔드 통신 아키텍처**: Supabase DB와 직접 연결하여 빠른 로컬 쿼리를 수행할 수 있을 뿐만 아니라, 환경 변수 (`NEXT_PUBLIC_FASTAPI_URL`) 설정에 따라 FastAPI 백엔드로 즉각 트래픽을 리다이렉트하는 유연성을 확보했습니다.

## 🛠️ 기술 스택

### 1. Core Framework & Web
* **React 19.2.4**: 차세대 렌더링 라이브러리 및 향상된 훅 기능 활용
* **Next.js 16.2.6 (App Router)**: 최상위 최적화 서버 렌더링(SSR) 및 Server Actions 아키텍처 채택
* **TypeScript 5**: 정적 타입 보장 및 안전한 대규모 프로젝트 리팩토링 지원

### 2. Database & Data Layer
* **Supabase Client SDK (`@supabase/supabase-js 2.49.4`)**: 클라이언트/서버 직접 연동 및 트랜잭션 CRUD 쿼리 수행
* **Next.js Server Actions**: 데이터베이스 조회 및 Gemini AI 호출의 안전한 비차단 서버 처리 구현

### 3. AI & Analytics
* **Google Gemini Generative AI (`@google/generative-ai 0.21.0`)**: Gemini 1.5 Pro 모델 연동 및 API 에러에 대응하는 정규식 기반 Rule-based Fallback 엔진 탑재

### 4. Styling & UI Components
* **TailwindCSS 4 (`@tailwindcss/postcss`)**: 포스트프로세서 연동 및 CSS Variables 기반 전역 프리미엄 다크 테마(#121214) 아키텍처
* **Lucide React (`lucide-react 1.16.0`)**: 프리미엄 벡터 아이콘 패키지 탑재

### 5. Build & Quality
* **ESLint 9**: 정적 코드 분석 규칙 도입 및 실시간 버그 예방

## 🏗️ 시스템 아키텍쳐

### 디렉토리 구조 (Layered Folder Architecture)

```text
frontend/
├── app/                            # Next.js App Router 핵심 애플리케이션 소스
│   ├── actions/                    # 보안 및 DB 쿼리를 처리하는 Server Actions 레이어
│   │   ├── chat.ts                 # Gemini API 통신 및 실시간 대화형 어시스턴트 로직
│   │   └── data.ts                 # Supabase 직접 조회 및 FastAPI 리다이렉션 기반 데이터 액션
│   │
│   ├── api/                        # Next.js API Route Handlers (서버 엔드포인트)
│   │   ├── analyze-review/         
│   │   │   └── route.ts            # 리뷰 수신, Gemini 감성 분석 및 Supabase 적재 (POST)
│   │   └── test-db/                
│   │       └── route.ts            # DB 연결 및 환경변수 진단용 엔드포인트 (GET)
│   │
│   ├── components/                 # UI 및 상호작용 컴포넌트 레이어
│   │   ├── AnalyticsPanel.tsx      # 리뷰 통계 분석, 핵심 속성 시각화 및 제품별 필터링
│   │   ├── ChatPanel.tsx           # 실시간 피드백 및 대화형 VOC 채팅 인터페이스
│   │   └── Sidebar.tsx             # 대시보드 전역 네비게이션
│   │
│   ├── lib/                        # 전역 라이브러리 및 유틸리티 설정
│   │   └── supabase.ts             # Supabase 공통 초기화 클라이언트 인스턴스
│   │
│   ├── services/                   # 공통 데이터 서비스 및 순수 비즈니스 로직
│   │   └── reviewService.ts        # 데이터 포맷팅, 감성 분석 점수 환산, 부정 리뷰 필터링 로직
│   │
│   ├── types/                      # TypeScript 인터페이스 및 전역 타입 정의
│   │   └── index.ts                # Message, Review, Product, Score 등 도메인 객체 명세
│   │
│   ├── favicon.ico                 # 웹 애플리케이션 파비콘
│   ├── globals.css                 # 테마 컬러 변수 및 TailwindCSS 글로벌 선언
│   ├── layout.tsx                  # Noto Sans KR 웹폰트 및 Metadata 최상위 레이아웃
│   └── page.tsx                    # 대시보드 상태 컨트롤 및 UI 구조 조립 (Entry Page)
│
├── public/                         # 빌드 및 런타임용 정적 자산
├── eslint.config.mjs               # ESLint Linter 규칙 설정
├── next.config.ts                  # Next.js 프로젝트 빌드 및 기능 활성화 옵션
├── package.json                    # 모듈 의존성 및 빌드 스크립트 정의
├── postcss.config.mjs              # PostCSS 플러그인 설정 (TailwindCSS 4)
├── tsconfig.json                   # TypeScript 빌드 및 경로 단축키 규칙
├── AGENTS.md                       # 프레임워크 주의사항 및 에이전트 지침서
└── CLAUDE.md                       # 개발 환경 퀵 가이드
```

### ⚙️ 시스템 아키텍처 흐름 (Workflow)
<img src="./asset/시스템%20아키텍처.png" width="500" height="700"/>

## 사용 방법

### 1. git clone 실행
```shell
$ git clone https://github.com/Google-AI-Agent-Challenge/frontend.git
```

### 2. 시스템 설정

#### 2-1. 환경 변수 파일(`.env.local` 혹은 `.env`) 추가
- 루트 디렉토리에 `.env.local` 파일을 추가해주세요.
- **Supabase**, **Google Gemini** 연동 키 설정이 필요합니다.

```env
# Supabase Config
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Google Gemini Config
GEMINI_API_KEY="your-gemini-api-key"

# Optional backend configuration (FastAPI)
NEXT_PUBLIC_FASTAPI_URL="http://localhost:8000"
```

#### 2-2. 패키지 설치 및 실행
- npm을 활용해 필요한 의존성을 설치하고 로컬 개발 서버를 실행합니다.

```shell
# 의존성 패키지 설치
$ npm install

# 로컬 개발 서버 실행
$ npm run dev
```

#### 2-3. 프로덕션 빌드 및 실행
- 실제 프로덕션 서버로 구동하기 위해 아래 명령어를 사용합니다.

```shell
# Next.js 프로덕션 빌드
$ npm run build

# 서버 실행
$ npm run start
```

#### 2-4. 정적 린트 검사
- ESLint 스타일링 및 문법 규칙을 확인합니다.
```shell
$ npm run lint
```
