-- ============================================================
-- Migration: allow anonymous users (no email) to sign up
-- Paste into Supabase SQL Editor → Run
-- ============================================================

-- 1. Allow profiles.email to be NULL
alter table public.profiles alter column email drop not null;

-- 2. Update the trigger so it picks a sensible default name when there's no email
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
