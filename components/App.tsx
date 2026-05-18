'use client';

import { useSpark } from '@/lib/store';
import { PhoneFrame } from './PhoneFrame';
import { OnboardingFlow } from './OnboardingFlow';
import { ComingSoon } from './ComingSoon';

export function App() {
  const screen = useSpark((s) => s.screen);
  const day75 = useSpark((s) => s.day75Celebrate);

  return (
    <PhoneFrame>
      {screen.startsWith('onb-') ? (
        <OnboardingFlow />
      ) : day75 ? (
        <ComingSoon title="Day 75" body="Celebration screen comes online in the next push." />
      ) : (
        <ComingSoon title="App tabs" body="Home / Discover / Capture / Friends / Profile coming online in the next push. The onboarding flow + Welcome screen are wired up — try going back to Welcome to test the flow." />
      )}
    </PhoneFrame>
  );
}
