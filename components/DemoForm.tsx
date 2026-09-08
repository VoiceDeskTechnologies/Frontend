"use client";

import { useEffect, useState } from "react";

const roles = [
  ["sales", "Sales Agent"],
  ["customer_service", "Customer Service"],
  ["booking", "Booking Agent"],
  ["receptionist", "Receptionist"],
  ["lead_qualification", "Lead Qualification"],
  ["support", "Support Agent"],
  ["custom", "Custom Agent"],
] as const;
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function formatTime(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

export default function DemoForm() {
  const [agentType, setAgentType] = useState("sales");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callId, setCallId] = useState<string | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [ending, setEnding] = useState(false);
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!callId || timeLimitReached) return;
    const timer = window.setInterval(() => {
      setCallSeconds((current) => {
        const next = current + 1;
        if (next >= 30) {
          window.clearInterval(timer);
          setTimeLimitReached(true);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [callId, timeLimitReached]);

  useEffect(() => {
    if (!timeLimitReached || !callId) return;
    void endCall();
  }, [timeLimitReached, callId]);

  async function endCall() {
    if (!callId || ending) return;
    setEnding(true);
    try {
      await fetch(`${api}/api/demo/calls/${callId}/end`, { method: "POST" });
    } finally {
      setEnding(false);
    }
  }

  async function startCall(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setTimeLimitReached(false);
    setCallSeconds(0);
    try {
      const response = await fetch(`${api}/api/demo/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, firstName, lastName, phoneNumber }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to start the demo call.");
      setCallId(result.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start the demo call.");
    }
  }

  function closeCall() {
    setCallId(null);
    setCallSeconds(0);
    setMuted(false);
    setTimeLimitReached(false);
  }

  if (callId) return <div className="demo-call-card"><div className="demo-call-topline"><span className="live-dot" /> HANDSFREE DEMO <button type="button" onClick={closeCall} aria-label="Close demo call">×</button></div><div className="demo-call-orb">HF</div><h3>{firstName} {lastName}</h3><p className="demo-call-status">{timeLimitReached ? "Time limit reached for demo calls" : "Your AI agent is calling now"}</p><strong className="demo-call-time">{formatTime(callSeconds)}</strong><div className="demo-call-controls"><button type="button" className={muted ? "selected" : ""} onClick={() => setMuted((value) => !value)}><span>⌁</span>{muted ? "Unmute" : "Mute"}</button><button type="button" className="demo-call-end" onClick={() => { void endCall(); closeCall(); }} disabled={ending}><span>⌕</span>End call</button></div>{timeLimitReached && <p className="demo-call-limit">Time limit reached for demo calls</p>}</div>;

  return <form className="demo-form demo-call-form" onSubmit={startCall}><div className="demo-call-form-heading"><p className="public-kicker">TRY A LIVE DEMO</p><h3>Have your AI call you.</h3><p>Choose an agent, tell it who to ask for, and we&apos;ll start a 30-second demo call.</p></div><label>Agent type<select value={agentType} onChange={(event) => setAgentType(event.target.value)}>{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="form-two"><label>First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></label><label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} required /></label></div><label>Phone number<input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} type="tel" placeholder="+1 555 123 4567" pattern="\+[1-9][0-9]{6,14}" required /><small className="demo-field-note">Use international format, including the + country code.</small></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" disabled={!firstName || !lastName || !phoneNumber}>Start demo call <span>↗</span></button></form>;
}
