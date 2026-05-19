'use client';

import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import type { Tab } from '@/lib/types';

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-3v-7H8v7H5a2 2 0 0 1-2-2V11z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx={9} cy={8} r={3.5} />
        <circle cx={17} cy={9} r={2.5} />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <path d="M15 20c0-2 1.5-3.5 4-3.5s2.5 1.5 2.5 3.5" />
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 5.5C10 4 7 4 4.5 4.5v14c2.5-.5 5.5-.5 7.5 1V5.5z" strokeLinejoin="round" />
        <path d="M12 5.5C14 4 17 4 19.5 4.5v14c-2.5-.5-5.5-.5-7.5 1V5.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx={11} cy={11} r={7} />
        <line x1={16.5} y1={16.5} x2={21} y2={21} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'foryou',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx={12} cy={8} r={4} />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function TabBar() {
  const tab = useSpark((s) => s.tab);
  const setTab = useSpark((s) => s.setTab);
  const dailyEntry = useSpark((s) => s.user.dailyEntry);
  const openDailySheet = useUi((s) => s.openDailySheet);

  const handleTabPress = (id: Tab) => {
    // Home is always reachable. Other tabs require today's entry first.
    if (id === 'home' || dailyEntry) {
      setTab(id);
      return;
    }
    setTab('home');
    setTimeout(() => openDailySheet(), 60);
  };

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const isJournal = t.id === 'journal';
        const isActive = tab === t.id;
        const isLocked = !dailyEntry && t.id !== 'home';
        return (
          <button
            key={t.id}
            className={
              'tab' +
              (isActive ? ' active' : '') +
              (isJournal ? ' tab-journal' : '') +
              (isLocked ? ' locked' : '')
            }
            onClick={() => handleTabPress(t.id)}
          >
            <span className="tab-ico">
              {t.icon}
              {isLocked && (
                <span className="tab-lock" aria-hidden>
                  <svg viewBox="0 0 24 24" width={10} height={10} fill="currentColor">
                    <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z"/>
                  </svg>
                </span>
              )}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
