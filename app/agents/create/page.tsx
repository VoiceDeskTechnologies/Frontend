"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api/client";

const roleOptions = [
  ["sales", "Sales Agent", "Understand prospects and move qualified conversations forward.", "Sales Assistant", "Help prospects understand our services and convert qualified prospects into customers."],
  ["customer_service", "Customer Service", "Resolve questions with patience and accurate business context.", "Customer Care", "Help customers resolve questions and problems efficiently."],
  ["booking", "Booking Agent", "Schedule, confirm, and reschedule appointments accurately.", "Booking Assistant", "Schedule and manage appointments without claiming a booking before it is confirmed."],
  ["receptionist", "Receptionist", "Greet callers, identify intent, route calls, and take messages.", "Receptionist", "Act as the company's professional first point of contact."],
  ["lead_qualification", "Lead Qualification", "Ask useful questions and identify high-value prospects.", "Lead Qualifier", "Understand and qualify prospective customers for this business."],
  ["support", "Support Agent", "Troubleshoot supported issues and escalate when needed.", "Support Assistant", "Help customers troubleshoot and resolve supported issues."],
  ["custom", "Custom", "Start from a blank role and define the workflow yourself.", "Custom Assistant", "Follow the user's custom instructions while respecting platform safety rules."],
] as const;

export default function CreateAgentPage() {
  const router = useRouter();
  const [agentType, setAgentType] = useState("custom");
  const [form, setForm] = useState({ name: "", role: "Custom Agent", objective: "Follow the user's custom instructions while respecting platform safety rules.", personality: "Friendly", greeting: "Hi, I'm an AI assistant calling on behalf of HandsFree.", systemInstructions: "Speak naturally, keep responses concise, ask one question at a time, and never make promises you cannot fulfill." });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  function chooseRole(value: string) { const selected = roleOptions.find(([type]) => type === value) ?? roleOptions[6]; setAgentType(value); setForm((current) => ({ ...current, name: selected[3], role: selected[1], objective: selected[4], systemInstructions: `You are the ${selected[1]} for this business.\n${selected[4]}\nNever invent pricing, policies, availability, or completed actions.` })); }
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); try { await apiRequest("/api/agents", { method: "POST", body: JSON.stringify({ ...form, agentType, disclosureEnabled: true, disclosureText: form.greeting }) }); router.push("/agents"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create agent"); setLoading(false); } }
  return <main className="phone-shell feature-page"><header className="app-header"><Link href="/dashboard" className="brand"><span className="brand-name">Hands<span>Free</span></span><span className="brand-parent">by VoiceDesk Technologies</span></Link><Link className="feature-back" href="/agents">Cancel</Link></header><form className="feature-content form-page agent-builder" onSubmit={submit}><span className="eyebrow">AGENT BUILDER</span><h1>Choose your agent&apos;s role</h1><div className="role-picker">{roleOptions.map(([type, name, description]) => <button type="button" className={agentType === type ? "selected" : ""} key={type} onClick={() => chooseRole(type)}><strong>{name}</strong><small>{description}</small></button>)}</div><label>Agent name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Sarah" required /></label><label>Objective<textarea value={form.objective} onChange={(event) => update("objective", event.target.value)} required /></label><label>Personality<select value={form.personality} onChange={(event) => update("personality", event.target.value)}><option>Professional</option><option>Friendly</option><option>Warm</option><option>Direct</option><option>Empathetic</option></select></label><label>Greeting<textarea value={form.greeting} onChange={(event) => update("greeting", event.target.value)} required /></label><label>Instructions<textarea value={form.systemInstructions} onChange={(event) => update("systemInstructions", event.target.value)} required /></label>{error && <p className="auth-error">{error}</p>}<button className="primary-action" disabled={loading}>{loading ? "Creating agent..." : "Create agent"}<span>→</span></button></form></main>;
}
