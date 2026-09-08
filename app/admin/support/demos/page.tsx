"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

type DemoRequest = { id: string; full_name: string; business_name: string | null; email: string; phone_number: string | null; business_type: string | null; agent_type: string; message: string | null; status: string; notes: string | null; created_at: string };
const statuses = ["new", "contacted", "scheduled", "completed", "cancelled"];

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [selected, setSelected] = useState<DemoRequest | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  async function load() { try { setRequests(await apiRequest<DemoRequest[]>(`/api/admin/demo-requests?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load demo requests"); } }
  useEffect(() => { void apiRequest<DemoRequest[]>(`/api/admin/demo-requests?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`).then(setRequests).catch((reason: Error) => setError(reason.message)); }, [status, search]);
  async function save() { if (!selected) return; try { const updated = await apiRequest<DemoRequest>(`/api/admin/demo-requests/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status: selected.status, notes }) }); setRequests((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected(updated); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update demo request"); } }
  return <section className="admin-content"><div className="admin-page-heading"><div><p className="admin-kicker">CUSTOMER OPERATIONS</p><h2>Demo requests</h2><p>Review businesses interested in seeing a HANDSFREE agent.</p></div><Link href="/admin/support" className="admin-chip">Back to support</Link></div><div className="admin-filter-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, business, or email" /><button onClick={() => void load()}>Search</button>{statuses.map((item) => <button className={status === item ? "active" : ""} key={item} onClick={() => setStatus(status === item ? "" : item)}>{item}</button>)}</div>{error && <div className="admin-error" role="alert">{error}</div>}<div className="support-layout"><div className="admin-panel support-queue"><div className="queue-heading"><strong>Requests</strong><span>{requests.length} shown</span></div>{requests.length ? requests.map((item) => <button className="ticket-row" key={item.id} onClick={() => { setSelected(item); setNotes(item.notes ?? ""); }}><span className="priority-dot normal" /><span><strong>{item.full_name}</strong><b>{item.business_name || "Business not provided"}</b><small>{item.agent_type.replace("_", " ")} · {item.status} · {new Date(item.created_at).toLocaleString()}</small></span><span>›</span></button>) : <p className="admin-empty">No demo requests found.</p>}</div>{selected && <div className="admin-panel support-detail"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button><p className="admin-kicker">REQUEST DETAILS</p><h3>{selected.full_name}</h3><p>{selected.email}{selected.phone_number ? ` · ${selected.phone_number}` : ""}</p><p><b>{selected.agent_type.replace("_", " ")}</b> · {selected.business_type || "Business type not provided"}</p>{selected.message && <p className="support-messages"><span>{selected.message}</span></p>}<label>Status<select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value })}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} /></label><button className="primary-action" onClick={() => void save()}>Save request <span>→</span></button></div>}</div></section>;
}
