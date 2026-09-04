"use client";
/* Cloud persistence + real authentication (Supabase).
   - ZERO config: env vars absent → everything stays local (demo mode).
   - Configured: email+password accounts via Supabase Auth. Sessions persist
     in the browser; rows are owner-only (RLS: auth.uid() = id), so typing
     someone else's email gets you nowhere — there is no password to guess
     and no row you can read.
   Setup: free Supabase project → run supabase/schema.sql → set the two
   NEXT_PUBLIC_ vars (local .env.local + Vercel env). In Supabase dashboard:
   Authentication → Sign In/Up → turn OFF "Confirm email" for instant testing. */
import { createClient, type SupabaseClient, type User as SupaUser } from "@supabase/supabase-js";
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

/* ---------- auth ---------- */

export async function cloudSignUp(email: string, password: string): Promise<{
  user: SupaUser | null; hasSession: boolean; needsConfirmation: boolean; error: string | null;
}> {
  const sb = getClient();
  if (!sb) return { user: null, hasSession: false, needsConfirmation: false, error: "Cloud saving is not configured." };
  const { data, error } = await sb.auth.signUp({ email: email.toLowerCase().trim(), password });
  if (error) return { user: null, hasSession: false, needsConfirmation: false, error: friendlyAuthError(error.message) };
  return { user: data.user, hasSession: !!data.session, needsConfirmation: !data.session, error: null };
}

export async function cloudSignIn(email: string, password: string): Promise<{
  user: SupaUser | null; error: string | null;
}> {
  const sb = getClient();
  if (!sb) return { user: null, error: "Cloud saving is not configured." };
  const { data, error } = await sb.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
  if (error) return { user: null, error: friendlyAuthError(error.message) };
  return { user: data.user, error: null };
}

export async function cloudSignOut() {
  try { await getClient()?.auth.signOut(); } catch {}
}

export async function cloudSessionUser(): Promise<SupaUser | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

function friendlyAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Wrong email or password.";
  if (/user already registered/i.test(msg)) return "That email already has an account — sign in instead.";
  if (/password/i.test(msg) && /short|length|characters/i.test(msg)) return "Password needs at least 6 characters.";
  if (/email.*confirm/i.test(msg)) return "Check your inbox to confirm your email, then sign in.";
  return msg || "Something went wrong signing you in.";
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
