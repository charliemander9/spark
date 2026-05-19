// Nudges — send + receive between friends.

import { supabase } from './supabase';

export interface IncomingNudge {
  id: string;
  fromUserId: string;
  fromName: string;
  message: string;
  createdAt: string;
}

export async function sendNudge(
  toUserId: string,
  message: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase.from('nudges').insert({
    from_user: user.id,
    to_user: toUserId,
    message,
  });
  return error ? { error: error.message } : {};
}

export async function getUnreadNudges(): Promise<IncomingNudge[]> {
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('nudges')
    .select('id, from_user, message, created_at')
    .eq('to_user', user.id)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) return [];

  const senderIds = Array.from(new Set(data.map((n: any) => n.from_user)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', senderIds);

  const nameById = new Map(
    (profiles ?? []).map((p: any) => [p.id, p.name as string]),
  );

  return data.map((n: any) => ({
    id: n.id,
    fromUserId: n.from_user,
    fromName: nameById.get(n.from_user) ?? 'Someone',
    message: n.message,
    createdAt: n.created_at,
  }));
}

export async function markNudgesRead(ids: string[]): Promise<void> {
  if (!supabase || ids.length === 0) return;
  await supabase.from('nudges').update({ read: true }).in('id', ids);
}
