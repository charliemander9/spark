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
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);

  const [activeTab, setActiveTab] = useState<ProfileTab>('all');

  const filtered = filterDiary(diary, activeTab);

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="prof-head">
        <div className="prof-ava">{(user.name[0] || 'C').toUpperCase()}</div>
        <div className="prof-name">
          <h1>{user.name}</h1>
          <div className="prof-handle">@{handleFromName(user.name)}</div>
        </div>
      </div>

      <div className="prof-stats">
        <div className="prof-stat">
          <div className="v">{user.day}</div>
          <div className="l">of 75</div>
        </div>
        <div className="prof-stat">
          <div className="v">{user.streak}</div>
          <div className="l">streak</div>
        </div>
        <div className="prof-stat">
          <div className="v">{user.buddies.length}</div>
          <div className="l">friends</div>
        </div>
        <div className="prof-stat">
          <div className="v">{diary.length}</div>
          <div className="l">entries</div>
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
          {filtered.map((d) => (
            <div
              key={d.id}
              className={'prof-tile ' + d.type + (d.id === newestId ? ' new' : '')}
              style={d.type === 'reflection' ? undefined : { backgroundImage: d.bg }}
            >
              {d.type === 'reflection' && (
                <div className="pt-body">{d.body}</div>
              )}
              {d.type === 'video' && (
                <div className="pt-play" />
              )}
              {d.photos && d.photos.length > 1 && (
                <div className="pt-multi">⊞ {d.photos.length}</div>
              )}
            </div>
          ))}
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
  const presetName = preset === '75-hard-lite' ? '75 Hard Lite' :
                     preset === 'endurance' ? 'Endurance' :
                     preset === 'recomp' ? 'Recomp' :
                     preset === 'recovery' ? 'Recovery' :
                     preset === 'custom' ? 'Custom 75' : preset;
  return `${presetName} · Day ${day} of 75 · ${streak} day streak`;
}
