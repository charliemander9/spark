'use client';

import { useSpark } from '@/lib/store';
import type { Screen } from '@/lib/types';
import { ONB_ORDER } from '@/lib/data';
import { Welcome } from './onboarding/Welcome';
import { NameSetup } from './onboarding/NameSetup';
import { ChallengePicker } from './onboarding/ChallengePicker';
import { Privacy } from './onboarding/Privacy';
import { Buddies } from './onboarding/Buddies';

export function OnboardingFlow() {
  const screen = useSpark((s) => s.screen);
  const setScreen = useSpark((s) => s.setScreen);

  const idx = ONB_ORDER.indexOf(screen as (typeof ONB_ORDER)[number]);
  const total = ONB_ORDER.length;

  return (
    <div className="onb">
      {idx > 0 && (
        <button
          className="onb-back"
          onClick={() => setScreen(ONB_ORDER[idx - 1] as Screen)}
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
      {screen === 'onb-name' && <NameSetup />}
      {screen === 'onb-challenge' && <ChallengePicker />}
      {screen === 'onb-privacy' && <Privacy />}
      {screen === 'onb-buddies' && <Buddies />}
    </div>
  );
}
