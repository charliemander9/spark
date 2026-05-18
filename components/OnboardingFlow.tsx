'use client';

import { useSpark } from '@/lib/store';
import type { Screen } from '@/lib/types';
import { ONB_ORDER } from '@/lib/data';
import { Welcome } from './onboarding/Welcome';

export function OnboardingFlow() {
  const screen = useSpark((s) => s.screen);
  const setScreen = useSpark((s) => s.setScreen);
  const privacy = useSpark((s) => s.user.privacy);

  const idx = ONB_ORDER.indexOf(screen as typeof ONB_ORDER[number]);
  const total = privacy === 'private' ? ONB_ORDER.length - 1 : ONB_ORDER.length;

  return (
    <div className="onb">
      {idx > 0 && (
        <button
          className="onb-back"
          onClick={() => {
            let p = idx - 1;
            if (ONB_ORDER[p] === 'onb-find' && privacy === 'private') p--;
            setScreen(ONB_ORDER[p] as Screen);
          }}
        >
          ←
        </button>
      )}
      <div className="onb-dots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={i <= idx ? 'active' : ''} />
        ))}
      </div>

      {screen === 'onb-welcome' && <Welcome />}
      {screen === 'onb-challenge' && <Placeholder title="Choose your 75" next="onb-privacy" />}
      {screen === 'onb-privacy' && <Placeholder title="Who can see your posts?" next="onb-buddies" />}
      {screen === 'onb-buddies' && <Placeholder title="Your accountability circle" next="onb-find" />}
      {screen === 'onb-find' && <Placeholder title="Find your community" next="app" finish />}
    </div>
  );
}

function Placeholder({ title, next, finish }: { title: string; next: Screen; finish?: boolean }) {
  const setScreen = useSpark((s) => s.setScreen);
  return (
    <div className="onb-q">
      <h1>{title}</h1>
      <p className="lede">This screen will be ported in the next push.</p>
      <div style={{ flex: 1 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={() => setScreen(next)}
        >
          {finish ? 'Start' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
