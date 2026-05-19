'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { MOCK_PHOTOS } from '@/lib/data';
import { saveDailyEntryToDb } from '@/lib/dailyEntry';
import type { Photo } from '@/lib/types';

export function DailySheet() {
  const open = useUi((s) => s.dailySheetOpen);
  const close = useUi((s) => s.closeDailySheet);
  const setDailyEntry = useSpark((s) => s.setDailyEntry);
  const pushDiary = useSpark((s) => s.pushDiary);

  const [mode, setMode] = useState<'photo' | 'journal'>('photo');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [body, setBody] = useState('');

  const save = async () => {
    if (mode === 'photo' && photos.length === 0) {
      alert('Add a photo or switch to journal');
      return;
    }
    if (mode === 'journal' && !body.trim()) {
      alert('Write a few words or switch to photo');
      return;
    }

    // Persist to Supabase (no-op in local mode)
    const { error } = await saveDailyEntryToDb(
      mode,
      mode === 'journal' ? body.trim() : null,
      mode === 'photo' ? photos.map((p) => p.bg) : [],
    );
    if (error) {
      alert('Could not save: ' + error);
      return;
    }

    // Mirror to local store so the rest of the app updates immediately
    const d = new Date();
    const days = ['Su','M','T','W','Th','F','Sa'];
    const id = 'daily_' + Date.now();
    if (mode === 'photo') {
      pushDiary({
        id,
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: 'photo',
        bg: photos[0].bg,
        photos,
        isDaily: true,
      });
    } else {
      pushDiary({
        id,
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: 'reflection',
        body: body.trim(),
        isDaily: true,
      });
    }
    setDailyEntry({ type: mode, savedAt: Date.now() });
    setPhotos([]);
    setBody('');
    close();
  };

  if (!open) return null;
  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2><em>Today's entry</em></h2>
        <p style={{ padding: '0 22px 4px', fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-3)' }}>
          A photo or a journal — something to mark the day. Unlocks today's check-ins.
        </p>
        <div className="daily-mode-tabs">
          <button className={mode === 'photo' ? 'active' : ''} onClick={() => setMode('photo')}>📷 Photo</button>
          <button className={mode === 'journal' ? 'active' : ''} onClick={() => setMode('journal')}>✎ Journal</button>
        </div>

        {mode === 'photo' && (
          <div className="form-section">
            <label>Photos · up to 5</label>
            <div className="photo-carousel">
              {photos.map((p, i) => (
                <div key={i} className="photo-tile" style={{ backgroundImage: p.bg }}>
                  <button className="photo-remove" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  className="photo-tile add"
                  onClick={() => setPhotos([...photos, { type: 'photo', bg: MOCK_PHOTOS[photos.length % MOCK_PHOTOS.length] }])}
                >
                  <span className="ico">+</span>
                  <span className="lbl">Photo</span>
                </button>
              )}
            </div>
          </div>
        )}

        {mode === 'journal' && (
          <div className="form-section">
            <label>Journal entry</label>
            <textarea
              className="daily-journal-input"
              placeholder="A line or two about today…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn btn-secondary" onClick={close}>Cancel</button>
          <button className="btn btn-accent" onClick={save}>Save & Unlock</button>
        </div>
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
