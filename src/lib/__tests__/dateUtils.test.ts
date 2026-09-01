import * as fc from 'fast-check';
import { isSameDay, localDateKey, today } from '../dateUtils';

// ---------------------------------------------------------------------------
// localDateKey
// ---------------------------------------------------------------------------

describe('localDateKey', () => {
  it('formats a known date correctly', () => {
    // new Date(year, monthIndex, day) — month is 0-indexed
    expect(localDateKey(new Date(2024, 0, 1))).toBe('2024-01-01');
    expect(localDateKey(new Date(2024, 11, 31))).toBe('2024-12-31');
    expect(localDateKey(new Date(2000, 1, 5))).toBe('2000-02-05');
  });

  it('zero-pads month and day to two digits', () => {
    expect(localDateKey(new Date(2024, 2, 3))).toBe('2024-03-03');
  });

  it('returns YYYY-MM-DD format for any valid date', () => {
    fc.assert(
      fc.property(
        // Use years 1970–9999 — realistic for a habit tracker and avoids
        // JS Date quirks with years < 100 (which are treated as 1900+n by
        // the Date constructor's two-argument form in some environments).
        fc.integer({ min: 1970, max: 9999 }).chain((year) =>
          fc.integer({ min: 0, max: 11 }).chain((month) =>
            fc.integer({ min: 1, max: 28 }).map((day) => new Date(year, month, day)),
          ),
        ),
        (date) => {
          const key = localDateKey(date);
          // Must match YYYY-MM-DD
          expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          // Round-trip: parsing the key must produce the same local date components
          const [y, m, d] = key.split('-').map(Number);
          expect(y).toBe(date.getFullYear());
          expect(m).toBe(date.getMonth() + 1);
          expect(d).toBe(date.getDate());
        },
      ),
    );
  });

  it('uses local timezone (not UTC) — getDate/getMonth/getFullYear', () => {
    // Construct a specific local date and confirm the key matches local components
    const d = new Date(2023, 5, 15); // 15 June 2023 local
    expect(localDateKey(d)).toBe('2023-06-15');
  });
});

// ---------------------------------------------------------------------------
// today
// ---------------------------------------------------------------------------

describe('today', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the same value as localDateKey(new Date())', () => {
    // Capture both within the same tick to avoid midnight edge-case flakiness
    const before = localDateKey(new Date());
    const result = today();
    const after = localDateKey(new Date());
    // Result must be one of the surrounding two values (handles the midnight edge case)
    expect([before, after]).toContain(result);
  });
});

// ---------------------------------------------------------------------------
// isSameDay
// ---------------------------------------------------------------------------

describe('isSameDay', () => {
  it('returns true for two Date objects on the same calendar day', () => {
    const a = new Date(2024, 3, 10, 8, 0, 0);
    const b = new Date(2024, 3, 10, 23, 59, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for dates on different calendar days', () => {
    const a = new Date(2024, 3, 10);
    const b = new Date(2024, 3, 11);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('returns false for the same day in different months', () => {
    const a = new Date(2024, 2, 10);
    const b = new Date(2024, 3, 10);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('returns false for the same day/month in different years', () => {
    const a = new Date(2023, 3, 10);
    const b = new Date(2024, 3, 10);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('is reflexive — a date is the same day as itself', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 9999 }).chain((year) =>
          fc.integer({ min: 0, max: 11 }).chain((month) =>
            fc.integer({ min: 1, max: 28 }).map((day) => new Date(year, month, day)),
          ),
        ),
        (date) => {
          expect(isSameDay(date, date)).toBe(true);
        },
      ),
    );
  });

  it('is symmetric — isSameDay(a, b) === isSameDay(b, a)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 9999 }).chain((year) =>
          fc.integer({ min: 0, max: 11 }).chain((month) =>
            fc.integer({ min: 1, max: 28 }).chain((day) =>
              fc.integer({ min: 0, max: 23 }).chain((hour) =>
                fc.integer({ min: 0, max: 59 }).map((minute) => ({
                  a: new Date(year, month, day, hour, minute),
                  b: new Date(year, month, day, (hour + 1) % 24, minute),
                })),
              ),
            ),
          ),
        ),
        ({ a, b }) => {
          expect(isSameDay(a, b)).toBe(isSameDay(b, a));
        },
      ),
    );
  });

  it('agrees with localDateKey equality', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 9998 }).chain((year) =>
          fc.integer({ min: 0, max: 11 }).chain((month) =>
            fc.integer({ min: 1, max: 28 }).chain((day1) =>
              fc.integer({ min: 1, max: 28 }).map((day2) => ({
                a: new Date(year, month, day1),
                b: new Date(year, month, day2),
              })),
            ),
          ),
        ),
        ({ a, b }) => {
          const sameKey = localDateKey(a) === localDateKey(b);
          expect(isSameDay(a, b)).toBe(sameKey);
        },
      ),
    );
  });
});
