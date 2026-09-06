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
let lastLinkSentAt = 0;
export async function cloudRequestLink(email: string): Promise<string | null> {
  const sb = getClient();
  if (!sb) return "Cloud saving is not configured.";
  const clean = email.toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return "Please enter a valid email.";
  // Client-side throttle: one link per 45s so nobody (and no double-click)
  // trips Supabase's send limits by accident.
  const wait = Math.ceil((45000 - (Date.now() - lastLinkSentAt)) / 1000);
  if (wait > 0) return `Link already on its way — check your inbox (and spam). You can request a new one in ${wait}s.`;
  lastLinkSentAt = Date.now();
  const { error } = await sb.auth.signInWithOtp({
    email: clean,
    options: { emailRedirectTo: `${SITE.baseUrl}/auth/callback` },
  });
  if (error) { lastLinkSentAt = 0; return friendlyAuthError(error.message); }
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
  if (/error sending.*email|smtp|mailer/i.test(msg))
    return "The mail sender refused it — recheck SMTP (app password with no spaces, sender matches the account), or switch custom SMTP off to use the built-in sender.";
  if (/rate limit|too many|over_email_send_rate_limit|email rate limit exceeded/i.test(msg))
    return "Email provider is being protective — wait a couple of minutes and try once.";
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

/* ---------- public reading (no login needed) ---------- */
/* Published portfolios are public by design — that's the whole product.
   Contact emails are public too (they're printed on the page for inquiries).
   Everything else stays owner-only. */

export async function loadPublicArtist(username: string): Promise<Artist | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("data")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  const arts = (data.data as { artists?: Artist[] })?.artists ?? [];
  const found = arts.find(a => a.username.toLowerCase() === username.toLowerCase());
  return found && found.published ? found : null;
}

export async function loadPublicArtists(): Promise<Artist[]> {
  const sb = getClient();
  if (!sb) return [];
  const { data, error } = await sb.from("profiles").select("data").limit(100);
  if (error || !data) return [];
  const seen = new Map<string, Artist>();
  for (const row of data) {
    const arts = ((row.data as { artists?: Artist[] })?.artists ?? []).filter(a => a.published);
    for (const a of arts) if (!seen.has(a.username.toLowerCase())) seen.set(a.username.toLowerCase(), a);
  }
  return Array.from(seen.values());
}
