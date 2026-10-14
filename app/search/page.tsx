"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, FileText, CheckSquare, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

type Doc = { id: string; title: string; body: string; category: string };
type Task = { id: string; title: string; mode: string; status: string; priority: string };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notice, setNotice] = useState("Searching your workspace…");

  useEffect(() => {
    let active = true;
    async function load() {
      const db = createClient();
      const [d, t] = await Promise.all([
        db.from("documents").select("id,title,body,category").order("updated_at", { ascending: false }),
        db.from("tasks").select("id,title,mode,status,priority").order("created_at", { ascending: false })
      ]);
      if (!active) return;
      if (d.error || t.error) setNotice("Some results could not be loaded. Check your workspace access and try again.");
      else setNotice("");
      setDocs((d.data ?? []) as Doc[]);
      setTasks((t.data ?? []) as Task[]);
    }
    void load();
    return () => { active = false; };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { docs: docs.slice(0, 5), tasks: tasks.slice(0, 5) };
    return {
      docs: docs.filter(x => [x.title, x.body, x.category].join(" ").toLowerCase().includes(q)),
      tasks: tasks.filter(x => [x.title, x.mode, x.status, x.priority].join(" ").toLowerCase().includes(q))
    };
  }, [query, docs, tasks]);

  return <AuthGuard><main className="min-h-screen bg-[#09090f] px-5 py-6 text-[#f4f1fa] sm:px-8 lg:px-12 lg:py-9"><div className="mx-auto max-w-5xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to overview</Link>
    <div className="relative mt-7 overflow-hidden rounded-[26px] border border-violet-200/[.13] bg-[#100f1a] p-6 sm:p-9"><p className="text-[10px] font-semibold tracking-[.22em] text-violet-200">RAVEN / WORKSPACE INDEX</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Search everything<span className="text-violet-200">.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Find specs, decisions, tasks, and work across every Raven game mode.</p></div>
    <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/[.08] bg-[#0f0e17] px-4"><Search className="shrink-0 text-slate-500" size={20}/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search specs, decisions, tasks, modes…" className="w-full bg-transparent py-4 outline-none"/></label>
    {notice && <p className="mt-4 text-sm text-slate-400">{notice}</p>}
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <section><div className="mb-3 flex items-center gap-2"><FileText size={17} className="text-indigo-200"/><h2 className="font-semibold">Documents</h2><span className="text-xs text-slate-500">{results.docs.length}</span></div>
        {results.docs.length ? <div className="space-y-3">{results.docs.map(d => <article key={d.id} className="rounded-xl border border-white/[.08] bg-[#0f0e17] p-4"><div className="text-xs text-indigo-200">{d.category}</div><h3 className="mt-1 font-medium">{d.title}</h3><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-400">{d.body || "No body text."}</p><Link href="/documents" className="mt-3 inline-flex items-center gap-1 text-xs text-slate-300">Open documents <ArrowUpRight size={13}/></Link></article>)}</div> : <p className="rounded-xl border border-dashed border-white/[.1] p-5 text-sm text-slate-500">No matching documents.</p>}
      </section>
      <section><div className="mb-3 flex items-center gap-2"><CheckSquare size={17} className="text-indigo-200"/><h2 className="font-semibold">Tasks</h2><span className="text-xs text-slate-500">{results.tasks.length}</span></div>
        {results.tasks.length ? <div className="space-y-3">{results.tasks.map(t => <article key={t.id} className="rounded-xl border border-white/10 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium">{t.title}</h3><span className="text-xs text-slate-400">{t.status}</span></div><p className="mt-2 text-sm text-slate-500">{t.mode} · {t.priority} priority</p><Link href="/tasks" className="mt-3 inline-flex items-center gap-1 text-xs text-slate-300">Open tasks <ArrowUpRight size={13}/></Link></article>)}</div> : <p className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No matching tasks.</p>}
      </section>
    </div>
  </div></main></AuthGuard>;
}
