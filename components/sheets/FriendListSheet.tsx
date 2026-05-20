'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { hasSupabase } from '@/lib/supabase';
import { loadFollowing, loadFollowers, type FriendSummary } from '@/lib/friends';
import { DEMO_FRIENDS } from '@/lib/data';

const TITLES: Record<string, string> = {
  following: 'Following',
  followers: 'Followers',
  nudges: 'Nudges',
};

const SUBTITLES: Record<string, string> = {
  following: 'People you follow',
  followers: 'People who follow you',
  nudges: 'Friends you can cheer or nudge',
};

export function FriendListSheet() {
  const mode = useUi((s) => s.friendListMode);
  const close = useUi((s) => s.closeFriendList);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const openUserProfile = useUi((s) => s.openUserProfile);
  const demoMode = useSpark((s) => s.demoMode);

  const [realFriends, setRealFriends] = useState<FriendSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mode || !hasSupabase) return;
    setLoading(true);
    const loader =
      mode === 'followers'
        ? loadFollowers
        : loadFollowing;
    loader().then((list) => {
      setRealFriends(list);
      setLoading(false);
    });
  }, [mode]);

  if (!mode) return null;

  // Demo friends only show in the list when demo mode is explicitly on.
  const friends: FriendSummary[] = demoMode
    ? [
        ...realFriends,
        ...DEMO_FRIENDS.map(
          (d) =>
            ({
              id: d.id,
              name: d.name,
              invite_code: '',
              day: d.day,
              streak: d.streak,
              todayEntry: d.todayEntry,
            } as FriendSummary),
        ),
      ]
    : realFriends;

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2>
          <em>{TITLES[mode]}</em>
        </h2>
        <p
          style={{
            padding: '0 22px 12px',
            fontFamily: "'Fraunces',serif",
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--ink-3)',
          }}
        >
          {SUBTITLES[mode]}
        </p>

        {loading ? (
          <div className="empty-tab">
            <div className="icon">⏳</div>
            <p>Loading…</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="empty-tab">
            <div className="icon">🫂</div>
            <h3>No one here yet</h3>
            <p>Invite a friend to start your circle.</p>
            <button
              className="empty-cta"
              onClick={() => {
                close();
                openInviteSheet();
              }}
            >
              Invite a friend
            </button>
          </div>
        ) : (
          <div className="friend-list">
            {friends.map((f) => (
              <button
                key={f.id}
                className="friend-row"
                onClick={() => {
                  close();
                  openUserProfile({
                    id: f.id,
                    name: f.name,
                    bio: f.bio,
                    avatarUrl: f.avatarUrl,
                    day: f.day,
                    streak: f.streak,
                    isDemo: f.id.startsWith('demo-'),
                  });
                }}
              >
                <div className="fr-ava">{(f.name[0] || '?').toUpperCase()}</div>
                <div className="fr-body">
                  <div className="fr-name">{f.name}</div>
                  <div className="fr-sub">
                    Day {f.day} ·{' '}
                    <span className="streak-chip">
                      🔥 <span className="mono">{f.streak}d</span>
                    </span>
                  </div>
                </div>
                {f.todayEntry && <div className="fr-pulse" title="Posted today" />}
              </button>
            ))}
            <button
              className="friend-row friend-row-add"
              onClick={() => {
                close();
                openInviteSheet();
              }}
            >
              <div className="fr-ava add">+</div>
              <div className="fr-body">
                <div className="fr-name">Add a friend</div>
                <div className="fr-sub">Share your invite link</div>
              </div>
            </button>
          </div>
        )}
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
