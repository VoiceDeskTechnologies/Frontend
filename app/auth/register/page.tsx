"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setMessage(""); const supabase = createSupabaseBrowserClient(); if (!supabase) { setMessage("Authentication is not configured. Add the Supabase environment variables."); setLoading(false); return; } const { error } = await supabase.auth.signUp({ email, password }); if (error) setMessage(error.message); else setMessage("Check your email to verify your account, then sign in."); setLoading(false); }
  return <main className="auth-page"><Link href="/landing" className="brand"><span className="brand-name">Hands<span>Free</span></span><span className="brand-parent">by VoiceDesk Technologies</span></Link><form className="auth-card" onSubmit={submit}><span className="eyebrow">GET STARTED</span><h1>Your AI, on the phone.</h1><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="auth-error">{message}</p>}<button className="primary-action" disabled={loading}>{loading ? "Creating account..." : "Create account"}<span>→</span></button><p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></p></form></main>;
}