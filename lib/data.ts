// Static catalogs — categories, presets, suggestions, mock data.

import type { Category, CategoryId, Preset } from './types';

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
  sleep: {
    id: 'sleep', label: 'Sleep', type: 'numeric',
    ringColor: '#9D8FD9', unit: 'hours', defaultGoal: 8,
    range: [6, 10], step: 0.5,
    fmt: (n) => n + ' hrs',
  },
  custom: {
    id: 'custom', label: 'Custom', type: 'custom',
    ringColor: '#E66EAE', desc: 'Define your own check-in.',
  },
};

export const PRESETS: Record<string, Preset> = {
  custom: {
    label: 'Build my own',
    desc: 'Pick three from the catalog. Mix and match.',
    slots: null,
  },
  '75-hard': {
    label: '75 Hard',
    desc: 'The original — 5 rules. Two workouts, gallon of water, 10 pages, diet.',
    slots: [
      { cat: 'workout',     label: 'Workout 1',       config: { mustBeOutdoors: false, minDuration: 45 } },
      { cat: 'workout',     label: 'Outside Workout', config: { mustBeOutdoors: true,  minDuration: 45 } },
      { cat: 'water',       label: 'Gallon of Water', config: { goal: 128 } },
      { cat: 'reading',     label: '10 Pages',        config: { goal: 10 } },
      { cat: 'alcohol',     label: 'No Alcohol',      config: {} },
    ],
  },
  '75-hard-lite': {
    label: '75 Hard Lite',
    desc: 'Two workouts, 10K steps. The classic.',
    slots: [
      { cat: 'workout', label: 'Workout 1',       config: { mustBeOutdoors: false, minDuration: 45 } },
      { cat: 'workout', label: 'Outside Workout', config: { mustBeOutdoors: true,  minDuration: 45 } },
      { cat: 'steps',   label: '10K Steps',       config: { goal: 10000 } },
    ],
  },
  runner: {
    label: 'Runner',
    desc: 'Run, log miles, hit your steps.',
    slots: [
      { cat: 'workout', label: 'Run',         config: { mustBeOutdoors: true,  minDuration: 30 } },
      { cat: 'workout', label: 'Strength',    config: { mustBeOutdoors: false, minDuration: 30 } },
      { cat: 'steps',   label: '12K Steps',   config: { goal: 12000 } },
    ],
  },
  endurance: {
    label: 'Endurance',
    desc: 'Long cardio, big steps, hydrate hard.',
    slots: [
      { cat: 'workout', label: 'Cardio',      config: { mustBeOutdoors: false, minDuration: 60 } },
      { cat: 'steps',   label: '15K Steps',   config: { goal: 15000 } },
      { cat: 'water',   label: '100 oz Water', config: { goal: 100 } },
    ],
  },
  'move-more': {
    label: 'Move More',
    desc: 'One workout, big steps, no booze.',
    slots: [
      { cat: 'workout', label: 'Workout',     config: { mustBeOutdoors: false, minDuration: 30 } },
      { cat: 'steps',   label: '10K Steps',   config: { goal: 10000 } },
      { cat: 'alcohol', label: 'No Alcohol',  config: {} },
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
  reset: {
    label: 'Reset',
    desc: 'No drinks, clean eating, daily walk.',
    slots: [
      { cat: 'alcohol',     label: 'No Alcohol',   config: {} },
      { cat: 'cleanEating', label: 'Clean Eating', config: {} },
      { cat: 'steps',       label: '8K Steps',     config: { goal: 8000 } },
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

export const ONB_ORDER = ['onb-welcome', 'onb-name', 'onb-challenge', 'onb-privacy', 'onb-buddies', 'onb-notifications'] as const;

export const SUGGESTED_FOLLOWS = [
  { name: 'Maya G.', initials: 'MG', sub: 'Building habits · 47 day streak' },
  { name: 'Sam P.',  initials: 'SP', sub: 'Get more active · 28 day streak' },
  { name: 'Theo R.', initials: 'TR', sub: 'Focus · 92 day streak' },
  { name: 'Lena T.', initials: 'LT', sub: 'Sober · 365 day streak' },
];

export interface VideoCard {
  author: string;
  initials: string;
  title: string;
  note: string;
  img: string;
}

export const VIDEOS: Record<string, VideoCard[]> = {
  active: [], endurance: [], strength: [], recomp: [],
};

export interface BuddyMock {
  name: string;
  initials: string;
  streak: number;
  state: 'fire' | 'frost' | 'okay';
  avaColor: 'terracotta' | 'sage' | 'rose';
  todayCheck: string | null;
}

export const BUDDIES: BuddyMock[] = [];

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

export const FRIENDS_FEED: FriendPostMock[] = [];

// ============ DEMO DATA — loaded by Settings → Load demo data ============
export interface DemoFriend {
  id: string;
  name: string;
  day: number;
  streak: number;
  todayEntry: {
    type: 'photo' | 'journal';
    body: string | null;
    isVideo?: boolean;
  } | null;
}

export const DEMO_FRIENDS: DemoFriend[] = [
  { id: 'demo-maya', name: 'Maya',  day: 47, streak: 47,
    todayEntry: { type: 'photo', body: '3h 02m yesterday. Deleted Instagram for the week.' } },
  { id: 'demo-jay',  name: 'Jay',   day: 22, streak: 14,
    todayEntry: { type: 'photo', body: '5h 40m — rough day, too much TikTok. Resetting.' } },
  { id: 'demo-sam',  name: 'Sam',   day: 61, streak: 61,
    todayEntry: { type: 'photo', body: '2h 15m. Best day this month.' } },
  { id: 'demo-rina', name: 'Rina',  day: 9,  streak: 9,
    todayEntry: { type: 'photo', body: 'Day 9. 4h flat. Slowly bringing it down.' } },
  { id: 'demo-leo',  name: 'Leo',   day: 33, streak: 33,
    todayEntry: { type: 'photo', body: '4h 30m. Phone stays in another room after 9pm now.' } },
];

export interface DemoDiscover {
  id: string;
  name: string;
  initials: string;
  bio: string;
  day: number;
  streak: number;
  avaGradient: string;
  bg: string;          // photo gradient for the explore tile
  tag: string;         // category for filter (Running, Lifting, etc.)
  caption: string;
  isVideo?: boolean;
}

export const DISCOVER_FILTERS = [
  'For you',
  'Running',
  'Lifting',
  'Outdoor',
  'Recovery',
  'Eating',
  'No alcohol',
  'Yoga',
] as const;

export const DEMO_DISCOVER: DemoDiscover[] = [
  { id:'dd-1', name:'Theo R.',   initials:'TR', bio:'Recomp · two-a-days',       day: 41, streak: 41,
    avaGradient: 'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)',
    bg: 'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)',
    tag: 'Lifting', caption: 'Day 41. Push day done before 7.' },
  { id:'dd-2', name:'Lena T.',   initials:'LT', bio:'Endurance · half marathon', day: 58, streak: 58,
    avaGradient: 'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)',
    bg: 'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)',
    tag: 'Running', caption: '12 miles at sunrise. Body remembered.', isVideo: true },
  { id:'dd-3', name:'Diego P.',  initials:'DP', bio:'Strength · 75 Hard',         day: 12, streak: 12,
    avaGradient: 'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)',
    bg: 'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)',
    tag: 'Lifting', caption: 'Day 12. Volume up, weight up, no excuses.' },
  { id:'dd-4', name:'Ari B.',    initials:'AB', bio:'Recovery · sleep + water',   day: 30, streak: 30,
    avaGradient: 'linear-gradient(160deg,#1c2a18 0%,#3a5530 60%,#a0b08a 100%)',
    bg: 'linear-gradient(160deg,#1c2a18 0%,#3a5530 60%,#a0b08a 100%)',
    tag: 'Recovery', caption: 'Day 30. Slept 8h. Walked 5k. Easy day.' },
  { id:'dd-5', name:'Noor H.',   initials:'NH', bio:'Custom · climbing 3×/wk',    day: 5,  streak: 5,
    avaGradient: 'linear-gradient(160deg,#2a1830 0%,#5a2a55 60%,#b04d9c 100%)',
    bg: 'linear-gradient(160deg,#2a1830 0%,#5a2a55 60%,#b04d9c 100%)',
    tag: 'Outdoor', caption: 'Bouldering session. Got the V4.', isVideo: true },
  { id:'dd-6', name:'Jules M.',  initials:'JM', bio:'Reset · 21 days sober',      day: 21, streak: 21,
    avaGradient: 'linear-gradient(160deg,#102838 0%,#1a5878 60%,#5fb0d4 100%)',
    bg: 'linear-gradient(160deg,#102838 0%,#1a5878 60%,#5fb0d4 100%)',
    tag: 'No alcohol', caption: 'Three weeks. Sleep is incredible.' },
  { id:'dd-7', name:'Kai S.',    initials:'KS', bio:'Move More · long walks',     day: 33, streak: 33,
    avaGradient: 'linear-gradient(160deg,#2a3a28 0%,#5a8a55 60%,#a8d090 100%)',
    bg: 'linear-gradient(160deg,#2a3a28 0%,#5a8a55 60%,#a8d090 100%)',
    tag: 'Outdoor', caption: 'Trail loop, 14k steps before noon.' },
  { id:'dd-8', name:'Riley F.',  initials:'RF', bio:'Recomp · clean eating',      day: 18, streak: 18,
    avaGradient: 'linear-gradient(160deg,#3a2818 0%,#8a5c34 60%,#E0A06F 100%)',
    bg: 'linear-gradient(160deg,#3a2818 0%,#8a5c34 60%,#E0A06F 100%)',
    tag: 'Eating', caption: 'Meal prep Sunday. The whole week sorted.' },
  { id:'dd-9', name:'Sage P.',   initials:'SP', bio:'Yoga + endurance',           day: 9,  streak: 9,
    avaGradient: 'linear-gradient(160deg,#283038 0%,#4c5c78 60%,#a0b0c8 100%)',
    bg: 'linear-gradient(160deg,#283038 0%,#4c5c78 60%,#a0b0c8 100%)',
    tag: 'Yoga', caption: 'Morning flow. 30 minutes, every day.' },
];
