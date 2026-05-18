'use client';

import { useSpark } from '@/lib/store';

export function ComingSoon({ title, body }: { title: string; body: string }) {
  const setScreen = useSpark((s) => s.setScreen);
  return (
    <div className="onb" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="onb-hero" style={{ flex: 1, justifyContent: 'center' }}>
        <div className="brand" style={{ fontSize: 56 }}>Spark</div>
        <div className="brand-flourish" />
        <h1 style={{ marginTop: 18 }}>{title}</h1>
        <p className="lede" style={{ textAlign: 'center', maxWidth: 300 }}>
          {body}
        </p>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-secondary btn-lg btn-block"
          onClick={() => setScreen('onb-welcome')}
        >
          Back to onboarding
        </button>
      </div>
    </div>
  );
}
