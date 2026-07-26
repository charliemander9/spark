'use client';

import { useSpark } from '@/lib/store';
import { CHALLENGE_LENGTH } from '@/lib/data';

export function DayComplete() {
  const beginAnotherRound = useSpark((s) => s.beginAnotherRound);
  const setChallengeComplete = useSpark((s) => s.setChallengeComplete);

  return (
    <div className="day75-screen">
      <div className="preamble">Day {CHALLENGE_LENGTH} — Complete</div>
      <div className="big-number">{CHALLENGE_LENGTH}</div>
      <h1><em>Days.</em></h1>
      <h2 style={{ fontSize: 36, fontWeight: 300 }}>Done.</h2>
      <div className="day75-flourish" />
      <p className="day75-tagline">
        You showed up every day. Two workouts. Ten thousand steps. Thirty
        times in a row. That counts.
      </p>
      <div className="day75-stats">
        <div className="day75-stat">
          <div className="v">{CHALLENGE_LENGTH}</div>
          <div className="l">Days Done</div>
        </div>
        <div className="day75-stat">
          <div className="v">60</div>
          <div className="l">Workouts</div>
        </div>
        <div className="day75-stat">
          <div className="v">300k+</div>
          <div className="l">Steps</div>
        </div>
      </div>
      <div className="day75-actions">
        <button className="btn btn-accent btn-lg btn-block" onClick={beginAnotherRound}>
          Begin Another Round
        </button>
        <button
          className="btn btn-ghost btn-block"
          style={{ fontSize: 13 }}
          onClick={() => setChallengeComplete(false)}
        >
          Take a break first
        </button>
      </div>
    </div>
  );
}
