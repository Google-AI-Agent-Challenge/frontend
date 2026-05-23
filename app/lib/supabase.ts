import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase 환경변수 누락 — .env.local을 확인하고 서버를 재시작하세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
