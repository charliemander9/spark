'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { supabase, hasSupabase } from '@/lib/supabase';
import { loadProfile } from '@/lib/profile';
import { fetchTodayEntry } from '@/lib/dailyEntry';
import { PhoneFrame } from './PhoneFrame';
import { OnboardingFlow } from './OnboardingFlow';
import { TabBar } from './TabBar';
import { Home } from './tabs/Home';
import { Discover } from './tabs/Discover';
import { Journal } from './tabs/Journal';
import { Friends } from './tabs/Friends';
import { Profile } from './tabs/Profile';
import { Day75 } from './Day75';
import { SignIn } from './auth/SignIn';
import { SettingsSheet } from './sheets/SettingsSheet';
import { WorkoutSheet } from './sheets/WorkoutSheet';
import { NumericSheet } from './sheets/NumericSheet';
import { DailySheet } from './sheets/DailySheet';
import { InviteSheet } from './sheets/InviteSheet';

type AuthState = 'loading' | 'signedIn' | 'signedOut';

export function App() {
  const screen = useSpark((s) => s.screen);
  const tab = useSpark((s) => s.tab);
  const day75 = useSpark((s) => s.day75Celebrate);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);
  const setDailyEntry = useSpark((s) => s.setDailyEntry);

  const [authState, setAuthState] = useState<AuthState>(
    hasSupabase ? 'loading' : 'signedIn',
  );

  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    const applyProfile = async (userId: string) => {
      const profile = await loadProfile(userId);
      if (profile) {
        setUser({
          name: profile.name,
          tone: profile.tone,
          privacy: profile.privacy,
          day: profile.day,
          streak: profile.streak,
          freezes: profile.freezes,
          preset: profile.preset,
        });
        // Re-check today's entry so reloads/re-opens stay unlocked.
        const today = await fetchTodayEntry(userId);
        if (today) {
          setDailyEntry({ type: today.type, savedAt: Date.now() });
        }
        // New users — first sign-in, no onboarding yet — see the setup flow.
        if (profile.onboarded) {
          setScreen('app');
        } else {
          setScreen('onb-challenge');
        }
      } else {
        setScreen('app');
      }
    };

    // Initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        await applyProfile(data.session.user.id);
        setAuthState('signedIn');
      } else {
        setAuthState('signedOut');
      }
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await applyProfile(session.user.id);
        setAuthState('signedIn');
      } else if (event === 'SIGNED_OUT') {
        setAuthState('signedOut');
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [setUser, setScreen, setDailyEntry]);

  const inOnboarding = screen.startsWith('onb-');

  if (authState === 'loading') {
    return (
      <PhoneFrame>
        <div className="onb-hero" style={{ justifyContent: 'center' }}>
          <div className="brand" style={{ opacity: 0.6 }}>
            Good <span className="brand-bolt">⚡</span> Morning
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (authState === 'signedOut') {
    return (
      <PhoneFrame>
        <SignIn />
      </PhoneFrame>
    );
  }

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
          {tab === 'journal' && <Journal />}
          {tab === 'friends' && <Friends />}
          {tab === 'foryou' && <Profile />}
        </>
      )}
      {!inOnboarding && !day75 && <TabBar />}
      <SettingsSheet />
      <WorkoutSheet />
      <NumericSheet />
      <DailySheet />
      <InviteSheet />
    </PhoneFrame>
  );
}
