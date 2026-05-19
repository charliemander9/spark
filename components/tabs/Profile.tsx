'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import type { DiaryEntry } from '@/lib/types';

type ProfileTab = 'all' | 'photos' | 'journal';

export function Profile() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const newestId = useSpark((s) => s.newestDiaryId);
  const demoMode = useSpark((s) => s.demoMode);
  const loadDemo = useSpark((s) => s.loadDemo);
  const clearDemo = useSpark((s) => s.clearDemo);
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const openViewer = useUi((s) => s.openViewer);

  const [activeTab, setActiveTab] = useState<ProfileTab>('all');

  const filtered = filterDiary(diary, activeTab);

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button
            className={'demo-btn' + (demoMode ? ' on' : '')}
            onClick={() => (demoMode ? clearDemo() : loadDemo())}
          >
            {demoMode ? '× Demo on' : '✨ Load demo'}
          </button>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="prof-head">
        <div className="prof-ava">{(user.name[0] || 'C').toUpperCase()}</div>
        <div className="prof-name-block">
          <h1>{user.name}</h1>
          <div className="prof-handle">@{handleFromName(user.name)}</div>
          <div className="prof-stats-inline">
            <div className="psi">
              <span className="v">{user.follows.length}</span>
              <span className="l">following</span>
            </div>
            <div className="psi">
              <span className="v">{user.buddies.length}</span>
              <span className="l">followers</span>
            </div>
            <div className="psi">
              <span className="v">0</span>
              <span className="l">nudges</span>
            </div>
          </div>
        </div>
      </div>

      <div className="prof-streak-row">
        <div className="prof-streak-chip">
          <span>🔥</span>
          <span><b>{user.streak}</b> day streak</span>
        </div>
        <div className="prof-streak-chip">
          <span>📅</span>
          <span>Day <b>{user.day}</b> of 75</span>
        </div>
        <div className="prof-streak-chip">
          <span>📷</span>
          <span><b>{diary.length}</b> entries</span>
        </div>
      </div>

      <div className="prof-bio">
        <p>
          {bioFor(user.preset, user.day, user.streak)}
        </p>
      </div>

      <div className="prof-actions">
        <button className="btn btn-secondary" onClick={openInviteSheet}>
          Share my code
        </button>
        <button className="btn btn-secondary" onClick={openSettings}>
          Edit profile
        </button>
      </div>

      <div className="prof-tabs">
        <button
          className={'pt-tab' + (activeTab === 'all' ? ' active' : '')}
          onClick={() => setActiveTab('all')}
          aria-label="All entries"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x={3} y={3} width={7} height={7} rx={1} />
            <rect x={14} y={3} width={7} height={7} rx={1} />
            <rect x={3} y={14} width={7} height={7} rx={1} />
            <rect x={14} y={14} width={7} height={7} rx={1} />
          </svg>
        </button>
        <button
          className={'pt-tab' + (activeTab === 'photos' ? ' active' : '')}
          onClick={() => setActiveTab('photos')}
          aria-label="Photos"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x={3} y={6.5} width={18} height={13.5} rx={2.5} />
            <circle cx={12} cy={13} r={4} />
            <path d="M8 6.5l1.5-2.2h5L16 6.5" />
          </svg>
        </button>
        <button
          className={'pt-tab' + (activeTab === 'journal' ? ' active' : '')}
          onClick={() => setActiveTab('journal')}
          aria-label="Journal"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M5 4h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V4z" strokeLinejoin="round"/>
            <path d="M8 8h7M8 12h7M8 16h4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">📷</div>
          <h3>Nothing here yet</h3>
          <p>Add photos or write a journal entry — they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="prof-grid">
          {filtered.map((d) => {
            const m = d.bg?.match(/url\("?([^"]+)"?\)/);
            const rawUrl = m ? m[1] : null;
            const isRealVideo =
              d.type === 'video' && rawUrl && rawUrl.startsWith('blob:');
            return (
              <div
                key={d.id}
                className={'prof-tile ' + d.type + (d.id === newestId ? ' new' : '')}
                style={
                  d.type === 'reflection' || isRealVideo
                    ? undefined
                    : { backgroundImage: d.bg }
                }
                onClick={() =>
                  openViewer({
                    authorName: user.name,
                    authorInitials: (user.name[0] || '?').toUpperCase(),
                    when: `${d.day} · ${d.date}`,
                    bg: d.bg,
                    isVideo: d.type === 'video',
                    isJournal: d.type === 'reflection',
                    body: d.body,
                    day: user.day,
                    streak: user.streak,
                  })
                }
              >
                {isRealVideo && (
                  <video
                    src={rawUrl!}
                    muted
                    playsInline
                    preload="metadata"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                {d.type === 'reflection' && (
                  <div className="pt-body">{d.body}</div>
                )}
                {d.type === 'video' && <div className="pt-play" />}
                {d.photos && d.photos.length > 1 && (
                  <div className="pt-multi">⊞ {d.photos.length}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ height: 20 }} />
    </>
  );
}

function filterDiary(diary: DiaryEntry[], tab: ProfileTab): DiaryEntry[] {
  if (tab === 'all') return diary;
  if (tab === 'photos') return diary.filter((d) => d.type === 'photo' || d.type === 'video');
  return diary.filter((d) => d.type === 'reflection');
}

function handleFromName(name: string): string {
  return (name || 'you').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function bioFor(preset: string, day: number, streak: number): string {
  const labels: Record<string, string> = {
    '75-hard-lite': '75 Hard Lite',
    runner: 'Runner',
    endurance: 'Endurance',
    'move-more': 'Move More',
    recomp: 'Recomp',
    reset: 'Reset',
    recovery: 'Recovery',
    custom: 'Custom 75',
  };
  const presetName = labels[preset] ?? preset;
  return `${presetName} · Day ${day} of 75 · ${streak} day streak`;
}
