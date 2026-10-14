"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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
  return <><div className="flex justify-end gap-3 border-b border-white/10 px-5 py-3 text-xs text-slate-400"><span>{email} · {role}</span><button onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); }} className="border border-white/10 rounded-lg px-3 py-1.5">Sign out</button></div>{children}</>;
}
