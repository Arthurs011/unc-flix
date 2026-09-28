-- UNCFLIX — account area (profile + preferences).
-- Run in Supabase SQL Editor after the continue_watching script.
-- Safe to re-run.

-- 1. Table
create table if not exists public.account_profiles (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  display_name     text,
  avatar_color     text not null default '#0ea5e9',
  autoplay_next    boolean not null default true,
  autoplay_trailers boolean not null default false,
  updated_at       timestamptz not null default now()
);

-- 2. Row level security
alter table public.account_profiles enable row level security;

drop policy if exists "read own profile" on public.account_profiles;
create policy "read own profile"
  on public.account_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "insert own profile" on public.account_profiles;
create policy "insert own profile"
  on public.account_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own profile" on public.account_profiles;
create policy "update own profile"
  on public.account_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. PostgREST re-read
notify pgrst, 'reload schema';
