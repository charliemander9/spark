'use client';

import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { DEMO_DISCOVER } from '@/lib/data';

export function Discover() {
  const openSettings = useUi((s) => s.openSettings);
  const setScreen = useSpark((s) => s.setScreen);
  const demoMode = useSpark((s) => s.demoMode);

  const cards = demoMode ? DEMO_DISCOVER : [];

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
          Real fitness journeys, kept honest.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">🌊</div>
          <h3>No stories yet</h3>
          <p>
            Follow a few people working on similar goals and their journeys will
            show up here.
          </p>
          <button
            className="empty-cta"
            onClick={() => setScreen('onb-find')}
          >
            Find people
          </button>
        </div>
      ) : (
        <div className="discover-list">
          {cards.map((p) => (
            <div key={p.id} className="discover-person">
              <div className="dp-ava" style={{ backgroundImage: p.avaGradient }}>
                <span>{p.initials}</span>
              </div>
              <div className="dp-body">
                <div className="dp-name">{p.name}</div>
                <div className="dp-bio">{p.bio}</div>
                <div className="dp-sub">
                  <span className="streak-chip">🔥 <span className="mono">{p.streak}d</span></span>
                  <span>· Day {p.day} of 75</span>
                </div>
              </div>
              <button className="dp-follow">Follow</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 20 }} />
    </>
  );
}
