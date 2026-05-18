// Static catalogs — categories, presets, suggestions, mock data.
// Ported from the HTML prototype.

import type { Category, CategoryId, Preset, PresetId } from './types';

export const CATEGORIES: Record<CategoryId, Category> = {
  workout: {
    id: 'workout', label: 'Workout', type: 'workout',
    ringColor: '#FF4D7A', desc: '45-min session, indoor or outdoor.',
  },
  steps: {
    id: 'steps', label: 'Steps', type: 'numeric',
    ringColor: '#5BE0F0', unit: 'steps', defaultGoal: 10000,
    range: [2000, 25000], step: 500,
    fmt: (n) => n.toLocaleString() + ' steps',
    supportsSync: true,
  },
  water: {
    id: 'water', label: 'Water', type: 'numeric',
    ringColor: '#4DD4E8', unit: 'oz', defaultGoal: 64,
    range: [32, 128], step: 8,
    fmt: (n) => n + ' oz',
    supportsSync: true,
  },
  sleep: {
    id: 'sleep', label: 'Sleep', type: 'numeric',
    ringColor: '#9D8FD9', unit: 'hours', defaultGoal: 8,
    range: [6, 10], step: 0.5,
    fmt: (n) => n + ' hrs',
  },
  alcohol: {
    id: 'alcohol', label: 'No Alcohol', type: 'binary',
    ringColor: '#E8896F', desc: 'Stay alcohol-free today.',
  },
  cleanEating: {
    id: 'cleanEating', label: 'Clean Eating', type: 'binary',
    ringColor: '#A8E060', desc: 'Whole foods. No processed junk.',
  },
  reading: {
    id: 'reading', label: 'Reading', type: 'numeric',
    ringColor: '#F5C842', unit: 'pages', defaultGoal: 10,
    range: [5, 30], step: 1,
    fmt: (n) => n + ' pages',
  },
  custom: {
    id: 'custom', label: 'Custom', type: 'custom',
    ringColor: '#E66EAE', desc: 'Define your own check-in.',
  },
};

export const PRESETS: Record<string, Preset> = {
  '75-hard-lite': {
    label: '75 Hard Lite',
    desc: 'Two workouts and 10,000 steps. The default.',
    slots: [
      { cat: 'workout', label: 'Workout 1',       config: { mustBeOutdoors: false, minDuration: 45 } },
      { cat: 'workout', label: 'Outside Workout', config: { mustBeOutdoors: true,  minDuration: 45 } },
      { cat: 'steps',   label: '10K Steps',       config: { goal: 10000 } },
    ],
  },
  endurance: {
    label: 'Endurance',
    desc: 'Cardio, long walks, plenty of water.',
    slots: [
      { cat: 'workout', label: 'Cardio',      config: { mustBeOutdoors: false, minDuration: 45 } },
      { cat: 'steps',   label: '12K Steps',   config: { goal: 12000 } },
      { cat: 'water',   label: '80 oz Water', config: { goal: 80 } },
    ],
  },
  recomp: {
    label: 'Recomp',
    desc: 'Workout, steps, clean food.',
    slots: [
      { cat: 'workout',     label: 'Workout',      config: { mustBeOutdoors: false, minDuration: 45 } },
      { cat: 'steps',       label: '10K Steps',    config: { goal: 10000 } },
      { cat: 'cleanEating', label: 'Clean Eating', config: {} },
    ],
  },
  recovery: {
    label: 'Recovery',
    desc: 'Gentle walks, sleep, hydration.',
    slots: [
      { cat: 'steps', label: '8K Steps',     config: { goal: 8000 } },
      { cat: 'sleep', label: 'Sleep 8 hrs',  config: { goal: 8 } },
      { cat: 'water', label: '80 oz Water',  config: { goal: 80 } },
    ],
  },
  custom: {
    label: 'Build my own',
    desc: 'Pick any three from the catalog.',
    slots: null,
  },
};

export const DAILY_QUOTES = [
  "Show up. The rest follows.",
  "The discomfort is the work.",
  "Strong is built, not given.",
  "Move first. Think later.",
  "The ocean doesn't care if you're tired.",
  "Every step is the long game.",
  "Hard now, or hard later.",
  "Your body adapts to what you ask of it.",
  "Motion creates emotion.",
  "Done is the new perfect.",
];

export const MOCK_PHOTOS = [
  'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)',
  'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)',
  'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)',
  'linear-gradient(160deg,#1c2a18 0%,#3a5530 60%,#a0b08a 100%)',
  'linear-gradient(160deg,#2a1830 0%,#5a2a55 60%,#b04d9c 100%)',
  'linear-gradient(160deg,#102838 0%,#1a5878 60%,#5fb0d4 100%)',
];

export const TONE_COPY = {
  feather: {
    sub: 'Two workouts. 10K steps. Begin gently.',
    needHelp: "Just one move today. Anything that gets you outside.",
    celebDone: 'Beautifully done.',
    celebMain: 'Outside, done. The harder one is behind you.',
    celebTreat: 'Ten thousand. You moved today.',
  },
  balanced: {
    sub: 'One indoor, one outside, 10K steps. Show up.',
    needHelp: 'Start with the indoor session. Outside can come later.',
    celebDone: 'Logged. One down.',
    celebMain: 'Outside, done. Strong work.',
    celebTreat: '10K hit. Streak +1.',
  },
  rock: {
    sub: 'Indoor. Outside. 10K steps. Every day.',
    needHelp: 'Pick a workout. Start now.',
    celebDone: 'Logged.',
    celebMain: 'Outside done. One more.',
    celebTreat: 'Streak +1. Tomorrow again.',
  },
};

export const ONB_ORDER = ['onb-welcome', 'onb-challenge', 'onb-privacy', 'onb-buddies', 'onb-find'] as const;

export const SUGGESTED_FOLLOWS = [
  { name: 'Maya G.', initials: 'MG', sub: 'Building habits · 47 day streak' },
  { name: 'Sam P.',  initials: 'SP', sub: 'Get more active · 28 day streak' },
  { name: 'Theo R.', initials: 'TR', sub: 'Focus · 92 day streak' },
  { name: 'Lena T.', initials: 'LT', sub: 'Sober · 365 day streak' },
];

// Discover feed — real fitness journeys grouped by track
export interface VideoCard {
  author: string;
  initials: string;
  title: string;
  note: string;
  img: string;
}

export const VIDEOS: Record<string, VideoCard[]> = {
  active: [
    { author: 'Sam P.',  initials: 'SP', title: 'How 10K steps a day changed my life',  note: 'started at 2,000 — built from there', img: 'linear-gradient(160deg,#0c2438 0%,#1f5878 60%,#65a0c6 100%)' },
    { author: 'Maya G.', initials: 'MG', title: 'I just kept showing up. That was it.',  note: 'no fancy program, no perfect plan',   img: 'linear-gradient(160deg,#1a3548 0%,#3d6a90 60%,#7ea8c8 100%)' },
    { author: 'Theo R.', initials: 'TR', title: 'From sedentary to daily mover',          note: 'the first 7 days are the hardest',     img: 'linear-gradient(160deg,#2e2818 0%,#7a6238 60%,#dcb968 100%)' },
  ],
  endurance: [
    { author: 'Aria L.', initials: 'AL', title: 'Couch to marathon at 38',                note: 'two years, one 5K at a time',          img: 'linear-gradient(160deg,#103040 0%,#1f5878 60%,#65a0c6 100%)' },
    { author: 'Theo R.', initials: 'TR', title: 'How I learned to love running',          note: 'the first 10 minutes always lies',     img: 'linear-gradient(160deg,#243a50 0%,#3a6a96 60%,#80b0d5 100%)' },
    { author: 'Devon M.', initials: 'DM', title: 'Open-water swimming saved my mornings', note: 'cold water, clear head',                img: 'linear-gradient(160deg,#082030 0%,#155068 60%,#5090b8 100%)' },
  ],
  strength: [
    { author: 'Jess K.',   initials: 'JK', title: 'From bodyweight to double-bodyweight deadlift', note: 'two years of slow, stubborn lifting', img: 'linear-gradient(160deg,#2e2920 0%,#7a6440 60%,#D4AF6E 100%)' },
    { author: 'Marcus J.', initials: 'MJ', title: 'Shoulders that don\'t ache anymore',            note: 'small accessory work every session', img: 'linear-gradient(160deg,#3a3220 0%,#8a7038 60%,#dcb968 100%)' },
  ],
  recomp: [
    { author: 'Lena T.',  initials: 'LT', title: 'Down 30 pounds — what actually worked', note: 'consistency over intensity',           img: 'linear-gradient(160deg,#2a2820 0%,#7a6c40 60%,#d8c074 100%)' },
    { author: 'Priya N.', initials: 'PN', title: 'Recomping in my 40s',                   note: 'patience is the only secret',          img: 'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#d6c060 100%)' },
  ],
};

// Friends — buddy circle + feed
export interface BuddyMock {
  name: string;
  initials: string;
  streak: number;
  state: 'fire' | 'frost' | 'okay';
  avaColor: 'terracotta' | 'sage' | 'rose';
  todayCheck: string | null;
}

export const BUDDIES: BuddyMock[] = [
  { name: 'Mom',    initials: 'M',  streak: 124, state: 'fire',  avaColor: 'terracotta', todayCheck: 'Beach walk done. 13K logged.' },
  { name: 'Riley',  initials: 'R',  streak: 14,  state: 'fire',  avaColor: 'sage',       todayCheck: 'Beach run at sunrise. Two down.' },
  { name: 'Maya',   initials: 'MK', streak: 47,  state: 'okay',  avaColor: 'rose',       todayCheck: 'Heavy back day. New PR pulled.' },
  { name: 'Jordan', initials: 'J',  streak: 2,   state: 'frost', avaColor: 'sage',       todayCheck: null },
];

export interface FriendPostMock {
  name: string;
  initials: string;
  avaColor: 'terra' | 'sage' | 'rose';
  when: string;
  streak: number;
  state: 'fire' | 'frost' | 'okay';
  type: 'photo' | 'reflection';
  course: string;
  caption?: string;
  reflection?: string;
  bg?: string;
}

export const FRIENDS_FEED: FriendPostMock[] = [
  { name: 'Riley',  initials: 'R', avaColor: 'terra', when: '12 min ago', streak: 14,  state: 'fire', type: 'photo',
    course: 'OUTSIDE', caption: 'Beach run at sunrise. Cold, then warm. Two down today.',
    bg: 'linear-gradient(160deg,#0c2438 0%,#1a4870 60%,#5a90b8 100%)' },
  { name: 'Maya',   initials: 'M', avaColor: 'sage',  when: '1 hr ago',   streak: 47,  state: 'fire', type: 'reflection',
    course: 'WORKOUT',
    reflection: 'Heavy back day. Pulled a new PR. Hands are wrecked but I feel taller. Outside session after work.' },
  { name: 'Jordan', initials: 'J', avaColor: 'rose',  when: '3 hr ago',   streak: 2,   state: 'frost', type: 'photo',
    course: '10K STEPS', caption: 'Walked to the coffee shop and back. Halfway there already.',
    bg: 'linear-gradient(160deg,#2e2818 0%,#a05c34 60%,#E8896F 100%)' },
  { name: 'Sam',    initials: 'S', avaColor: 'sage',  when: 'Yesterday',  streak: 121, state: 'fire',  type: 'photo',
    course: 'OUTSIDE', caption: 'Surf check at 6am. Ocean was glassy. One workout outdoor — done.',
    bg: 'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)' },
];
