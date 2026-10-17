"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Activity, Boxes, CheckSquare, FileText, Search, Users, Shield, Clapperboard } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState("Checking access…");
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      const { data, error } = await supabase.from("workspace_members").select("role").eq("user_id", session.user.id).maybeSingle();
      if (!active) return;
      if (error || !data) { setStatus("This account is signed in but has not been approved for Raven."); return; }
      setRole(data.role);
      setAllowed(true);
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (!session) router.replace("/login"); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router]);

  if (!allowed) return <main className="grid min-h-screen place-items-center px-5"><section className="max-w-md text-center"><h1 className="text-2xl font-semibold">Raven Workspace</h1><p className="mt-3 text-sm leading-6 text-slate-400">{status}</p><a href="/login" className="mt-5 inline-block text-sm text-indigo-200">Back to sign in</a></section></main>;
  return <><div className="sticky top-0 z-30 border-b border-white/[.08] bg-[#0c0b13]/95 px-4 backdrop-blur-xl sm:px-6"><div className="mx-auto flex min-h-14 max-w-[1440px] items-center gap-4"><Link href="/" aria-label="Raven home" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-[.16em] text-white"><span className="grid h-8 w-8 place-items-center rounded-xl border border-violet-200/15 bg-violet-300/[.08] text-violet-200"><Shield size={16}/></span><span className="hidden sm:inline">RAVEN</span></Link><nav aria-label="Workspace navigation" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2">{[{href:"/",label:"Overview",Icon:Activity},{href:"/projects",label:"Projects",Icon:Boxes},{href:"/tasks",label:"Tasks",Icon:CheckSquare},{href:"/documents",label:"Docs",Icon:FileText},{href:"/search",label:"Search",Icon:Search},{href:"/watch-party",label:"Watch Party",Icon:Clapperboard},{href:"/team",label:"Team",Icon:Users}].map(item=><Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-400 transition hover:bg-white/[.06] hover:text-white sm:px-3"><item.Icon size={14}/><span>{item.label}</span></Link>)}</nav><div className="hidden items-center gap-3 md:flex"><span className="max-w-40 truncate text-[11px] text-slate-500">{email} · {role}</span><button onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/[.05]">Sign out</button></div><button onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }} className="shrink-0 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-300 hover:bg-white/[.05] md:hidden">Exit</button></div></div>{children}</>;
}
