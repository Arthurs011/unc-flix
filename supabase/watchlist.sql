-- Watchlist / library. Synced per account so a saved title follows the user
-- across devices. Mirrors the structure and RLS approach of ensure_schema.sql.
-- Idempotent: safe to re-run.

create table if not exists public.watchlist (
  id           bigserial primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  media_type   text not null check (media_type in ('movie', 'tv')),
  media_id     integer not null,
  title        text,
  poster_path  text,
  backdrop_path text,
  overview     text,
  created_at   timestamptz not null default now()
);

-- One entry per title per user. Also makes the sync an idempotent upsert.
create unique index if not exists watchlist_user_media_uniq
  on public.watchlist (user_id, media_type, media_id);

create index if not exists watchlist_user_created_idx
  on public.watchlist (user_id, created_at desc);

alter table public.watchlist enable row level security;

drop policy if exists "read own watchlist" on public.watchlist;
create policy "read own watchlist" on public.watchlist
  for select using (auth.uid() = user_id);

drop policy if exists "insert own watchlist" on public.watchlist;
create policy "insert own watchlist" on public.watchlist
  for insert with check (auth.uid() = user_id);

-- Deleting a watchlist row needs the delete policy, unlike account_profiles.
drop policy if exists "delete own watchlist" on public.watchlist;
create policy "delete own watchlist" on public.watchlist
  for delete using (auth.uid() = user_id);

-- PostgREST caches the schema, so reload it after changing DDL.
notify pgrst, 'reload schema';