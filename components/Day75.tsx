'use client';

import { useSpark } from '@/lib/store';

export function Day75() {
  const beginAnother75 = useSpark((s) => s.beginAnother75);
  const setDay75 = useSpark((s) => s.setDay75);

  return (
    <div className="day75-screen">
      <div className="preamble">Day 75 — Complete</div>
      <div className="big-number">75</div>
      <h1><em>Days.</em></h1>
      <h2 style={{ fontSize: 36, fontWeight: 300 }}>Done.</h2>
      <div className="day75-flourish" />
      <p className="day75-tagline">
        You showed up every day. Two workouts. Ten thousand steps. Seventy-five
        times in a row. That counts.
      </p>
      <div className="day75-stats">
        <div className="day75-stat">
          <div className="v">75</div>
          <div className="l">Days Done</div>
        </div>
        <div className="day75-stat">
          <div className="v">150</div>
          <div className="l">Workouts</div>
        </div>
        <div className="day75-stat">
          <div className="v">750k+</div>
          <div className="l">Steps</div>
        </div>
      </div>
      <div className="day75-actions">
        <button className="btn btn-accent btn-lg btn-block" onClick={beginAnother75}>
          Begin Another 75
        </button>
        <button
          className="btn btn-ghost btn-block"
          style={{ fontSize: 13 }}
          onClick={() => setDay75(false)}
        >
          Take a break first
        </button>
      </div>
    </div>
  );
}
