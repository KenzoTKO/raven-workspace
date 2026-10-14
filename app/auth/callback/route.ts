import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));

  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get(name: string) { return store.get(name)?.value; },
      set(name: string, value: string, options: any) {
        try { store.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: any) {
        try { store.set({ name, value: "", ...options, maxAge: 0 }); } catch {}
      }
    }}
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=link_expired", url.origin));
  return NextResponse.redirect(new URL("/", url.origin));
}
