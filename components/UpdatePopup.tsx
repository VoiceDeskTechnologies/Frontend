"use client";

import { useEffect, useState } from "react";

type ProductUpdate = { id: string; title: string; body: string; type: "maintenance" | "promotion" | "upgrade" | "announcement"; cta_label: string | null; cta_url: string | null };
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function UpdatePopup() {
  const [update, setUpdate] = useState<ProductUpdate | null>(null);
  const [closed, setClosed] = useState(false);
  useEffect(() => { fetch(`${api}/api/updates`).then((response) => response.json()).then((items: ProductUpdate[]) => { const first = items[0]; if (first && window.sessionStorage.getItem(`update:${first.id}`) !== "closed") setUpdate(first); }).catch(() => undefined); }, []);
  function dismiss() { if (update) window.sessionStorage.setItem(`update:${update.id}`, "closed"); setClosed(true); }
  if (!update || closed) return null;
  return <div className={`update-overlay update-${update.type}`} role="dialog" aria-modal="true" aria-labelledby="update-title"><section className="update-popup"><div className="update-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index}>{update.type === "maintenance" ? (index % 2 ? "⚙" : "🔧") : update.type === "promotion" ? (index % 2 ? "$" : "✦") : update.type === "upgrade" ? (index % 2 ? "↑" : "✦") : "•"}</i>)}</div><button className="update-close" onClick={dismiss} aria-label="Close update">×</button><span className="update-kicker">{update.type.toUpperCase()} · HANDSFREE</span><h2 id="update-title">{update.title}</h2><p>{update.body}</p><div className="update-actions">{update.cta_label && update.cta_url && <a href={update.cta_url}>{update.cta_label}<span>→</span></a>}<button onClick={dismiss}>Got it</button></div></section></div>;
}
