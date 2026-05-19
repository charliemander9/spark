-- ============================================================
-- Migration: anonymous users + onboarded flag
-- Paste into Supabase SQL Editor → Run.
-- Safe to re-run.
-- ============================================================

-- 1. Allow profiles.email to be NULL (anon users have no email)
alter table public.profiles alter column email drop not null;

-- 2. Add onboarded flag so we can tell new users from returning ones
alter table public.profiles
  add column if not exists onboarded boolean default false not null;

-- 3. Mark every existing user as already onboarded so they don't get bounced
-- back into the welcome flow.
update public.profiles set onboarded = true where onboarded = false;

-- 4. Update the auto-create-profile trigger so it handles anon users (no email)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email,''), '@', 1), ''),
      'Friend'
    )
  );
  return new;
end;
$$ language plpgsql security definer;
