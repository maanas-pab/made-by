-- made by — cloud persistence (Supabase / Postgres)
-- Run once in Supabase SQL editor (or psql). Then set in Vercel:
--   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

create table if not exists profiles (
  email text primary key,
  username text not null,
  data jsonb not null default '{"artists":[]}',
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Demo-stage open policies (anyone can read/write by email key).
-- Before real launch: switch to Supabase Auth + auth.uid() owner policies.
drop policy if exists "open read" on profiles;
create policy "open read" on profiles for select using (true);

drop policy if exists "open write" on profiles;
create policy "open write" on profiles for insert with check (true);

drop policy if exists "open update" on profiles;
create policy "open update" on profiles for update using (true) with check (true);
