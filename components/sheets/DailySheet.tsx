'use client';

import { useRef, useState, useEffect } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Release object URLs when component closes / photos change
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        const m = p.bg.match(/url\("?(blob:[^"]+)"?\)/);
        if (m) URL.revokeObjectURL(m[1]);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = 5 - photos.length;
    const picked: Photo[] = [];
    for (let i = 0; i < Math.min(files.length, room); i++) {
      const f = files[i];
      const url = URL.createObjectURL(f);
      const isVideo = f.type.startsWith('video/');
      picked.push({
        type: isVideo ? 'video' : 'photo',
        bg: `url("${url}")`,
      });
    }
    setPhotos([...photos, ...picked]);
    // Reset so the same file can be picked again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      const firstIsVideo = photos[0].type === 'video';
      pushDiary({
        id,
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: firstIsVideo ? 'video' : 'photo',
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
          A photo, video, or a journal — something to mark the day.
        </p>
        <div className="daily-mode-tabs">
          <button className={mode === 'photo' ? 'active' : ''} onClick={() => setMode('photo')}>📷 Photo / Video</button>
          <button className={mode === 'journal' ? 'active' : ''} onClick={() => setMode('journal')}>✎ Journal</button>
        </div>

        {mode === 'photo' && (
          <div className="form-section">
            <label>Photos &amp; videos · up to 5</label>
            <div className="photo-carousel">
              {photos.map((p, i) => (
                <div key={i} className="photo-tile" style={{ backgroundImage: p.bg }}>
                  {p.type === 'video' && <div className="photo-video-badge">▶</div>}
                  <button
                    className="photo-remove"
                    onClick={() => {
                      const m = p.bg.match(/url\("?(blob:[^"]+)"?\)/);
                      if (m) URL.revokeObjectURL(m[1]);
                      setPhotos(photos.filter((_, j) => j !== i));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  className="photo-tile add"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="ico">+</span>
                  <span className="lbl">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => onFiles(e.target.files)}
            />
            <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--ink-3)', fontFamily: "'Inter',sans-serif", textAlign: 'center' }}>
              Choose from library, take a photo, or record video.
            </p>
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
          <button className="btn btn-accent" onClick={save}>Save &amp; Unlock</button>
        </div>
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
