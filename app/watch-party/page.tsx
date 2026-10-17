"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Check, Clapperboard, Copy, Crown, Link2, MessageCircle, Pause, Play, Plus, Send, Settings2, Shield, Users, Volume2, Youtube } from "lucide-react";

type VideoItem = { id: string; title: string; by?: string };
type ChatItem = { id: string; name: string; text: string; time: string; mine?: boolean };
type PlayerState = { videoId: string; time: number; playing: boolean; at: number };

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement | string, options: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
type YTPlayer = {
  getCurrentTime: () => number;
  getPlayerState: () => number;
  loadVideoById: (id: string, startSeconds?: number) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

function videoIdFromUrl(input: string) {
  try {
    const url = new URL(input.trim());
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || null;
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) return parts[1] || null;
    }
  } catch { return null; }
  return null;
}
function shortTime() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function roomCode() { return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }

export default function WatchPartyPage() {
  const [room, setRoom] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [videoId, setVideoId] = useState("jfKfPfyJRdk");
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<VideoItem[]>([{ id: "jfKfPfyJRdk", title: "lofi hip hop radio 📚 - beats to relax / study to" }]);
  const [chat, setChat] = useState<ChatItem[]>([{ id: "welcome", name: "Raven", text: "Welcome to the watch party. Drop a YouTube link to get started.", time: "now" }]);
  const [message, setMessage] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [syncNote, setSyncNote] = useState("Waiting for room");
  const channelRef = useRef<any>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const remoteActionRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBroadcastRef = useRef(0);\n  const videoIdRef = useRef(videoId);\n  const queueRef = useRef(queue);\n  useEffect(() => { videoIdRef.current = videoId; }, [videoId]);\n  useEffect(() => { queueRef.current = queue; }, [queue]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let roomId = params.get("room");
    if (!roomId) {
      roomId = roomCode();
      window.history.replaceState({}, "", window.location.pathname + "?room=" + encodeURIComponent(roomId));
      sessionStorage.setItem("raven-watch-host-" + roomId, "1");
    }
    setRoom(roomId);
    setIsHost(sessionStorage.getItem("raven-watch-host-" + roomId) === "1");
    const savedName = localStorage.getItem("raven-watch-name") || "";
    setName(savedName);
    setNameDraft(savedName);
  }, []);

  useEffect(() => {
    if (!room || !name) return;
    const supabase = createClient();
    const channel = supabase.channel("raven-watch-" + room, {
      config: { broadcast: { self: false }, presence: { key: name + "-" + Math.random().toString(36).slice(2, 7) } }
    });
    channelRef.current = channel;
    channel
      .on("broadcast", { event: "player" }, ({ payload }: { payload: PlayerState }) => {
        if (isHost || !payload?.videoId) return;
        remoteActionRef.current = true;
        setVideoId(payload.videoId);
        setPlaying(payload.playing);
        const player = playerRef.current;
        if (player) {
          const drift = Math.abs((player.getCurrentTime?.() || 0) - (payload.time || 0));
          if (player.getVideoData && false) return;
          if (drift > 2) player.seekTo(Math.max(0, payload.time), true);
          if (payload.playing) player.playVideo(); else player.pauseVideo();
        }
        setSyncNote("Synced with host");
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => { remoteActionRef.current = false; }, 900);
      })
      .on("broadcast", { event: "video" }, ({ payload }: { payload: VideoItem }) => {
        if (!payload?.id) return;
        setVideoId(payload.id);
        setQueue((old) => old.some((v) => v.id === payload.id) ? old : [...old, payload]);
        if (playerRef.current && !isHost) {
          remoteActionRef.current = true;
          playerRef.current.loadVideoById(payload.id);
          if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
          syncTimerRef.current = setTimeout(() => { remoteActionRef.current = false; }, 1200);
        }
      })
      .on("broadcast", { event: "chat" }, ({ payload }: { payload: ChatItem }) => {
        if (payload?.text) setChat((old) => [...old.slice(-99), payload]);
      })
      .on("broadcast", { event: "queue" }, ({ payload }: { payload: VideoItem[] }) => {
        if (Array.isArray(payload)) setQueue(payload);
      })
      .on("broadcast", { event: "request-state" }, () => {
        if (isHost && playerRef.current) {
          void channel.send({ type: "broadcast", event: "player", payload: { videoId: videoIdRef.current, time: playerRef.current.getCurrentTime(), playing: playerRef.current.getPlayerState() === 1, at: Date.now() } });
          void channel.send({ type: "broadcast", event: "queue", payload: queueRef.current });
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name?: string }>();
        const names = Object.values(state).flat().map((entry) => entry.name || "Guest");
        setPeople([...new Set(names)]);
      })
      .subscribe(async (status: string) => {
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          await channel.track({ name, joined_at: new Date().toISOString() });
          await channel.send({ type: "broadcast", event: "request-state", payload: {} });
          setSyncNote("Room connected");
        }
      });
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room, name, isHost]);

  useEffect(() => {
    if (!frameRef.current) return;
    let cancelled = false;
    const mountPlayer = () => {
      if (cancelled || !frameRef.current || !window.YT?.Player) return;
      if (playerRef.current) { try { playerRef.current.destroy(); } catch {} }
      const target = document.createElement("div");
      target.id = "raven-youtube-player";
      frameRef.current.replaceChildren(target);
      playerRef.current = new window.YT.Player(target, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: { autoplay: 0, controls: 1, rel: 0, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            if (!isHost) void channelRef.current?.send({ type: "broadcast", event: "request-state", payload: {} });
            setSyncNote(isHost ? "You're controlling playback" : "Ready to sync");
          },
          onStateChange: (event: { data: number }) => {
            if (remoteActionRef.current) return;
            const state = window.YT?.PlayerState;
            if (!state) return;
            if (event.data === state.PLAYING || event.data === state.PAUSED || event.data === state.ENDED) {
              const now = Date.now();
              if (now - lastBroadcastRef.current < 250) return;
              lastBroadcastRef.current = now;
              const isPlaying = event.data === state.PLAYING;
              setPlaying(isPlaying);
              if (isHost) {
                void channelRef.current?.send({ type: "broadcast", event: "player", payload: { videoId, time: playerRef.current?.getCurrentTime() || 0, playing: isPlaying, at: now } });
              }
            }
          }
        }
      });
    };
    if (window.YT?.Player) mountPlayer();
    else {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { previous?.(); mountPlayer(); };
    }
    return () => { cancelled = true; };
    // Player is intentionally initialized once per selected video/host role.
  }, [videoId, isHost]);

  useEffect(() => {
    if (!isHost || !connected) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const now = Date.now();
      if (now - lastBroadcastRef.current < 3000) return;
      lastBroadcastRef.current = now;
      void channelRef.current?.send({ type: "broadcast", event: "player", payload: { videoId, time: player.getCurrentTime(), playing: player.getPlayerState() === 1, at: now } });
    }, 4000);
    return () => clearInterval(interval);
  }, [isHost, connected, videoId]);

  const addVideo = useCallback((event?: React.FormEvent) => {
    event?.preventDefault();
    const id = videoIdFromUrl(urlDraft);
    if (!id) { setSyncNote("Paste a valid YouTube video link"); return; }
    const item = { id, title: "YouTube video · " + id };
    setVideoId(id);
    setQueue((old) => old.some((v) => v.id === id) ? old : [...old, item]);
    setUrlDraft("");
    if (isHost) {
      void channelRef.current?.send({ type: "broadcast", event: "video", payload: item });
      void channelRef.current?.send({ type: "broadcast", event: "queue", payload: [...queue.filter((v) => v.id !== id), item] });
    } else {
      void channelRef.current?.send({ type: "broadcast", event: "video", payload: item });
    }
    setPlaying(false);
    setSyncNote(isHost ? "Video changed for everyone" : "Video request sent");
  }, [urlDraft, isHost, queue]);

  const sendChat = (event: React.FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !channelRef.current) return;
    const item = { id: Math.random().toString(36).slice(2), name, text: text.slice(0, 500), time: shortTime(), mine: true };
    setChat((old) => [...old.slice(-99), item]);
    void channelRef.current.send({ type: "broadcast", event: "chat", payload: item });
    setMessage("");
  };

  const copyInvite = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const changePlayback = (nextPlaying: boolean) => {
    if (!isHost || !playerRef.current) return;
    remoteActionRef.current = true;
    if (nextPlaying) playerRef.current.playVideo(); else playerRef.current.pauseVideo();
    setPlaying(nextPlaying);
    void channelRef.current?.send({ type: "broadcast", event: "player", payload: { videoId, time: playerRef.current.getCurrentTime(), playing: nextPlaying, at: Date.now() } });
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => { remoteActionRef.current = false; }, 900);
  };

  if (!name) return <main className="grid min-h-screen place-items-center bg-[#09090f] px-5 text-[#f4f1fa]"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111118] p-7 shadow-2xl shadow-violet-950/20"><div className="mb-6 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Clapperboard size={23}/></div><div><p className="text-xs uppercase tracking-[.2em] text-violet-300">Raven Network</p><h1 className="mt-1 text-2xl font-semibold">Watch Party</h1></div></div><p className="mb-5 text-sm leading-6 text-slate-400">Pick a name so your friends know who's in the room.</p><form onSubmit={(e) => { e.preventDefault(); const n = nameDraft.trim().slice(0, 24); if (n) { localStorage.setItem("raven-watch-name", n); setName(n); } }} className="space-y-3"><input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Your display name" maxLength={24} required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-violet-400/60"/><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Join room <ArrowLeft className="rotate-180" size={16}/></button></form><p className="mt-5 text-center text-xs text-slate-600">Room {room || "…" } · Invite-only by link</p></div></main>;

  return <main className="min-h-screen bg-[#09090f] text-[#f4f1fa]">
    <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[#0b0c10]/95 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6"><Link href="/" className="flex shrink-0 items-center gap-2 text-xs text-slate-400 transition hover:text-white"><ArrowLeft size={15}/><span className="hidden sm:inline">Raven Workspace</span></Link><div className="h-6 w-px bg-white/10"/><div className="grid h-9 w-9 place-items-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Clapperboard size={18}/></div><div><div className="text-sm font-semibold tracking-wide">RAVEN <span className="text-violet-300">WATCH PARTY</span></div><div className="text-[10px] text-slate-500">Watch together, wherever you are</div></div><div className="ml-auto flex items-center gap-2"><span className={"hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] sm:inline-flex " + (connected ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" : "border-amber-300/20 bg-amber-300/5 text-amber-200")}><span className={"h-1.5 w-1.5 rounded-full " + (connected ? "bg-emerald-300" : "bg-amber-300")}/>{connected ? "LIVE" : "CONNECTING"}</span><button onClick={copyInvite} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-medium transition hover:bg-white/[.08]">{copied ? <Check size={14}/> : <Copy size={14}/>}<span className="hidden sm:inline">{copied ? "Copied!" : "Invite friends"}</span><span className="sm:hidden">{copied ? "Copied" : "Invite"}</span></button></div></div></header>
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300"><span className="h-1.5 w-1.5 rounded-full bg-violet-300"/>{isHost ? "You're hosting" : "You're watching with friends"}</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Movie night, <span className="text-violet-300">together.</span></h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">One room. One timeline. Send a link and press play together.</p></div><div className="flex items-center gap-3 rounded-2xl border border-white/[.08] bg-white/[.025] px-4 py-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-200"><Users size={19}/></div><div><div className="text-lg font-semibold tabular-nums">{Math.max(people.length, 1)}</div><div className="text-[10px] text-slate-500">in this room</div></div><div className="ml-2 flex -space-x-2">{(people.length ? people : [name]).slice(0,4).map((p,i)=><div key={p} title={p} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0b0c10] bg-gradient-to-br from-violet-400/80 to-indigo-500/80 text-[10px] font-semibold text-white">{p.slice(0,1).toUpperCase()}</div>)}</div></div></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[.09] bg-[#101115] shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3"><div className="flex min-w-0 items-center gap-2"><Youtube size={17} className="shrink-0 text-red-400"/><span className="truncate text-xs font-medium text-slate-200">YouTube player</span><span className="rounded-md border border-white/[.08] px-2 py-0.5 text-[9px] text-slate-500">SYNCED</span></div><button onClick={() => setShowSettings((v) => !v)} className="rounded-lg p-2 text-slate-400 hover:bg-white/[.06] hover:text-white" aria-label="Room settings"><Settings2 size={16}/></button></div>
          {showSettings && <div className="flex flex-wrap items-center gap-3 border-b border-white/[.07] bg-white/[.02] px-4 py-3 text-xs"><span className="text-slate-400">Room code</span><strong>{room}</strong><span className="text-slate-500">·</span><span className="text-slate-400">Host controls playback</span><button onClick={copyInvite} className="ml-auto text-violet-300">{copied ? "Copied" : "Copy invite link"}</button></div>}
          <div className="aspect-video bg-black"><div ref={frameRef} className="h-full w-full"/></div>
          <div className="flex flex-wrap items-center gap-3 border-t border-white/[.07] px-4 py-3 sm:px-5"><button disabled={!isHost} onClick={() => changePlayback(!playing)} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">{playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? "Pause for everyone" : "Play for everyone"}</button><div className="flex items-center gap-2 text-xs text-slate-400"><Volume2 size={15}/><span>{isHost ? "You're in control" : "Host controls playback"}</span></div><div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500"><span className={"h-1.5 w-1.5 rounded-full " + (connected ? "bg-emerald-300" : "bg-amber-300")}/>{syncNote}</div></div>
          <form onSubmit={addVideo} className="flex gap-2 border-t border-white/[.07] bg-black/10 p-3 sm:p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.03] text-slate-400"><Link2 size={16}/></div><input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="Paste a YouTube link to play for everyone…" className="min-w-0 flex-1 rounded-xl border border-white/[.08] bg-black/20 px-3 text-xs outline-none transition placeholder:text-slate-600 focus:border-violet-400/40"/><button className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/10 px-3 text-xs font-medium text-violet-200 transition hover:bg-violet-400/20"><Plus size={15}/><span className="hidden sm:inline">Add video</span></button></form>
        </section>
        <aside className="grid min-h-[520px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-white/[.09] bg-[#101115]">
          <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-4"><div className="flex items-center gap-2"><MessageCircle size={17} className="text-violet-300"/><h2 className="text-sm font-semibold">Room chat</h2></div><span className="text-[10px] text-slate-500">REAL-TIME</span></div>
          <div className="max-h-[480px] min-h-[250px] space-y-4 overflow-y-auto p-4">{chat.map((item) => <div key={item.id} className="flex gap-2.5"><div className={"grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[10px] font-semibold " + (item.name === "Raven" ? "bg-violet-400/15 text-violet-200" : "bg-white/[.07] text-slate-200")}>{item.name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-xs font-medium text-slate-200">{item.name}</span><span className="text-[9px] text-slate-600">{item.time}</span></div><p className="mt-1 break-words text-xs leading-5 text-slate-400">{item.text}</p></div></div>)}</div>
          <form onSubmit={sendChat} className="border-t border-white/[.07] p-3"><div className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-black/20 p-1.5"><input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="Say something…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs outline-none placeholder:text-slate-600"/><button aria-label="Send message" disabled={!message.trim()} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500 text-white transition hover:bg-violet-400 disabled:opacity-40"><Send size={14}/></button></div></form>
        </aside>
      </div>
      <section className="mt-5 rounded-2xl border border-white/[.09] bg-[#101115] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Clapperboard size={16} className="text-violet-300"/><h2 className="text-sm font-semibold">Up next</h2></div><p className="mt-1 text-[11px] text-slate-500">Videos shared in this room</p></div><span className="rounded-lg border border-white/[.08] px-2.5 py-1.5 text-[10px] text-slate-500">{queue.length} {queue.length === 1 ? "video" : "videos"}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{queue.map((item, index) => <button key={item.id} onClick={() => { if (!isHost) { setSyncNote("Only the host can change playback"); return; } setVideoId(item.id); void channelRef.current?.send({ type: "broadcast", event: "video", payload: item }); }} className={"flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition " + (item.id === videoId ? "border-violet-300/30 bg-violet-400/[.07]" : "border-white/[.07] bg-white/[.015] hover:bg-white/[.04]")}><img src={"https://i.ytimg.com/vi/" + item.id + "/mqdefault.jpg"} alt="" className="h-14 w-24 shrink-0 rounded-lg bg-black object-cover"/><div className="min-w-0 flex-1"><div className="mb-1 text-[9px] uppercase tracking-[.14em] text-slate-500">{index === 0 ? "Now playing" : "In queue"}</div><div className="truncate text-xs font-medium text-slate-200">{item.title}</div><div className="mt-1 truncate text-[10px] text-slate-500">youtube.com</div></div>{item.id === videoId ? <span className="h-2 w-2 shrink-0 rounded-full bg-violet-300"/> : <Play size={13} className="shrink-0 text-slate-500"/>}</button>)}</div></section>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600"><span className="flex items-center gap-2"><Shield size={12}/>RAVEN NETWORK · WATCH PARTY</span><span>Share the invite link with people you trust.</span></footer>
    </div>
  </main>;
}
