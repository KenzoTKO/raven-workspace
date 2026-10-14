"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/auth/callback" }
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
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
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-indigo-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{busy ? "Sending…" : "Email me a sign-in link"}</button>
      </form>}
      <p className="mt-7 text-xs leading-5 text-slate-500">Only approved Raven workspace members can access shared content. Sign-in alone does not grant team access.</p>
    </section>
  </main>;
}
