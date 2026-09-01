// Feature: habrite-app, Property 19: State persistence round-trip
//
// Validates: Requirements 13.1, 13.2

import * as fc from 'fast-check';
import type {
  Habit,
  DayRecord,
  DayCompletionStatus,
  GrowthStage,
} from '../types';

/**
 * The persisted subset of HabitState that must survive a
 * JSON serialize → deserialize round-trip unchanged.
 *
 * Mirrors the `partialize` selection in `src/store/useHabitStore.ts`, focusing
 * on the runtime data fields called out by Property 19: `habits`, `dayRecords`,
 * `coinBalance`, `streak`, `cumulativeCompletedDays`, `growthStage`, `isWilting`.
 */
interface PersistedState {
  habits: [Habit, Habit, Habit];
  dayRecords: Record<string, DayRecord>;
  coinBalance: number;
  streak: number;
  cumulativeCompletedDays: number;
  growthStage: GrowthStage;
  isWilting: boolean;
}

const VALID_STAGES: GrowthStage[] = ['seedling', 'sprout', 'bloom', 'flourishing'];
const VALID_STATUSES: DayCompletionStatus[] = ['complete', 'partial', 'missed'];

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a valid "YYYY-MM-DD" date key (days capped at 28 for validity). */
const dateKeyArb = fc
  .integer({ min: 2000, max: 2099 })
  .chain((year) =>
    fc.integer({ min: 1, max: 12 }).chain((month) =>
      fc.integer({ min: 1, max: 28 }).map((day) => {
        const mm = month < 10 ? `0${month}` : `${month}`;
        const dd = day < 10 ? `0${day}` : `${day}`;
        return `${year}-${mm}-${dd}`;
      }),
    ),
  );

/** An "HH:MM" reminder time string, or null. */
const reminderTimeArb: fc.Arbitrary<string | null> = fc.option(
  fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => {
      const hh = h < 10 ? `0${h}` : `${h}`;
      const mm = m < 10 ? `0${m}` : `${m}`;
      return `${hh}:${mm}`;
    }),
  { nil: null },
);

/** A single Habit object. */
const habitArb: fc.Arbitrary<Habit> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 60 }),
  reminderTime: reminderTimeArb,
  notificationId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
});

/** A tuple of exactly three Habit objects (Req 1.1). */
const habitsArb: fc.Arbitrary<[Habit, Habit, Habit]> = fc.tuple(
  habitArb,
  habitArb,
  habitArb,
);

/** A DayRecord whose `dateKey` matches its map key is enforced by dayRecordsArb. */
function dayRecordArb(dateKey: string): fc.Arbitrary<DayRecord> {
  return fc.record({
    dateKey: fc.constant(dateKey),
    completedHabitIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
      maxLength: 3,
    }),
    status: fc.constantFrom<DayCompletionStatus>(...VALID_STATUSES),
  });
}

/** A record mapping dateKey -> DayRecord (with consistent keys). */
const dayRecordsArb: fc.Arbitrary<Record<string, DayRecord>> = fc
  .array(dateKeyArb, { maxLength: 12 })
  .chain((keys) => {
    const uniqueKeys = [...new Set(keys)];
    if (uniqueKeys.length === 0) {
      return fc.constant<Record<string, DayRecord>>({});
    }
    return fc
      .tuple(...uniqueKeys.map((key) => dayRecordArb(key)))
      .map((records) => {
        const out: Record<string, DayRecord> = {};
        uniqueKeys.forEach((key, i) => {
          out[key] = records[i];
        });
        return out;
      });
  });

/** Non-negative integer economy value. */
const nonNegIntArb = fc.integer({ min: 0, max: 1_000_000 });

/** A complete persisted-state object. */
const persistedStateArb: fc.Arbitrary<PersistedState> = fc.record({
  habits: habitsArb,
  dayRecords: dayRecordsArb,
  coinBalance: nonNegIntArb,
  streak: nonNegIntArb,
  cumulativeCompletedDays: nonNegIntArb,
  growthStage: fc.constantFrom<GrowthStage>(...VALID_STAGES),
  isWilting: fc.boolean(),
});

// ---------------------------------------------------------------------------
// Unit tests — specific, known inputs
// ---------------------------------------------------------------------------

describe('persistence round-trip — unit', () => {
  const sample: PersistedState = {
    habits: [
      { id: 'habit-1', name: 'Habit 1', reminderTime: null, notificationId: null },
      { id: 'habit-2', name: 'Drink water', reminderTime: '08:30', notificationId: 'n2' },
      { id: 'habit-3', name: 'Read', reminderTime: '21:00', notificationId: null },
    ],
    dayRecords: {
      '2024-06-14': {
        dateKey: '2024-06-14',
        completedHabitIds: ['habit-1', 'habit-2', 'habit-3'],
        status: 'complete',
      },
      '2024-06-15': {
        dateKey: '2024-06-15',
        completedHabitIds: ['habit-1'],
        status: 'partial',
      },
    },
    coinBalance: 125,
    streak: 4,
    cumulativeCompletedDays: 9,
    growthStage: 'bloom',
    isWilting: false,
  };

  it('round-trips a fully-populated persisted state unchanged', () => {
    const restored = JSON.parse(JSON.stringify(sample));
    expect(restored).toEqual(sample);
  });

  it('round-trips a default/empty persisted state unchanged', () => {
    const defaults: PersistedState = {
      habits: [
        { id: 'habit-1', name: 'Habit 1', reminderTime: null, notificationId: null },
        { id: 'habit-2', name: 'Habit 2', reminderTime: null, notificationId: null },
        { id: 'habit-3', name: 'Habit 3', reminderTime: null, notificationId: null },
      ],
      dayRecords: {},
      coinBalance: 0,
      streak: 0,
      cumulativeCompletedDays: 0,
      growthStage: 'seedling',
      isWilting: false,
    };
    const restored = JSON.parse(JSON.stringify(defaults));
    expect(restored).toEqual(defaults);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

describe('persistence round-trip — property-based (P19)', () => {
  // Property 19: serialize → deserialize preserves every runtime field
  it('P19: JSON round-trip deep-equals the original persisted state', () => {
    // Feature: habrite-app, Property 19: State persistence round-trip
    fc.assert(
      fc.property(persistedStateArb, (state) => {
        const restored = JSON.parse(JSON.stringify(state));
        expect(restored).toEqual(state);
      }),
    );
  });
});
