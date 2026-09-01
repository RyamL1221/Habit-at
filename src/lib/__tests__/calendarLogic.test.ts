// Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
//
// Validates: Requirements 10.4, 10.5, 10.6, 10.7

import * as fc from 'fast-check';
import { computeCellStatus } from '../calendarLogic';
import { DayCompletionStatus, DayRecord } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a DayRecord with the given status and dateKey. */
function makeRecord(dateKey: string, status: DayCompletionStatus): DayRecord {
  return {
    dateKey,
    completedHabitIds: [],
    status,
  };
}

/**
 * Arbitrary that generates a valid "YYYY-MM-DD" date string
 * for years 2000–2099 to keep generated strings within a realistic range.
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

// ---------------------------------------------------------------------------
// Unit tests — specific, known inputs
// ---------------------------------------------------------------------------

describe('computeCellStatus — unit', () => {
  const TODAY = '2024-06-15';

  describe('future dates', () => {
    it('returns "future" when dateKey > today', () => {
      expect(computeCellStatus(undefined, '2024-06-16', TODAY)).toBe('future');
    });

    it('returns "future" even when a record is supplied for a future date', () => {
      // A record should never exist for a future date, but the guard must still hold
      const record = makeRecord('2099-01-01', 'complete');
      expect(computeCellStatus(record, '2099-01-01', TODAY)).toBe('future');
    });
  });

  describe('today (dateKey === today)', () => {
    it('returns "empty" when no record exists for today', () => {
      expect(computeCellStatus(undefined, TODAY, TODAY)).toBe('empty');
    });

    it('returns "complete" for a complete record on today', () => {
      expect(computeCellStatus(makeRecord(TODAY, 'complete'), TODAY, TODAY)).toBe('complete');
    });

    it('returns "partial" for a partial record on today', () => {
      expect(computeCellStatus(makeRecord(TODAY, 'partial'), TODAY, TODAY)).toBe('partial');
    });

    it('returns "empty" for a missed record on today', () => {
      expect(computeCellStatus(makeRecord(TODAY, 'missed'), TODAY, TODAY)).toBe('empty');
    });
  });

  describe('past dates (dateKey < today)', () => {
    const PAST = '2024-01-01';

    it('returns "empty" when no record exists for a past date (Req 10.6)', () => {
      expect(computeCellStatus(undefined, PAST, TODAY)).toBe('empty');
    });

    it('returns "complete" for a complete record on a past date (Req 10.4)', () => {
      expect(computeCellStatus(makeRecord(PAST, 'complete'), PAST, TODAY)).toBe('complete');
    });

    it('returns "partial" for a partial record on a past date (Req 10.5)', () => {
      expect(computeCellStatus(makeRecord(PAST, 'partial'), PAST, TODAY)).toBe('partial');
    });

    it('returns "empty" for a missed record on a past date (Req 10.6)', () => {
      expect(computeCellStatus(makeRecord(PAST, 'missed'), PAST, TODAY)).toBe('empty');
    });
  });
});

// ---------------------------------------------------------------------------
// Property-based tests — P18
// ---------------------------------------------------------------------------

describe('computeCellStatus — property-based (P18)', () => {
  // Property 18a: future dates NEVER return a filled state (Req 10.7)
  it('P18a: never returns "complete" or "partial" for a future date', () => {
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(
        dateKeyArb,
        dateKeyArb,
        fc.constantFrom<DayCompletionStatus>('complete', 'partial', 'missed'),
        (dateKey, today, status) => {
          // Force dateKey to be strictly in the future by always using the
          // larger of the two dates as "today's" value +1 day, or by using
          // a future date directly.
          const [futureKey, todayKey] =
            dateKey > today ? [dateKey, today] : [today, dateKey];

          if (futureKey === todayKey) {
            // Equal dates are not future — skip this sample
            return true;
          }

          const record = makeRecord(futureKey, status);
          const result = computeCellStatus(record, futureKey, todayKey);
          return result === 'future';
        },
      ),
    );
  });

  // Property 18b: absent record on a past/today date always returns 'empty' (Req 10.6)
  it('P18b: undefined record on a past or present date returns "empty"', () => {
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(
        dateKeyArb,
        dateKeyArb,
        (dateKey, today) => {
          // Ensure dateKey <= today
          const [pastOrToday, todayKey] =
            dateKey <= today ? [dateKey, today] : [today, dateKey];

          return computeCellStatus(undefined, pastOrToday, todayKey) === 'empty';
        },
      ),
    );
  });

  // Property 18c: 'complete' status on past/today returns 'complete' (Req 10.4)
  it('P18c: complete record on a past or present date returns "complete"', () => {
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(dateKeyArb, dateKeyArb, (dateKey, today) => {
        const [pastOrToday, todayKey] =
          dateKey <= today ? [dateKey, today] : [today, dateKey];

        const record = makeRecord(pastOrToday, 'complete');
        return computeCellStatus(record, pastOrToday, todayKey) === 'complete';
      }),
    );
  });

  // Property 18d: 'partial' status on past/today returns 'partial' (Req 10.5)
  it('P18d: partial record on a past or present date returns "partial"', () => {
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(dateKeyArb, dateKeyArb, (dateKey, today) => {
        const [pastOrToday, todayKey] =
          dateKey <= today ? [dateKey, today] : [today, dateKey];

        const record = makeRecord(pastOrToday, 'partial');
        return computeCellStatus(record, pastOrToday, todayKey) === 'partial';
      }),
    );
  });

  // Property 18e: 'missed' status on past/today returns 'empty' (Req 10.6)
  it('P18e: missed record on a past or present date returns "empty"', () => {
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(dateKeyArb, dateKeyArb, (dateKey, today) => {
        const [pastOrToday, todayKey] =
          dateKey <= today ? [dateKey, today] : [today, dateKey];

        const record = makeRecord(pastOrToday, 'missed');
        return computeCellStatus(record, pastOrToday, todayKey) === 'empty';
      }),
    );
  });

  // Property 18f: result is always one of the four valid values
  it('P18f: always returns one of the four defined cell status values', () => {
    const validResults = new Set(['complete', 'partial', 'empty', 'future']);
    // Feature: habrite-app, Property 18: Calendar cell status is a pure function of day record
    fc.assert(
      fc.property(
        dateKeyArb,
        dateKeyArb,
        fc.option(fc.constantFrom<DayCompletionStatus>('complete', 'partial', 'missed'), {
          nil: undefined,
        }),
        (dateKey, today, status) => {
          const record = status !== undefined ? makeRecord(dateKey, status) : undefined;
          const result = computeCellStatus(record, dateKey, today);
          return validResults.has(result);
        },
      ),
    );
  });
});
