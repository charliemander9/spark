// Profile load + update helpers.

import { supabase, type ProfileRow } from './supabase';

export async function loadProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return (data as ProfileRow | null) ?? null;
}

export async function updateProfile(
  patch: Partial<ProfileRow>,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', user.id);
  return error ? { error: error.message } : {};
}
