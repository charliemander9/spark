'use client';

import { useSpark } from '@/lib/store';

export function Welcome() {
  const setScreen = useSpark((s) => s.setScreen);
  return (
    <div className="onb-hero">
      <div className="brand">Spark</div>
      <div className="brand-flourish" />
      <p
        className="lede"
        style={{ marginTop: 18, maxWidth: 310, textAlign: 'center' }}
      >
        Find your spark. Seventy-five days of the habits you choose, held honest
        by the people who show up with you.
      </p>
      <div style={{ flex: 1 }} />
      <button
        className="btn btn-accent btn-lg btn-block"
        onClick={() => setScreen('onb-challenge')}
      >
        Get Started
      </button>
      <button
        className="btn btn-ghost btn-block"
        style={{ marginTop: 6, fontSize: 12.5 }}
        onClick={() => setScreen('onb-challenge')}
      >
        I already have an account
      </button>
    </div>
  );
}
