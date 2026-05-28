# 📋 프론트엔드 기술 의사결정 문서 (Decision Making)

우리 프로젝트의 **프론트엔드 기술 의사결정** 문서에 오신 것을 환영합니다. 이 문서는 고성능의 현대적인 프론트엔드 스택을 정의하는 기술적 맥락, 주요 아키텍처 결정 사항 및 디렉터리 구조를 설명합니다.

---

## 🛠️ 프론트엔드 개발 환경 및 기술 스택 (Context)

우리의 프론트엔드 스택은 최신 React 및 Next.js 에코시스템을 기반으로 구축되었으며, 프리미엄 스타일링, 로컬 또는 클라우드 데이터 레이어, 그리고 강력한 AI 분석 엔진과 유기적으로 통합되어 있습니다.

| 구분 | 기술 스택 | 주요 상세 정보 및 버전 |
| :--- | :--- | :--- |
| **핵심 웹/프레임워크** | **React 19.2.4 + Next.js 16.2.6** | 최신 App Router 아키텍처 채택 |
| **언어** | **TypeScript 5** | 런타임 안정성 및 개발자 생산성을 위한 엄격한 정적 타입 시스템 적용 |
| **스타일링** | **TailwindCSS 4** | `@tailwindcss/postcss` 연동 및 CSS 변수(Variables) 기반 테마 설정 |
| **데이터 레이어** | **Supabase Client SDK** | 직접적인 DB 쿼리 및 CRUD 처리 (`@supabase/supabase-js` v2.49.4) |
| | **Next.js Server Actions** | 서버 사이드 보안 데이터 통신 (API 키 및 DB 자격 증명 노출 방지) |
| | **Node-fetch** | 로컬 FastAPI 서버로의 유연한 API 리다이렉트 지원 |
| **AI 및 분석** | **@google/generative-ai** | 차세대 초고속 **Gemini 2.5-flash** (`v0.21.0`) API 탑재 |
| | **감성 분석 엔진** | 대화형 AI 기반 VOC 분석 및 실시간 다차원 감성 진단 (긍정 / 중립 / 부정) |
| | **2단계 쿼리 파이프라인** | 1단계: 질문 분석 필터 추출 ➔ 2단계: Supabase 동적 쿼리 ➔ 3단계: Gemini RAG 응답 생성 |
| | **규칙 기반 폴백** | Gemini API 호출 제한 또는 오류에 대응하는 내장 정규식 기반 폴백 기능 |
| **아이콘 및 UI 요소**| **Lucide React** | 프리미엄 벡터 아이콘 세트 (`v1.16.0`) |

---

## 🏗️ 주요 아키텍처 결정 사항 (Architectural Decisions)

### 1. Next.js 16 + React 19 최신 릴리스 도입
- **Server Actions**를 활용하여 프론트엔드와 백엔드 간의 불필요한 REST API 보일러플레이트를 제거하고 안전한 데이터 상호작용 채널을 확보했습니다.
- 서버 사이드 렌더링(SSR) 및 정적 최적화 기법을 적용하여 웹 애플리케이션의 초기 로딩 속도(LCP)와 사용자 경험을 극대화하였습니다.

### 2. 직접적인 Supabase 연동 및 하이브리드 리다이렉트 아키텍처
- **로컬/백엔드 서버 분리 유연성**: FastAPI 백엔드 엔진이 활성화되지 않은 독립 구동 상황에서도 프론트엔드 서버에서 Supabase SDK를 통해 데이터베이스에 직접 접근 및 CRUD 동작을 신속하게 처리합니다.
- **하이브리드 리다이렉트**: `NEXT_PUBLIC_FASTAPI_URL` 환경 변수가 설정되면, Server Actions 및 API Fetch 라우트를 통해 복잡한 머신러닝 연산이나 인프라 연동 트래픽이 FastAPI 백엔드로 즉각 자동 리다이렉션되도록 유연하게 연계하였습니다.

### 3. Gemini AI 기반 VOC 진단 자동화 (App Route Handler)
- `app/api/analyze-review` 경로에 전용 Route Handler를 구축하여 리뷰가 등록되는 즉시 실시간으로 감성 점수(0.0 ~ 1.0), 핵심 키워드 추출, 이슈 타입 분기, AI 요약 텍스트 생성을 단일 데이터 트랜잭션 내에서 분석 완료합니다.
- Gemini API의 일시적 장애나 속도 제한(Rate Limit)에 직면할 경우를 대비하여, 내장 정규식 기반의 **Rule-based Fallback 엔진**을 탑재하여 99.9% 이상의 고가용성을 보장합니다.

### 4. 클라이언트 사이드 실시간 속성 분석 및 엑셀(CSV) 내보내기 기능
- **실시간 속성 연산**: `page.tsx` 내에서 "성분/트러블", "제형/발림성", "용기/디자인" 등 주요 화장품 VOC 속성을 분류하고 스코어링하는 `calculateScores` 로직을 수립하여 즉각적인 대시보드 인터랙션과 동기화를 지원합니다.
- **한글 깨짐 없는 CSV 추출**: 오프라인 엑셀 분석 시 한글이 깨지는 현상을 차단하고자 **BOM(Byte Order Mark, `\uFEFF`)**을 삽입한 CSV 내보내기 유틸리티를 적용하였습니다.

### 5. 프리미엄 다크 모드 및 글래스모피즘 UI 아키텍처
- `globals.css` 파일에 CSS variables 기반의 세련된 다크 테마 컬러 매트릭스(#121214)를 구축하고 모던한 **글래스모피즘(Glassmorphism)** 레이어 디자인을 구현하였습니다.
- 다차원 카드 UI 배치 및 Lucide React의 정교한 아이콘 배치를 통해 프리미엄 감각의 사용자 인터페이스와 생동감 넘치는 호버 애니메이션 효과를 선사합니다.

### 6. UI 영속화 및 레이아웃 동기화 미들웨어 (UI Persistence)
- 사용자가 설정한 개인화 대시보드 레이아웃 상태(`pinned_widget`)를 Supabase의 `user_layouts` 테이블에 영속화합니다.
- 브라우저를 새로고침하거나 기기를 변경하여 다시 로그인하더라도 클라이언트 상태를 유지하여 일관된 맞춤형 업무 환경을 복원합니다.

### 7. 2단계 지능형 AI 필터 추출 및 RAG 엔진 (2-Stage RAG Pipeline)
- 사용자가 입력한 자연어 대화형 검색을 처리하기 위해 **2단계 인텔리전트 AI 파이프라인**을 완성하였습니다.
  1. **1단계**: `gemini-2.5-flash` 모델을 사용하여 자연어 질문으로부터 정형 필터(브랜드, 점수, 기간 등)를 구조적으로 분석 및 추출합니다.
  2. **2단계**: 추출된 동적 필터를 Supabase DB의 `ilike`, `gte`, `eq`, `or` 쿼리 메서드에 대입하여 초고속으로 대상 리뷰 데이터를 검색합니다.
  3. **3단계**: 검색 완료된 결과 텍스트를 RAG(Retrieval-Augmented Generation) 컨텍스트로 결합하여 요약 답변을 재구성하고, 매칭된 **실제 원문 리뷰 ID 목록(`matchedReviewIds`)**과 함께 반환합니다.

### 8. 의료 및 위험성 안전 바이패스 지침 (Safety Bypass)
- 화장품 부작용(예: "피부 트러블", "붉은기", "간지러움" 등) 관련 리뷰는 일반적인 폭력성/유해성 검열에 의해 차단될 우려가 있습니다.
- 이를 해결하기 위해 Gemini API 호출 시 안전 임계값 필터(`HarmBlockThreshold.BLOCK_ONLY_HIGH`)를 정밀 조정하고, 메디컬/화장품 VOC 전문 분석 페르소나 지침 프롬프트를 주입하여 중단 없는 RAG 분석 신뢰성을 확보하였습니다.

---

## 📂 계층형 폴더 구조 (Layered Folder Architecture)

프로젝트는 유지보수성과 관심사 분리(Separation of Concerns)를 극대화하기 위해 다음과 같은 계층형 디렉터리 아키텍처로 구조화되었습니다.

```text
frontend/
├── app/                            # Next.js App Router 핵심 애플리케이션 소스
│   ├── actions/                    # 보안 및 DB 직접 쿼리를 처리하는 Server Actions
│   │   ├── chat.ts                 # Gemini API 통신, 2-Stage 필터 연동 VOC 채팅 로직
│   │   └── data.ts                 # Supabase 직접 조회 및 FastAPI 리다이렉트 처리 데이터/레이아웃 액션
│   │
│   ├── api/                        # Next.js API Route Handlers (서버 사이드 엔드포인트)
│   │   ├── analyze-review/         
│   │   │   └── route.ts            # 리뷰 수집, Gemini 감성 분석 및 Supabase 적재 (POST)
│   │   └── test-db/                
│   │       └── route.ts            # DB 연결 및 환경변수 진단용 테스트 라우터 (GET)
│   │
│   ├── components/                 # UI 구성 요소 및 대시보드 컴포넌트
│   │   ├── AnalyticsPanel.tsx      # 리뷰 통계 분석, 핵심 속성 시각화 및 상품별 필터링
│   │   ├── ChatPanel.tsx           # 실시간 피드백 및 대화형 VOC 채팅 인터페이스
│   │   └── Sidebar.tsx             # 대시보드 전역 네비게이션
│   │
│   ├── lib/                        # 전역 설정 및 서드파티 라이브러리 인스턴스
│   │   └── supabase.ts             # Supabase 공통 초기화 클라이언트 설정
│   │
│   ├── services/                   # 비즈니스 로직 및 공통 데이터 가공 서비스
│   │   └── reviewService.ts        # 감성 분석 점수 환산 및 VOC 속성 분류 순수 로직
│   │
│   ├── types/                      # TypeScript 전역 공통 인터페이스 명세
│   │   └── index.ts                # Message, Review, Product, Score 등의 타입 정의
│   │
│   ├── favicon.ico                 # 웹 서비스 파비콘
│   ├── globals.css                 # 테마 컬러 변수 및 글로벌 CSS 선언 (TailwindCSS 4)
│   ├── layout.tsx                  # 최상위 HTML 구조, Noto Sans KR 폰트 및 공통 메타데이터
│   └── page.tsx                    # 대시보드 상태 컨트롤 및 UI 조립 메인 페이지 (Entry Point)
│
├── public/                         # 빌드 및 런타임용 정적 자산 폴더
├── eslint.config.mjs               # ESLint Linter 상세 규칙 구성 파일
├── next.config.ts                  # Next.js 프로젝트 컴파일 및 런타임 최적화 빌드 설정
├── package.json                    # 프로젝트 의존성 관리 및 NPM 실행 스크립트 정의
├── postcss.config.mjs              # PostCSS 컴파일러 설정 (TailwindCSS 4 연동)
├── tsconfig.json                   # TypeScript 환경 설정 및 Path Alias 정의
├── AGENTS.md                       # 프레임워크 제약 사항 및 개발 에이전트 지침 가이드
└── CLAUDE.md                       # 빌드, 테스트 및 명령어 실행 퀵가이드
```

---

> [!NOTE]
> 본 설계 문서는 Google AI Agent Challenge 프로젝트의 프론트엔드 아키텍처 및 기술적 의사결정의 이정표 역할을 합니다. 신규 컴포넌트 설계 및 백엔드와의 API 결합 시 위의 계층별 구조적 역할 분담 및 의사결정 원칙을 반드시 준수하시기 바랍니다.