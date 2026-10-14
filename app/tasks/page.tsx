"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Task = { id: string; title: string; mode: string; status: string; priority: string; created_at: string };

export default function TasksPage() {
  const [tasks,setTasks] = useState<Task[]>([]);
  const [title,setTitle] = useState("");
  const [mode,setMode] = useState("Prisons");
  const [priority,setPriority] = useState("Normal");
  const [notice,setNotice] = useState("Loading tasks…");
  const [busy,setBusy] = useState(false);
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
  return <main className="min-h-screen px-5 py-8 md:px-10"><div className="mx-auto max-w-5xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to overview</Link>
    <div className="mt-8 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><CheckSquare/></div><div><p className="text-xs uppercase tracking-[.2em] text-indigo-200">Raven Network</p><h1 className="text-3xl font-semibold">Tasks</h1></div></div>
    <p className="mt-3 text-slate-400">Track development work across every game mode.</p>
    <form onSubmit={add} className="mt-8 rounded-2xl border border-white/10 bg-white/[.025] p-5"><h2 className="mb-4 font-medium">Add a task</h2><input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Configure prison mines" className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 outline-none focus:border-indigo-300/50"/><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={mode} onChange={e=>setMode(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>UnstableFFA</option><option>Gens</option><option>Prisons</option><option>Earth / Towny</option><option>Network-wide</option></select><select value={priority} onChange={e=>setPriority(e.target.value)} className="rounded-xl border border-white/10 bg-[#080b12] px-3 py-3"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></div><button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"><Plus size={16}/>{busy?"Adding…":"Add task"}</button></form>
    {notice && <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-slate-400">{notice}</p>}
    <div className="mt-5 grid gap-3">{tasks.map(t=><article key={t.id} className="flex items-center gap-4 rounded-2xl border border-white/10 p-4"><button onClick={()=>void toggle(t)} aria-label={t.status==="Done"?"Reopen task":"Complete task"} className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${t.status==="Done"?"border-indigo-300 bg-indigo-300 text-slate-950":"border-white/20"}`}>{t.status==="Done"?"✓":""}</button><div className="min-w-0 flex-1"><p className={t.status==="Done"?"text-slate-500 line-through":"font-medium"}>{t.title}</p><p className="mt-1 text-xs text-slate-500">{t.mode} · {t.priority} priority</p></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{t.status}</span></article>)}</div>
  </div></main>;
}
