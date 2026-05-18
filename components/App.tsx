'use client';

import { useSpark } from '@/lib/store';
import { PhoneFrame } from './PhoneFrame';
import { OnboardingFlow } from './OnboardingFlow';
import { TabBar } from './TabBar';
import { Home } from './tabs/Home';
import { Discover } from './tabs/Discover';
import { Capture } from './tabs/Capture';
import { Friends } from './tabs/Friends';
import { Profile } from './tabs/Profile';
import { Day75 } from './Day75';
import { SettingsSheet } from './sheets/SettingsSheet';
import { WorkoutSheet } from './sheets/WorkoutSheet';
import { NumericSheet } from './sheets/NumericSheet';
import { DailySheet } from './sheets/DailySheet';

export function App() {
  const screen = useSpark((s) => s.screen);
  const tab = useSpark((s) => s.tab);
  const day75 = useSpark((s) => s.day75Celebrate);

  const inOnboarding = screen.startsWith('onb-');

  return (
    <PhoneFrame>
      {inOnboarding ? (
        <OnboardingFlow />
      ) : day75 ? (
        <Day75 />
      ) : (
        <>
          {tab === 'home' && <Home />}
          {tab === 'discover' && <Discover />}
          {tab === 'capture' && <Capture />}
          {tab === 'friends' && <Friends />}
          {tab === 'foryou' && <Profile />}
        </>
      )}
      {!inOnboarding && !day75 && <TabBar />}
      <SettingsSheet />
      <WorkoutSheet />
      <NumericSheet />
      <DailySheet />
    </PhoneFrame>
  );
}
