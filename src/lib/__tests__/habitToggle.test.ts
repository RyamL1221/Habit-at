// Feature: habrite-app, Property 4: Habit toggle is its own inverse
// Feature: habrite-app, Property 7: Third-habit completion triggers celebration
// Feature: habrite-app, Property 8: Day reset on new day open
//
// Validates: Requirements 2.2, 2.3, 2.4, 2.5, 3.1, 3.8

// AsyncStorage is imported transitively by the store via the persist
// middleware. Mock it so the store can be exercised in the Jest environment.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import * as fc from 'fast-check';
import { useHabitStore, type HabitState } from '../../store/useHabitStore';
import type { Habit, DayRecord } from '../types';

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

/** The store's default habit IDs (see DEFAULT_HABITS in useHabitStore). */
const HABIT_IDS = ['habit-1', 'habit-2', 'habit-3'] as const;

const DEFAULT_HABITS: [Habit, Habit, Habit] = [
  { id: 'habit-1', name: 'Habit 1', reminderTime: null, notificationId: null },
  { id: 'habit-2', name: 'Habit 2', reminderTime: null, notificationId: null },
  { id: 'habit-3', name: 'Habit 3', reminderTime: null, notificationId: null },
];

/**
 * Builds a fresh, deterministic default slice of persisted state.
 * Only the persisted/runtime data fields are provided — the actions live on
 * the store and are preserved by `setState`'s shallow merge.
 */
function defaultState(): Partial<HabitState> {
  return {
    habits: [
      { ...DEFAULT_HABITS[0] },
      { ...DEFAULT_HABITS[1] },
      { ...DEFAULT_HABITS[2] },
    ],
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
    _hasHydrated: true,
  };
}

/** Resets the store to a clean default state. */
function resetStore(overrides: Partial<HabitState> = {}): void {
  useHabitStore.setState({ ...defaultState(), ...overrides });
}

// ---------------------------------------------------------------------------
// Property 4: Habit toggle is its own inverse
// ---------------------------------------------------------------------------

describe('toggleHabit — inverse property (P4)', () => {
  beforeEach(() => resetStore());

  it('P4a: toggling a habit twice returns todayCompletedIds to its original state', () => {
    // Feature: habrite-app, Property 4: Habit toggle is its own inverse
    fc.assert(
      fc.property(
        // Any starting subset of completed habits...
        fc.subarray([...HABIT_IDS]),
        // ...and any habit to toggle twice.
        fc.constantFrom(...HABIT_IDS),
        (initialCompleted, habitId) => {
          resetStore({ todayCompletedIds: [...initialCompleted] });

          const before = [...useHabitStore.getState().todayCompletedIds];

          useHabitStore.getState().toggleHabit(habitId);
          useHabitStore.getState().toggleHabit(habitId);

          const after = useHabitStore.getState().todayCompletedIds;

          // Order-independent set equality: same members, same length.
          return (
            after.length === before.length &&
            before.every((id) => after.includes(id)) &&
            after.every((id) => before.includes(id))
          );
        },
      ),
    );
  });

  it('P4b: coin balance is restored after a complete/uncomplete round trip', () => {
    // Feature: habrite-app, Property 4: Habit toggle is its own inverse
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.constantFrom(...HABIT_IDS),
        (startBalance, habitId) => {
          // Start with the habit uncompleted so the first toggle completes it.
          resetStore({ coinBalance: startBalance, todayCompletedIds: [] });

          useHabitStore.getState().toggleHabit(habitId); // complete
          useHabitStore.getState().toggleHabit(habitId); // uncomplete

          return useHabitStore.getState().coinBalance === startBalance;
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Third-habit completion triggers celebration
// ---------------------------------------------------------------------------

describe('toggleHabit — third-habit celebration (P7)', () => {
  beforeEach(() => resetStore());

  it('P7: completing the third habit sets celebrationActive = true', () => {
    // Feature: habrite-app, Property 7: Third-habit completion triggers celebration
    fc.assert(
      fc.property(
        // Choose which single habit remains uncompleted (the "third").
        fc.constantFrom(0, 1, 2),
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        (thirdIndex, startBalance, startStreak) => {
          const remaining = HABIT_IDS[thirdIndex];
          const alreadyDone = HABIT_IDS.filter((id) => id !== remaining);

          // Exactly two habits completed, celebration not yet triggered.
          resetStore({
            todayCompletedIds: [...alreadyDone],
            coinBalance: startBalance,
            streak: startStreak,
            celebrationTriggeredToday: false,
            celebrationActive: false,
          });

          useHabitStore.getState().toggleHabit(remaining);

          const state = useHabitStore.getState();
          return (
            state.celebrationActive === true &&
            state.celebrationTriggeredToday === true &&
            state.todayCompletedIds.length === 3
          );
        },
      ),
    );
  });

  it('P7b: re-marking after un-marking re-triggers the celebration (Req 3.8)', () => {
    // Feature: habrite-app, Property 7: Third-habit completion triggers celebration
    fc.assert(
      fc.property(fc.constantFrom(0, 1, 2), (thirdIndex) => {
        const remaining = HABIT_IDS[thirdIndex];
        const alreadyDone = HABIT_IDS.filter((id) => id !== remaining);

        resetStore({ todayCompletedIds: [...alreadyDone] });

        // Complete third → celebration fires.
        useHabitStore.getState().toggleHabit(remaining);
        // Un-mark → celebration clears and celebrationTriggeredToday resets.
        useHabitStore.getState().toggleHabit(remaining);
        // Re-mark → celebration must re-trigger.
        useHabitStore.getState().toggleHabit(remaining);

        return useHabitStore.getState().celebrationActive === true;
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Day reset on new day open
// ---------------------------------------------------------------------------

describe('evaluateDayOnOpen — new day reset (P8)', () => {
  beforeEach(() => resetStore());

  it('P8: a differing day with no record clears todayCompletedIds', () => {
    // Feature: habrite-app, Property 8: Day reset on new day open
    fc.assert(
      fc.property(
        // Any non-empty subset of completed habits carried into the new day.
        fc.subarray([...HABIT_IDS]).filter((ids) => ids.length > 0),
        (initialCompleted) => {
          // Seed a record for a PAST date and stale in-memory completion.
          const pastRecord: DayRecord = {
            dateKey: '2020-01-01',
            completedHabitIds: [...initialCompleted],
            status: 'partial',
          };

          resetStore({
            dayRecords: { '2020-01-01': pastRecord },
            todayCompletedIds: [...initialCompleted],
          });

          // A future date guaranteed to have no record → treated as a new day.
          const newDay = '2999-12-31';
          useHabitStore.getState().evaluateDayOnOpen(newDay);

          return useHabitStore.getState().todayCompletedIds.length === 0;
        },
      ),
    );
  });

  it('P8b: opening a day that already has a record preserves its completion', () => {
    // Feature: habrite-app, Property 8: Day reset on new day open
    fc.assert(
      fc.property(
        fc.subarray([...HABIT_IDS]).filter((ids) => ids.length > 0),
        (completed) => {
          const dayKey = '2999-12-31';
          const record: DayRecord = {
            dateKey: dayKey,
            completedHabitIds: [...completed],
            status: completed.length === 3 ? 'complete' : 'partial',
          };

          resetStore({
            dayRecords: { [dayKey]: record },
            todayCompletedIds: [],
          });

          useHabitStore.getState().evaluateDayOnOpen(dayKey);

          const after = useHabitStore.getState().todayCompletedIds;
          return (
            after.length === completed.length &&
            completed.every((id) => after.includes(id))
          );
        },
      ),
    );
  });
});
