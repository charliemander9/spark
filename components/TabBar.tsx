'use client';

import { useSpark } from '@/lib/store';
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
    id: 'capture',
    label: 'Capture',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x={3} y={6.5} width={18} height={13.5} rx={2.5} />
        <circle cx={12} cy={13} r={4} />
        <path d="M8 6.5l1.5-2.2h5L16 6.5" />
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

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const isCapture = t.id === 'capture';
        const isActive = tab === t.id;
        return (
          <button
            key={t.id}
            className={'tab' + (isActive ? ' active' : '') + (isCapture ? ' tab-capture' : '')}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-ico">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
