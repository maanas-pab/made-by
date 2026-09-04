"use client";
/* Cloud persistence + passwordless authentication (Supabase magic links).
   - ZERO config: env vars absent → everything stays local (demo mode).
   - Configured: enter email → click the link → you're in. Supabase Auth owns
     sessions; rows are owner-only (RLS: auth.uid() = id), so typing someone
     else's email gets you nowhere — the link goes to THEIR inbox, not yours.
   Setup: free Supabase project → run supabase/schema.sql → set the two
   NEXT_PUBLIC_ vars (.env.local + Vercel env) → Authentication → URL
   Configuration: add http://localhost:3000/** and https://<domain>/** to
   Redirect URLs (magic links are rejected without this). */
import { createClient, type SupabaseClient, type User as SupaUser } from "@supabase/supabase-js";
import { SITE } from "./site";
import type { Artist } from "./data";

let client: SupabaseClient | null = null;

export function cloudEnabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getClient(): SupabaseClient | null {
  if (!cloudEnabled()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

/* ---------- auth (magic link) ---------- */

/** Sends the magic link. Resolves null on success, error message on failure. */
export async function cloudRequestLink(email: string): Promise<string | null> {
  const sb = getClient();
  if (!sb) return "Cloud saving is not configured.";
  const clean = email.toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return "Please enter a valid email.";
  const { error } = await sb.auth.signInWithOtp({
    email: clean,
    options: { emailRedirectTo: `${SITE.baseUrl}/auth/callback` },
  });
  if (error) return friendlyAuthError(error.message);
  return null;
}

/** Call on the callback page (and when polling): picks up the session from
    the link and resolves the user, or null if the link hasn't landed yet. */
export async function cloudFinalizeLink(): Promise<SupaUser | null> {
  const sb = getClient();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}

export async function cloudSignOut() {
  try { await getClient()?.auth.signOut(); } catch {}
}

export async function cloudSessionUser(): Promise<SupaUser | null> {
  const sb = getClient();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}

function friendlyAuthError(msg: string): string {
  if (/rate limit|too many|over_email_send_rate_limit/i.test(msg))
    return "Too many links in a row — wait a minute and try again.";
  if (/redirect.*not allowed|redirect_uri/i.test(msg))
    return "This domain isn't allow-listed yet (Supabase → URL Configuration → Redirect URLs).";
  if (/signups not allowed|sign-up.*disabled/i.test(msg))
    return "New accounts are paused — ask Maanas for access.";
  return msg || "Couldn't send the link. Try again.";
}

/* ---------- data (owner-only) ---------- */

export interface RemoteState {
  userId: string;
  email: string;
  username: string;
  artists: Artist[];
  updatedAt: string;
}

export async function loadRemoteById(uid: string): Promise<RemoteState | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, email, username, data, updated_at")
    .eq("id", uid)
    .maybeSingle();
  if (error || !data) return null;
  return {
    userId: data.id,
    email: data.email,
    username: data.username,
    artists: (data.data as { artists?: Artist[] })?.artists ?? [],
    updatedAt: data.updated_at,
  };
}

export async function saveRemoteById(uid: string, email: string, username: string, artists: Artist[]) {
  const sb = getClient();
  if (!sb) return false;
  const { error } = await sb.from("profiles").upsert(
    { id: uid, email: email.toLowerCase(), username, data: { artists }, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  return !error;
}
