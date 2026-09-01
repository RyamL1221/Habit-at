import * as fc from 'fast-check';

// AsyncStorage is required transitively by the Zustand persist middleware inside
// useHabitStore. Mock it so the store can be imported and driven in Jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useHabitStore } from '../../store/useHabitStore';
import type { DayCompletionStatus, DayRecord, Habit } from '../types';

const HABIT_IDS = ['habit-1', 'habit-2', 'habit-3'] as const;

const DEFAULT_HABITS: [Habit, Habit, Habit] = [
  { id: 'habit-1', name: 'Habit 1', reminderTime: null, notificationId: null },
  { id: 'habit-2', name: 'Habit 2', reminderTime: null, notificationId: null },
  { id: 'habit-3', name: 'Habit 3', reminderTime: null, notificationId: null },
];

/** Restore the store to a clean default state so each property run is isolated. */
function resetStore() {
  useHabitStore.setState({
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
  });
}

/** Builds a "YYYY-MM-DD" key n days after 2000-01-01, so ordering is stable. */
function dateKeyFromOffset(offset: number): string {
  const base = Date.UTC(2000, 0, 1);
  const d = new Date(base + offset * 24 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const pad = (x: number) => (x < 10 ? `0${x}` : `${x}`);
  return `${y}-${pad(m)}-${pad(day)}`;
}

beforeEach(() => {
  resetStore();
});

// Feature: habrite-app, Property 13: Wilting state activates on missed previous day
describe('Property 13: Wilting state activates on missed previous day', () => {
  it('sets isWilting=true when the most recent recorded day was partial or missed', () => {
    // Feature: habrite-app, Property 13: Wilting state activates on missed previous day
    const notCompleteStatus = fc.constantFrom<DayCompletionStatus>('partial', 'missed');

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }), // offset of the recorded (past) day
        fc.integer({ min: 1, max: 365 }), // gap in days to the open day
        notCompleteStatus,
        // For a partial record, include 1 or 2 completed habits; missed => empty.
        fc.subarray([...HABIT_IDS], { minLength: 0, maxLength: 3 }),
        (recordOffset, gap, status, completedSubset) => {
          resetStore();

          const recordDateKey = dateKeyFromOffset(recordOffset);
          const openDateKey = dateKeyFromOffset(recordOffset + gap);

          // Keep the completed set consistent with the status classification.
          const completedHabitIds =
            status === 'missed' ? [] : completedSubset.slice(0, 2);

          const record: DayRecord = {
            dateKey: recordDateKey,
            completedHabitIds,
            status,
          };

          useHabitStore.setState({
            dayRecords: { [recordDateKey]: record },
            isWilting: false,
          });

          useHabitStore.getState().evaluateDayOnOpen(openDateKey);

          expect(useHabitStore.getState().isWilting).toBe(true);
        },
      ),
    );
  });
});

// Feature: habrite-app, Property 14: Wilting state clears on first habit completion
describe('Property 14: Wilting state clears on first habit completion', () => {
  it('sets isWilting=false when the first habit is completed while wilting', () => {
    // Feature: habrite-app, Property 14: Wilting state clears on first habit completion
    fc.assert(
      fc.property(fc.constantFrom(...HABIT_IDS), (habitId) => {
        resetStore();

        useHabitStore.setState({
          isWilting: true,
          todayCompletedIds: [],
        });

        useHabitStore.getState().toggleHabit(habitId);

        expect(useHabitStore.getState().isWilting).toBe(false);
      }),
    );
  });
});
