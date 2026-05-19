// Friend management — invite code lookup, add friend, list friends.

import { supabase, type ProfileRow, type FriendshipRow } from './supabase';

export async function getMyInviteCode(): Promise<string | null> {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('id', user.id)
    .single();
  return data?.invite_code ?? null;
}

export interface FriendSummary {
  id: string;
  name: string;
  invite_code: string;
  day: number;
  streak: number;
  todayEntry: { type: 'photo' | 'journal'; body: string | null } | null;
}

export async function addFriendByCode(
  code: string,
): Promise<{ friend?: ProfileRow; error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };

  const cleaned = code.trim().toUpperCase();
  if (cleaned.length !== 6) return { error: 'Code should be 6 characters' };

  // Look up profile by code
  const { data: friend, error: lookupErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('invite_code', cleaned)
    .maybeSingle();

  if (lookupErr) return { error: lookupErr.message };
  if (!friend) return { error: 'No one with that code' };

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  if (user.id === friend.id) return { error: "That's your own code" };

  // Normalize ordering so user_a < user_b
  const [user_a, user_b] =
    user.id < friend.id ? [user.id, friend.id] : [friend.id, user.id];

  const { error } = await supabase
    .from('friendships')
    .insert({ user_a, user_b });

  if (error && error.code !== '23505') return { error: error.message };

  return { friend: friend as ProfileRow };
}

export async function loadFriends(): Promise<FriendSummary[]> {
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: edges } = await supabase
    .from('friendships')
    .select('user_a, user_b');
  if (!edges || edges.length === 0) return [];

  const friendIds = (edges as FriendshipRow[]).map((e) =>
    e.user_a === user.id ? e.user_b : e.user_a,
  );

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, invite_code, day, streak')
    .in('id', friendIds);

  const today = new Date().toISOString().slice(0, 10);
  const { data: entries } = await supabase
    .from('daily_entries')
    .select('user_id, type, body')
    .in('user_id', friendIds)
    .eq('entry_date', today);

  return (profiles ?? []).map((p: any) => {
    const e = (entries ?? []).find((x: any) => x.user_id === p.id);
    return {
      id: p.id,
      name: p.name,
      invite_code: p.invite_code,
      day: p.day,
      streak: p.streak,
      todayEntry: e ? { type: e.type, body: e.body } : null,
    } as FriendSummary;
  });
}
