-- UNCFLIX — account data
-- Run this in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Continue watching (the only thing synced for now; watchlist + recently
-- viewed stay in localStorage until later).
--
-- The unique constraint is what makes sync an upsert: writing progress for a
-- title the user already has updates that row instead of piling up
-- duplicates, so a device that has been offline can replay its writes safely.
-- ---------------------------------------------------------------------------
create table if not exists public.continue_watching (
  id            bigint generated always as identity primary key,
  user_id       uuid    not null references auth.users (id) on delete cascade,
  media_type    text    not null check (media_type in ('movie', 'tv')),
  media_id      integer not null,
  title         text    not null default '',
  poster_path   text,
  backdrop_path text,
  progress      integer not null default 0 check (progress between 0 and 100),
  season        integer,
  episode       integer,
  updated_at    timestamptz not null default now(),
  unique (user_id, media_type, media_id)
);

-- "Continue watching" is always read newest-first, scoped to one user.
create index if not exists continue_watching_user_recent_idx
  on public.continue_watching (user_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Row level security.
--
-- This is the whole security model: the publishable key ships in the browser
-- and is public, so every statement below must filter on auth.uid(). Without
-- RLS enabled, any visitor could read everyone's viewing history by calling
-- the REST API directly.
-- ---------------------------------------------------------------------------
alter table public.continue_watching enable row level security;

drop policy if exists "read own continue watching" on public.continue_watching;
create policy "read own continue watching"
  on public.continue_watching for select
  using (auth.uid() = user_id);

drop policy if exists "insert own continue watching" on public.continue_watching;
create policy "insert own continue watching"
  on public.continue_watching for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own continue watching" on public.continue_watching;
create policy "update own continue watching"
  on public.continue_watching for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own continue watching" on public.continue_watching;
create policy "delete own continue watching"
  on public.continue_watching for delete
  using (auth.uid() = user_id);
