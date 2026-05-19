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
  addCustomSlot: () => void;
  removeCustomSlot: (i: number) => void;

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
  return [
    { category: 'workout', label: 'Workout 1',
      config: { mustBeOutdoors: false, minDuration: 45 },
      completed: false, details: null, value: 0, source: null },
    { category: 'workout', label: 'Outside Workout',
      config: { mustBeOutdoors: true, minDuration: 45 },
      completed: false, details: null, value: 0, source: null },
    { category: 'steps', label: '10K Steps',
      config: { goal: 10000 },
      completed: false, details: null, value: 0, source: null },
  ];
}

function makeDefaultCustomDraft(): CustomDraftSlot[] {
  return [
    { categoryId: 'workout', config: { mustBeOutdoors: false, minDuration: 45 } },
    { categoryId: 'workout', config: { mustBeOutdoors: true,  minDuration: 45 } },
    { categoryId: 'steps',   config: { goal: 10000 } },
  ];
}

// Empty calendar by default — populated as the user completes days.
const defaultCalendar: Record<number, CalendarDay> = {};

// Empty by default — populated only when the user posts or loads demo.
const defaultDiary: DiaryEntry[] = [];

/**
 * Helper used by every "complete a check-in" action. Applies the slot mutation
 * to the menu, and if every slot is completed, bumps the day counter, locks in
 * a calendar entry, and resets all slots for tomorrow.
 */
function bumpIfAllDone(
  st: SparkState,
  mutate: (m: Menu) => Menu,
): Partial<SparkState> {
  const m = mutate(st.menu);
  const allDone = m.length > 0 && m.every((c) => c.completed);
  if (!allDone) return { menu: m };

  const u = { ...st.user, streak: st.user.streak + 1 };
  const cal = {
    ...st.calendar,
    [u.day]: { done: m.map(() => true) },
  };
  if (u.day >= 75) {
    return { menu: m, user: u, calendar: cal, day75Celebrate: true };
  }
  u.day += 1;
  const reset = m.map((c) => ({
    ...c,
    completed: false,
    value: 0,
    source: null,
    details: null,
  }));
  return { menu: reset, user: u, calendar: cal };
}

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
    const m: Menu = preset.slots.map((slot) => ({
      category: slot.cat,
      label: slot.label,
      config: { ...slot.config },
      completed: false,
      details: null,
      value: 0,
      source: null,
    }));
    set({ menu: m, user: { ...get().user, preset: id } });
    set({
      customDraft: preset.slots.map((s) => ({
        categoryId: s.cat,
        config: { ...s.config },
        label: s.label,
      })),
    });
  },

  applyCustomDraft: () => {
    const draft = get().customDraft;
    const m: Menu = draft.map((d) => {
      const cat = CATEGORIES[d.categoryId];
      let label = d.label || '';
      if (!label) {
        if (cat.type === 'workout')
          label = d.config.mustBeOutdoors ? 'Outside Workout' : 'Workout';
        else if (cat.type === 'numeric')
          label = (cat.fmt?.(d.config.goal ?? cat.defaultGoal ?? 0) ?? '') + '';
        else if (cat.type === 'custom') label = d.config.label || 'Custom';
        else label = cat.label;
      }
      return {
        category: d.categoryId,
        label,
        config: { ...d.config },
        completed: false,
        details: null,
        value: 0,
        source: null,
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

  addCustomSlot: () => set((st) => {
    if (st.customDraft.length >= 6) return st;
    return {
      customDraft: [
        ...st.customDraft,
        { categoryId: 'workout', config: { mustBeOutdoors: false, minDuration: 30 } },
      ],
    };
  }),

  removeCustomSlot: (i) => set((st) => {
    if (st.customDraft.length <= 1) return st;
    return { customDraft: st.customDraft.filter((_, j) => j !== i) };
  }),

  // Helpers used by every "complete a check-in" action
  pickCheckIn: (key, picked) => set((st) => ({
    menu: st.menu.map((c, i) => (i === key ? { ...c, value: picked ?? 0 } : c)),
  })),

  completeCourse: (key) => set((st) => bumpIfAllDone(st, (m) =>
    m.map((c, i) => (i === key ? { ...c, completed: true } : c))
  )),

  toggleBinary: (key) => set((st) => {
    const cur = st.menu[key];
    if (cur.completed) {
      return {
        menu: st.menu.map((c, i) => (i === key ? { ...c, completed: false } : c)),
      } as Partial<SparkState>;
    }
    return bumpIfAllDone(st, (m) =>
      m.map((c, i) => (i === key ? { ...c, completed: true } : c))
    );
  }),

  setCheckInValue: (key, value, source) => set((st) => {
    const cur = st.menu[key];
    const goal = cur.config.goal ?? CATEGORIES[cur.category].defaultGoal ?? 0;
    const hit = value >= goal;
    return bumpIfAllDone(st, (m) =>
      m.map((c, i) =>
        i === key ? { ...c, value, source, completed: hit } : c,
      ),
    );
  }),

  saveWorkoutDetails: (key, details) => set((st) =>
    bumpIfAllDone(st, (m) =>
      m.map((c, i) => (i === key ? { ...c, details, completed: true } : c)),
    ),
  ),

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
