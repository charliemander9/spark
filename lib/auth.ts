// Email + 6-digit-OTP sign-in. Works great on mobile PWA.

import { supabase } from './supabase';

export async function sendOtp(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return error ? { error: error.message } : {};
}

export async function verifyOtp(
  email: string,
  token: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  return error ? { error: error.message } : {};
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Anonymous sign-in — no email, no code. Creates a real Supabase user
// account that can add friends, send nudges, etc. Display name is captured
// so friends see something recognizable instead of a UUID.
export async function signInAnon(
  displayName: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return { error: error.message };
  // The profiles row is auto-created by a trigger on auth.users insert. Patch
  // in the display name so the friend list shows it.
  const userId = data.user?.id;
  if (userId && displayName.trim()) {
    await supabase
      .from('profiles')
      .update({ name: displayName.trim() })
      .eq('id', userId);
  }
  return {};
}
