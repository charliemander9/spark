// Supabase client. If env vars aren't set yet, this is null and the app
// falls back to local-only behavior (mock data, in-memory state).
//
// Set up:
//   1. Create a project at supabase.com
//   2. Settings → API → copy "Project URL" and "anon public key"
//   3. Add to Vercel env vars (Settings → Environment Variables):
//        NEXT_PUBLIC_SUPABASE_URL
//        NEXT_PUBLIC_SUPABASE_ANON_KEY
//   4. Run the SQL in db/schema.sql in your Supabase SQL editor.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate the URL so a malformed env var degrades to local mode instead of
// crashing the build during static-page generation.
function looksLikeUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const configured = looksLikeUrl(url) && !!anonKey;

if (!configured && typeof window !== 'undefined') {
  if (url || anonKey) {
    // Only log on the client — and only if the user actually set something.
    // eslint-disable-next-line no-console
    console.warn(
      '[GM] Supabase env vars look wrong. Expected URL like ' +
        'https://xxxx.supabase.co and a separate anon key. Running in local mode.',
    );
  }
}

export const supabase: SupabaseClient | null = configured
  ? createClient(url!, anonKey!)
  : null;

export const hasSupabase = !!supabase;

// Database types — kept in sync with db/schema.sql
export interface ProfileRow {
  id: string;             // matches auth.users.id
  email: string | null;   // null for anonymous users
  name: string;
  bio: string | null;
  created_at: string;
  day: number;
  streak: number;
  freezes: number;
  preset: string;
  tone: 'feather' | 'balanced' | 'rock';
  privacy: 'private' | 'friends' | 'open';
  onboarded: boolean;
  invite_code: string;
}

export interface DailyEntryRow {
  id: string;
  user_id: string;
  entry_date: string;      // YYYY-MM-DD
  type: 'photo' | 'journal';
  body: string | null;
  photo_urls: string[];    // for now, gradient strings as placeholders
  created_at: string;
}

export interface FriendshipRow {
  id: string;
  user_a: string;          // user with smaller uuid
  user_b: string;
  created_at: string;
}

export interface NudgeRow {
  id: string;
  from_user: string;
  to_user: string;
  message: string;
  read: boolean;
  created_at: string;
}
