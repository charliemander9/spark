'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { MOCK_PHOTOS } from '@/lib/data';
import type { Photo } from '@/lib/types';

type Mode = 'video' | 'photo' | 'reflection';

export function Capture() {
  const setTab = useSpark((s) => s.setTab);
  const pushDiary = useSpark((s) => s.pushDiary);
  const [mode, setMode] = useState<Mode>('video');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [body, setBody] = useState('');

  const save = () => {
    const d = new Date(2026, 4, 15);
    const days = ['Su','M','T','W','Th','F','Sa'];
    const dayLetter = days[d.getDay()];
    const date = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const id = 'cap_' + Date.now();

    if (mode === 'reflection') {
      if (!body.trim()) { alert('Write a few lines first'); return; }
      pushDiary({ id, day: dayLetter, date, type: 'reflection', body: body.trim() });
    } else if (mode === 'photo') {
      if (photos.length === 0) { alert('Add at least one photo'); return; }
      pushDiary({ id, day: dayLetter, date, type: 'photo', bg: photos[0].bg, photos });
    } else {
      pushDiary({
        id, day: dayLetter, date, type: 'video',
        bg: MOCK_PHOTOS[Math.floor(Math.random() * MOCK_PHOTOS.length)],
      });
    }
    setBody('');
    setPhotos([]);
    setTab('foryou');
  };

  return (
    <div className="capture">
      <div className="capture-top">
        <div className="course-seg">
          {(['video', 'photo', 'reflection'] as Mode[]).map((m) => (
            <button
              key={m}
              className={mode === m ? 'active' : ''}
              onClick={() => setMode(m)}
            >
              {m === 'video' ? 'Video' : m === 'photo' ? 'Photo' : 'Note'}
            </button>
          ))}
        </div>
        <button className="capture-x" onClick={() => setTab('home')}>×</button>
      </div>

      <div className="capture-task">
        <div className="lead">Quick capture</div>
        <h2>Add to your diary</h2>
      </div>

      {mode === 'video' && (
        <>
          <div className="capture-viewport" />
          <div className="capture-helper">Tap to record — up to 30s</div>
          <div className="capture-bottom">
            <button className="record-btn" onClick={save} />
            <div className="capture-fallbacks">
              <button onClick={() => setMode('photo')}>Photo</button>
              <button onClick={() => setMode('reflection')}>Note</button>
            </div>
          </div>
        </>
      )}

      {mode === 'photo' && (
        <div style={{ padding: '0 22px 24px' }}>
          <div className="photo-stage" style={{ marginBottom: 14 }}>
            <div className="icon">
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.6}>
                <rect x={3} y={6.5} width={18} height={13.5} rx={2.5} />
                <circle cx={12} cy={13} r={4} />
                <path d="M8 6.5l1.5-2.2h5L16 6.5" />
              </svg>
            </div>
            <div className="hint">Add up to 5 photos</div>
          </div>
          <div className="photo-carousel" style={{ marginBottom: 18 }}>
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
          <button className="btn btn-accent btn-lg btn-block" onClick={save}>
            Save Photos
          </button>
        </div>
      )}

      {mode === 'reflection' && (
        <div style={{ padding: '0 22px 24px' }}>
          <div className="reflection-card">
            <div className="lead">Today's reflection</div>
            <h3>How did it <em>feel</em>?</h3>
            <textarea
              placeholder="Write a few lines. Anything. The act is the gift."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button
            className="btn btn-accent btn-lg btn-block capture-submit"
            onClick={save}
          >
            Save Reflection
          </button>
        </div>
      )}
    </div>
  );
}
