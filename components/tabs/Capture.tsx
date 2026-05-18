'use client';

import { useSpark } from '@/lib/store';

export function Capture() {
  const setTab = useSpark((s) => s.setTab);
  return (
    <div className="capture-pad">
      <h1 style={{ marginTop: 24 }}>Capture</h1>
      <p className="lede" style={{ marginTop: 12 }}>
        Workout proof flow comes online next push. For now, log workouts from the
        Home tab's course cards.
      </p>
      <button
        className="btn btn-secondary btn-lg btn-block"
        style={{ marginTop: 18 }}
        onClick={() => setTab('home')}
      >
        Back to Home
      </button>
    </div>
  );
}
