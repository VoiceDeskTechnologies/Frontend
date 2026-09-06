"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";

const labels: Record<string, [string, string]> = {
  calls: ["Calls", "Live call activity and provider status."],
  agents: ["AI Agents", "Live agent configuration and availability."],
  "phone-numbers": ["Phone Numbers", "Assigned numbers and provisioning state."],
  billing: ["Billing & Revenue", "Verified payments and configurable plans."],
  usage: ["Usage & Analytics", "Usage ledger activity from real calls."],
  settings: ["Settings", "Current platform configuration and service readiness."],
  "audit-logs": ["Audit Logs", "Recorded administrative activity."],
};

type Overview = { section: string; columns?: string[]; rows?: Record<string, unknown>[]; plans?: Record<string, unknown>[]; configuration?: Record<string, unknown> };

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && value.includes("T")) return new Date(value).toLocaleString();
  return String(value);
}

export default function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const [section, setSection] = useState("");
  const [result, setResult] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { void params.then(({ section: value }) => { setSection(value); apiRequest<Overview>(`/api/admin/overview/${value}`).then(setResult).catch((reason: Error) => setError(reason.message)); }); }, [params]);
  const [title, message] = labels[section] ?? ["Admin section", "This admin section is not configured."];

  return <section className="admin-content">
    <div className="admin-page-heading"><div><p className="admin-kicker">ADMINISTRATION / LIVE DATA</p><h2>{title}</h2><p>{message}</p></div><Link href="/admin">Dashboard <span>{"->"}</span></Link></div>
    {error && <div className="admin-error" role="alert">Unable to load live data. {error}</div>}
    {!result && !error && <div className="admin-panel admin-empty-page"><h3>Loading live records...</h3></div>}
    {result?.configuration && <div className="admin-stat-grid">{Object.entries(result.configuration).map(([key, value]) => <div className="admin-stat-card" key={key}><span><small>{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}</small><strong>{displayValue(value)}</strong><em>Current backend value</em></span></div>)}</div>}
    {result?.plans && <div className="admin-panel"><div className="admin-panel-heading"><h3>Plans</h3></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr>{Object.keys(result.plans[0] ?? {}).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{result.plans.map((row, index) => <tr key={String(row.id ?? index)}>{Object.keys(result.plans?.[0] ?? {}).map((key) => <td key={key}>{displayValue(row[key])}</td>)}</tr>)}</tbody></table></div></div>}
    {result?.rows && <div className="admin-panel table-panel"><div className="admin-table-meta"><strong>{result.rows.length.toLocaleString()} records</strong><span>Live backend data</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr>{(result.columns ?? []).map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={String(row.id ?? index)}>{(result.columns ?? []).map((column) => <td key={column}>{displayValue(row[column])}</td>)}</tr>)}</tbody></table></div></div>}
  </section>;
}
