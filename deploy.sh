#!/bin/bash

# ========================================================== #
# TONES_Frontend GCP Cloud Run 원클릭 배포 자동화 스크립트       #
# 설명: .env.local의 환경변수를 읽어 Cloud Build 치환 변수로     #
#       넘기고, GCP us-central1 리전에 빌드 및 배포합니다.       #
# ========================================================== #

# 1. 인프라 설정 상수 선언
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="us-central1"
SERVICE_NAME="tones-frontend"
REPO_NAME="tones-repo"

# 2. .env.local에서 배포에 필요한 환경변수 읽기
if [ -f .env.local ]; then
    API_URL=$(grep    '^NEXT_PUBLIC_API_URL=' .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    GEMINI_API_KEY=$(grep '^GEMINI_API_KEY='      .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
else
    echo "⚠️  [Warning] .env.local 파일이 없습니다. .env.example을 복사한 후 값을 채워주세요."
    echo "   cp .env.example .env.local"
    exit 1
fi

# 3. 필수 변수 검증
if [ -z "$API_URL" ]; then
    echo "❌ [Error] .env.local에 NEXT_PUBLIC_API_URL이 설정되지 않았습니다."
    exit 1
fi
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ [Error] .env.local에 GEMINI_API_KEY가 설정되지 않았습니다."
    exit 1
fi

# 4. GCP 프로젝트 ID 검증
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo "❌ [Error] gcloud 프로젝트 ID가 설정되지 않았습니다."
    echo "💡 'gcloud config set project [YOUR_PROJECT_ID]' 명령어로 설정 후 재시도하세요."
    exit 1
fi

echo "=========================================================="
echo "🚀 TONES 프론트엔드 서비스 GCP Cloud Run 배포를 시작합니다."
echo "   - GCP 프로젝트: $PROJECT_ID"
echo "   - 대상 리전  : $REGION"
echo "   - 서비스 이름: $SERVICE_NAME"
echo "   - 백엔드 URL : $API_URL"
echo "=========================================================="

# 5. GCP Artifact Registry 레포지토리 자동 생성 (미존재 시)
echo "📦 1. Artifact Registry 레포지토리 구성 확인 중..."
gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "   ➡️ 레포지토리가 존재하지 않아 신규 생성합니다: $REPO_NAME"
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="TONES Docker Container Repository" \
        --project=$PROJECT_ID
else
    echo "   ✅ 레포지토리 준비 완료: $REPO_NAME"
fi

# 6. Cloud Build를 사용한 빌드 및 배포
#    - _API_URL       : 빌드 타임 번들 인라인(NEXT_PUBLIC_API_URL) + Cloud Run 런타임 주입(API_URL)
#    - _GEMINI_API_KEY: Cloud Run 런타임 주입 (Server Actions에서 Gemini 직접 호출용)
echo "🏗️ 2. Google Cloud Build를 활용하여 원격 프론트엔드 빌드 시작..."
gcloud builds submit --config=cloudbuild.yaml \
    --substitutions=COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest"),_API_URL="$API_URL",_GEMINI_API_KEY="$GEMINI_API_KEY" \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo "🎉 프론트엔드 배포 파이프라인 기동 성공!"
    echo "=========================================================="
else
    echo "❌ [Error] 빌드 파이프라인 기동 실패. 로그를 확인하세요."
    exit 1
fi
