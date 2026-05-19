// Friend management — invite code lookup, follows, friends list.

import { supabase, type ProfileRow } from './supabase';

export async function followUser(
  targetId: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };
  if (user.id === targetId) return { error: "Can't follow yourself" };

  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetId });
  if (error && error.code !== '23505') return { error: error.message };
  return {};
}

export async function unfollowUser(
  targetId: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: user.id, following_id: targetId });
  return error ? { error: error.message } : {};
}

/** True if the current user follows `targetId`. */
export async function isFollowing(targetId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
    .maybeSingle();
  return !!data;
}

/** Get follower + following counts for any user. */
export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  if (!supabase) return { followers: 0, following: 0 };
  const [followersRes, followingRes] = await Promise.all([
    supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('following_id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);
  return {
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}

/** Get the list of people the current user follows, with profile summaries. */
export async function loadFollowing(): Promise<FriendSummary[]> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: edges } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);
  if (!edges || edges.length === 0) return [];
  const ids = edges.map((e: any) => e.following_id);
  return summarize(ids);
}

/** Get the list of people who follow the current user. */
export async function loadFollowers(): Promise<FriendSummary[]> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: edges } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', user.id);
  if (!edges || edges.length === 0) return [];
  const ids = edges.map((e: any) => e.follower_id);
  return summarize(ids);
}

async function summarize(ids: string[]): Promise<FriendSummary[]> {
  if (!supabase) return [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, invite_code, day, streak, bio, avatar_url')
    .in('id', ids);
  const today = new Date().toISOString().slice(0, 10);
  const { data: entries } = await supabase
    .from('daily_entries')
    .select('user_id, type, body')
    .in('user_id', ids)
    .eq('entry_date', today);
  return (profiles ?? []).map((p: any) => {
    const e = (entries ?? []).find((x: any) => x.user_id === p.id);
    return {
      id: p.id,
      name: p.name,
      invite_code: p.invite_code,
      day: p.day,
      streak: p.streak,
      bio: p.bio ?? '',
      avatarUrl: p.avatar_url ?? null,
      todayEntry: e ? { type: e.type, body: e.body } : null,
    } as FriendSummary;
  });
}

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
  bio?: string;
  avatarUrl?: string | null;
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

  // New follow-based model: adding by code = following that user (one-way).
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: friend.id });

  if (error && error.code !== '23505') return { error: error.message };

  return { friend: friend as ProfileRow };
}

/**
 * Legacy "friends" loader — now powered by the `follows` table. Returns the
 * list of people the current user follows (which is what shows on the Friends
 * tab BeReal feed and most "your circle" views).
 */
export async function loadFriends(): Promise<FriendSummary[]> {
  return loadFollowing();
}
