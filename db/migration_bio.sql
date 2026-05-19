-- ============================================================
-- Migration: add bio column to profiles
-- Paste into Supabase SQL Editor → Run.
-- Safe to re-run.
-- ============================================================
alter table public.profiles
  add column if not exists bio text;
