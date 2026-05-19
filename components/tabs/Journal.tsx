'use client';

import { useRef } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { Calendar } from '../Calendar';
import type { Photo } from '@/lib/types';

export function Journal() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const pushDiary = useSpark((s) => s.pushDiary);
  const openSettings = useUi((s) => s.openSettings);
  const openDailySheet = useUi((s) => s.openDailySheet);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const picked: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const url = URL.createObjectURL(f);
      const isVideo = f.type.startsWith('video/');
      picked.push({
        type: isVideo ? 'video' : 'photo',
        bg: `url("${url}")`,
      });
    }
    if (picked.length === 0) return;
    const d = new Date();
    const days = ['Su','M','T','W','Th','F','Sa'];
    pushDiary({
      id: 'jx_' + Date.now(),
      day: days[d.getDay()],
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      type: picked[0].type === 'video' ? 'video' : 'photo',
      bg: picked[0].bg,
      photos: picked,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <div className="streak-pill">
            <span className="flame">🔥</span>
            <span className="n">{user.streak}</span>
            <span className="lbl">days</span>
          </div>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="friends-head">
        <div className="date">Day {user.day} of 75</div>
        <h1>Journal</h1>
      </div>

      <Calendar />

      <div className="section-label">Add to today</div>
      <div className="journal-actions">
        <button className="journal-action" onClick={openDailySheet}>
          <div className="ja-ico" style={{ background: 'linear-gradient(160deg, var(--terracotta) 0%, var(--clay) 100%)', color: 'var(--bg-2)' }}>✎</div>
          <div className="ja-body">
            <b>Write entry</b>
            <small>A line, a paragraph, whatever shows up</small>
          </div>
        </button>
        <button className="journal-action" onClick={() => fileInputRef.current?.click()}>
          <div className="ja-ico" style={{ background: 'linear-gradient(160deg, #1c3548 0%, #2d6a95 100%)', color: 'var(--bg-2)' }}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x={3} y={6.5} width={18} height={13.5} rx={2.5} />
              <circle cx={12} cy={13} r={4} />
              <path d="M8 6.5l1.5-2.2h5L16 6.5" />
            </svg>
          </div>
          <div className="ja-body">
            <b>Add photos / video</b>
            <small>Pick from library or take new</small>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      <div className="section-label">Recent entries</div>
      {diary.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">📓</div>
          <h3>Nothing yet</h3>
          <p>Add a photo, video, or write something. It'll show up here.</p>
        </div>
      ) : (
        <div className="journal-list">
          {diary.slice(0, 20).map((d) => (
            <div key={d.id} className={'journal-row ' + d.type}>
              {d.type === 'reflection' ? (
                <div className="jr-text">
                  <div className="jr-date">{d.day} · {d.date}</div>
                  <div className="jr-body">{d.body}</div>
                </div>
              ) : (
                <>
                  <div className="jr-thumb" style={{ backgroundImage: d.bg }}>
                    {d.type === 'video' && <div className="jr-play" />}
                  </div>
                  <div className="jr-text">
                    <div className="jr-date">{d.day} · {d.date}</div>
                    <div className="jr-body">{d.type === 'video' ? 'Video' : 'Photo'}{d.photos && d.photos.length > 1 ? ` · ${d.photos.length}` : ''}</div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 20 }} />
    </>
  );
}
