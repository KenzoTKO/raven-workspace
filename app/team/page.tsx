"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Users, ShieldCheck, Trash2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase";

type Member = { user_id: string; email: string; role: string; created_at: string };
type Invite = { email: string; role: string; created_at: string };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [myRole, setMyRole] = useState("staff");
  const [notice, setNotice] = useState("Loading team…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const db = createClient();
    const { data: auth } = await db.auth.getUser();
    if (auth.user) {
      const { data: mine } = await db.from("workspace_members").select("role").eq("user_id", auth.user.id).maybeSingle();
      if (mine) setMyRole(mine.role);
    }
    const { data: m, error: me } = await db.from("workspace_members").select("user_id,email,role,created_at").order("created_at", { ascending: true });
    const { data: i, error: ie } = await db.from("workspace_invites").select("email,role,created_at").order("created_at", { ascending: false });
    if (me) setNotice(me.message);
    else if (ie && myRole !== "staff") setNotice(ie.message);
    else setNotice("");
    setMembers((m ?? []) as Member[]);
    setInvites((i ?? []) as Invite[]);
  }, [myRole]);

  useEffect(() => { void load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || clean === "k@zela.gg") return;
    setBusy(true); setNotice("");
    try {
      const { error } = await createClient().from("workspace_invites").upsert({ email: clean, role }, { onConflict: "email" });
      if (error) throw error;
      setEmail("");
      await load();
      setNotice("Invitation access saved. The teammate must sign in with this exact email to activate access.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not save invite."); }
    finally { setBusy(false); }
  }

  async function changeRole(member: Member, nextRole: string) {
    if (member.role === "owner") return;
    const { error } = await createClient().from("workspace_members").update({ role: nextRole }).eq("user_id", member.user_id);
    if (error) setNotice(error.message); else { await load(); setNotice("Role updated."); }
  }

  async function removeMember(member: Member) {
    if (member.role === "owner" || !confirm("Remove " + member.email + " from Raven?")) return;
    const { error } = await createClient().from("workspace_members").delete().eq("user_id", member.user_id);
    if (error) setNotice(error.message); else { await load(); setNotice("Member removed."); }
  }

  async function removeInvite(invite: Invite) {
    if (!confirm("Remove the pending invite for " + invite.email + "?")) return;
    const { error } = await createClient().from("workspace_invites").delete().eq("email", invite.email);
    if (error) setNotice(error.message); else { await load(); setNotice("Invite removed."); }
  }

  return <AuthGuard><main className="min-h-screen bg-[#09090f] px-5 py-6 text-[#f4f1fa] sm:px-8 lg:px-12 lg:py-9"><div className="mx-auto max-w-5xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to overview</Link>
    <div className="relative mt-7 overflow-hidden rounded-[26px] border border-violet-200/[.13] bg-[#100f1a] p-6 sm:p-9"><p className="text-[10px] font-semibold tracking-[.22em] text-violet-200">RAVEN / ACCESS CONTROL</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Team & access<span className="text-violet-200">.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Manage the people building Raven, their workspace roles, and pending access.</p><div className="mt-5 inline-flex rounded-full border border-amber-200/15 bg-amber-200/[.05] px-3 py-1.5 text-xs text-amber-100">Your role · {myRole}</div></div>
    {myRole === "owner" || myRole === "admin" ? <form onSubmit={invite} className="mt-6 rounded-2xl border border-white/[.08] bg-[#0f0e17] p-5 sm:p-6"><h2 className="mb-4 flex items-center gap-2 font-medium"><UserPlus size={17}/> Invite a teammate</h2><div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@example.com" className="rounded-xl border border-white/[.09] bg-black/20 px-4 py-3 text-sm outline-none focus:border-violet-200/40"/><select value={role} onChange={e=>setRole(e.target.value)} className="rounded-xl border border-white/[.09] bg-[#111019] px-3 py-3 text-sm"><option value="staff">Staff</option><option value="admin" disabled={myRole!=="owner"}>Admin</option></select><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c4b5fd] px-4 py-3 text-sm font-semibold text-[#171020] disabled:opacity-50"><UserPlus size={16}/>{busy?"Saving…":"Grant access"}</button></div><p className="mt-3 text-xs text-slate-500">This creates an allowlist entry; it does not send email. Share the sign-in page with your teammate.</p></form> : <div className="mt-8 rounded-xl border border-white/10 p-4 text-sm text-slate-400">Only owners and admins can manage invitations.</div>}
    {notice && <p className="mt-4 rounded-xl border border-white/10 p-3 text-sm text-slate-400">{notice}</p>}
    <section className="mt-8"><h2 className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck size={17} className="text-indigo-200"/> Members <span className="text-xs text-slate-500">{members.length}</span></h2><div className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0f0e17]">{members.map(m=><div key={m.user_id} className="flex flex-wrap items-center gap-3 border-b border-white/[.07] p-4 last:border-0"><div className="min-w-0 flex-1"><p className="break-all text-sm font-medium">{m.email}</p><p className="mt-1 text-xs text-slate-500">Added {new Date(m.created_at).toLocaleDateString()}</p></div>{m.role==="owner"?<span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">Owner</span>:myRole==="owner"?<><select value={m.role} onChange={e=>void changeRole(m,e.target.value)} className="rounded-lg border border-white/10 bg-[#080b12] px-2 py-2 text-xs"><option value="staff">Staff</option><option value="admin">Admin</option></select><button onClick={()=>void removeMember(m)} aria-label="Remove member" className="rounded-lg p-2 text-slate-500 hover:text-red-300"><Trash2 size={16}/></button></>:<span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">{m.role}</span>}</div>)}{!members.length&&<p className="p-5 text-sm text-slate-500">No members found.</p>}</div></section>
    {(myRole==="owner"||myRole==="admin")&&<section className="mt-8"><h2 className="mb-3 font-semibold">Pending access <span className="text-xs text-slate-500">{invites.length}</span></h2><div className="overflow-hidden rounded-2xl border border-white/10">{invites.map(i=><div key={i.email} className="flex items-center gap-3 border-b border-white/[.07] p-4 last:border-0"><div className="min-w-0 flex-1"><p className="break-all text-sm">{i.email}</p><p className="mt-1 text-xs text-slate-500">Role: {i.role}</p></div><button onClick={()=>void removeInvite(i)} aria-label="Remove invitation" className="rounded-lg p-2 text-slate-500 hover:text-red-300"><Trash2 size={16}/></button></div>)}{!invites.length&&<p className="p-5 text-sm text-slate-500">No pending invites.</p>}</div></section>}
  </div></main></AuthGuard>;
}
