'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { saveDailyEntryToDb } from '@/lib/dailyEntry';
import type { Photo } from '@/lib/types';

// Random placeholder so users get an example of what to write.
const CAPTION_EXAMPLES = [
  'About to head out for a morning run.',
  'Gym fit on. 45 min strength session.',
  'Walking to the trailhead, going for 12k today.',
  'Water bottle filled. Cardio first, lift after.',
  'Pre-run selfie. Cold but going.',
  'Outfit ready. Workout 1 in 20 min.',
];

export function DailySheet() {
  const open = useUi((s) => s.dailySheetOpen);
  const close = useUi((s) => s.closeDailySheet);
  const setDailyEntry = useSpark((s) => s.setDailyEntry);
  const pushDiary = useSpark((s) => s.pushDiary);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [placeholder, setPlaceholder] = useState(CAPTION_EXAMPLES[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state + pick a fresh example every time the sheet opens.
  useEffect(() => {
    if (open) {
      setPlaceholder(
        CAPTION_EXAMPLES[Math.floor(Math.random() * CAPTION_EXAMPLES.length)],
      );
    }
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const save = async () => {
    const text = caption.trim();
    // Need at least one — photo or caption.
    if (photos.length === 0 && !text) {
      alert('Add a photo or write something — one is enough.');
      return;
    }
    setBusy(true);

    const dbType: 'photo' | 'journal' = photos.length > 0 ? 'photo' : 'journal';

    // UNLOCK LOCALLY FIRST — don't let DB issues block the user.
    const d = new Date();
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const id = 'daily_' + Date.now();

    if (photos.length > 0) {
      pushDiary({
        id,
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: photos[0].type === 'video' ? 'video' : 'photo',
        bg: photos[0].bg,
        photos,
        body: text || undefined,
        isDaily: true,
      });
    } else {
      pushDiary({
        id,
        day: days[d.getDay()],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        type: 'reflection',
        body: text,
        isDaily: true,
      });
    }

    setDailyEntry({ type: dbType, savedAt: Date.now() });
    setPhotos([]);
    setCaption('');
    setBusy(false);
    close();

    // Best-effort DB sync — fire-and-forget. If it fails, we log but the user
    // is already unlocked and the entry is saved locally.
    saveDailyEntryToDb(dbType, text || null, photos.map((p) => p.bg)).then(
      ({ error }) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[GM] daily entry sync failed:', error);
        }
      },
    );
  };

  if (!open) return null;
  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2>
          <em>Today&apos;s entry</em>
        </h2>
        <p
          style={{
            padding: '0 22px 4px',
            fontFamily: "'Fraunces',serif",
            fontStyle: 'italic',
            fontSize: 13.5,
            color: 'var(--ink-3)',
          }}
        >
          A quick snap and a line about what you&apos;re doing today. This is
          what your friends see.
        </p>

        <div className="form-section">
          <label>Snap</label>
          {photos.length === 0 ? (
            <button
              className="daily-photo-empty"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dpe-ico">
                <svg
                  viewBox="0 0 24 24"
                  width={28}
                  height={28}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <rect x={3} y={6.5} width={18} height={13.5} rx={2.5} />
                  <circle cx={12} cy={13} r={4} />
                  <path d="M8 6.5l1.5-2.2h5L16 6.5" />
                </svg>
              </div>
              <div className="dpe-body">
                <b>Add a photo or video</b>
                <small>Selfie · gym fit · water bottle · trailhead</small>
              </div>
            </button>
          ) : (
            <div className="photo-carousel">
              {photos.map((p, i) => {
                const m = p.bg.match(/url\("?([^"]+)"?\)/);
                const rawUrl = m ? m[1] : null;
                return (
                <div
                  key={i}
                  className="photo-tile"
                  style={p.type === 'video' ? undefined : { backgroundImage: p.bg }}
                >
                  {p.type === 'video' && rawUrl && (
                    <>
                      <video
                        src={rawUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="photo-tile-video"
                      />
                      <div className="photo-video-badge">▶</div>
                    </>
                  )}
                  <button
                    className="photo-remove"
                    onClick={() => {
                      if (rawUrl && rawUrl.startsWith('blob:'))
                        URL.revokeObjectURL(rawUrl);
                      setPhotos(photos.filter((_, j) => j !== i));
                    }}
                  >
                    ×
                  </button>
                </div>
                );
              })}
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
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        <div className="form-section">
          <label>What are you doing today?</label>
          <textarea
            className="daily-journal-input"
            placeholder={placeholder}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>

        <div className="sheet-actions">
          <button className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save & Unlock'}
          </button>
        </div>
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
