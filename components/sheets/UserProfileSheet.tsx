'use client';

import { useEffect, useState } from 'react';
import { useUi } from '@/lib/storeActions';
import { hasSupabase } from '@/lib/supabase';
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowCounts,
} from '@/lib/friends';

/**
 * Tap-into-someone-else's profile sheet. Shows their avatar, name, bio,
 * day/streak/follower/following counts, and a Follow / Unfollow button.
 */
export function UserProfileSheet() {
  const user = useUi((s) => s.viewedUser);
  const close = useUi((s) => s.closeUserProfile);

  const [following, setFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.isDemo || !hasSupabase) {
      setFollowing(false);
      setCounts({ followers: 0, following: 0 });
      return;
    }
    isFollowing(user.id).then(setFollowing);
    getFollowCounts(user.id).then(setCounts);
  }, [user]);

  if (!user) return null;

  const handleToggle = async () => {
    if (user.isDemo) {
      // Demo users aren't in the DB — flip the local indicator and tell the
      // user it's just preview state.
      setFollowing((f) => !f);
      setTimeout(
        () => alert("Demo profiles can't be followed for real — try inviting a real friend."),
        80,
      );
      return;
    }
    setBusy(true);
    if (following) {
      await unfollowUser(user.id);
      setFollowing(false);
      setCounts((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }));
    } else {
      await followUser(user.id);
      setFollowing(true);
      setCounts((c) => ({ ...c, followers: c.followers + 1 }));
    }
    setBusy(false);
  };

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />

        <div className="ups-head">
          <div className="ups-ava">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              (user.name[0] || '?').toUpperCase()
            )}
          </div>
          <div className="ups-id">
            <div className="ups-name">{user.name}</div>
            <div className="ups-handle">
              @{user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
            </div>
          </div>
        </div>

        <div className="ups-stats">
          <div className="ups-stat">
            <span className="v">{user.day ?? 1}</span>
            <span className="l">of 75</span>
          </div>
          <div className="ups-stat">
            <span className="v">{user.streak ?? 0}</span>
            <span className="l">streak</span>
          </div>
          <div className="ups-stat">
            <span className="v">{counts.followers}</span>
            <span className="l">followers</span>
          </div>
          <div className="ups-stat">
            <span className="v">{counts.following}</span>
            <span className="l">following</span>
          </div>
        </div>

        {user.bio && (
          <p className="ups-bio">{user.bio}</p>
        )}

        <div className="ups-actions">
          <button
            className={'btn ' + (following ? 'btn-secondary' : 'btn-accent')}
            onClick={handleToggle}
            disabled={busy}
          >
            {busy ? '…' : following ? 'Following ✓' : '+ Follow'}
          </button>
          <button className="btn btn-secondary" onClick={close}>
            Close
          </button>
        </div>

        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
