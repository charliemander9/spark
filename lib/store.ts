// Zustand store — all global state for Spark.

import { create } from 'zustand';
import { CATEGORIES, PRESETS } from './data';
import type {
  CheckIn, CustomDraftSlot, DiaryEntry, Menu, Photo, Screen, SlotKey, Tab, User,
  CalendarDay, WorkoutDetails,
} from './types';

interface SparkState {
  // Routing
  screen: Screen;
  tab: Tab;
  day75Celebrate: boolean;

  // User
  user: User;

  // Daily menu (3 slots)
  menu: Menu;

  // Customization draft (used in Build-my-own)
  customDraft: CustomDraftSlot[];

  // Calendar history
  calendar: Record<number, CalendarDay>;

  // Diary (photos / videos / reflections)
  diary: DiaryEntry[];
  newestDiaryId: string | null;

  // Demo mode — extra fake friends/discover content layered in for showcase
  demoMode: boolean;

  // Sheet state
  workoutSheetCourse: SlotKey | null;
  workoutPhotosTmp: Photo[];
  numericSheetKey: SlotKey | null;
  dailyMode: 'photo' | 'journal';
  dailyPhotosTmp: Photo[];

  // Actions
  setScreen: (s: Screen) => void;
  setTab: (t: Tab) => void;
  setUser: (patch: Partial<User>) => void;
  setMenu: (m: Menu) => void;
  applyPreset: (id: string) => void;
  applyCustomDraft: () => void;
  setCustomDraft: (d: CustomDraftSlot[]) => void;
  patchCustomSlot: (i: number, patch: Partial<CustomDraftSlot> & { config?: Partial<CustomDraftSlot['config']> }) => void;

  setWorkoutSheetCourse: (k: SlotKey | null) => void;
  setNumericSheetKey: (k: SlotKey | null) => void;

  pickCheckIn: (key: SlotKey, picked: number | null) => void;
  completeCourse: (key: SlotKey) => void;
  toggleBinary: (key: SlotKey) => void;
  setCheckInValue: (key: SlotKey, value: number, source: string | null) => void;
  saveWorkoutDetails: (key: SlotKey, details: WorkoutDetails) => void;

  setDailyEntry: (entry: User['dailyEntry']) => void;
  useFreeze: () => void;
  pushDiary: (e: DiaryEntry) => void;

  setDay75: (v: boolean) => void;
  beginAnother75: () => void;

  loadDemo: () => void;
  clearDemo: () => void;
}

function makeDefaultMenu(): Menu {
  return {
    appetizer: { category: 'workout', label: 'Workout 1',
      config: { mustBeOutdoors: false, minDuration: 45 },
      completed: false, details: null, value: 0, source: null },
    main: { category: 'workout', label: 'Outside Workout',
      config: { mustBeOutdoors: true, minDuration: 45 },
      completed: false, details: null, value: 0, source: null },
    treat: { category: 'steps', label: '10K Steps',
      config: { goal: 10000 },
      completed: false, details: null, value: 0, source: null },
  };
}

function makeDefaultCustomDraft(): CustomDraftSlot[] {
  return [
    { categoryId: 'workout', config: { mustBeOutdoors: false, minDuration: 45 } },
    { categoryId: 'workout', config: { mustBeOutdoors: true,  minDuration: 45 } },
    { categoryId: 'steps',   config: { goal: 10000 } },
  ];
}

const defaultCalendar: Record<number, CalendarDay> = {
  1:  { w1: true, w2: true,  steps: true  },
  2:  { w1: true, w2: true,  steps: true  },
  3:  { w1: true, w2: true,  steps: true  },
  4:  { w1: true, w2: false, steps: true  },
  5:  { w1: true, w2: true,  steps: true  },
  6:  { w1: true, w2: true,  steps: true  },
  7:  { w1: true, w2: true,  steps: true  },
  8:  { w1: true, w2: true,  steps: false },
  9:  { w1: true, w2: true,  steps: true  },
  10: { w1: true, w2: true,  steps: true  },
  11: { w1: true, w2: true,  steps: true  },
  12: { w1: true, w2: true,  steps: true  },
};

const defaultDiary: DiaryEntry[] = [
  { id:'d1', day:'M',  date:'May 12', course:'main',      type:'photo', bg:'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)' },
  { id:'d2', day:'T',  date:'May 13', course:'treat',     type:'reflection',
    body:'Hit 13K today without trying. Walked the long way home from the lift session. Legs heavy but light, somehow.' },
  { id:'d3', day:'W',  date:'May 14', course:'appetizer', type:'video', bg:'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)' },
  { id:'d4', day:'W',  date:'May 14', course:'main',      type:'video', bg:'linear-gradient(160deg,#0c2438 0%,#1a4870 60%,#5a90b8 100%)' },
  { id:'d5', day:'Th', date:'May 15', course:'appetizer', type:'photo', bg:'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)' },
];

export const useSpark = create<SparkState>((set, get) => ({
  screen: 'onb-welcome',
  tab: 'home',
  day75Celebrate: false,

  user: {
    name: 'Charlie',
    privacy: 'friends',
    tone: 'balanced',
    buddies: [],
    follows: [],
    streak: 13,
    day: 13,
    freezes: 2,
    preset: 'custom',
    dailyEntry: null,
    strict: true,
    push: true,
    accBuddy: true,
    notifBuddies: true,
  },

  menu: makeDefaultMenu(),
  customDraft: makeDefaultCustomDraft(),
  calendar: { ...defaultCalendar },
  diary: defaultDiary,
  newestDiaryId: null,
  demoMode: false,

  workoutSheetCourse: null,
  workoutPhotosTmp: [],
  numericSheetKey: null,
  dailyMode: 'photo',
  dailyPhotosTmp: [],

  setScreen: (s) => set({ screen: s }),
  setTab: (t) => set({ tab: t }),
  setUser: (patch) => set((st) => ({ user: { ...st.user, ...patch } })),
  setMenu: (m) => set({ menu: m }),
  setWorkoutSheetCourse: (k) => set({ workoutSheetCourse: k }),
  setNumericSheetKey: (k) => set({ numericSheetKey: k }),

  applyPreset: (id) => {
    const preset = PRESETS[id];
    if (!preset?.slots) return;
    const keys: SlotKey[] = ['appetizer', 'main', 'treat'];
    const m: Menu = makeDefaultMenu();
    preset.slots.forEach((slot, i) => {
      const key = keys[i];
      m[key] = {
        category: slot.cat,
        label: slot.label,
        config: { ...slot.config },
        completed: false, details: null, value: 0, source: null,
      };
    });
    set({ menu: m, user: { ...get().user, preset: id } });
    set({ customDraft: preset.slots.map((s) => ({ categoryId: s.cat, config: { ...s.config }, label: s.label })) });
  },

  applyCustomDraft: () => {
    const keys: SlotKey[] = ['appetizer', 'main', 'treat'];
    const draft = get().customDraft;
    const m: Menu = makeDefaultMenu();
    draft.forEach((d, i) => {
      const key = keys[i];
      const cat = CATEGORIES[d.categoryId];
      let label = d.label || '';
      if (!label) {
        if (cat.type === 'workout')  label = d.config.mustBeOutdoors ? 'Outside Workout' : 'Workout';
        else if (cat.type === 'numeric') label = (cat.fmt?.(d.config.goal ?? cat.defaultGoal ?? 0) ?? '') + '';
        else if (cat.type === 'custom')  label = d.config.label || 'Custom';
        else label = cat.label;
      }
      m[key] = {
        category: d.categoryId,
        label,
        config: { ...d.config },
        completed: false, details: null, value: 0, source: null,
      };
    });
    set({ menu: m, user: { ...get().user, preset: 'custom' } });
  },

  setCustomDraft: (d) => set({ customDraft: d }),

  patchCustomSlot: (i, patch) => set((st) => {
    const draft = [...st.customDraft];
    const cur = draft[i];
    draft[i] = {
      ...cur,
      ...patch,
      config: { ...cur.config, ...(patch.config || {}) },
    };
    return { customDraft: draft };
  }),

  pickCheckIn: (key, picked) => set((st) => ({
    menu: { ...st.menu, [key]: { ...st.menu[key], value: picked ?? 0 } },
  })),

  completeCourse: (key) => set((st) => {
    const m = { ...st.menu, [key]: { ...st.menu[key], completed: true } };
    const allDone = m.appetizer.completed && m.main.completed && m.treat.completed;
    const u = { ...st.user };
    let cal = st.calendar;
    if (allDone) {
      u.streak += 1;
      cal = { ...cal, [u.day]: { w1: true, w2: true, steps: true } };
      if (u.day >= 75) {
        return { menu: m, user: u, calendar: cal, day75Celebrate: true };
      }
      u.day += 1;
      m.appetizer.completed = false;
      m.main.completed = false;
      m.treat.completed = false;
    }
    return { menu: m, user: u, calendar: cal };
  }),

  toggleBinary: (key) => set((st) => {
    const cur = st.menu[key];
    if (!cur.completed) {
      const next: CheckIn = { ...cur, completed: true };
      const m = { ...st.menu, [key]: next };
      const allDone = m.appetizer.completed && m.main.completed && m.treat.completed;
      const u = { ...st.user };
      let cal = st.calendar;
      if (allDone) {
        u.streak += 1;
        cal = { ...cal, [u.day]: { w1: true, w2: true, steps: true } };
        if (u.day >= 75) return { menu: m, user: u, calendar: cal, day75Celebrate: true };
        u.day += 1;
        m.appetizer.completed = false;
        m.main.completed = false;
        m.treat.completed = false;
      }
      return { menu: m, user: u, calendar: cal };
    } else {
      return { menu: { ...st.menu, [key]: { ...cur, completed: false } } };
    }
  }),

  setCheckInValue: (key, value, source) => set((st) => {
    const cur = st.menu[key];
    const goal = cur.config.goal ?? CATEGORIES[cur.category].defaultGoal ?? 0;
    const hit = value >= goal;
    const m = { ...st.menu, [key]: { ...cur, value, source, completed: hit } };
    const allDone = m.appetizer.completed && m.main.completed && m.treat.completed;
    const u = { ...st.user };
    let cal = st.calendar;
    if (hit && allDone) {
      u.streak += 1;
      cal = { ...cal, [u.day]: { w1: true, w2: true, steps: true } };
      if (u.day >= 75) return { menu: m, user: u, calendar: cal, day75Celebrate: true };
      u.day += 1;
      m.appetizer.completed = false;
      m.main.completed = false;
      m.treat.completed = false;
    }
    return { menu: m, user: u, calendar: cal };
  }),

  saveWorkoutDetails: (key, details) => set((st) => {
    const cur = st.menu[key];
    const m = { ...st.menu, [key]: { ...cur, details, completed: true } };
    const allDone = m.appetizer.completed && m.main.completed && m.treat.completed;
    const u = { ...st.user };
    let cal = st.calendar;
    if (allDone) {
      u.streak += 1;
      cal = { ...cal, [u.day]: { w1: true, w2: true, steps: true } };
      if (u.day >= 75) return { menu: m, user: u, calendar: cal, day75Celebrate: true };
      u.day += 1;
      m.appetizer.completed = false;
      m.main.completed = false;
      m.treat.completed = false;
    }
    return { menu: m, user: u, calendar: cal };
  }),

  setDailyEntry: (entry) => set((st) => ({ user: { ...st.user, dailyEntry: entry } })),

  // Streak freeze — uses one freeze, marks today as covered without requiring a real entry
  useFreeze: () => set((st) => {
    if (st.user.freezes <= 0) return st;
    return {
      user: {
        ...st.user,
        freezes: st.user.freezes - 1,
        dailyEntry: { type: 'photo', savedAt: Date.now() },
      },
    };
  }),

  pushDiary: (e) => set((st) => ({
    diary: [e, ...st.diary],
    newestDiaryId: e.id,
  })),

  setDay75: (v) => set({ day75Celebrate: v }),

  beginAnother75: () => set((st) => ({
    user: { ...st.user, day: 1, streak: 1 },
    calendar: {},
    menu: makeDefaultMenu(),
    day75Celebrate: false,
    tab: 'home',
  })),

  loadDemo: () => set((st) => ({
    demoMode: true,
    diary: [
      ...DEMO_DIARY,
      ...st.diary.filter((d) => !d.id.startsWith('demo_')),
    ],
  })),

  clearDemo: () => set((st) => ({
    demoMode: false,
    diary: st.diary.filter((d) => !d.id.startsWith('demo_')),
  })),
}));

const DEMO_DIARY: DiaryEntry[] = [
  { id:'demo_1', day:'F',  date:'May 16', type:'photo', isDaily: true,
    bg:'linear-gradient(160deg,#1c3548 0%,#2d6a95 60%,#7AB6D8 100%)' },
  { id:'demo_2', day:'Th', date:'May 15', type:'reflection',
    body:'Long run before work. Lungs burned the first mile then the body remembered. There\'s a moment around minute 22 where it stops being a fight.' },
  { id:'demo_3', day:'W',  date:'May 14', type:'video',
    bg:'linear-gradient(160deg,#2e2a18 0%,#7c6c30 60%,#F5C842 100%)' },
  { id:'demo_4', day:'T',  date:'May 13', type:'photo',
    bg:'linear-gradient(160deg,#3a2818 0%,#a05c34 60%,#E8896F 100%)' },
  { id:'demo_5', day:'M',  date:'May 12', type:'reflection',
    body:'Restart week. Bed before 10. Two workouts, ten thousand steps. Boring on paper, less boring when I do it.' },
  { id:'demo_6', day:'Su', date:'May 11', type:'photo',
    bg:'linear-gradient(160deg,#1c2a18 0%,#3a5530 60%,#a0b08a 100%)' },
  { id:'demo_7', day:'Sa', date:'May 10', type:'video',
    bg:'linear-gradient(160deg,#2a1830 0%,#5a2a55 60%,#b04d9c 100%)' },
  { id:'demo_8', day:'F',  date:'May 9',  type:'photo',
    bg:'linear-gradient(160deg,#102838 0%,#1a5878 60%,#5fb0d4 100%)' },
  { id:'demo_9', day:'Th', date:'May 8',  type:'reflection',
    body:'Skipped the second workout. The day got away from me. Doing it tomorrow without making it a whole thing.' },
];
