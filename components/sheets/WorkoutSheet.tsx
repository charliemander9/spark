'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import type { Photo, WorkoutDetails } from '@/lib/types';

export function WorkoutSheet() {
  const open = useUi((s) => s.workoutSheetOpen);
  const close = useUi((s) => s.closeWorkoutSheet);
  const slot = useSpark((s) => s.workoutSheetCourse);
  const menu = useSpark((s) => s.menu);
  const saveWorkoutDetails = useSpark((s) => s.saveWorkoutDetails);

  const [type, setType] = useState('');
  const [dur, setDur] = useState('');
  const [place, setPlace] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (slot && menu[slot]?.details) {
      const d = menu[slot]!.details!;
      setType(d.type); setDur(d.duration); setPlace(d.place);
      setPhotos(d.photos ?? []);
    } else {
      setType(''); setDur(''); setPlace(''); setPhotos([]);
    }
  }, [slot, menu]);

  if (!open || !slot) return null;
  const isOutdoors = menu[slot].config.mustBeOutdoors;

  const save = (source?: string) => {
    if (!source && (!type.trim() || !dur.trim())) {
      alert('Add a workout type and time'); return;
    }
    const details: WorkoutDetails = source
      ? {
          type: isOutdoors ? 'Outdoor Run' : 'Strength Training',
          duration: isOutdoors ? '42' : '46',
          place: isOutdoors ? 'Beach loop' : 'Home gym',
          source, photos,
        }
      : { type: type.trim(), duration: dur.trim(), place: place.trim() || 'Anywhere', source: null, photos };
    saveWorkoutDetails(slot, details);
    close();
  };

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2><em>{slot === 'appetizer' ? 'Log Workout 1' : 'Log Workout 2'}</em></h2>
        <p style={{ padding: '0 22px 4px', fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-3)' }}>
          {isOutdoors ? 'Must be outside. 45 minutes minimum.' : 'Indoor or outdoor. 45 minutes minimum.'}
        </p>

        <div className="form-section">
          <label>What kind of workout</label>
          <input type="text" placeholder="Running · Lifting · Yoga · Surf · …" value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-section" style={{ flex: 1 }}>
            <label>Time (min)</label>
            <input type="number" min={0} placeholder="45" value={dur} onChange={(e) => setDur(e.target.value)} />
          </div>
          <div className="form-section" style={{ flex: 1.4 }}>
            <label>Place</label>
            <input type="text" placeholder="Gym · Beach · Home …" value={place} onChange={(e) => setPlace(e.target.value)} />
          </div>
        </div>

        <div className="form-section">
          <label>Photos &amp; video <span className="lbl-hint">up to 5</span></label>
          <div className="photo-carousel">
            {photos.map((p, i) => (
              <div
                key={i}
                className="photo-tile"
                style={{ backgroundImage: p.bg }}
              >
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
        </div>

        <div className="form-divider"><span>or import from device</span></div>
        <div className="import-row">
          <button className="import-btn" onClick={() => save('Apple Watch')}><span className="ico">⌚</span><span>Apple Watch</span></button>
          <button className="import-btn" onClick={() => save('Fitbit')}><span className="ico">◐</span><span>Fitbit</span></button>
          <button className="import-btn" onClick={() => save('Strava')}><span className="ico">⚡</span><span>Strava</span></button>
        </div>

        <div className="sheet-actions">
          <button className="btn btn-secondary" onClick={close}>Cancel</button>
          <button className="btn btn-accent" onClick={() => save()}>Save Workout</button>
        </div>
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
