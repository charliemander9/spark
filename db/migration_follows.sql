-- ============================================================
-- Migration: asymmetric follows (Instagram/TikTok style)
-- Adds public.follows alongside the existing public.friendships table.
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
-- ============================================================

create table if not exists public.follows (
  follower_id  uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at   timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

-- Anyone signed in can read follow rows (so we can count followers/following)
drop policy if exists "follows_select_authenticated" on public.follows;
create policy "follows_select_authenticated" on public.follows
  for select using (auth.role() = 'authenticated');

-- Only you can follow on your behalf
drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows
  for insert with check (auth.uid() = follower_id);

-- Only you can unfollow
drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = follower_id);

-- Backfill: turn each existing symmetric friendship into two follows so the
-- new model lights up immediately for current users.
insert into public.follows (follower_id, following_id)
  select user_a, user_b from public.friendships
  on conflict do nothing;

insert into public.follows (follower_id, following_id)
  select user_b, user_a from public.friendships
  on conflict do nothing;
