"use client";

import AuthGuard from "@/components/AuthGuard";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Doc = { id: string; title: string; body: string; category: string; updated_at: string };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("Loading documents…");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const db = createClient();
      const { data, error } = await db.from("documents").select("id,title,body,category,updated_at").order("updated_at", { ascending: false });
      if (error) throw error;
      setDocs((data ?? []) as Doc[]);
      setNotice("");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not load documents.");
    }
  }
  useEffect(() => { void load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true); setNotice("");
    try {
      const db = createClient();
      const result = editingId
        ? await db.from("documents").update({ title: title.trim(), body, category }).eq("id", editingId)
        : await db.from("documents").insert({ title: title.trim(), body, category });
      const { error } = result;
      if (error) throw error;
      setTitle(""); setBody(""); setCategory("General"); setEditingId(null);
      await load();
      setNotice(editingId ? "Document updated." : "Document saved.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save document.");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      const { error } = await createClient().from("documents").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not delete document."); }
  }

  const filtered = docs.filter(d => (d.title + " " + d.body + " " + d.category).toLowerCase().includes(query.toLowerCase()));
  return <AuthGuard><main className="min-h-screen bg-[#09090f] px-5 py-6 text-[#f4f1fa] sm:px-8 lg:px-12 lg:py-9">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to overview</Link>
      <div className="relative mt-7 overflow-hidden rounded-[26px] border border-violet-200/[.13] bg-[#100f1a] p-6 sm:p-9"><p className="text-[10px] font-semibold tracking-[.22em] text-violet-200">RAVEN / KNOWLEDGE BASE</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Documents<span className="text-violet-200">.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Specifications, decisions, and references—organized in one place for the whole network.</p></div>
      <form onSubmit={save} className="mt-6 rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-medium">{editingId ? "Edit document" : "Create a document"}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(""); setBody(""); setCategory("General"); }} className="text-xs text-slate-400 hover:text-white">Cancel edit</button>}</div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title" required className="w-full rounded-xl border border-white/[.09] bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-violet-200/40"/>
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr]">
          <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-white/[.09] bg-[#111019] px-3 py-3 text-sm"><option>General</option><option>UnstableFFA</option><option>Gens</option><option>Prisons</option><option>Earth / Towny</option></select>
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write notes, requirements, decisions…" rows={4} className="w-full rounded-xl border border-white/[.09] bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-violet-200/40"/>
        </div>
        <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c4b5fd] px-4 py-3 text-sm font-semibold text-[#171020] disabled:opacity-50"><Plus size={16}/>{busy ? "Saving…" : editingId ? "Update document" : "Save document"}</button>
      </form>
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.025] px-4"><Search size={17} className="text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search documents…" className="w-full bg-transparent py-3 outline-none"/></div>
      {notice && <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-slate-400">{notice}</p>}
      <div className="mt-4 grid gap-3">{filtered.map(d=><article key={d.id} className="rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5"><div className="flex items-start justify-between gap-4"><div><span className="text-xs text-indigo-200">{d.category}</span><h2 className="mt-1 text-lg font-medium">{d.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{d.body}</p><p className="mt-4 text-xs text-slate-600">Updated {new Date(d.updated_at).toLocaleString()}</p></div><div className="flex gap-1"><button onClick={() => { setEditingId(d.id); setTitle(d.title); setBody(d.body); setCategory(d.category); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Edit document" className="rounded-lg p-2 text-slate-500 hover:bg-indigo-300/10 hover:text-indigo-200">Edit</button><button onClick={()=>void remove(d.id)} aria-label="Delete document" className="rounded-lg p-2 text-slate-500 hover:bg-red-400/10 hover:text-red-300"><Trash2 size={16}/></button></div></div></article>)}</div>
    </div>
  </main></AuthGuard>;
}
