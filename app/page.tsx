import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { ArrowUpRight, Boxes, CheckSquare, FileText, Shield, Search, Users } from "lucide-react";

const modes = [
  { name: "UnstableFFA", description: "Fast-paced free-for-all PvP", status: "Planning" },
  { name: "Gens", description: "Generator progression mode", status: "Planning" },
  { name: "Prisons", description: "Raven Prisons development", status: "In progress" },
  { name: "Earth / Towny", description: "World-building and towns", status: "Planning" }
];

const cards = [
  { title: "Documents", detail: "Specs, decisions, and references", icon: FileText, href: "/documents" },
  { title: "Tasks", detail: "Track work across the network", icon: CheckSquare, href: "/tasks" },
  { title: "Search", detail: "Find docs and tasks instantly", icon: Search, href: "/search" },
  { title: "Team", detail: "Roles, ownership, and access", icon: Users, href: "/team" }
];

export default function HomePage() {
  return <AuthGuard><main className="min-h-screen">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0c111b] p-6 lg:block">
      <div className="mb-12 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200"><Shield size={21}/></div><div><div className="font-semibold tracking-wide">RAVEN</div><div className="text-xs text-slate-500">NETWORK WORKSPACE</div></div></div>
      <div className="mb-3 text-xs uppercase tracking-[.18em] text-slate-500">Workspace</div>
      <div className="rounded-lg bg-white/[.07] px-3 py-2.5 text-sm">Overview</div>
      <Link href="/team" className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/[.05] hover:text-white"><Users size={15}/> Team access</Link><Link href="/search" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/[.05] hover:text-white"><Search size={15}/> Search</Link><Link href="/projects" className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/[.05] hover:text-white"><Boxes size={15}/> Game-mode projects</Link><div className="mt-8 text-xs uppercase tracking-[.18em] text-slate-500">Network</div>
      {modes.map(mode => <div key={mode.name} className="mt-2 rounded-lg px-3 py-2 text-sm text-slate-400">{mode.name}</div>)}
      <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 p-3 text-xs text-slate-500">Raven Network · Internal tools</div>
    </aside>
    <section className="mx-auto max-w-7xl px-5 py-8 lg:ml-64 lg:px-10 lg:py-12">
      <div className="flex items-center justify-between"><div className="text-sm text-slate-500">Raven Network <span className="px-2">/</span> Overview</div><Link href="/login" className="rounded-full border border-indigo-300/30 px-3 py-1.5 text-xs text-indigo-200 transition hover:bg-indigo-300/10">Sign in / Owner access</Link></div>
      <div className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1.5 text-xs text-indigo-200"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300"/> OPERATIONS HUB</div><h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Build something<br/><span className="text-slate-500">worth remembering.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">One home for Raven Network planning, documentation, and game-mode development.</p></div><Link href="/search" className="flex items-center gap-2 self-start rounded-xl bg-indigo-300 px-4 py-3 text-sm font-semibold text-slate-950 md:self-auto"><Search size={16}/> Search workspace <ArrowUpRight size={16}/></Link></div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({title,detail,icon:Icon,href}) => <Link href={href} key={title} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-indigo-300/40"><div className="mb-6 grid h-10 w-10 place-items-center rounded-xl bg-white/[.06] text-indigo-200"><Icon size={20}/></div><div className="font-medium">{title}</div><div className="mt-1 text-sm text-slate-500">{detail}</div><div className="mt-4 flex items-center gap-1 text-xs text-indigo-200">Open workspace <ArrowUpRight size={13}/></div></Link>)}</div>
      <div className="mt-12 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Game modes</h2><p className="mt-1 text-sm text-slate-500">Your network, organized by project.</p></div><Link href="/projects" className="text-xs text-indigo-200">VIEW ALL PROJECTS →</Link></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{modes.map((mode,index) => <article key={mode.name} className="rounded-2xl border border-white/10 bg-[#0c111b] p-5 transition hover:border-indigo-300/30"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-slate-300"><Boxes size={20}/></div><div><h3 className="font-medium">{mode.name}</h3><p className="mt-1 text-sm text-slate-500">{mode.description}</p></div></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{mode.status}</span></div><div className="mt-6 flex items-center justify-between border-t border-white/[.07] pt-4 text-xs text-slate-500"><span>Project 0{index+1}</span><span className="flex items-center gap-1">Open overview <ArrowUpRight size={13}/></span></div></article>)}</div>
      <footer className="mt-14 border-t border-white/10 pt-5 text-xs text-slate-600">RAVEN WORKSPACE <span className="px-2">·</span> Private operations workspace · Supabase-backed shared data.</footer>
    </section>
  </main></AuthGuard>;
}
