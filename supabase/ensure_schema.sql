-- UNCFLIX — ensure continue_watching is exactly right.
-- Paste into Supabase SQL Editor and run. Safe to re-run.
-- Fixes the "public.public.continue_watching" dotted-name case and guarantees
-- columns, upsert index, RLS and policies all exist.

-- 0. Report what exists right now (check the output/notice)
select n.nspname || '.' || c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r' and c.relname ilike '%continue%';

-- 1. Repair a table created with a literal dot in its name
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'public.continue_watching'
  ) then
    execute 'alter table public."public.continue_watching" rename to continue_watching';
    raise notice 'renamed dotted table -> public.continue_watching';
  else
    raise notice 'no dotted table found - nothing to rename';
  end if;
end $$;

-- 2. Make sure every column the app writes exists
alter table public.continue_watching
  add column if not exists user_id       uuid references auth.users (id) on delete cascade,
  add column if not exists media_type    text,
  add column if not exists media_id      integer,
  add column if not exists title         text not null default '',
  add column if not exists poster_path   text,
  add column if not exists backdrop_path text,
  add column if not exists progress      integer not null default 0,
  add column if not exists season        integer,
  add column if not exists episode       integer,
  add column if not exists updated_at    timestamptz not null default now();

-- 3. user_id is required (needs an empty table, which this is)
alter table public.continue_watching alter column user_id set not null;

-- 4. Unique index is what makes sync an upsert instead of duplicate rows
create unique index if not exists continue_watching_user_media_uniq
  on public.continue_watching (user_id, media_type, media_id);

create index if not exists continue_watching_user_recent_idx
  on public.continue_watching (user_id, updated_at desc);

-- 5. Data hygiene constraints
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'continue_watching_media_type_check') then
    alter table public.continue_watching
      add constraint continue_watching_media_type_check
      check (media_type in ('movie', 'tv'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'continue_watching_progress_check') then
    alter table public.continue_watching
      add constraint continue_watching_progress_check
      check (progress between 0 and 100);
  end if;
end $$;

-- 6. Row level security - the entire security model, since the publishable
--    key is public by design. Every policy must filter on auth.uid().
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

-- 7. Make PostgREST re-read the schema
notify pgrst, 'reload schema';
