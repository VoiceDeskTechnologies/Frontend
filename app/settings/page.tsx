"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/api/client";

const groups = [
  ["ACCOUNT", [["My Profile", "/settings/profile", "♙"], ["My Numbers", "/settings/numbers", "☎"], ["Subscription & Billing", "/settings/billing", "▤"], ["Usage & Minutes", "/settings/usage", "◔"], ["Payment Methods", "/settings/payment-methods", "▣"], ["Invoices", "/settings/invoices", "▤"]]],
  ["AI & BUSINESS", [["AI Agents", "/agents", "✦"], ["Call Tasks", "/settings/call-tasks", "◷"], ["Knowledge Base", "/settings/knowledge-base", "▤"], ["Contacts", "/settings/contacts", "◎"], ["Templates", "/settings/templates", "□"]]],
  ["INTEGRATIONS", [["Integrations", "/settings/integrations", "↔"], ["Webhooks", "/settings/webhooks", "⌁"]]],
  ["APP", [["Notifications", "/settings/notifications", "♧"], ["Appearance", "/settings/appearance", "◐"], ["Language", "/settings/language", "文"], ["Sounds", "/settings/sounds", "◉"]]],
  ["SECURITY", [["Security", "/settings/security", "⌑"]]],
  ["SUPPORT", [["Help Center", "/settings/help", "?"], ["About HANDSFREE", "/settings/about", "i"]]],
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { apiRequest("/api/admin/telephony/config").then(() => setIsAdmin(true)).catch(() => setIsAdmin(false)); }, []);
  async function logOut() { setLoggingOut(true); const { createSupabaseBrowserClient } = await import("@/lib/supabase/client"); const supabase = createSupabaseBrowserClient(); if (supabase) await supabase.auth.signOut(); router.push("/landing"); }
  return <main className="phone-shell feature-page"><header className="app-header"><Link href="/landing" className="brand"><span className="brand-name">Hands<span>Free</span></span><span className="brand-parent">by VoiceDesk Technologies</span></Link><Link className="feature-back" href="/">Dashboard</Link></header><section className="feature-content settings-hub"><span className="eyebrow">ACCOUNT CONTROL</span><h1>Settings</h1><div className="settings-profile"><span className="agent-avatar">H</span><div><strong>Your HANDSFREE account</strong><p>Manage your profile, calling tools, and preferences.</p></div></div>{groups.map(([title, links]) => <section className="settings-group" key={title}><h2>{title}</h2>{links.map(([label, href, icon]) => <Link href={href} key={href}><span aria-hidden="true">{icon}</span>{label}<b aria-hidden="true">›</b></Link>)}</section>)}{isAdmin && <section className="settings-group"><h2>ADMINISTRATION</h2><Link href="/admin"><span aria-hidden="true">⌘</span>Admin console<b aria-hidden="true">›</b></Link></section>}<button className="settings-logout" onClick={logOut} disabled={loggingOut}>{loggingOut ? "Signing out..." : "Log out"}</button></section></main>;
}
