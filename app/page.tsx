"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { ArrowUpRight, Boxes, CheckSquare, FileText, Shield, Search, Users, Activity, Sparkles, ChevronRight, Megaphone, Server, CalendarDays, Link2, Settings, Trash2, BookOpen, Palette, Wrench, Bell, Camera, ExternalLink, ListTodo } from "lucide-react";

const modes = [
  { name: "UnstableFFA", description: "Fast-paced free-for-all PvP", status: "Planning", tone: "from-violet-400/20 to-fuchsia-500/5", mark: "01" },
  { name: "Gens", description: "Generator progression mode", status: "Planning", tone: "from-amber-300/20 to-orange-500/5", mark: "02" },
  { name: "Prisons", description: "Raven Prisons development", status: "In progress", tone: "from-violet-400/20 to-indigo-500/5", mark: "03" },
  { name: "Earth / Towny", description: "World-building and towns", status: "Planning", tone: "from-emerald-400/15 to-teal-500/5", mark: "04" }
];

const tools = [
  { title: "Game Modes", detail: "Docs, features, progress", icon: Boxes, href: "/projects", number: "01" },
  { title: "Roadmap", detail: "Milestones and launch plans", icon: ListTodo, href: "/tasks", number: "02" },
  { title: "Tasks", detail: "Track work and deadlines", icon: CheckSquare, href: "/tasks", number: "03" },
  { title: "Team", detail: "Members and roles", icon: Users, href: "/team", number: "04" }
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] border-r border-white/[.08] bg-[#0b0c10] px-3 py-4 lg:flex lg:flex-col">
      <Link href="/" className="mb-6 flex h-10 items-center gap-3 px-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Shield size={20}/></span><span className="text-sm font-semibold tracking-[.12em] text-white">RAVEN NETWORK</span></Link>
      <nav className="flex flex-col gap-1 text-sm">
        <Link href="/" className="flex items-center gap-3 rounded-lg bg-violet-600/25 px-3 py-2.5 text-violet-100"><Activity size={17}/>Home</Link>
        <Link href="/tasks" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><ListTodo size={17}/>Roadmap</Link>
        <Link href="/documents?category=Announcements" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Megaphone size={17}/>Announcements</Link>
        <Link href="/tasks" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><CheckSquare size={17}/>Tasks</Link>
        <Link href="/documents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><BookOpen size={17}/>Knowledge Base</Link>
        <Link href="/projects" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Server size={17}/>Servers</Link>
        <Link href="/projects" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Boxes size={17}/>Game Modes</Link>
        <Link href="/tasks?mode=Network-wide" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Wrench size={17}/>Development</Link>
        <Link href="/documents?category=Marketing" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Megaphone size={17}/>Marketing</Link>
        <Link href="/documents?category=Design" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Palette size={17}/>Design</Link>
        <Link href="/tasks?mode=Network-wide" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Settings size={17}/>Operations</Link>
        <Link href="/documents?category=Staff" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Shield size={17}/>Staff Handbook</Link>
      </nav>
      <div className="my-4 border-t border-white/[.08]"/>
      <p className="mb-2 px-3 text-[10px] uppercase tracking-[.18em] text-slate-500">Tools</p>
      <nav className="flex flex-col gap-1 text-sm">
        <Link href="/tasks" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><CalendarDays size={17}/>Calendar</Link>
        <Link href="/documents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><FileText size={17}/>Files</Link>
        <Link href="/documents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><BookOpen size={17}/>Templates</Link>
        <Link href="/search" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Link2 size={17}/>Links & Search</Link>
      </nav>
      <div className="my-4 border-t border-white/[.08]"/>
      <p className="mb-2 px-3 text-[10px] uppercase tracking-[.18em] text-slate-500">Admin</p>
      <nav className="flex flex-col gap-1 text-sm">
        <Link href="/team" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Settings size={17}/>Settings & Roles</Link>
        <Link href="/team" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/[.05]"><Users size={17}/>Members</Link>
      </nav>
      <div className="mt-auto px-3 pt-5 text-[10px] text-slate-600">RAVEN NETWORK · PRIVATE</div>
    </aside>
    <section className="min-h-screen mx-auto max-w-[1800px] pb-12 lg:ml-[258px]">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-white/[.08] bg-[#0b0c10]/95 px-5 backdrop-blur sm:px-7"><Link href="/search" className="flex w-full max-w-md items-center gap-3 rounded-lg border border-white/[.09] bg-white/[.025] px-3 py-2 text-xs text-slate-500"><Search size={15}/>Search workspace…<span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span></Link><span className="ml-auto text-slate-400"><Bell size={17}/></span><Link href="/team" className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">R</Link></header>
      <div className="relative mx-0 overflow-hidden border-b border-white/[.08] bg-[#100d1c]">
        <div className="relative flex h-[190px] items-center justify-center overflow-hidden sm:h-[220px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(139,72,255,.38),transparent_48%),linear-gradient(90deg,#0c0b13,#25123c_48%,#0c0b13)]"/>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage:"linear-gradient(135deg, transparent 46%, rgba(179,125,255,.4) 47%, transparent 48%),linear-gradient(45deg, transparent 46%, rgba(179,125,255,.22) 47%, transparent 48%)",backgroundSize:"46px 46px"}}/>
          <div className="relative text-center"><div className="mx-auto grid h-20 w-20 place-items-center text-5xl text-violet-200 drop-shadow-[0_0_22px_rgba(168,85,247,.7)]"><Shield size={64}/></div><div className="mt-1 font-serif text-4xl tracking-[.14em] text-white drop-shadow-lg">RAVEN</div><div className="mt-1 text-[10px] tracking-[.55em] text-violet-200">N E T W O R K</div></div>
          <Link href="/projects" className="absolute right-5 top-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"><Camera size={14}/> Customize</Link>
        </div>
      </div>
      <div className="grid gap-6 px-5 pt-6 sm:px-7 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to Raven Network</h1><p className="mt-2 text-sm text-slate-400 sm:text-base">Private hub for documentation, planning, and team collaboration.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{tools.map(({title,detail,icon:Icon,href})=><Link href={href} key={title} className="flex items-center gap-3 rounded-xl border border-white/[.09] bg-[#111216] p-4 transition hover:border-violet-300/30 hover:bg-[#17151d]"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-600/20 text-violet-300"><Icon size={22}/></div><div className="min-w-0"><div className="text-sm font-medium">{title}</div><div className="mt-1 text-[11px] text-slate-500">{detail}</div></div><ArrowUpRight size={15} className="ml-auto shrink-0 text-slate-500"/></Link>)}</div>
        <div className="mt-6 rounded-xl border border-white/[.09] bg-[#101115] p-4 sm:p-5">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Roadmap Overview</h2><p className="mt-1 text-xs text-slate-500">Live task status across Raven Network</p></div><Link href="/tasks" className="rounded-lg border border-white/10 px-3 py-2 text-xs">View all →</Link></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">{[{label:"Planning",status:"To do",tone:"text-slate-300",accent:"bg-slate-400"},{label:"In Progress",status:"To do",tone:"text-violet-300",accent:"bg-violet-400"},{label:"Testing",status:"To do",tone:"text-amber-200",accent:"bg-amber-300"},{label:"Completed",status:"Done",tone:"text-emerald-300",accent:"bg-emerald-400"}].map((lane,i)=><div key={lane.label} className="min-w-0 border-l border-white/[.07] pl-3 first:border-0 first:pl-0"><div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${lane.tone}`}>{lane.label}<span className="rounded-full bg-white/[.07] px-2 py-0.5 text-[10px]">{i===3?stats.done:Math.max(0,stats.tasks-stats.done)}</span></div><div className="space-y-2">{i===3 ? <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3 text-xs text-slate-400">{stats.done ? `${stats.done} tasks completed` : "Completed work will appear here"}</div> : <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3 text-xs text-slate-400">{stats.loaded ? `${stats.tasks-stats.done} tasks need attention` : "Loading tasks…"}</div>}</div></div>)}</div>
        </div>
      </div>
      <aside className="space-y-4">
        <section className="rounded-xl border border-white/[.09] bg-[#101115] p-4"><h2 className="flex items-center gap-2 text-sm font-semibold"><Link2 size={17} className="text-violet-300"/>Quick Links</h2><div className="mt-3 space-y-1">{[{label:"Task board",href:"/tasks"},{label:"Knowledge Base",href:"/documents"},{label:"Discord / Community",href:"/documents?category=Community"},{label:"Team & access",href:"/team"},{label:"Search workspace",href:"/search"}].map(item=><Link key={item.label} href={item.href} className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-slate-300 hover:bg-white/[.05]">{item.label}<ExternalLink size={12} className="text-slate-600"/></Link>)}</div></section>
        <section className="rounded-xl border border-white/[.09] bg-[#101115] p-4"><h2 className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={17} className="text-violet-300"/>Upcoming Deadlines</h2><p className="mt-3 text-xs leading-5 text-slate-500">Add due dates to tasks to show real deadlines here.</p><Link href="/tasks" className="mt-2 inline-block text-xs text-violet-300">Open task board →</Link></section>
        <section className="rounded-xl border border-white/[.09] bg-[#101115] p-4"><h2 className="flex items-center gap-2 text-sm font-semibold"><Activity size={17} className="text-violet-300"/>Recent Updates</h2><div className="mt-3 space-y-3 text-xs text-slate-400"><p>{stats.docs} knowledge-base documents in workspace</p><p>{stats.tasks} tracked tasks across modes</p><p>{stats.done} tasks marked completed</p><p>Access controlled by Raven team roles</p></div></section>
      </aside>
      </div>
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-5 text-[10px] tracking-[.12em] text-slate-600"><span>RAVEN NETWORK <span className="px-2 text-slate-700">/</span> PRIVATE WORKSPACE</span><span>BUILT TO MOVE DIFFERENT.</span></footer>
    </section>
  </main></AuthGuard>;
}
