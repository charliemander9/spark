'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { supabase, hasSupabase } from '@/lib/supabase';
import { loadProfile } from '@/lib/profile';
import { fetchTodayEntry } from '@/lib/dailyEntry';
import { registerServiceWorker } from '@/lib/notifications';
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
import { FriendListSheet } from './sheets/FriendListSheet';
import { UserProfileSheet } from './sheets/UserProfileSheet';
import { EntryViewer } from './EntryViewer';

type AuthState = 'loading' | 'signedIn' | 'signedOut';

export function App() {
  const screen = useSpark((s) => s.screen);
  const tab = useSpark((s) => s.tab);
  const day75 = useSpark((s) => s.day75Celebrate);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);
  const setDailyEntry = useSpark((s) => s.setDailyEntry);
  const setTab = useSpark((s) => s.setTab);
  const pushDiary = useSpark((s) => s.pushDiary);
  const resetData = useSpark((s) => s.resetData);

  // Rehydrate today's diary entry from the DB row so the photo shows after reload.
  const rehydrateTodayInDiary = (today: {
    type: 'photo' | 'journal';
    body: string | null;
    photo_urls: string[];
  }) => {
    const d = new Date();
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const dateLabel = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const id = 'daily_rehydrate_' + d.toISOString().slice(0, 10);
    if (today.type === 'journal') {
      pushDiary({
        id,
        day: days[d.getDay()],
        date: dateLabel,
        type: 'reflection',
        body: today.body || '',
        isDaily: true,
      });
      return;
    }
    // Photo / video entry
    const urls = today.photo_urls || [];
    const photos = urls.map((u) => {
      const looksLikeUrl = u.startsWith('url(');
      const bg = looksLikeUrl ? u : `url("${u}")`;
      // Heuristic: treat .mp4/.mov as video, otherwise photo
      const isVid = /\.(mp4|mov|webm)(\?|$)/i.test(u);
      return { type: isVid ? ('video' as const) : ('photo' as const), bg };
    });
    pushDiary({
      id,
      day: days[d.getDay()],
      date: dateLabel,
      type: photos[0]?.type === 'video' ? 'video' : 'photo',
      bg: photos[0]?.bg,
      photos,
      body: today.body || undefined,
      isDaily: true,
    });
  };

  const [authState, setAuthState] = useState<AuthState>(
    hasSupabase ? 'loading' : 'signedIn',
  );

  // Register the service worker once on mount (enables push notifications).
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    const applyProfile = async (userId: string) => {
      const profile = await loadProfile(userId);
      if (profile) {
        setUser({
          name: profile.name,
          bio: profile.bio ?? '',
          avatarUrl: profile.avatar_url ?? null,
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
          // Rehydrate the daily diary entry with the stored URLs so the photo
          // shows on Home / Profile / Friends after reload.
          rehydrateTodayInDiary(today);
        }
        // New users — first sign-in — start fresh: clear any stale state from
        // the previous session (tab, diary, dailyEntry, demo data) and route
        // through the Welcome intro.
        if (profile.onboarded) {
          setTab('home');
          setScreen('app');
        } else {
          resetData();
          setTab('home');
          setScreen('onb-welcome');
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
  }, [setUser, setScreen, setDailyEntry, setTab, pushDiary, resetData]);

  const inOnboarding = screen.startsWith('onb-');

  if (authState === 'loading') {
    return (
      <PhoneFrame>
        <div className="onb-hero" style={{ justifyContent: 'center' }}>
          <div className="brand" style={{ opacity: 0.6 }}>
            Good<span className="brand-bolt">⚡</span>Morning
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
      <FriendListSheet />
      <UserProfileSheet />
      <EntryViewer />
    </PhoneFrame>
  );
}
