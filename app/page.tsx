"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { playCallEndTone, playDialTone, startRingingTone, stopAllCallSounds } from "@/lib/audio/callSounds";

const keys = [["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"], ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"], ["*", ""], ["0", "+"], ["#", ""]];
const menuItems = ["AI Agents", "My Numbers", "Call Tasks", "Knowledge Base", "Usage", "Billing", "Settings", "Help & Support"];
type CallSummary = { direction: string; status: string };
type Contact = { id: string; first_name: string; last_name: string; company: string | null; phone_number: string };
type Call = { id: string; to_number: string; direction: string; status: string; duration_seconds: number | null; summary: string | null; created_at: string; ai_agents: { name: string } | null };
type SearchResults = { contacts: Contact[]; calls: { id: string; to_number: string; status: string; summary: string | null }[]; agents: { id: string; name: string; role: string }[] };

export default function Home() {
  const [number, setNumber] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [callMode, setCallMode] = useState(false);
  const [task, setTask] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(() => !createSupabaseBrowserClient());
  const [missedCalls, setMissedCalls] = useState(0);
  const [ringing, setRinging] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [callError, setCallError] = useState("");
  const [popup, setPopup] = useState<"contacts" | "calls" | "search" | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>({ contacts: [], calls: [], agents: [] });
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [contactComposerOpen, setContactComposerOpen] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: "", lastName: "", company: "", phoneNumber: "", email: "" });
  const append = (value: string) => { if (number.length < 15) setNumber((current) => current + value); };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSignedIn(Boolean(data.session)); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => () => stopAllCallSounds(), []);
  useEffect(() => {
    if (!ringing || callStartedAt === null) return;
    const timer = window.setInterval(() => setCallSeconds(Math.floor((Date.now() - callStartedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [ringing, callStartedAt]);

  useEffect(() => {
    if (!signedIn) return;
    apiRequest<CallSummary[]>("/api/calls").then((calls) => setMissedCalls(calls.filter((call) => call.direction === "inbound" && ["no_answer", "busy", "failed"].includes(call.status)).length)).catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    if (!popup) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setPopup(null); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [popup]);

  useEffect(() => {
    if (!popup || !signedIn) return;
    const path = popup === "contacts" ? "/api/contacts" : "/api/calls";
    if (popup === "search") return;
    apiRequest<Contact[] | Call[]>(path).then((data) => popup === "contacts" ? setContacts(data as Contact[]) : setCalls(data as Call[])).catch((reason: Error) => setPopupError(reason.message)).finally(() => setPopupLoading(false));
  }, [popup, signedIn]);

  async function logOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setSignedIn(false);
    setMissedCalls(0);
    setMenuOpen(false);
  }
  async function startAiCall() { setCallError(""); try { await apiRequest<{ allowed: boolean }>("/api/calls/authorize", { method: "POST" }); startRingingTone(); setCallStartedAt(Date.now()); setCallSeconds(0); setRinging(true); setCallMode(false); } catch (error) { setCallError(error instanceof Error ? error.message : "Your account cannot start this call."); } }
  function endCall() { stopAllCallSounds(); playCallEndTone(); setRinging(false); setCallStartedAt(null); setCallSeconds(0); setMuted(false); setTransferOpen(false); }
  function formatDuration(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
  async function runSearch(event: React.FormEvent) { event.preventDefault(); if (searchQuery.trim().length < 2) return; setPopupLoading(true); setPopupError(""); try { setSearchResults(await apiRequest<SearchResults>(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)); } catch (reason) { setPopupError(reason instanceof Error ? reason.message : "Unable to search"); } finally { setPopupLoading(false); } }
  function openPopup(nextPopup: "contacts" | "calls" | "search") { setPopupError(""); setPopupLoading(nextPopup !== "search"); setPopup(nextPopup); }
  async function addContact(event: React.FormEvent) { event.preventDefault(); setContactSaving(true); setPopupError(""); try { await apiRequest("/api/contacts", { method: "POST", body: JSON.stringify({ ...contactForm, company: contactForm.company || null, email: contactForm.email || null }) }); setContactForm({ firstName: "", lastName: "", company: "", phoneNumber: "", email: "" }); setContactComposerOpen(false); setPopupLoading(true); setContacts(await apiRequest<Contact[]>("/api/contacts")); } catch (reason) { setPopupError(reason instanceof Error ? reason.message : "Unable to add contact"); } finally { setContactSaving(false); setPopupLoading(false); } }
  return <main className="phone-shell">{popup === "contacts" && <button className="popup-add-floating" onClick={() => setContactComposerOpen(true)}>Add new contact <span>+</span></button>}{contactComposerOpen && <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="contact-title"><form className="call-modal" onSubmit={addContact}><button type="button" className="modal-close" onClick={() => setContactComposerOpen(false)} aria-label="Close">×</button><span className="eyebrow">NEW CONTACT</span><h1 id="contact-title">Add a contact</h1>{([['firstName', 'First name'], ['lastName', 'Last name'], ['company', 'Company'], ['phoneNumber', 'Phone number'], ['email', 'Email']] as const).map(([key, label]) => <label key={key}>{label}<input type={key === 'email' ? 'email' : 'text'} value={contactForm[key]} onChange={(event) => setContactForm((current) => ({ ...current, [key]: event.target.value }))} required={key === 'firstName' || key === 'phoneNumber'} /></label>)}<button className="primary-action" disabled={contactSaving}>{contactSaving ? 'Saving contact...' : 'Add contact'}<span>→</span></button></form></div>}
    <div className="ambient-glow" />
    <header className="app-header">
      <Link href="/landing" className="brand" aria-label="Visit HandsFree landing page"><span className="brand-name">Hands<span>Free</span></span><span className="brand-parent">by VoiceDesk Technologies</span></Link>
      <button className="icon-button" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}>•••</button>
      {menuOpen && <><button className="backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><nav className="overflow-menu" aria-label="HandsFree navigation">{menuItems.map((item) => <Link href={item === "Call Tasks" ? "/tasks" : `/${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</Link>)}<Link className="menu-create" href="/agents/create">+ Create AI Agent</Link>{authReady && (signedIn ? <button className="menu-auth" onClick={logOut}><span aria-hidden="true">⇥</span> Log out</button> : <Link className="menu-auth" href="/auth/login"> <span aria-hidden="true">⇥</span> Log in</Link>)}</nav></>}
    </header>
    {ringing ? <section className="live-call" aria-label="Live call"><div className="call-topline"><button className="call-back" onClick={endCall} aria-label="End call">↓</button><span>{callSeconds === 0 ? "CONNECTING" : "AI CALL"}</span><button className="call-more" aria-label="More call options">•••</button></div><div className="caller-orb">{number.slice(-2) || "HF"}</div><h1>{number || "Unknown caller"}</h1><p className="caller-number">{callSeconds === 0 ? "Connecting securely..." : formatDuration(callSeconds)}</p><p className="agent-line"><span className="status-dot" /> Sarah · AI agent</p><div className="waveform" aria-label="Call audio activity"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="call-controls"><button className={muted ? "control active-control" : "control"} onClick={() => setMuted((value) => !value)}><span>⌁</span><small>{muted ? "Unmute" : "Mute"}</small></button><button className="control" onClick={() => setTransferOpen((value) => !value)}><span>⇄</span><small>Transfer</small></button><button className="control" onClick={() => setTransferOpen((value) => !value)}><span>⌨</span><small>Keypad</small></button><button className="end-call" onClick={endCall} aria-label="End call"><span>☎</span><small>End</small></button></div>{transferOpen && <div className="call-popover"><strong>Call tools</strong><p>Transfer or send tones during this call.</p><label>Transfer number<input type="tel" placeholder="+1 555 123 4567" /></label><button className="primary-action" onClick={() => setTransferOpen(false)}>Close tools <span>×</span></button></div>}</section> : <section className="dialer-content" aria-label="HandsFree dialer">
      <div className="number-badge">Your HandsFree Number <span className="status-dot" /></div>
      <div className="number-entry"><div className={`number-display ${number ? "has-number" : ""}`}>{number || "Enter a number"}</div>{number && <button className="erase-button" aria-label="Erase last digit" onClick={() => setNumber((current) => current.slice(0, -1))}>⌫</button>}</div>
      <div className="keypad" role="group" aria-label="Phone keypad">{keys.map(([digit, letters]) => <button className="key" key={digit} onClick={() => { append(digit); playDialTone(); }}><strong>{digit}</strong><small>{letters}</small></button>)}</div>
      {ringing && <div className="ringing-status" role="status"><span className="ringing-dot" /> Ringing <button onClick={endCall}>End call</button></div>}
      <button className="call-button" aria-label="Ask HandsFree to call" onClick={() => { playDialTone(); setCallMode(true); }}>☎</button>
    </section>}
    <nav className="bottom-nav" aria-label="Primary navigation"><button onClick={() => openPopup("contacts")}><span className="nav-icon">◎</span>Contacts</button><Link className="active" href="/"><span className="nav-icon grid-icon">••<br />••</span>Keypad</Link><button className="call-nav-item" onClick={() => openPopup("calls")}><span className="nav-icon">◷</span>Calls{missedCalls > 0 && <span className="call-badge" aria-label={`${missedCalls} missed calls`}>{missedCalls > 9 ? "9+" : missedCalls}</span>}</button><button onClick={() => openPopup("search")}><span className="nav-icon">⌕</span>Search</button></nav>
    {popup && <div className="modal-layer popup-layer" role="dialog" aria-modal="true" aria-labelledby="popup-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setPopup(null); }}><section className="data-popup"><button className="modal-close" onClick={() => setPopup(null)} aria-label="Close popup">×</button><span className="eyebrow">{popup === "contacts" ? "YOUR PEOPLE" : popup === "calls" ? "YOUR HISTORY" : "FIND ANYTHING"}</span><h1 id="popup-title">{popup === "contacts" ? "Contacts" : popup === "calls" ? "Calls" : "Search"}</h1>{popup === "search" && <form className="search-form popup-search" onSubmit={runSearch}><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Contacts, calls, agents..." minLength={2} required /><button className="primary-action">Search <span>⌕</span></button></form>}{popupError && <p className="auth-error">{popupError}</p>}{popupLoading && <p className="popup-state">Loading...</p>}{popup === "contacts" && !popupLoading && <div className="contact-list">{contacts.length ? contacts.map((contact) => <article className="contact-row" key={contact.id}><span className="agent-avatar">{contact.first_name.slice(0, 1).toUpperCase()}</span><div><h2>{contact.first_name} {contact.last_name}</h2><p>{contact.company || contact.phone_number}</p><small>{contact.phone_number}</small></div><a className="row-call" href={`tel:${contact.phone_number}`} aria-label={`Call ${contact.first_name}`}>☎</a></article>) : <div className="popup-state">No contacts yet.</div>}</div>}{popup === "calls" && !popupLoading && <div className="contact-list">{calls.length ? calls.map((call) => <article className="contact-row" key={call.id}><span className="agent-avatar">{call.direction === "inbound" ? "↓" : "↑"}</span><div><h2>{call.to_number}</h2><p>{call.ai_agents?.name || "Unassigned agent"} · {call.status}</p><small>{call.summary || "No summary available"}</small></div><time className="call-time">{new Date(call.created_at).toLocaleDateString()}</time></article>) : <div className="popup-state">No calls yet.</div>}</div>}{popup === "search" && !popupLoading && searchQuery && <div className="popup-results">{searchResults.contacts.length + searchResults.calls.length + searchResults.agents.length === 0 ? <div className="popup-state">No results.</div> : <>{searchResults.contacts.length > 0 && <><h2 className="result-heading">Contacts</h2>{searchResults.contacts.map((item) => <div className="result-row" key={item.id}><strong>{item.first_name} {item.last_name}</strong><span>{item.company || item.phone_number}</span></div>)}</>}{searchResults.calls.length > 0 && <><h2 className="result-heading">Calls</h2>{searchResults.calls.map((item) => <div className="result-row" key={item.id}><strong>{item.to_number}</strong><span>{item.status} · {item.summary || "No summary"}</span></div>)}</>}{searchResults.agents.length > 0 && <><h2 className="result-heading">AI Agents</h2>{searchResults.agents.map((item) => <div className="result-row" key={item.id}><strong>{item.name}</strong><span>{item.role}</span></div>)}</>}</>}</div>}</section></div>}
    {callMode && <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="call-title"><div className="call-modal"><button className="modal-close" onClick={() => setCallMode(false)} aria-label="Close">×</button><span className="eyebrow">AI CALL</span><h1 id="call-title">How should HandsFree help?</h1><p>Your agent will call <strong>{number || "this number"}</strong> and handle the conversation for you.</p><label htmlFor="task">What should they do?</label><textarea id="task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="Ask about an order, appointment, or anything else..." />{callError && <p className="auth-error">{callError} <Link href="/pricing">View plans</Link></p>}<button className="primary-action" disabled={!number || !task.trim()} onClick={startAiCall}>Start AI Call <span>→</span></button><Link className="secondary-action" href="/agents">Choose a different agent</Link></div></div>}
  </main>;
}
