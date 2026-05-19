// Tiny ad-hoc UI-only state that doesn't need to live in the Zustand store.
// Sheet open/close flags. Imported as a hook by the components that toggle sheets.

import { create } from 'zustand';

interface UiState {
  settingsOpen: boolean;
  workoutSheetOpen: boolean;
  numericSheetOpen: boolean;
  dailySheetOpen: boolean;
  inviteSheetOpen: boolean;

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
}

const useUi = create<UiState>((set) => ({
  settingsOpen: false,
  workoutSheetOpen: false,
  numericSheetOpen: false,
  dailySheetOpen: false,
  inviteSheetOpen: false,
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
}));

// Small typed accessor for convenience:
export function useSparkActions<T extends keyof UiState>(key: T): UiState[T] {
  return useUi((s) => s[key]);
}

export { useUi };
// re-export for convenience so Home can do `import { useSpark } from '@/lib/storeActions'`
export { useSpark } from './store';
