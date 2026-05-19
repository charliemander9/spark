'use client';

import { useRef, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/storage';
import { Media } from '../Media';
import type { DiaryEntry } from '@/lib/types';

type ProfileTab = 'all' | 'photos' | 'journal';

export function Profile() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const newestId = useSpark((s) => s.newestDiaryId);
  const demoMode = useSpark((s) => s.demoMode);
  const loadDemo = useSpark((s) => s.loadDemo);
  const clearDemo = useSpark((s) => s.clearDemo);
  const resetData = useSpark((s) => s.resetData);
  const [confirmReset, setConfirmReset] = useState(false);
  const setUser = useSpark((s) => s.setUser);
  const openSettings = useUi((s) => s.openSettings);
  const openInviteSheet = useUi((s) => s.openInviteSheet);
  const openViewer = useUi((s) => s.openViewer);

  const [activeTab, setActiveTab] = useState<ProfileTab>('all');
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = filterDiary(diary, activeTab);

  const saveBio = () => {
    const trimmed = bioDraft.trim();
    setUser({ bio: trimmed });
    setEditingBio(false);
    if (hasSupabase) updateProfile({ bio: trimmed });
  };

  const onAvatarFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      alert('Please pick an image file.');
      return;
    }
    // Show the local preview immediately so the UI is responsive
    const localUrl = URL.createObjectURL(f);
    setUser({ avatarUrl: localUrl });
    if (avatarInputRef.current) avatarInputRef.current.value = '';

    // Upload to storage in the background. When it returns, swap in the
    // permanent URL so it survives reloads and other devices.
    if (hasSupabase) {
      const { url, error } = await uploadAvatar(f);
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[GoodMorning] avatar upload failed:', error);
        return;
      }
      if (url) {
        setUser({ avatarUrl: url });
        await updateProfile({ avatar_url: url } as any);
      }
    }
  };

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button
            className="reset-btn"
            onClick={() => setConfirmReset(true)}
            title="Reset all data and start fresh"
          >
            ↺ Reset
          </button>
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
        <button
          className="prof-ava prof-ava-button"
          onClick={() => avatarInputRef.current?.click()}
          aria-label="Change profile picture"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="prof-ava-img" />
          ) : (
            (user.name[0] || 'C').toUpperCase()
          )}
          <span className="prof-ava-edit">
            <svg viewBox="0 0 24 24" width={12} height={12} fill="white">
              <path d="M3 17.5V21h3.5l11-11-3.5-3.5-11 11zm17.7-13.3a1 1 0 0 0 0-1.4l-2.5-2.5a1 1 0 0 0-1.4 0L15 1.9 18.6 5.5l2.1-2z" />
            </svg>
          </span>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => onAvatarFile(e.target.files)}
        />
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

      <div className="prof-bio">
        {editingBio ? (
          <div className="prof-bio-edit">
            <textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value.slice(0, 140))}
              placeholder="A line about you, your goals, your vibe."
              maxLength={140}
              autoFocus
              rows={2}
            />
            <div className="prof-bio-edit-row">
              <span className="prof-bio-count">{bioDraft.length}/140</span>
              <div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12.5 }}
                  onClick={() => {
                    setBioDraft(user.bio);
                    setEditingBio(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-accent"
                  style={{ padding: '8px 14px', fontSize: 12.5, marginLeft: 6 }}
                  onClick={saveBio}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p
            className="prof-bio-text"
            onClick={() => {
              setBioDraft(user.bio);
              setEditingBio(true);
            }}
          >
            {user.bio || (
              <span className="prof-bio-placeholder">
                Tap to add a bio — what are you here for?
              </span>
            )}
          </p>
        )}
      </div>

      <div className="prof-streak-row">
        <div className="prof-streak-chip">
          <span>🔥</span>
          <span>
            <b>{user.streak}</b> day streak
          </span>
        </div>
        <div className="prof-streak-chip">
          <span>📅</span>
          <span>
            Day <b>{user.day}</b> of 75
          </span>
        </div>
        <div className="prof-streak-chip">
          <span>📷</span>
          <span>
            <b>{diary.length}</b> entries
          </span>
        </div>
      </div>

      <div className="prof-actions">
        <button className="btn btn-secondary" onClick={openInviteSheet}>
          Share my code
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setBioDraft(user.bio);
            setEditingBio(true);
          }}
        >
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
              {d.type === 'reflection' ? (
                <div className="pt-body">{d.body}</div>
              ) : (
                <Media bg={d.bg} isVideo={d.type === 'video'} />
              )}
              {d.type === 'video' && <div className="pt-play" />}
              {d.photos && d.photos.length > 1 && (
                <div className="pt-multi">⊞ {d.photos.length}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 20 }} />

      {confirmReset && (
        <div className="modal-bd open" onClick={() => setConfirmReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><em>Start fresh?</em></h3>
            <p>
              This clears all entries, calendar progress, and demo data — your
              account, name, and bio stay. You&apos;ll be on day 1 with a clean
              slate.
            </p>
            <div className="row">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  resetData();
                  setConfirmReset(false);
                }}
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function filterDiary(diary: DiaryEntry[], tab: ProfileTab): DiaryEntry[] {
  if (tab === 'all') return diary;
  if (tab === 'photos')
    return diary.filter((d) => d.type === 'photo' || d.type === 'video');
  return diary.filter((d) => d.type === 'reflection');
}

function handleFromName(name: string): string {
  return (name || 'you').toLowerCase().replace(/[^a-z0-9]/g, '');
}
