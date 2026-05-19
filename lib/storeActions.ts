// Tiny ad-hoc UI-only state that doesn't need to live in the Zustand store.
// Sheet open/close flags. Imported as a hook by the components that toggle sheets.

import { create } from 'zustand';

export interface ViewerEntry {
  authorName: string;
  authorInitials: string;
  /** "Just now", "Today", "May 12" */
  when: string;
  /** "url('blob:...')" or "linear-gradient(...)" */
  bg?: string;
  /** True if `bg` points to a video file */
  isVideo?: boolean;
  /** Caption / journal body */
  body?: string;
  /** Pure journal entry — no photo */
  isJournal?: boolean;
  day?: number;
  streak?: number;
}

export type FriendListMode = 'following' | 'followers' | 'nudges';

interface UiState {
  settingsOpen: boolean;
  workoutSheetOpen: boolean;
  numericSheetOpen: boolean;
  dailySheetOpen: boolean;
  inviteSheetOpen: boolean;
  viewerEntry: ViewerEntry | null;
  friendListMode: FriendListMode | null;

  openSettings: () => void;
  closeSettings: () => void;
  openWorkoutSheet: () => void;
  closeWorkoutSheet: () => void;
  openNumericSheet: () => void;
  closeNumericSheet: () => void;
  openDailySheet: () => void;
  closeDailySheet: () => void;
  openInviteSheet: () => void;
  closeInviteSheet: () => void;
  openViewer: (entry: ViewerEntry) => void;
  closeViewer: () => void;
  openFriendList: (mode: FriendListMode) => void;
  closeFriendList: () => void;
}

const useUi = create<UiState>((set) => ({
  settingsOpen: false,
  workoutSheetOpen: false,
  numericSheetOpen: false,
  dailySheetOpen: false,
  inviteSheetOpen: false,
  viewerEntry: null,
  friendListMode: null,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openWorkoutSheet: () => set({ workoutSheetOpen: true }),
  closeWorkoutSheet: () => set({ workoutSheetOpen: false }),
  openNumericSheet: () => set({ numericSheetOpen: true }),
  closeNumericSheet: () => set({ numericSheetOpen: false }),
  openDailySheet: () => set({ dailySheetOpen: true }),
  closeDailySheet: () => set({ dailySheetOpen: false }),
  openInviteSheet: () => set({ inviteSheetOpen: true }),
  closeInviteSheet: () => set({ inviteSheetOpen: false }),
  openViewer: (entry) => set({ viewerEntry: entry }),
  closeViewer: () => set({ viewerEntry: null }),
  openFriendList: (mode) => set({ friendListMode: mode }),
  closeFriendList: () => set({ friendListMode: null }),
}));

// Small typed accessor for convenience:
export function useSparkActions<T extends keyof UiState>(key: T): UiState[T] {
  return useUi((s) => s[key]);
}

export { useUi };
// re-export for convenience so Home can do `import { useSpark } from '@/lib/storeActions'`
export { useSpark } from './store';
