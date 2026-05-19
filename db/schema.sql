-- ============================================================
-- Spark database schema
-- Paste this into the Supabase SQL Editor (Database → SQL Editor → New query)
-- Safe to re-run — idempotent.
-- ============================================================

-- 1. TABLES ---------------------------------------------------
-- All tables first, then policies. RLS rules below reference these
-- across each other, so they all need to exist before policies are defined.

create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  email        text not null,
  name         text not null,
  created_at   timestamptz default now() not null,

  -- Challenge state
  day          int  default 1  not null,
  streak       int  default 0  not null,
  freezes      int  default 2  not null,
  preset       text default '75-hard-lite' not null,
  tone         text default 'balanced' not null check (tone in ('feather','balanced','rock')),
  privacy      text default 'friends'  not null check (privacy in ('private','friends','open')),

  -- 6-character invite code for adding friends
  invite_code  text default upper(substr(md5(random()::text), 1, 6)) not null unique
);

create table if not exists public.friendships (
  id          uuid default gen_random_uuid() primary key,
  user_a      uuid references public.profiles on delete cascade not null,
  user_b      uuid references public.profiles on delete cascade not null,
  created_at  timestamptz default now() not null,
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.daily_entries (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  entry_date  date not null,
  type        text not null check (type in ('photo','journal')),
  body        text,
  photo_urls  text[] default '{}' not null,
  created_at  timestamptz default now() not null,
  unique (user_id, entry_date)
);

create table if not exists public.nudges (
  id          uuid default gen_random_uuid() primary key,
  from_user   uuid references public.profiles on delete cascade not null,
  to_user     uuid references public.profiles on delete cascade not null,
  message     text not null,
  read        boolean default false not null,
  created_at  timestamptz default now() not null
);


-- 2. ENABLE ROW-LEVEL SECURITY -------------------------------

alter table public.profiles      enable row level security;
alter table public.friendships   enable row level security;
alter table public.daily_entries enable row level security;
alter table public.nudges        enable row level security;


-- 3. POLICIES -------------------------------------------------
-- DROP first, then CREATE — makes the file safe to re-run.

-- profiles
drop policy if exists "profiles_select_own_and_friends" on public.profiles;
create policy "profiles_select_own_and_friends" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.friendships f
      where (f.user_a = auth.uid() and f.user_b = profiles.id)
         or (f.user_b = auth.uid() and f.user_a = profiles.id)
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- friendships
drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own" on public.friendships
  for select using (auth.uid() in (user_a, user_b));

drop policy if exists "friendships_insert_own" on public.friendships;
create policy "friendships_insert_own" on public.friendships
  for insert with check (auth.uid() in (user_a, user_b));

drop policy if exists "friendships_delete_own" on public.friendships;
create policy "friendships_delete_own" on public.friendships
  for delete using (auth.uid() in (user_a, user_b));

-- daily_entries
drop policy if exists "entries_select_own_and_friends" on public.daily_entries;
create policy "entries_select_own_and_friends" on public.daily_entries
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.friendships f
      where (f.user_a = auth.uid() and f.user_b = daily_entries.user_id)
         or (f.user_b = auth.uid() and f.user_a = daily_entries.user_id)
    )
  );

drop policy if exists "entries_insert_own" on public.daily_entries;
create policy "entries_insert_own" on public.daily_entries
  for insert with check (auth.uid() = user_id);

-- nudges
drop policy if exists "nudges_select_own" on public.nudges;
create policy "nudges_select_own" on public.nudges
  for select using (auth.uid() in (from_user, to_user));

drop policy if exists "nudges_insert_from_self" on public.nudges;
create policy "nudges_insert_from_self" on public.nudges
  for insert with check (auth.uid() = from_user);

drop policy if exists "nudges_update_received" on public.nudges;
create policy "nudges_update_received" on public.nudges
  for update using (auth.uid() = to_user);


-- 4. AUTO-CREATE PROFILE ON SIGN-UP ---------------------------
-- When someone signs up via Supabase Auth, automatically make their profile row.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
