"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "link_expired") setError("That sign-in link expired or was already used. Request a fresh link once email delivery is available.");
    else if (code === "missing_code") setError("The sign-in link is incomplete. Open the newest email link or request another one.");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/auth/callback" }
      });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("rate limit") || message.includes("too many")) {
          setError("Supabase is temporarily limiting sign-in emails. Stop retrying and wait before requesting another link. No new email was sent by this attempt.");
          setCooldown(60);
        } else {
          setError(error.message);
        }
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not contact the sign-in service. Check your connection and try again later.");
    } finally {
      setBusy(false);
    }
  }
