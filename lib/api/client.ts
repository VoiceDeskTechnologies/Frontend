import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Authentication is not configured");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to continue");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...options.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? "Request failed");
  return body as T;
}