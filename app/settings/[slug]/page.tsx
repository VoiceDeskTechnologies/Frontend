import Link from "next/link";
import { redirect } from "next/navigation";

const pages: Record<string, { title: string; description: string; eyebrow: string }> = {
  numbers: { title: "My Numbers", description: "Manage your assigned HANDSFREE numbers and default caller ID.", eyebrow: "ACCOUNT" },
  billing: { title: "Subscription & Billing", description: "Review your plan, payment status, and minute purchases.", eyebrow: "ACCOUNT" },
  usage: { title: "Usage & Minutes", description: "Review your current period, minutes, and call activity.", eyebrow: "ACCOUNT" },
  "payment-methods": { title: "Payment Methods", description: "Payment methods are managed securely through PayPal checkout.", eyebrow: "ACCOUNT" },
  invoices: { title: "Invoices", description: "Your verified payment history and invoices will appear here.", eyebrow: "ACCOUNT" },
  "call-tasks": { title: "Call Tasks", description: "Create and manage scheduled calls for your AI agents.", eyebrow: "AI & BUSINESS" },
  "knowledge-base": { title: "Knowledge Base", description: "Manage the information your AI agents use during calls.", eyebrow: "AI & BUSINESS" },
  contacts: { title: "Contacts", description: "Manage the people and businesses your agents can call.", eyebrow: "AI & BUSINESS" },
  templates: { title: "Templates", description: "Reusable agent and call-task templates will be managed here.", eyebrow: "AI & BUSINESS" },
  integrations: { title: "Integrations", description: "Connect supported business tools to HANDSFREE.", eyebrow: "INTEGRATIONS" },
  webhooks: { title: "Webhooks", description: "Review webhook integrations and delivery settings.", eyebrow: "INTEGRATIONS" },
  notifications: { title: "Notifications", description: "Choose how HANDSFREE keeps you informed about calls and account activity.", eyebrow: "APP" },
  appearance: { title: "Appearance", description: "Customize the visual presentation of your HANDSFREE workspace.", eyebrow: "APP" },
  language: { title: "Language", description: "Language preferences for your HANDSFREE workspace.", eyebrow: "APP" },
  sounds: { title: "Sounds", description: "Manage dial tones and call sounds.", eyebrow: "APP" },
  security: { title: "Security", description: "Review account security and password settings.", eyebrow: "SECURITY" },
  help: { title: "Help Center", description: "Find answers and contact HANDSFREE support.", eyebrow: "SUPPORT" },
  about: { title: "About HANDSFREE", description: "Information about HANDSFREE by VoiceDesk Technologies.", eyebrow: "ABOUT" },
};

export default async function SettingsSubpage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "numbers") redirect("/numbers");
  if (slug === "billing") redirect("/billing");
  if (slug === "usage") redirect("/usage");
  if (slug === "call-tasks") redirect("/tasks");
  if (slug === "knowledge-base") redirect("/knowledge");
  if (slug === "contacts") redirect("/contacts");
  if (slug === "help") redirect("/support");
  const page = pages[slug] ?? { title: "Settings", description: "This settings page is not available.", eyebrow: "ACCOUNT CONTROL" };
  return <main className="phone-shell feature-page"><header className="app-header"><Link href="/settings" className="brand"><span className="brand-name">Hands<span>Free</span></span><span className="brand-parent">by VoiceDesk Technologies</span></Link><Link className="feature-back" href="/settings">Settings</Link></header><section className="feature-content settings-subpage"><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><div className="settings-panel"><h2>{page.title}</h2><p>{page.description}</p><p className="feature-muted">This account setting is ready for your workspace and will use your authenticated account data.</p></div></section></main>;
}
