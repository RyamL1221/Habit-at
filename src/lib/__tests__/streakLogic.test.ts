// Feature: habrite-app, Property 9: Streak evaluation correctness
// Feature: habrite-app, Property 10: Streak evaluation idempotence
// Feature: habrite-app, Property 11: Day completion status classification
//
// Validates: Requirements 4.2, 4.3, 4.4, 4.6

import * as fc from 'fast-check';
import { computeDayStatus, evaluateStreak } from '../streakLogic';
import type { DayCompletionStatus, DayRecord } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(dateKey: string, status: DayCompletionStatus): DayRecord {
  return { dateKey, completedHabitIds: [], status };
}

/**
 * Generates a valid "YYYY-MM-DD" date string in the range 2000–2099.
 * Days are capped at 28 so every generated date is valid for all months.
 */
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

/** Non-negative streak values (realistic upper bound of 10 000 days). */
const streakArb = fc.integer({ min: 0, max: 10_000 });

/** A pair of distinct date keys where the first is strictly earlier. */
const distinctDatesArb = fc.tuple(dateKeyArb, dateKeyArb).filter(([a, b]) => a !== b);

// ---------------------------------------------------------------------------
// Unit tests — specific, known inputs
// ---------------------------------------------------------------------------

describe('evaluateStreak — unit', () => {
  const TODAY = '2024-06-15';
  const YESTERDAY = '2024-06-14';

  it('returns current streak unchanged when there is no history', () => {
    expect(evaluateStreak(5, undefined, TODAY)).toEqual({
      newStreak: 5,
      resetOccurred: false,
    });
  });

  it('returns current streak unchanged (idempotent) when lastDayRecord is today', () => {
    const record = makeRecord(TODAY, 'complete');
    expect(evaluateStreak(5, record, TODAY)).toEqual({
      newStreak: 5,
      resetOccurred: false,
    });
  });

  it('increments streak by 1 when previous day was complete', () => {
    const record = makeRecord(YESTERDAY, 'complete');
    expect(evaluateStreak(4, record, TODAY)).toEqual({
      newStreak: 5,
      resetOccurred: false,
    });
  });

  it('resets streak to 0 when previous day was partial', () => {
    const record = makeRecord(YESTERDAY, 'partial');
    expect(evaluateStreak(7, record, TODAY)).toEqual({
      newStreak: 0,
      resetOccurred: true,
    });
  });

  it('resets streak to 0 when previous day was missed', () => {
    const record = makeRecord(YESTERDAY, 'missed');
    expect(evaluateStreak(3, record, TODAY)).toEqual({
      newStreak: 0,
      resetOccurred: true,
    });
  });

  it('increments from 0 correctly', () => {
    const record = makeRecord(YESTERDAY, 'complete');
    expect(evaluateStreak(0, record, TODAY)).toEqual({
      newStreak: 1,
      resetOccurred: false,
    });
  });
});

describe('computeDayStatus — unit', () => {
  const HABIT_IDS = ['h1', 'h2', 'h3'];

  it('returns "missed" when no habits are completed', () => {
    expect(computeDayStatus([], HABIT_IDS)).toBe('missed');
  });

  it('returns "complete" when all habits are completed', () => {
    expect(computeDayStatus(HABIT_IDS, HABIT_IDS)).toBe('complete');
  });

  it('returns "partial" when 1 of 3 habits is completed', () => {
    expect(computeDayStatus(['h1'], HABIT_IDS)).toBe('partial');
  });

  it('returns "partial" when 2 of 3 habits are completed', () => {
    expect(computeDayStatus(['h1', 'h2'], HABIT_IDS)).toBe('partial');
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

describe('evaluateStreak — property-based (P9, P10)', () => {
  // Property 9a: partial or missed previous day always resets streak to 0 (Req 4.3)
  it('P9a: partial or missed previous day resets streak to 0', () => {
    // Feature: habrite-app, Property 9: Streak evaluation correctness
    fc.assert(
      fc.property(
        streakArb,
        dateKeyArb,
        dateKeyArb,
        fc.constantFrom<DayCompletionStatus>('partial', 'missed'),
        (currentStreak, recordDateKey, today, status) => {
          // Ensure the record is for a different day than today (not same-day)
          if (recordDateKey === today) return true; // skip same-day samples

          const record = makeRecord(recordDateKey, status);
          const { newStreak, resetOccurred } = evaluateStreak(currentStreak, record, today);
          return newStreak === 0 && resetOccurred === true;
        },
      ),
    );
  });

  // Property 9b: complete previous day increments streak by 1 (Req 4.2)
  it('P9b: complete previous day increments streak by 1', () => {
    // Feature: habrite-app, Property 9: Streak evaluation correctness
    fc.assert(
      fc.property(
        streakArb,
        distinctDatesArb,
        (currentStreak, [recordDateKey, today]) => {
          const record = makeRecord(recordDateKey, 'complete');
          const { newStreak, resetOccurred } = evaluateStreak(currentStreak, record, today);
          return newStreak === currentStreak + 1 && resetOccurred === false;
        },
      ),
    );
  });

  // Property 10: same-day evaluation is idempotent — streak never changes (Req 4.6)
  it('P10: calling evaluateStreak with lastDayRecord.dateKey === today is idempotent', () => {
    // Feature: habrite-app, Property 10: Streak evaluation idempotence
    fc.assert(
      fc.property(
        streakArb,
        dateKeyArb,
        fc.constantFrom<DayCompletionStatus>('complete', 'partial', 'missed'),
        (currentStreak, today, status) => {
          const record = makeRecord(today, status);

          // First call
          const first = evaluateStreak(currentStreak, record, today);
          // Second call with the updated streak — must still be stable
          const second = evaluateStreak(first.newStreak, record, today);

          return (
            first.newStreak === currentStreak &&
            second.newStreak === currentStreak &&
            first.resetOccurred === false &&
            second.resetOccurred === false
          );
        },
      ),
    );
  });

  // Property 10b: no-history call is also idempotent (Req 4.6)
  it('P10b: calling evaluateStreak with no history is idempotent', () => {
    // Feature: habrite-app, Property 10: Streak evaluation idempotence
    fc.assert(
      fc.property(streakArb, dateKeyArb, (currentStreak, today) => {
        const first = evaluateStreak(currentStreak, undefined, today);
        const second = evaluateStreak(first.newStreak, undefined, today);

        return (
          first.newStreak === currentStreak &&
          second.newStreak === currentStreak &&
          first.resetOccurred === false &&
          second.resetOccurred === false
        );
      }),
    );
  });
});

describe('computeDayStatus — property-based (P11)', () => {
  // Three fixed habit IDs mirror the app's required three-habit setup (Req 1.1)
  const HABIT_IDS = ['habit-a', 'habit-b', 'habit-c'];

  // Property 11a: empty completedIds always returns 'missed' (Req 4.4)
  it('P11a: empty completedIds always returns "missed" for any non-empty habitIds', () => {
    // Feature: habrite-app, Property 11: Day completion status classification
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (habitIds) => {
          return computeDayStatus([], habitIds) === 'missed';
        },
      ),
    );
  });

  // Property 11b: completing all habits returns 'complete' (Req 4.4)
  it('P11b: completing all habitIds always returns "complete"', () => {
    // Feature: habrite-app, Property 11: Day completion status classification
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
        (habitIds) => {
          // Deduplicate so completedIds.length === habitIds.length
          const unique = [...new Set(habitIds)];
          return computeDayStatus(unique, unique) === 'complete';
        },
      ),
    );
  });

  // Property 11c: exactly one of three habits completed returns 'partial' (Req 4.4)
  it('P11c: completing exactly 1 of 3 habits returns "partial"', () => {
    // Feature: habrite-app, Property 11: Day completion status classification
    fc.assert(
      fc.property(
        fc.constantFrom(HABIT_IDS[0], HABIT_IDS[1], HABIT_IDS[2]),
        (oneId) => {
          return computeDayStatus([oneId], HABIT_IDS) === 'partial';
        },
      ),
    );
  });

  // Property 11d: completing exactly 2 of 3 habits returns 'partial' (Req 4.4)
  it('P11d: completing exactly 2 of 3 habits returns "partial"', () => {
    // Feature: habrite-app, Property 11: Day completion status classification
    fc.assert(
      fc.property(
        fc.constantFrom(
          [HABIT_IDS[0], HABIT_IDS[1]],
          [HABIT_IDS[0], HABIT_IDS[2]],
          [HABIT_IDS[1], HABIT_IDS[2]],
        ),
        (twoIds) => {
          return computeDayStatus([...twoIds], [...HABIT_IDS]) === 'partial';
        },
      ),
    );
  });

  // Property 11e: result is always one of the three valid statuses
  it('P11e: result is always "missed", "partial", or "complete"', () => {
    // Feature: habrite-app, Property 11: Day completion status classification
    const validStatuses = new Set<DayCompletionStatus>(['missed', 'partial', 'complete']);
    fc.assert(
      fc.property(
        fc.subarray(HABIT_IDS),
        (completedIds) => {
          const result = computeDayStatus(completedIds, HABIT_IDS);
          return validStatuses.has(result);
        },
      ),
    );
  });
});
