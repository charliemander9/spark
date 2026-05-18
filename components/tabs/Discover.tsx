'use client';

import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { VIDEOS, type VideoCard } from '@/lib/data';

export function Discover() {
  const openSettings = useUi((s) => s.openSettings);

  // Mix all categories together, round-robin
  const cards: VideoCard[] = [];
  const cats = ['active', 'endurance', 'strength', 'recomp'];
  let i = 0, added = true;
  while (added) {
    added = false;
    for (const id of cats) {
      const arr = VIDEOS[id] || [];
      if (arr[i]) { cards.push(arr[i]); added = true; }
    }
    i++;
  }

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button className="iconbtn">
            <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.6}>
              <circle cx={11} cy={11} r={7} />
              <line x1={16.5} y1={16.5} x2={21} y2={21} strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="discover-head">
        <div className="date">Community</div>
        <h1>Discover</h1>
        <p className="small muted" style={{ marginTop: 6 }}>
          Real fitness journeys, kept honest. Running, lifting, swimming, recomp — all mixed.
        </p>
      </div>

      <div style={{ height: 14 }} />

      {cards.map((v, idx) => (
        <div key={v.author + idx} className="discover-card">
          <div className="dc-img" style={{ backgroundImage: v.img }}>
            <div className="dc-play" />
            <div>
              <div className="lead">Story</div>
              <h3>{v.title}</h3>
            </div>
          </div>
          <div className="dc-meta">
            <div className="dc-author">
              <div className="avatar-sm sage">{v.initials}</div>
              <div>
                <div className="name">{v.author}</div>
                <div className="sub">{v.note}</div>
              </div>
            </div>
            <div className="dc-actions">
              <div>♡ 2.4k</div>
              <div>↗</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
