'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { hasSupabase, supabase } from '@/lib/supabase';
import { loadFriends, type FriendSummary } from '@/lib/friends';
import { getUnreadNudges, markNudgesRead, sendNudge, type IncomingNudge } from '@/lib/nudges';
import { DEMO_FRIENDS } from '@/lib/data';

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const demoMode = useSpark((s) => s.demoMode);

  const [realFriends, setRealFriends] = useState<FriendSummary[]>([]);
  const [nudges, setNudges] = useState<IncomingNudge[]>([]);
  const [loading, setLoading] = useState(hasSupabase);
  const [confirm, setConfirm] = useState<{ friendId: string; name: string } | null>(null);

  const friends: FriendSummary[] = demoMode
    ? [...realFriends, ...DEMO_FRIENDS.map((d) => ({
        id: d.id, name: d.name, invite_code: '',
        day: d.day, streak: d.streak, todayEntry: d.todayEntry,
      } as FriendSummary))]
    : realFriends;

  const refresh = async () => {
    const [list, incoming] = await Promise.all([loadFriends(), getUnreadNudges()]);
    setRealFriends(list);
    setNudges(incoming);
    setLoading(false);
  };

  useEffect(() => {
    if (!hasSupabase) { setLoading(false); return; }
    refresh();
  }, []);

  // Real-time subscriptions — refresh when a new nudge arrives or a friend posts
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const channel = supabase
      .channel('friends-tab')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nudges' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_entries' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships' }, () => refresh())
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const dismissNudges = async () => {
    const ids = nudges.map((n) => n.id);
    setNudges([]);
    await markNudgesRead(ids);
  };

  const sendCheer = async () => {
    if (!confirm) return;
    // Demo friends aren't in the DB — pretend the cheer went out
    if (confirm.friendId.startsWith('demo-')) {
      setConfirm(null);
      setTimeout(() => alert('Sent.'), 80);
      return;
    }
    const { error } = await sendNudge(confirm.friendId, 'Cheering you on today 🔥');
    setConfirm(null);
    if (error) setTimeout(() => alert(error), 80);
    else setTimeout(() => alert('Sent.'), 80);
  };

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

      {nudges.length > 0 && (
        <div className="nudge-banner">
          <div className="nb-body">
            <b>
              {nudges.length === 1
                ? `${nudges[0].fromName} sent you a nudge`
                : `${nudges.length} new nudges`}
            </b>
            <em style={{ fontStyle: 'italic' }}>"{nudges[0].message}"</em>
            <small>tap to dismiss</small>
          </div>
          <button onClick={dismissNudges}>Got it</button>
        </div>
      )}

      {loading && !demoMode && friends.length === 0 ? (
        <div className="empty-tab"><div className="icon">⏳</div><p>Loading friends…</p></div>
      ) : friends.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">🫂</div>
          <h3>Add your circle</h3>
          <p>
            Share your invite code with someone, or enter their code, and their
            daily check-ins will show up here.
          </p>
          <button className="empty-cta" onClick={openInviteSheet}>
            Invite or add a friend
          </button>
        </div>
      ) : (
        <>
          <div className="section-label">Buddies — tap to cheer</div>
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
                  <div className={'buddy-ava sage' + (f.todayEntry ? ' has-gratitude' : '')}>
                    {(f.name[0] || '?').toUpperCase()}
                  </div>
                  <button
                    className="nudge-dot"
                    onClick={() => setConfirm({ friendId: f.id, name: f.name })}
                  >
                    <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor">
                      <path d="M13 2l-9 12h7l-1 8 9-12h-7z" />
                    </svg>
                  </button>
                </div>
                <span className="name">{f.name}</span>
                <span className="streak-mini">
                  <span>🔥</span>
                  <span className="mono">{f.streak}d</span>
                </span>
              </div>
            ))}
            <div className="buddy" onClick={openInviteSheet}>
              <div className="buddy-ava-wrap"><div className="buddy-ava add">+</div></div>
              <span className="name">Add</span>
            </div>
          </div>

          <div className="section-label">Today</div>
          {friends.filter((f) => f.todayEntry).length === 0 ? (
            <div className="empty-tab"><p>No check-ins from your friends today yet.</p></div>
          ) : (
            friends.filter((f) => f.todayEntry).map((f) => (
              <div key={f.id} className="fpost">
                <div className="fpost-head">
                  <div className="fpost-id">
                    <div className="ava">{(f.name[0] || '?').toUpperCase()}</div>
                    <div>
                      <div className="name">{f.name}</div>
                      <div className="sub">
                        Day {f.day} ·{' '}
                        <span className="streak-chip">🔥 <span className="mono">{f.streak}d</span></span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="fpost-nudge"
                    onClick={() => setConfirm({ friendId: f.id, name: f.name })}
                  >
                    Cheer
                  </button>
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

      {confirm && (
        <div className="modal-bd open" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><em>Send {confirm.name} a cheer</em></h3>
            <p>A small "I see you doing this — keep going" note?</p>
            <div className="row">
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Not now</button>
              <button className="btn btn-accent" onClick={sendCheer}>Yes, send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
