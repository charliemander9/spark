'use client';

import { useSpark } from '@/lib/store';

export function Welcome() {
  const setScreen = useSpark((s) => s.setScreen);
  return (
    <div className="onb-hero">
      <div className="brand">
        Good<span className="brand-bolt">⚡</span>Morning
      </div>
      <div className="brand-flourish" />

      <p
        className="lede"
        style={{ marginTop: 18, maxWidth: 320, textAlign: 'center' }}
      >
        Seventy-five days of less screen time and better habits — held honest
        by the community who shows up with you.
      </p>

      <div className="welcome-explainer">
        <div className="we-row">
          <div className="we-num">1</div>
          <div className="we-body">
            <b>Post your Screen Time daily</b>
            <small>Screenshot it, share it. Posting unlocks the rest of the app.</small>
          </div>
        </div>
        <div className="we-row">
          <div className="we-num">2</div>
          <div className="we-body">
            <b>Build the habits you choose</b>
            <small>Daily check-ins that pull you off your phone and toward your goals.</small>
          </div>
        </div>
        <div className="we-row">
          <div className="we-num">3</div>
          <div className="we-body">
            <b>Stay honest, together</b>
            <small>See friends&apos; screen times, cheer them on. Miss a day, lose your streak.</small>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button
        className="btn btn-accent btn-lg btn-block"
        onClick={() => setScreen('onb-name')}
      >
        Let&apos;s go
      </button>
    </div>
  );
}
