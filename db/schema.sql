-- ============================================================
-- Spark database schema
-- Paste this into the Supabase SQL Editor (Database → SQL Editor → New query)
-- Safe to re-run — idempotent.
-- ============================================================

-- 1. TABLES ---------------------------------------------------

create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  email        text,                       -- nullable: anonymous users have no email
  name         text not null,
  bio          text,                       -- short user-editable bio
  avatar_url   text,                       -- profile photo (Supabase Storage URL)
  created_at   timestamptz default now() not null,

  day          int  default 1  not null,
  streak       int  default 0  not null,
  freezes      int  default 2  not null,
  preset       text default '75-hard-lite' not null,
  tone         text default 'balanced' not null check (tone in ('feather','balanced','rock')),
  privacy      text default 'friends'  not null check (privacy in ('private','friends','open')),
  onboarded    boolean default false not null,

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

-- profiles: any signed-in user can SEE basic profile info (needed for
-- invite-code lookups). Sensitive stuff (entries, nudges) is locked down below.
drop policy if exists "profiles_select_own_and_friends" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- friendships: see + edit only the ones you're part of
drop policy if exists "friendships_select_own" on public.friendships;
create policy "friendships_select_own" on public.friendships
  for select using (auth.uid() in (user_a, user_b));

drop policy if exists "friendships_insert_own" on public.friendships;
create policy "friendships_insert_own" on public.friendships
  for insert with check (auth.uid() in (user_a, user_b));

drop policy if exists "friendships_delete_own" on public.friendships;
create policy "friendships_delete_own" on public.friendships
  for delete using (auth.uid() in (user_a, user_b));

-- daily_entries: see your own + friends'; write only your own
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

drop policy if exists "entries_update_own" on public.daily_entries;
create policy "entries_update_own" on public.daily_entries
  for update using (auth.uid() = user_id);

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

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,                                                -- may be NULL for anon
    coalesce(
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email,''), '@', 1), ''),
      'Friend'                                                -- fallback for anon
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
