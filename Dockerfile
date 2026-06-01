# Stage 1: 의존성 설치
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 2: 빌드
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 타임 환경변수 (NEXT_PUBLIC_* 변수는 빌드 시 인라인 처리됨)
# ARG NEXT_PUBLIC_SUPABASE_URL
# ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Stage 3: 실행 (최소 이미지)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# standalone 빌드 결과물 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
