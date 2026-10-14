"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "link_expired") setError("That sign-in link expired or was already used. Request a fresh link once email delivery is available.");
    else if (code === "missing_code") setError("The sign-in link is incomplete. Open the newest email link or request another one.");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/auth/callback" }
      });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("rate limit") || message.includes("too many")) {
          setError("Supabase is temporarily limiting sign-in emails. Stop retrying and wait before requesting another link.");
          setCooldown(60);
        } else setError(error.message);
      } else setSent(true);
    } catch {
      setError("Could not contact the sign-in service. Check your connection and try again later.");
    } finally { setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center px-5 py-12">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c111b] p-7 sm:p-9">
      <Link href="/" className="mb-9 inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={15}/> Raven Workspace</Link>
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-200"><ShieldCheck size={24}/></div>
      <p className="text-xs tracking-[.2em] text-indigo-200">PRIVATE NETWORK</p>
      <h1 className="mt-3 text-3xl font-semibold">Sign in to Raven</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">Enter your workspace email and we’ll send a secure sign-in link.</p>
      {sent ? <div className="mt-7 rounded-2xl border border-white/10 p-5"><h2 className="font-medium">Check your email</h2><p className="mt-2 text-sm text-slate-400">If the address is eligible, a sign-in link is on its way.</p><button onClick={() => setSent(false)} className="mt-4 text-sm text-indigo-200">Use another email</button></div> :
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label htmlFor="email" className="block text-sm text-slate-300">Email address</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourteam.com" className="w-full rounded-xl border border-white/10 bg-[#080c13] px-4 py-3 outline-none focus:border-indigo-300/60"/>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy || cooldown > 0} className="w-full rounded-xl bg-indigo-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{busy ? "Sending…" : cooldown > 0 ? `Wait ${cooldown}s before retrying` : "Email me a sign-in link"}</button>
      </form>}
      <p className="mt-7 text-xs leading-5 text-slate-500">Only approved Raven workspace members can access shared content. Sign-in alone does not grant team access.</p>
    </section>
  </main>;
}
