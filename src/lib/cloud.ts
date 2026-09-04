"use client";
/* Cloud persistence (Supabase Postgres).
   - Works with ZERO config: when env vars are absent everything stays local.
   - Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel env)
     and run supabase/schema.sql once: logins + pages then roam across devices.
   Demo-stage trust model: rows are keyed by email as claimed at sign-in.
   Before real launch, add Supabase Auth (magic link) + RLS owner policies. */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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

export interface RemoteState {
  email: string;
  username: string;
  artists: Artist[];
  updatedAt: string;
}

export async function loadRemote(email: string): Promise<RemoteState | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("email, username, data, updated_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return {
    email: data.email,
    username: data.username,
    artists: (data.data as { artists?: Artist[] })?.artists ?? [],
    updatedAt: data.updated_at,
  };
}

export async function saveRemote(email: string, username: string, artists: Artist[]) {
  const sb = getClient();
  if (!sb) return false;
  const { error } = await sb.from("profiles").upsert(
    {
      email: email.toLowerCase(),
      username,
      data: { artists },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
  return !error;
}
