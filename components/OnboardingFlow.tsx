'use client';

import { useSpark } from '@/lib/store';
import type { Screen } from '@/lib/types';
import { ONB_ORDER } from '@/lib/data';
import { Welcome } from './onboarding/Welcome';
import { ChallengePicker } from './onboarding/ChallengePicker';
import { Privacy } from './onboarding/Privacy';
import { Buddies } from './onboarding/Buddies';
import { FindFriends } from './onboarding/FindFriends';

export function OnboardingFlow() {
  const screen = useSpark((s) => s.screen);
  const setScreen = useSpark((s) => s.setScreen);
  const privacy = useSpark((s) => s.user.privacy);

  const idx = ONB_ORDER.indexOf(screen as (typeof ONB_ORDER)[number]);
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
      {screen === 'onb-challenge' && <ChallengePicker />}
      {screen === 'onb-privacy' && <Privacy />}
      {screen === 'onb-buddies' && <Buddies />}
      {screen === 'onb-find' && <FindFriends />}
    </div>
  );
}
