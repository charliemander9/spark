-- ============================================================
-- Migration: avatar_url column + storage buckets for avatars & entries
-- Paste into Supabase SQL Editor → Run. Safe to re-run.
-- ============================================================

-- 1. profiles.avatar_url for persistent profile photos
alter table public.profiles
  add column if not exists avatar_url text;

-- 2. Storage buckets — these need to exist BEFORE we add policies.
--    If your project doesn't already have them, the dashboard step below
--    creates them. The inserts below are idempotent.
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('entries', 'entries', true)
  on conflict (id) do update set public = true;

-- 3. Policies — users can write to their own folder. Files are publicly
--    readable so other devices/friends can see them. Folder = auth.uid().
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_user_write" on storage.objects;
create policy "avatars_user_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "entries_public_read" on storage.objects;
create policy "entries_public_read" on storage.objects
  for select using (bucket_id = 'entries');

drop policy if exists "entries_user_write" on storage.objects;
create policy "entries_user_write" on storage.objects
  for insert with check (
    bucket_id = 'entries'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "entries_user_update" on storage.objects;
create policy "entries_user_update" on storage.objects
  for update using (
    bucket_id = 'entries'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
