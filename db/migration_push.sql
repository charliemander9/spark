-- ============================================================
-- Migration: push_subscriptions for web-push notifications
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
-- ============================================================

create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now() not null
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- A user can see + manage only their own device subscriptions.
drop policy if exists "push_sub_select_own" on public.push_subscriptions;
create policy "push_sub_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "push_sub_insert_own" on public.push_subscriptions;
create policy "push_sub_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "push_sub_update_own" on public.push_subscriptions;
create policy "push_sub_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists "push_sub_delete_own" on public.push_subscriptions;
create policy "push_sub_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
