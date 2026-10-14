"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, Boxes, CheckSquare, FileText } from "lucide-react";

const modes = [
  { name: "UnstableFFA", summary: "Fast-paced free-for-all PvP", focus: "Combat, kits, maps, moderation" },
  { name: "Gens", summary: "Generator progression", focus: "Generator tiers, economy, upgrades" },
  { name: "Prisons", summary: "Raven Prisons development", focus: "Mines, prestige, PvP, launch scope" },
  { name: "Earth / Towny", summary: "World-building and towns", focus: "Claims, towns, nations, economy" }
];

export default function ProjectsPage() {
  return <AuthGuard><main className="min-h-screen px-5 py-8 md:px-10"><div className="mx-auto max-w-5xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16}/> Overview</Link>
    <p className="mt-8 text-xs uppercase tracking-[.2em] text-indigo-200">Raven Network</p>
    <h1 className="mt-2 text-3xl font-semibold">Game-mode projects</h1>
    <p className="mt-3 max-w-2xl text-slate-400">Organize scope, decisions, and launch work for every Raven mode.</p>
    <div className="mt-6 flex gap-3"><Link href="/documents" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm"><FileText size={16}/> Documents</Link><Link href="/tasks" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm"><CheckSquare size={16}/> Tasks</Link></div>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{modes.map((mode, i) => <article key={mode.name} className="rounded-2xl border border-white/10 bg-[#0c111b] p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><Boxes size={20}/></div><div><h2 className="font-semibold">{mode.name}</h2><p className="mt-1 text-sm text-slate-400">{mode.summary}</p></div></div><p className="mt-5 text-xs uppercase tracking-wider text-slate-500">Key workstreams</p><p className="mt-2 text-sm text-slate-300">{mode.focus}</p><div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-xs text-slate-500"><span>Project 0{i + 1}</span><Link href="/tasks" className="text-indigo-200">View tasks →</Link></div></article>)}</div>
  </div></main></AuthGuard>;
}
