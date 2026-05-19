// Daily-entry persistence to Supabase.

import { supabase } from './supabase';

export async function saveDailyEntryToDb(
  type: 'photo' | 'journal',
  body: string | null,
  photoUrls: string[] = [],
): Promise<{ error?: string }> {
  if (!supabase) return {}; // local mode — silently succeed
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from('daily_entries').upsert(
    {
      user_id: user.id,
      entry_date: today,
      type,
      body,
      photo_urls: photoUrls,
    },
    { onConflict: 'user_id,entry_date' },
  );

  return error ? { error: error.message } : {};
}

// Read whether the signed-in user has already posted today's entry. Used to
// rehydrate the dailyEntry flag on app load so they stay unlocked.
export async function fetchTodayEntry(
  userId: string,
): Promise<{ type: 'photo' | 'journal'; body: string | null; photo_urls: string[] } | null> {
  if (!supabase) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('daily_entries')
    .select('type, body, photo_urls')
    .eq('user_id', userId)
    .eq('entry_date', today)
    .maybeSingle();
  return (data as any) ?? null;
}
