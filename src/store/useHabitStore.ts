import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { computeCoinDelta } from '../lib/coinLogic';
import { today as todayKey } from '../lib/dateUtils';
import { computeGrowthStage } from '../lib/growthStage';
import { validateHabitName } from '../lib/habitValidation';
import { computeDayStatus, evaluateStreak } from '../lib/streakLogic';
import type { DayRecord, GrowthStage, Habit } from '../lib/types';

/**
 * The full persisted + runtime state for the Habrite habit store.
 *
 * Requirements: 1.1, 1.2, 2.2â€“2.7, 3.1, 3.2, 3.7, 3.8, 4.2â€“4.4,
 * 5.2, 5.7, 6.1, 6.2, 8.3â€“8.5, 13.1
 */
export interface HabitState {
  // Habit definitions â€” always exactly three (Req 1.1)
  habits: [Habit, Habit, Habit];

  // Per-day completion records, keyed by "YYYY-MM-DD" (Req 4.4, 13.1)
  dayRecords: Record<string, DayRecord>;

  // Current-day completion (mirrored into dayRecords on each toggle)
  todayCompletedIds: string[];

  // Economy
  coinBalance: number;
  streak: number;
  cumulativeCompletedDays: number;

  // Growth
  growthStage: GrowthStage;
  isWilting: boolean;

  // Celebration
  celebrationActive: boolean;
  celebrationTriggeredToday: boolean;

  // Non-persisted runtime flags
  storeWriteError: boolean; // triggers WarningBanner (Req 2.8)
  _hasHydrated: boolean;

  // Actions
  toggleHabit: (habitId: string) => void;
  saveHabit: (index: 0 | 1 | 2, name: string, reminderTime: string | null) => void;
  evaluateDayOnOpen: (today: string) => void;
  dismissCelebration: () => void;
  dismissStoreWriteError: () => void;
  // Dev/testing helpers for the coin economy
  grantCoins: (amount: number) => void;
  resetCoins: () => void;
  setHydrated: () => void;
}

/**
 * True only in a real browser (or a native RN JS runtime that shims `window`).
 * During Expo's static web render (`web.output: "static"`), route HTML is
 * generated in a bare Node process where `window` is undefined. AsyncStorage's
 * web implementation dereferences `window`, so any read/write throws
 * `ReferenceError: window is not defined`. There is nothing to persist to
 * during SSR anyway, so we detect this environment and skip storage entirely.
 */
const HAS_BROWSER_STORAGE = typeof window !== 'undefined';

/**
 * Flips the runtime-only `storeWriteError` flag without re-entering the persist
 * write path.
 *
 * `storeWriteError` is excluded from `partialize`, but the zustand persist
 * middleware still calls `setItem` on every `setState`. If a failed write's
 * catch handler calls `setState` directly, that triggers another `setItem`,
 * which fails again, which calls `setState` again â€” an infinite loop that
 * spins CPU and grows memory until the process OOMs. Guarding on the flag's
 * current value ensures we set it (and thus write) at most once per error
 * episode, breaking the loop.
 */
function markWriteError(): void {
  if (!useHabitStore.getState().storeWriteError) {
    useHabitStore.setState({ storeWriteError: true });
  }
}

/**
 * A thin wrapper around AsyncStorage that intercepts write failures.
 *
 * When `setItem` (or `removeItem`) throws, we swallow the error and flip the
 * runtime-only `storeWriteError` flag so the WarningBanner can surface a
 * non-blocking warning. Crucially, we do NOT re-throw: the persist middleware
 * treats the write as "done", so the toggled state is retained in memory
 * (Req 2.8). Reads delegate straight through to AsyncStorage.
 *
 * During static web render (no `window`), every method is a no-op stub so
 * AsyncStorage is never touched â€” there is no persistence target on the server.
 *
 * `useHabitStore` is referenced lazily inside the callbacks â€” they only run at
 * runtime, well after the store has finished initializing, so there is no TDZ
 * concern.
 */
const wrappedStorage = {
  getItem: (name: string): Promise<string | null> => {
    if (!HAS_BROWSER_STORAGE) return Promise.resolve(null);
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!HAS_BROWSER_STORAGE) return;
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      // Swallow â€” retain in-memory state and surface a warning (Req 2.8).
      console.warn('[habrite] Failed to persist store state:', error);
      markWriteError();
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (!HAS_BROWSER_STORAGE) return;
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn('[habrite] Failed to remove persisted store state:', error);
      markWriteError();
    }
  },
};

const DEFAULT_HABITS: [Habit, Habit, Habit] = [
  { id: 'habit-1', name: 'Habit 1', reminderTime: null, notificationId: null },
  { id: 'habit-2', name: 'Habit 2', reminderTime: null, notificationId: null },
  { id: 'habit-3', name: 'Habit 3', reminderTime: null, notificationId: null },
];

/** Total number of habits â€” fixed at three (Req 1.1). */
const HABIT_COUNT = 3;

/**
 * Finds the most recent DayRecord in `dayRecords` strictly before `today`.
 * Because dateKeys are "YYYY-MM-DD", lexical comparison equals chronological.
 */
function findLastRecordBefore(
  dayRecords: Record<string, DayRecord>,
  today: string,
): DayRecord | undefined {
  let latest: DayRecord | undefined;
  for (const key of Object.keys(dayRecords)) {
    if (key >= today) continue;
    if (latest === undefined || key > latest.dateKey) {
      latest = dayRecords[key];
    }
  }
  return latest;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: DEFAULT_HABITS,
      dayRecords: {},
      todayCompletedIds: [],
      coinBalance: 0,
      streak: 0,
      cumulativeCompletedDays: 0,
      growthStage: 'seedling',
      isWilting: false,
      celebrationActive: false,
      celebrationTriggeredToday: false,
      storeWriteError: false,
      _hasHydrated: false,

      toggleHabit: (habitId: string) => {
        const state = get();

        // Guard: only toggle IDs that belong to the fixed habit set.
        const habitIds = state.habits.map((h) => h.id);
        if (!habitIds.includes(habitId)) {
          return;
        }

        const dateKey = todayKey();
        const isCompleted = state.todayCompletedIds.includes(habitId);

        let newCompletedIds: string[];
        let delta: number;
        let newStreak = state.streak;
        let celebrationActive = state.celebrationActive;
        let celebrationTriggeredToday = state.celebrationTriggeredToday;
        let cumulativeCompletedDays = state.cumulativeCompletedDays;
        let isWilting = state.isWilting;

        if (!isCompleted) {
          // ---- Completing a habit ----
          newCompletedIds = [...state.todayCompletedIds, habitId];

          const isThirdHabit = newCompletedIds.length === HABIT_COUNT;

          if (isThirdHabit && !state.celebrationTriggeredToday) {
            // Third-and-final habit completes today â†’ celebration bonus (Req 3.1, 3.2)
            delta = computeCoinDelta('complete', false, true); // +15
            newStreak = state.streak + 1;
            celebrationActive = true;
            celebrationTriggeredToday = true;
            // The day just became fully complete â†’ count it (Req 5.2, 5.7)
            cumulativeCompletedDays = state.cumulativeCompletedDays + 1;
          } else {
            // Normal habit completion (Req 2.6)
            delta = computeCoinDelta('complete', false, false); // +5
          }

          // Completing the first habit while wilting clears the wilt (Req 6.2)
          if (isWilting && state.todayCompletedIds.length === 0) {
            isWilting = false;
          }
        } else {
          // ---- Uncompleting a habit ----
          newCompletedIds = state.todayCompletedIds.filter((id) => id !== habitId);

          if (state.celebrationTriggeredToday) {
            // Undo after celebration was triggered â†’ reverse the full bonus (Req 3.7)
            delta = computeCoinDelta('uncomplete', true, false); // -15
            newStreak = Math.max(0, state.streak - 1);
            celebrationActive = false;
            celebrationTriggeredToday = false;
            // The day is no longer fully complete â†’ uncount it
            cumulativeCompletedDays = Math.max(0, state.cumulativeCompletedDays - 1);
          } else {
            // Normal habit uncompletion (Req 2.7)
            delta = computeCoinDelta('uncomplete', false, false); // -5
          }
        }

        // Coin balance clamped to a minimum of 0 (Req 8.4)
        const newBalance = Math.max(0, state.coinBalance + delta);

        // Growth stage derived from cumulative completed days (Req 5.2, 5.7)
        const growthStage = computeGrowthStage(cumulativeCompletedDays);

        // Keep today's DayRecord in sync with the toggle (Req 2.4, 4.4)
        const dayRecord: DayRecord = {
          dateKey,
          completedHabitIds: newCompletedIds,
          status: computeDayStatus(newCompletedIds, habitIds),
        };

        set({
          todayCompletedIds: newCompletedIds,
          coinBalance: newBalance,
          streak: newStreak,
          cumulativeCompletedDays,
          growthStage,
          isWilting,
          celebrationActive,
          celebrationTriggeredToday,
          dayRecords: { ...state.dayRecords, [dateKey]: dayRecord },
        });
      },

      saveHabit: (index: 0 | 1 | 2, name: string, reminderTime: string | null) => {
        // Validation gate (Req 1.4, 1.5). UI surfaces the error; store stays unchanged.
        const result = validateHabitName(name);
        if (!result.valid) {
          return;
        }

        const state = get();
        const habits = [...state.habits] as [Habit, Habit, Habit];
        habits[index] = {
          ...habits[index],
          name: name.trim(),
          reminderTime,
        };

        set({ habits });
      },

      evaluateDayOnOpen: (today: string) => {
        const state = get();
        const lastRecord = findLastRecordBefore(state.dayRecords, today);

        // Idempotent streak evaluation (Req 4.2, 4.3, 4.6)
        const { newStreak, resetOccurred } = evaluateStreak(
          state.streak,
          lastRecord,
          today,
        );

        // Wilting activates when the most recent recorded day was not fully
        // complete (partial or missed) (Req 6.1). No prior day â†’ no wilting (Req 6.6).
        let isWilting = state.isWilting;
        if (lastRecord !== undefined && lastRecord.dateKey !== today) {
          isWilting = lastRecord.status !== 'complete';
        }

        // Reset today's in-memory completion when there is no record for today yet
        // (fresh day) (Req 2.5).
        const hasTodayRecord = state.dayRecords[today] !== undefined;
        const todayCompletedIds = hasTodayRecord
          ? state.dayRecords[today].completedHabitIds
          : [];

        // A new day means the celebration for "today" has not fired yet.
        const celebrationTriggeredToday = hasTodayRecord
          ? state.celebrationTriggeredToday
          : false;

        set({
          streak: newStreak,
          isWilting,
          todayCompletedIds,
          celebrationTriggeredToday,
          celebrationActive: hasTodayRecord ? state.celebrationActive : false,
        });

        // `resetOccurred` is captured for parity with evaluateStreak's contract;
        // the wilting flag above already reflects the reset condition.
        void resetOccurred;
      },

      dismissCelebration: () => {
        set({ celebrationActive: false });
      },

      dismissStoreWriteError: () => {
        set({ storeWriteError: false });
      },

      grantCoins: (amount: number) => {
        // Add coins to the balance, clamped to a minimum of 0 (Req 8.4).
        set((state) => ({ coinBalance: Math.max(0, state.coinBalance + amount) }));
      },
      resetCoins: () => {
        set({ coinBalance: 0 });
      },
      setHydrated: () => {
        set({ _hasHydrated: true });
      },
    }),
    {
      name: 'habrite-habit-store',
      storage: createJSONStorage(() => wrappedStorage),
      // Exclude runtime-only flags from persistence (Req 13.1).
      partialize: (state) => ({
        habits: state.habits,
        dayRecords: state.dayRecords,
        todayCompletedIds: state.todayCompletedIds,
        coinBalance: state.coinBalance,
        streak: state.streak,
        cumulativeCompletedDays: state.cumulativeCompletedDays,
        growthStage: state.growthStage,
        isWilting: state.isWilting,
        celebrationActive: state.celebrationActive,
        celebrationTriggeredToday: state.celebrationTriggeredToday,
      }),
      onRehydrateStorage: () => (_state, error) => {
        // Called after hydration completes (success or failure).
        if (error) {
          // Surface a non-blocking warning on read failure (Req 13.3 support).
          markWriteError();
        }
        // Mark hydration complete so the boot sequence can proceed (Req 13.2).
        useHabitStore.getState().setHydrated();
      },
    },
  ),
);
