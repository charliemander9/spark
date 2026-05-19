// Shared types for Spark.

export type CategoryId =
  | 'workout' | 'steps' | 'water' | 'sleep'
  | 'alcohol' | 'cleanEating' | 'reading' | 'custom';

export type CategoryType = 'workout' | 'numeric' | 'binary' | 'custom';

export interface Category {
  id: CategoryId;
  label: string;
  type: CategoryType;
  ringColor: string;
  desc?: string;
  unit?: string;
  defaultGoal?: number;
  range?: [number, number];
  step?: number;
  fmt?: (n: number) => string;
  supportsSync?: boolean;
}

export type PresetId =
  | '75-hard' | '75-hard-lite' | 'runner' | 'endurance' | 'move-more'
  | 'recomp' | 'reset' | 'recovery' | 'custom';

export interface PresetSlot {
  cat: CategoryId;
  label: string;
  config: SlotConfig;
}

export interface Preset {
  label: string;
  desc: string;
  slots: PresetSlot[] | null;
}

export interface SlotConfig {
  mustBeOutdoors?: boolean;
  minDuration?: number;
  goal?: number;
  label?: string;       // for custom
  quantified?: boolean; // for custom
  unit?: string;        // for custom
}

export interface Photo {
  type: 'photo' | 'video';
  bg: string;
}

export interface WorkoutDetails {
  type: string;
  duration: string;
  place: string;
  source: string | null;
  photos: Photo[];
}

export interface CheckIn {
  category: CategoryId;
  label: string;
  config: SlotConfig;
  completed: boolean;
  details: WorkoutDetails | null;
  value: number;
  source: string | null;
}

export type Privacy = 'private' | 'friends' | 'open';
export type Tone = 'feather' | 'balanced' | 'rock';
export type DailyMode = 'photo' | 'journal';

export interface Buddy { name: string; relation: string; phone?: string; }

export interface DailyEntry { type: DailyMode; savedAt: number; }

export interface User {
  name: string;
  bio: string;                 // user-editable bio shown on Profile
  avatarUrl: string | null;    // optional uploaded profile picture (blob URL or http URL)
  privacy: Privacy;
  tone: Tone;
  buddies: Buddy[];
  follows: string[];
  streak: number;
  day: number;
  freezes: number;             // Duolingo-style streak freezes available
  preset: PresetId | string;
  dailyEntry: DailyEntry | null;
  strict: boolean;
  push: boolean;
  accBuddy: boolean;
  notifBuddies: boolean;
}

/** Menu is now a variable-length list of check-ins (1–6). Presets ship 3. */
export type Menu = CheckIn[];

/** A SlotKey is the index of a CheckIn in the Menu array. */
export type SlotKey = number;

/** Per-day completion record — one boolean per slot in the user's menu. */
export interface CalendarDay {
  done: boolean[];
}

export interface DiaryEntry {
  id: string;
  day: string;
  date: string;
  type: 'video' | 'photo' | 'reflection';
  course?: string;
  bg?: string;
  body?: string;
  photos?: Photo[];
  isDaily?: boolean;
}

export interface CustomDraftSlot {
  categoryId: CategoryId;
  config: SlotConfig;
  label?: string;
}

export type Screen =
  | 'onb-welcome' | 'onb-challenge' | 'onb-privacy' | 'onb-buddies'
  | 'app';

export type Tab = 'home' | 'discover' | 'journal' | 'friends' | 'foryou';
