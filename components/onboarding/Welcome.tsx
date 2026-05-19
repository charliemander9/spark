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
        GM. Seventy-five days, every morning, the habits you choose — held
        honest by the people who show up with you.
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
