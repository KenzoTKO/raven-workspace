"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, ArrowUpRight, Boxes, CheckSquare, FileText, Sparkles, Swords, Pickaxe, Globe2, Zap } from "lucide-react";

const modes = [
  { name: "UnstableFFA", summary: "Fast-paced free-for-all PvP", focus: ["Combat & kits", "Arena maps", "Match flow"], icon: Swords, mark: "01", tone: "from-violet-500/20 via-purple-500/5 to-transparent", accent: "text-violet-200", status: "Planning" },
  { name: "Gens", summary: "Build, upgrade, and dominate", focus: ["Generator tiers", "Economy balance", "Progression"], icon: Zap, mark: "02", tone: "from-amber-400/20 via-orange-500/5 to-transparent", accent: "text-amber-100", status: "Planning" },
  { name: "Prisons", summary: "Raven's core progression experience", focus: ["Mines & prestige", "PvP systems", "Launch scope"], icon: Pickaxe, mark: "03", tone: "from-fuchsia-500/20 via-violet-500/5 to-transparent", accent: "text-fuchsia-200", status: "In progress" },
  { name: "Earth / Towny", summary: "A world shaped by its players", focus: ["Claims & towns", "Nations", "Player economy"], icon: Globe2, mark: "04", tone: "from-emerald-400/15 via-teal-500/5 to-transparent", accent: "text-emerald-200", status: "Planning" }
];

export default function ProjectsPage() {
  return <AuthGuard><main className="min-h-screen bg-[#09090f] px-5 py-6 text-[#f4f1fa] sm:px-8 lg:px-12 lg:py-9">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-white"><ArrowLeft size={15}/> Command center</Link>
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-[.2em] text-amber-100/80"><Sparkles size={14}/> RAVEN / PROJECTS</div>
      </header>
      <div className="relative mt-7 overflow-hidden rounded-[28px] border border-violet-200/[.14] bg-[#100f1a]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(151,113,255,.18),transparent_38%),radial-gradient(ellipse_at_0%_100%,rgba(231,185,101,.07),transparent_35%)]"/>
        <div className="pointer-events-none absolute -right-4 -top-14 select-none text-[220px] font-black leading-none text-white/[.02]">04</div>
        <div className="relative p-6 sm:p-9 lg:p-12">
          <p className="text-[10px] font-semibold tracking-[.24em] text-violet-200/80">THE NETWORK, IN MOTION</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Game-mode <span className="text-violet-200">projects.</span></h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">Four distinct experiences. One connected team. Keep the scope clear, decisions documented, and every launch moving forward.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/tasks" className="inline-flex items-center gap-2 rounded-xl bg-[#c4b5fd] px-4 py-3 text-sm font-semibold text-[#171020]"><CheckSquare size={16}/> Open task board <ArrowUpRight size={14}/></Link>
            <Link href="/documents" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-slate-200 hover:bg-white/[.06]"><FileText size={16}/> Project documents</Link>
          </div>
        </div>
      </div>
      <div className="mt-9 flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-amber-100/70">Active portfolio</p><h2 className="mt-2 text-2xl font-semibold">Choose your lane.</h2></div><span className="text-[10px] tracking-[.15em] text-slate-600">04 PROJECTS / 01 NETWORK</span></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{modes.map(mode=>{const Icon=mode.icon;return <article key={mode.name} className="group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0f0e17] transition duration-200 hover:-translate-y-0.5 hover:border-white/[.16]"><div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mode.tone}`}/><div className="relative p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/[.08] bg-black/20 ${mode.accent}`}><Icon size={22}/></div><span className="font-mono text-[10px] tracking-[.15em] text-slate-600">PROJECT / {mode.mark}</span></div><div className="mt-6 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight">{mode.name}</h3><p className="mt-1 text-sm text-slate-400">{mode.summary}</p></div><span className={`rounded-full border px-3 py-1.5 text-[10px] ${mode.status === "In progress" ? "border-amber-200/20 bg-amber-200/[.06] text-amber-100" : "border-white/10 bg-black/10 text-slate-400"}`}>{mode.status}</span></div><div className="mt-6 border-t border-white/[.08] pt-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-600">Key workstreams</p><div className="mt-3 flex flex-wrap gap-2">{mode.focus.map(item=><span key={item} className="rounded-lg border border-white/[.07] bg-black/10 px-2.5 py-1.5 text-[11px] text-slate-400">{item}</span>)}</div></div><Link href={`/tasks?mode=${encodeURIComponent(mode.name)}`} className="mt-6 flex items-center justify-between border-t border-white/[.08] pt-4 text-xs text-slate-400 transition hover:text-white"><span>View related tasks</span><ArrowUpRight size={15} className={mode.accent}/></Link></div></article>})}</div>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/[.07] pt-5 text-[10px] tracking-[.12em] text-slate-600"><span>RAVEN NETWORK / PRIVATE WORKSPACE</span><Link href="/" className="hover:text-slate-300">BACK TO COMMAND CENTER ↑</Link></footer>
    </div>
  </main></AuthGuard>;
}
