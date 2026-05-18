// Small utilities.

import { CATEGORIES, DAILY_QUOTES } from './data';
import type { CategoryId, SlotConfig } from './types';

export function todayLabel(): string {
  return new Date(2026, 4, 15).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export function greeting(name: string): [string, string] {
  const hr = new Date().getHours();
  const g = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  return [g, name];
}

export function dailyQuote(): string {
  return DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];
}

export function courseGradient(key: 'appetizer' | 'main' | 'treat'): string {
  return key === 'appetizer'
    ? 'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)'
    : key === 'main'
    ? 'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)'
    : 'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)';
}

export function defaultConfigFor(catId: CategoryId): SlotConfig {
  const cat = CATEGORIES[catId];
  if (cat.type === 'workout')  return { mustBeOutdoors: false, minDuration: 45 };
  if (cat.type === 'numeric')  return { goal: cat.defaultGoal };
  if (cat.type === 'custom')   return { label: 'My check-in', quantified: false, goal: 10, unit: 'min' };
  return {};
}

export function gearSvg(): string {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
}
