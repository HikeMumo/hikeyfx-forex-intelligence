-- HIKEYFX public-user foundation for Supabase.
-- Run in Supabase SQL Editor after creating the project.
-- Never disable RLS and never expose the service_role key in browser code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_pair text not null default 'EUR/USD',
  preferred_timeframe text not null default '15min'
    check (preferred_timeframe in ('15min','1h','4h')),
  sound_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now(),
  unique(user_id, symbol)
);

create table if not exists public.signal_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null default 'EUR/USD',
  timeframe text not null check (timeframe in ('15min','1h','4h')),
  direction text not null check (direction in ('BUY','SELL','WAIT')),
  confluence_score integer,
  entry_price numeric(14,7),
  stop_loss numeric(14,7),
  take_profit numeric(14,7),
  rationale text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_hikeyfx_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_hikeyfx_auth_user_created on auth.users;
create trigger on_hikeyfx_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_hikeyfx_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.watchlist enable row level security;
alter table public.signal_journal enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users manage own preferences" on public.user_preferences;
create policy "Users manage own preferences" on public.user_preferences
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own watchlist" on public.watchlist;
create policy "Users manage own watchlist" on public.watchlist
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users read own signal journal" on public.signal_journal;
create policy "Users read own signal journal" on public.signal_journal
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users add own signal journal" on public.signal_journal;
create policy "Users add own signal journal" on public.signal_journal
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own signal journal" on public.signal_journal;
create policy "Users delete own signal journal" on public.signal_journal
  for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.watchlist to authenticated;
grant select, insert, delete on public.signal_journal to authenticated;
