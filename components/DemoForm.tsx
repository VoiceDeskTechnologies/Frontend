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
function formatTime(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

export default function DemoForm() {
  const [agentType, setAgentType] = useState("sales");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!callActive || !callConnected) return;
    const timer = window.setInterval(() => {
      setCallSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [callActive, callConnected]);

  useEffect(() => {
    if (!callActive || callConnected) return;
    const timer = window.setTimeout(() => setCallConnected(true), 2200);
    return () => window.clearTimeout(timer);
  }, [callActive, callConnected]);

  async function startCall(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCallSeconds(0);
    setCallConnected(false);
    setCallActive(true);
  }

  function closeCall() {
    setCallActive(false);
    setCallConnected(false);
    setCallSeconds(0);
    setMuted(false);
    setSpeakerOn(false);
  }

  if (callActive) return <div className="demo-live-call"><div className="demo-live-topline"><span className="live-dot" /> HANDSFREE LIVE <button type="button" onClick={closeCall} aria-label="Close demo call">×</button></div><div className="demo-live-orb"><span className="voice-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span></div><h3>AI Agent</h3><p className="demo-live-status">{callConnected ? formatTime(callSeconds) : "Calling for your business..."}</p><p className="demo-agent-line"><span className="live-dot" /> Sarah · AI agent</p><section className="demo-transcript" aria-live="polite"><div><span>LIVE TRANSCRIPT</span><i /></div>{callConnected ? <><p className="demo-agent-text"><strong>Sarah · AI agent</strong>Hi, I&apos;m calling to help with your business.</p><p><strong>Caller</strong>Thanks, tell me more.</p></> : <p className="demo-transcript-empty">Waiting for the conversation to begin...</p>}</section><div className="demo-live-controls"><button type="button" className={muted ? "selected" : ""} onClick={() => setMuted((value) => !value)}><span>⌁</span>{muted ? "Unmute AI" : "Mute AI"}</button><button type="button" className={speakerOn ? "selected" : ""} onClick={() => setSpeakerOn((value) => !value)}><span>◖))</span>{speakerOn ? "Speaker on" : "Speaker"}</button><button type="button" className="demo-live-end" onClick={closeCall}><span>⌕</span>End</button></div></div>;

  return <form className="demo-form demo-call-form" onSubmit={startCall}><div className="demo-call-form-heading"><p className="public-kicker">TRY A LIVE DEMO</p><h3>Have your AI call you.</h3><p>Choose an agent, tell it who to ask for, and we&apos;ll start a 30-second demo call.</p></div><label>Agent type<select value={agentType} onChange={(event) => setAgentType(event.target.value)}>{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="form-two"><label>First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></label><label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} required /></label></div><label>Phone number<input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} type="tel" placeholder="+1 555 123 4567" pattern="\+[1-9][0-9]{6,14}" required /><small className="demo-field-note">Use international format, including the + country code.</small></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" disabled={!firstName || !lastName || !phoneNumber}>Start demo call <span>↗</span></button></form>;
}
