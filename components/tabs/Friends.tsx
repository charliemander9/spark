'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { hasSupabase } from '@/lib/supabase';
import { loadFriends, type FriendSummary } from '@/lib/friends';

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const setScreen = useSpark((s) => s.setScreen);

  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loading, setLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    loadFriends().then((list) => {
      if (alive) {
        setFriends(list);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button className="iconbtn" onClick={openInviteSheet} title="Invite a friend">
            <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.6}>
              <line x1={12} y1={5} x2={12} y2={19} strokeLinecap="round" />
              <line x1={5} y1={12} x2={19} y2={12} strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="friends-head">
        <div className="date">Your Circle</div>
        <h1>Friends</h1>
      </div>

      {loading ? (
        <div className="empty-tab">
          <div className="icon">⏳</div>
          <p>Loading friends…</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">🫂</div>
          <h3>Add your circle</h3>
          <p>
            Share your invite code with someone, or enter their code, and
            their daily check-ins will show up here.
          </p>
          <button className="empty-cta" onClick={openInviteSheet}>
            Invite or add a friend
          </button>
        </div>
      ) : (
        <>
          <div className="section-label">Buddies</div>
          <div className="buddies-row">
            {friends.map((f) => (
              <div
                key={f.id}
                className={'buddy' + (f.todayEntry ? ' has-note' : ' no-gratitude')}
              >
                {f.todayEntry && (
                  <div className="gratitude-note">
                    {f.todayEntry.type === 'journal'
                      ? f.todayEntry.body
                      : '📷 Photo today'}
                  </div>
                )}
                <div className="buddy-ava-wrap">
                  <div
                    className={'buddy-ava sage' + (f.todayEntry ? ' has-gratitude' : '')}
                  >
                    {(f.name[0] || '?').toUpperCase()}
                  </div>
                </div>
                <span className="name">{f.name}</span>
                <span className="streak-mini">
                  <span>🔥</span>
                  <span className="mono">{f.streak}d</span>
                </span>
              </div>
            ))}
            <div className="buddy" onClick={openInviteSheet}>
              <div className="buddy-ava-wrap">
                <div className="buddy-ava add">+</div>
              </div>
              <span className="name">Add</span>
            </div>
          </div>

          <div className="section-label">Today</div>
          {friends.filter((f) => f.todayEntry).length === 0 ? (
            <div className="empty-tab">
              <p>No check-ins from your friends today yet.</p>
            </div>
          ) : (
            friends
              .filter((f) => f.todayEntry)
              .map((f) => (
                <div key={f.id} className="fpost">
                  <div className="fpost-head">
                    <div className="fpost-id">
                      <div className="ava">{(f.name[0] || '?').toUpperCase()}</div>
                      <div>
                        <div className="name">{f.name}</div>
                        <div className="sub">
                          Day {f.day} ·{' '}
                          <span className="streak-chip">
                            🔥 <span className="mono">{f.streak}d</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {f.todayEntry!.type === 'journal' ? (
                    <div className="fpost-reflection">
                      <div className="chip">Today</div>
                      <div className="body">{f.todayEntry!.body}</div>
                    </div>
                  ) : (
                    <div className="fpost-frame">
                      <div
                        className="fpost-photo"
                        style={{ backgroundImage: 'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)' }}
                      >
                        <div className="fpost-chip">Today</div>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </>
      )}
    </>
  );
}
