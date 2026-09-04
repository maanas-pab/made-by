-- made by — accounts + cloud saving (Supabase / Postgres)
-- Run once in Supabase SQL editor (or psql). Then set in Vercel + .env.local:
--   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
-- Also in Supabase dashboard: Authentication → Sign In/Up → turn OFF
-- "Confirm email" for instant testing (turn back on for real launch).

-- One row per authenticated user. NOBODY can read or write another
-- person's row: every policy requires auth.uid() = id.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  data jsonb not null default '{"artists":[]}',
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "owner read" on profiles;
create policy "owner read" on profiles
  for select using (auth.uid() = id);

drop policy if exists "owner insert" on profiles;
create policy "owner insert" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "owner update" on profiles;
create policy "owner update" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
