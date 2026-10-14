"use client";

import AuthGuard from "@/components/AuthGuard";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Plus, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Task = { id: string; title: string; mode: string; status: string; priority: string; created_at: string };

export default function TasksPage() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [title,setTitle] = useState("");
  const [mode,setMode] = useState("Prisons");
  const [priority,setPriority] = useState("Normal");
  const [notice,setNotice] = useState("Loading tasks…");
  const [busy,setBusy] = useState(false);
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState("All");
  const [modeFilter,setModeFilter] = useState("All");
  const [priorityFilter,setPriorityFilter] = useState("All");
  async function load() {
    try { const {data,error}=await createClient().from("tasks").select("id,title,mode,status,priority,created_at").order("created_at",{ascending:false}); if(error) throw error; setTasks((data??[]) as Task[]); setNotice(""); }
    catch(e) { setNotice(e instanceof Error ? e.message : "Could not load tasks."); }
  }
  useEffect(()=>{void load();},[]);
  async function add(e:React.FormEvent) {
    e.preventDefault(); if(!title.trim()) return; setBusy(true);
    try { const {error}=await createClient().from("tasks").insert({title:title.trim(),mode,priority,status:"To do"}); if(error) throw error; setTitle(""); await load(); }
    catch(e) { setNotice(e instanceof Error ? e.message : "Could not create task."); }
    finally { setBusy(false); }
  }
  async function toggle(t:Task) {
    const status=t.status==="Done"?"To do":"Done";
    try { const {error}=await createClient().from("tasks").update({status}).eq("id",t.id); if(error) throw error; await load(); }
    catch(e) { setNotice(e instanceof Error ? e.message : "Could not update task."); }
  }
  async function remove(t:Task) { if (!confirm("Delete this task?")) return; const { error } = await createClient().from("tasks").delete().eq("id", t.id); if (error) setNotice(error.message); else await load(); }
  const filtered = tasks.filter(t => (t.title + " " + t.mode).toLowerCase().includes(query.toLowerCase()) && (filter === "All" || t.status === filter) && (modeFilter === "All" || t.mode === modeFilter) && (priorityFilter === "All" || t.priority === priorityFilter));
  return <AuthGuard><main className="min-h-screen bg-[#09090f] px-5 py-6 text-[#f4f1fa] sm:px-8 lg:px-12 lg:py-9"><div className="mx-auto max-w-6xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to overview</Link>
    <div className="relative mt-7 overflow-hidden rounded-[26px] border border-violet-200/[.13] bg-[#100f1a] p-6 sm:p-9"><p className="text-[10px] font-semibold tracking-[.22em] text-violet-200">RAVEN / EXECUTION</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Task board<span className="text-violet-200">.</span></h1><p className="mt-3 text-sm text-slate-400">Track the work behind every Raven game mode.</p></div>
    <p className="mt-3 text-slate-400">Track development work across every game mode.</p>
    <form onSubmit={add} className="mt-6 rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5 sm:p-6"><h2 className="mb-4 font-medium">Add a task</h2><input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Configure prison mines" className="w-full rounded-xl border border-white/[.09] bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-violet-200/40"/><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>UnstableFFA</option><option>Gens</option><option>Prisons</option><option>Earth / Towny</option><option>Network-wide</option></select><select value={priority} onChange={e=>setPriority(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></div><button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c4b5fd] px-4 py-3 text-sm font-semibold text-[#171020] disabled:opacity-50"><Plus size={16}/>{busy?"Adding…":"Add task"}</button></form>
    {notice && <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-slate-400">{notice}</p>}
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="flex items-center gap-2 rounded-xl border border-white/10 px-3"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks" className="w-full bg-transparent py-3 outline-none"/></label><select aria-label="Filter by status" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>All</option><option>To do</option><option>Done</option></select><select aria-label="Filter by game mode" value={modeFilter} onChange={e=>setModeFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>All</option><option>UnstableFFA</option><option>Gens</option><option>Prisons</option><option>Earth / Towny</option><option>Network-wide</option></select><select aria-label="Filter by priority" value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>All</option><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></div><p className="mt-3 text-xs text-slate-500">{filtered.length} tasks · {tasks.filter(t=>t.status==="Done").length} completed</p><div className="mt-3 grid gap-3">{filtered.map(t=><article key={t.id} className="flex items-center gap-4 rounded-2xl border border-white/10 p-4"><button onClick={()=>void toggle(t)} aria-label={t.status==="Done"?"Reopen task":"Complete task"} className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${t.status==="Done"?"border-indigo-300 bg-indigo-300 text-slate-950":"border-white/20"}`}>{t.status==="Done"?"✓":""}</button><div className="min-w-0 flex-1"><p className={t.status==="Done"?"text-slate-500 line-through":"font-medium"}>{t.title}</p><p className="mt-1 text-xs text-slate-500">{t.mode} · {t.priority} priority</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{t.status}</span><button onClick={()=>void remove(t)} aria-label="Delete task" className="rounded-lg p-2 text-slate-500 hover:text-red-300"><Trash2 size={15}/></button></div></article>)}</div>
  </div></main></AuthGuard>;
}
