import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("⚠️ Supabase 환경변수 누락 — .env.local을 확인하고 서버를 재시작하세요.");
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// 기존 코드와의 호환성을 위한 Proxy export
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
