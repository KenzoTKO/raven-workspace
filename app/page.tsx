"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { ArrowUpRight, Boxes, CheckSquare, FileText, Shield, Search, Users, Activity, Sparkles, ChevronRight } from "lucide-react";

const modes = [
  { name: "UnstableFFA", description: "Fast-paced free-for-all PvP", status: "Planning", tone: "from-violet-400/20 to-fuchsia-500/5", mark: "01" },
  { name: "Gens", description: "Generator progression mode", status: "Planning", tone: "from-amber-300/20 to-orange-500/5", mark: "02" },
  { name: "Prisons", description: "Raven Prisons development", status: "In progress", tone: "from-violet-400/20 to-indigo-500/5", mark: "03" },
  { name: "Earth / Towny", description: "World-building and towns", status: "Planning", tone: "from-emerald-400/15 to-teal-500/5", mark: "04" }
];

const tools = [
  { title: "Documents", detail: "Specs, decisions & references", icon: FileText, href: "/documents", number: "01" },
  { title: "Task board", detail: "Plan work and track progress", icon: CheckSquare, href: "/tasks", number: "02" },
  { title: "Workspace search", detail: "Find anything across Raven", icon: Search, href: "/search", number: "03" },
  { title: "Team & access", detail: "People, roles and permissions", icon: Users, href: "/team", number: "04" }
];

export default function HomePage() {
  const [stats, setStats] = useState({ tasks: 0, done: 0, docs: 0, loaded: false });
  useEffect(() => {
    let active = true;
    async function loadStats() {
      const db = createClient();
      const [tasks, done, docs] = await Promise.all([
        db.from("tasks").select("id", { count: "exact", head: true }),
        db.from("tasks").select("id", { count: "exact", head: true }).eq("status", "Done"),
        db.from("documents").select("id", { count: "exact", head: true })
      ]);
      if (active) setStats({ tasks: tasks.count ?? 0, done: done.count ?? 0, docs: docs.count ?? 0, loaded: true });
    }
    void loadStats();
    return () => { active = false; };
  }, []);
  return <AuthGuard><main className="min-h-screen bg-[#09090f] text-[#f4f1fa]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[250px] border-r border-white/[.07] bg-[#0c0b13] px-5 py-7 lg:flex lg:flex-col">
      <Link href="/" className="mb-12 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-200/20 bg-gradient-to-br from-violet-400/20 to-amber-300/10 text-amber-200 shadow-lg shadow-violet-950/20"><Shield size={22}/></div>
        <div><div className="font-semibold tracking-[.2em]">RAVEN</div><div className="mt-1 text-[9px] tracking-[.24em] text-slate-500">NETWORK / INTERNAL</div></div>
      </Link>
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-slate-600">Workspace</p>
      <div className="flex items-center gap-3 rounded-xl border border-violet-300/10 bg-violet-300/[.08] px-3 py-3 text-sm text-violet-100"><Activity size={16}/> Overview <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-200"/></div>
      <Link href="/projects" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[.04] hover:text-white"><Boxes size={16}/> Game modes</Link>
      <Link href="/documents" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[.04] hover:text-white"><FileText size={16}/> Documents</Link>
      <Link href="/tasks" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[.04] hover:text-white"><CheckSquare size={16}/> Task board</Link>
      <Link href="/search" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[.04] hover:text-white"><Search size={16}/> Search</Link>
      <Link href="/team" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[.04] hover:text-white"><Users size={16}/> Team & access</Link>
      <div className="mt-9 border-t border-white/[.07] pt-6"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-slate-600">Your network</p>{modes.map(m=><Link key={m.name} href="/projects" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-400 hover:bg-white/[.04] hover:text-slate-100"><span className="h-1.5 w-1.5 rounded-full bg-violet-300/70"/>{m.name}</Link>)}</div>
      <div className="mt-auto rounded-2xl border border-amber-200/10 bg-gradient-to-br from-violet-400/[.08] to-amber-300/[.03] p-4"><div className="flex items-center gap-2 text-xs font-medium text-amber-100"><Sparkles size={14}/> Raven workspace</div><p className="mt-2 text-[11px] leading-5 text-slate-500">One command center. Every project moving forward.</p></div>
    </aside>
    <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-6 sm:px-8 lg:ml-[250px] lg:px-10 lg:pt-9 xl:px-14">
      <header className="flex items-center justify-between border-b border-white/[.07] pb-5"><div className="text-xs text-slate-500"><span className="text-slate-300">Raven Network</span><span className="mx-2 text-slate-700">/</span>Command center</div><Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:border-amber-200/30 hover:text-amber-100">All projects <ArrowUpRight size={14}/></Link></header>
      <div className="relative mt-7 overflow-hidden rounded-[28px] border border-violet-200/[.14] bg-[#100f1a]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_8%,rgba(151,113,255,.19),transparent_36%),radial-gradient(ellipse_at_92%_100%,rgba(231,185,101,.09),transparent_30%)]"/>
        <div className="pointer-events-none absolute right-[-25px] top-[-85px] select-none text-[280px] font-black leading-none text-white/[.018]">R</div>
        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_240px] lg:items-end lg:p-12">
          <div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[.06] px-3 py-1.5 text-[10px] font-semibold tracking-[.18em] text-amber-100"><span className="h-1.5 w-1.5 rounded-full bg-amber-200"/> PRIVATE OPERATIONS</div>
            <h1 className="max-w-2xl text-[38px] font-semibold leading-[1.08] tracking-[-.045em] sm:text-5xl lg:text-[58px]">Make Raven<br/><span className="bg-gradient-to-r from-violet-200 via-violet-100 to-amber-100 bg-clip-text text-transparent">impossible to ignore.</span></h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">The command center for building, organizing, and launching every corner of Raven Network.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/projects" className="inline-flex items-center gap-2 rounded-xl bg-[#c4b5fd] px-5 py-3 text-sm font-semibold text-[#171020] shadow-lg shadow-violet-950/30 transition hover:bg-[#d6ccff]">Explore projects <ArrowUpRight size={16}/></Link><Link href="/search" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/[.07]"><Search size={16}/> Search workspace</Link></div>
          </div>
          <div className="hidden rounded-2xl border border-white/[.09] bg-black/20 p-5 lg:block"><div className="flex items-center justify-between text-[10px] uppercase tracking-[.18em] text-slate-500"><span>Live workspace</span><Activity size={14} className="text-amber-200"/></div><div className="mt-5 grid grid-cols-2 gap-4"><div><div className="text-3xl font-semibold">{stats.loaded ? stats.tasks : "—"}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Total tasks</div></div><div><div className="text-3xl font-semibold text-emerald-200">{stats.loaded ? stats.done : "—"}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Completed</div></div><div><div className="text-2xl font-semibold">{stats.loaded ? stats.docs : "—"}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Documents</div></div><div><div className="text-2xl font-semibold">04</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Game modes</div></div></div><div className="mt-4 h-px bg-white/[.08]"/><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-300"/> Live counts from your workspace</div></div>
        </div>
      </div>
      <div className="mt-10 flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-violet-200/80">The workspace</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Everything in its place.</h2><p className="mt-2 text-sm text-slate-500">Your tools, without the clutter.</p></div><span className="hidden text-[10px] tracking-[.18em] text-slate-600 sm:block">RAVEN / 01—04</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{tools.map(({title,detail,icon:Icon,href,number})=><Link href={href} key={title} className="group rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-violet-200/25 hover:bg-[#14121f]"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl border border-violet-200/10 bg-violet-300/[.08] text-violet-200 transition group-hover:border-amber-200/20 group-hover:text-amber-100"><Icon size={19}/></div><span className="font-mono text-[10px] text-slate-700">{number}</span></div><h3 className="mt-6 font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p><div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-4 text-xs text-violet-200/80"><span>Open section</span><ChevronRight size={15} className="transition group-hover:translate-x-1"/></div></Link>)}</div>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-100/70">Built under one banner</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Game-mode projects</h2><p className="mt-2 text-sm text-slate-500">Each mode gets its own lane. All of them move Raven forward.</p></div><Link href="/projects" className="inline-flex items-center gap-2 text-xs text-amber-100/80 hover:text-amber-50">View project hub <ArrowUpRight size={14}/></Link></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{modes.map((mode)=><Link href={`/tasks?mode=${encodeURIComponent(mode.name)}`} key={mode.name} className="group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5 transition hover:border-white/[.16]"><div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${mode.tone} opacity-70 transition group-hover:opacity-100`}/><div className="relative"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-mono tracking-[.18em] text-slate-600">PROJECT / {mode.mark}</div><h3 className="mt-2 text-lg font-semibold">{mode.name}</h3><p className="mt-1 text-sm text-slate-400">{mode.description}</p></div><span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] ${mode.status === "In progress" ? "border-amber-200/20 bg-amber-200/[.07] text-amber-100" : "border-white/10 bg-black/10 text-slate-400"}`}>{mode.status}</span></div><div className="mt-6 flex items-center justify-between border-t border-white/[.08] pt-4 text-xs text-slate-500"><span>Scope · Tasks · Decisions</span><span className="inline-flex items-center gap-1 text-slate-300 transition group-hover:text-amber-100">Open project <ArrowUpRight size={13}/></span></div></div></Link>)}</div>
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-5 text-[10px] tracking-[.12em] text-slate-600"><span>RAVEN NETWORK <span className="px-2 text-slate-700">/</span> PRIVATE WORKSPACE</span><span>BUILT TO MOVE DIFFERENT.</span></footer>
    </section>
  </main></AuthGuard>;
}
