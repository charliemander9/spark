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
// account that can add friends, send nudges, etc. Display name is passed via
// user_metadata so the on-signup trigger reads it directly (otherwise the
// profile row is created with the 'Friend' fallback before we can patch).
export async function signInAnon(
  displayName: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const name = displayName.trim() || 'Friend';
  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { name } },
  });
  if (error) return { error: error.message };
  // Belt-and-suspenders — also patch the profile in case the trigger races.
  const userId = data.user?.id;
  if (userId) {
    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', userId);
  }
  return {};
}
