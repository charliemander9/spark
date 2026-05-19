'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { hasSupabase, supabase } from '@/lib/supabase';
import { loadFriends, type FriendSummary } from '@/lib/friends';
import { getUnreadNudges, markNudgesRead, sendNudge, type IncomingNudge } from '@/lib/nudges';
import { DEMO_FRIENDS } from '@/lib/data';
import { Media } from '../Media';

interface FeedItem {
  id: string;
  name: string;
  initials: string;
  when: string;
  streak: number;
  day: number;
  bg: string;            // gradient or url() for the photo
  caption: string;
  isYou?: boolean;
  isVideo?: boolean;
}

// Mock photos used for demo friends so the feed isn't gradient-only.
const DEMO_BGS = [
  'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)',
  'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)',
  'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)',
  'linear-gradient(160deg,#1c2a18 0%,#3a5530 60%,#a0b08a 100%)',
];

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const openViewer = useUi((s) => s.openViewer);
  const demoMode = useSpark((s) => s.demoMode);
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);

  const [realFriends, setRealFriends] = useState<FriendSummary[]>([]);
  const [nudges, setNudges] = useState<IncomingNudge[]>([]);
  const [loading, setLoading] = useState(hasSupabase);
  const [confirm, setConfirm] = useState<{ friendId: string; name: string } | null>(null);
  // Local reactions store — postId → { fire?: bool, heart?: bool, clap?: bool }
  // (Would move to DB in a future push.)
  const [reactions, setReactions] = useState<Record<string, Record<string, boolean>>>({});
  const [cheerMessage, setCheerMessage] = useState('');

  const toggleReaction = (postId: string, kind: string) => {
    setReactions((prev) => {
      const cur = prev[postId] ?? {};
      return { ...prev, [postId]: { ...cur, [kind]: !cur[kind] } };
    });
  };

  // Always layer demo friends in for visual richness when the user doesn't have
  // their own friends yet. The toggle on Profile controls whether DEMO_DIARY is
  // injected into the user's own diary, not whether demo people show up here.
  const showDemoFriends = demoMode || realFriends.length === 0;
  const friends: FriendSummary[] = showDemoFriends
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

  const refresh = async () => {
    const [list, incoming] = await Promise.all([loadFriends(), getUnreadNudges()]);
    setRealFriends(list);
    setNudges(incoming);
    setLoading(false);
  };

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const channel = supabase
      .channel('friends-tab')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nudges' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_entries' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships' }, () => refresh())
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const dismissNudges = async () => {
    const ids = nudges.map((n) => n.id);
    setNudges([]);
    await markNudgesRead(ids);
  };

  const sendCheer = async () => {
    if (!confirm) return;
    const text = cheerMessage.trim() || 'Cheering you on today 🔥';
    if (confirm.friendId.startsWith('demo-')) {
      setConfirm(null);
      setCheerMessage('');
      setTimeout(() => alert('Sent.'), 80);
      return;
    }
    const { error } = await sendNudge(confirm.friendId, text);
    setConfirm(null);
    setCheerMessage('');
    if (error) setTimeout(() => alert(error), 80);
    else setTimeout(() => alert('Sent.'), 80);
  };

  // Build the unified feed: your own daily entry first, then each friend with an entry today.
  const feed: FeedItem[] = [];

  // Your own daily entry
  const todayEntry = diary.find((d) => d.isDaily);
  if (todayEntry) {
    feed.push({
      id: 'me-' + todayEntry.id,
      name: user.name,
      initials: (user.name[0] || '?').toUpperCase(),
      when: 'Just now',
      streak: user.streak,
      day: user.day,
      bg: todayEntry.bg || DEMO_BGS[0],
      caption: todayEntry.body || (todayEntry.type === 'reflection' ? '' : 'Today.'),
      isYou: true,
      isVideo: todayEntry.type === 'video',
    });
  }

  friends.forEach((f, i) => {
    if (!f.todayEntry) return;
    const demoVideo =
      f.id.startsWith('demo-') &&
      Boolean((f.todayEntry as any).isVideo);
    feed.push({
      id: f.id,
      name: f.name,
      initials: (f.name[0] || '?').toUpperCase(),
      when: 'Today',
      streak: f.streak,
      day: f.day,
      bg: DEMO_BGS[i % DEMO_BGS.length],
      caption:
        f.todayEntry.body
          ? f.todayEntry.body
          : demoVideo
          ? 'Posted a video.'
          : 'Posted a photo.',
      isVideo: demoVideo,
    });
  });

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
        <h1>Today</h1>
      </div>

      {/* Always-visible add-a-friend CTA */}
      <button className="add-friend-cta" onClick={openInviteSheet}>
        <span className="afc-plus">+</span>
        <span className="afc-label">Add a friend</span>
      </button>

      {nudges.length > 0 && (
        <div className="nudge-banner">
          <div className="nb-body">
            <b>
              {nudges.length === 1
                ? `${nudges[0].fromName} sent you a nudge`
                : `${nudges.length} new nudges`}
            </b>
            <em style={{ fontStyle: 'italic' }}>&quot;{nudges[0].message}&quot;</em>
            <small>tap to dismiss</small>
          </div>
          <button onClick={dismissNudges}>Got it</button>
        </div>
      )}

      {/* Buddies strip — quick cheer access */}
      {friends.length > 0 && (
        <div className="buddies-row">
          {friends.map((f) => (
            <div
              key={f.id}
              className={'buddy' + (f.todayEntry ? ' has-note' : ' no-gratitude')}
            >
              <div className="buddy-ava-wrap">
                <div className={'buddy-ava sage' + (f.todayEntry ? ' has-gratitude' : '')}>
                  {(f.name[0] || '?').toUpperCase()}
                </div>
                {f.todayEntry && (
                  <button
                    className="nudge-dot"
                    onClick={() => setConfirm({ friendId: f.id, name: f.name })}
                  >
                    <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor">
                      <path d="M13 2l-9 12h7l-1 8 9-12h-7z" />
                    </svg>
                  </button>
                )}
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
      )}

      {loading && !demoMode && feed.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">⏳</div>
          <p>Loading…</p>
        </div>
      ) : feed.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">📷</div>
          <h3>No one has posted yet</h3>
          <p>
            When you and your friends drop your daily snap, it shows up here. Add
            someone to get started.
          </p>
          <button className="empty-cta" onClick={openInviteSheet}>
            Invite or add a friend
          </button>
        </div>
      ) : (
        <div className="bereal-feed">
          {feed.map((p) => (
            <article key={p.id} className="bereal-post">
              <header className="bp-head">
                <div className="bp-ava">{p.initials}</div>
                <div className="bp-id">
                  <div className="bp-name">
                    {p.name}
                    {p.isYou && <span className="bp-you">you</span>}
                  </div>
                  <div className="bp-sub">
                    Day {p.day} ·{' '}
                    <span className="streak-chip">
                      🔥 <span className="mono">{p.streak}d</span>
                    </span>{' '}
                    · {p.when}
                  </div>
                </div>
                {!p.isYou && (
                  <button
                    className="fpost-nudge"
                    onClick={() => setConfirm({ friendId: p.id, name: p.name })}
                  >
                    Cheer
                  </button>
                )}
              </header>

              <div
                onClick={() =>
                  openViewer({
                    authorName: p.name,
                    authorInitials: p.initials,
                    when: p.when,
                    bg: p.bg,
                    isVideo: p.isVideo,
                    body: p.caption,
                    day: p.day,
                    streak: p.streak,
                  })
                }
                style={{ cursor: 'pointer' }}
              >
                <BPPhoto bg={p.bg} isVideo={p.isVideo} />
              </div>

              {p.caption && (
                <div className="bp-caption">
                  <b>{p.name.toLowerCase()}</b> {p.caption}
                </div>
              )}

              <div className="bp-reactions">
                {(['fire', 'heart', 'clap'] as const).map((kind) => {
                  const active = reactions[p.id]?.[kind];
                  const emoji =
                    kind === 'fire' ? '🔥' : kind === 'heart' ? '❤️' : '👏';
                  // Demo baseline so reactions look populated; +1 if user tapped
                  const baseline =
                    p.id.startsWith('demo-')
                      ? ((p.id.charCodeAt(p.id.length - 1) +
                          kind.charCodeAt(0)) %
                          18) +
                        2
                      : 0;
                  const count = baseline + (active ? 1 : 0);
                  return (
                    <button
                      key={kind}
                      className={'bp-react' + (active ? ' active' : '')}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReaction(p.id, kind);
                      }}
                    >
                      <span className="bp-react-emoji">{emoji}</span>
                      {count > 0 && (
                        <span className="bp-react-count">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      {confirm && (
        <div className="modal-bd open" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <em>Cheer {confirm.name}</em>
            </h3>
            <p>Write a quick note — or just send the default.</p>
            <textarea
              className="cheer-input"
              placeholder="Cheering you on today 🔥"
              value={cheerMessage}
              onChange={(e) => setCheerMessage(e.target.value.slice(0, 200))}
              rows={2}
              autoFocus
            />
            <div className="cheer-count">{cheerMessage.length}/200</div>
            <div className="row">
              <button className="btn btn-secondary" onClick={() => { setConfirm(null); setCheerMessage(''); }}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={sendCheer}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </>
  );
}

/**
 * BeReal-post photo block — handles three cases:
 *  - real video file the user uploaded (blob: url) → renders <video>
 *  - gradient bg → renders a div with backgroundImage
 *  - demo "video" (gradient + play overlay)
 */
function BPPhoto({ bg, isVideo }: { bg: string; isVideo?: boolean }) {
  return (
    <div className="bp-photo">
      <Media bg={bg} isVideo={isVideo} />
      {isVideo && (
        <div className="bp-play-overlay">
          <svg viewBox="0 0 24 24" width={26} height={26} fill="white">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </div>
      )}
    </div>
  );
}
