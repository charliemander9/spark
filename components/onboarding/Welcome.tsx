'use client';

import { useSpark } from '@/lib/store';

export function Welcome() {
  const setScreen = useSpark((s) => s.setScreen);
  return (
    <div className="onb-hero">
      <div className="brand">
        Good <span className="brand-bolt">⚡</span> Morning
      </div>
      <div className="brand-flourish" />
      <p
        className="lede"
        style={{ marginTop: 18, maxWidth: 320, textAlign: 'center' }}
      >
        Good Morning! Seventy-five days, every day, the habits you choose —
        held by the community who show up with you.
      </p>
      <div style={{ flex: 1 }} />
      <button
        className="btn btn-accent btn-lg btn-block"
        onClick={() => setScreen('onb-challenge')}
      >
        Get Started
      </button>
    </div>
  );
}
