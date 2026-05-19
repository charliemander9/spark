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
