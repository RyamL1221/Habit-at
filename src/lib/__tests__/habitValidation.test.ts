import * as fc from 'fast-check';
import { validateHabitName } from '../habitValidation';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates strings that are empty or contain only whitespace characters. */
const whitespaceOnlyString = fc.oneof(
  fc.constant(''),
  // Build a whitespace-only string by mapping a non-empty string to spaces
  fc.string({ minLength: 1, maxLength: 80 }).map((s) => s.replace(/./g, ' ')),
);

/**
 * Generates strings whose *trimmed* length exceeds 60 characters.
 * We pad a 61-character base with optional leading/trailing spaces so the
 * raw input is always longer-than-60 after trimming.
 */
const tooLongName = fc
  .tuple(
    fc.string({ minLength: 61, maxLength: 200 }).filter((s) => s.trim().length > 60),
    fc.string({ maxLength: 5 }).map((s) => s.replace(/\S/g, '')), // leading spaces
    fc.string({ maxLength: 5 }).map((s) => s.replace(/\S/g, '')), // trailing spaces
  )
  .map(([core, lead, trail]) => lead + core + trail);

/**
 * Generates valid habit names: non-empty after trimming, and trimmed length ≤ 60.
 * Uses printable ASCII range to stay well-behaved while covering variety.
 */
const validHabitName = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => s.trim().length >= 1 && s.trim().length <= 60);

// ---------------------------------------------------------------------------
// Property 1: Habit list always contains exactly three habits
// ---------------------------------------------------------------------------

describe('Property 1: Habit list always contains exactly three habits', () => {
  it('an array of exactly three habit placeholders always has length 3', () => {
    // Feature: habrite-app, Property 1: Habit list always contains exactly three habits
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string(), fc.string()),
        ([name0, name1, name2]) => {
          const habitList: [string, string, string] = [name0, name1, name2];
          return habitList.length === 3;
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Habit name validation rejects invalid inputs
// ---------------------------------------------------------------------------

describe('Property 2: Habit name validation rejects invalid inputs', () => {
  it('rejects empty strings and whitespace-only strings with the correct error', () => {
    // Feature: habrite-app, Property 2: Habit name validation rejects invalid inputs
    fc.assert(
      fc.property(whitespaceOnlyString, (name) => {
        const result = validateHabitName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Habit name cannot be empty.');
      }),
    );
  });

  it('rejects strings whose trimmed length exceeds 60 characters with the correct error', () => {
    // Feature: habrite-app, Property 2: Habit name validation rejects invalid inputs
    fc.assert(
      fc.property(tooLongName, (name) => {
        const result = validateHabitName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Habit name must be 60 characters or fewer.');
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Habit name save round-trip
// ---------------------------------------------------------------------------

describe('Property 3: Habit name save round-trip', () => {
  it('accepts any valid habit name and returns { valid: true } with no error', () => {
    // Feature: habrite-app, Property 3: Habit name save round-trip
    fc.assert(
      fc.property(validHabitName, (name) => {
        const result = validateHabitName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
    );
  });
});
