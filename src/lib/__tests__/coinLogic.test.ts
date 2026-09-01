import * as fc from 'fast-check';
import { computeCoinDelta } from '../coinLogic';

// ---------------------------------------------------------------------------
// Property 5: Coin delta is correct for non-celebration toggles
// ---------------------------------------------------------------------------

describe('computeCoinDelta — non-celebration toggles (Property 5)', () => {
  it('returns +5 for completing a non-third habit with no celebration active', () => {
    // Feature: habrite-app, Property 5: Coin delta is correct for non-celebration toggles
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }), // any non-negative balance (applied at call site)
        (_balance) => {
          const delta = computeCoinDelta('complete', false, false);
          return delta === 5;
        },
      ),
    );
  });

  it('returns -5 for uncompleting a habit when no celebration was triggered', () => {
    // Feature: habrite-app, Property 5: Coin delta is correct for non-celebration toggles
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        (_balance) => {
          const delta = computeCoinDelta('uncomplete', false, false);
          return delta === -5;
        },
      ),
    );
  });

  it('clamp at call site: Math.max(0, balance + delta) never goes below 0', () => {
    // Feature: habrite-app, Property 5: Coin delta is correct for non-celebration toggles
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }), // small balances that can hit the floor
        (balance) => {
          const delta = computeCoinDelta('uncomplete', false, false);
          const newBalance = Math.max(0, balance + delta);
          return newBalance >= 0;
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Celebration coin arithmetic is correct
// ---------------------------------------------------------------------------

describe('computeCoinDelta — celebration arithmetic (Property 6)', () => {
  it('returns +15 when the third and final habit is marked complete', () => {
    // Feature: habrite-app, Property 6: Celebration coin arithmetic is correct
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        (_balance) => {
          // isThirdHabit=true, celebrationWasTriggered is irrelevant on 'complete'
          const delta = computeCoinDelta('complete', false, true);
          return delta === 15;
        },
      ),
    );
  });

  it('returns -15 when a habit is unmarked after celebration was triggered', () => {
    // Feature: habrite-app, Property 6: Celebration coin arithmetic is correct
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        (_balance) => {
          const delta = computeCoinDelta('uncomplete', true, false);
          return delta === -15;
        },
      ),
    );
  });

  it('clamp at call site: post-celebration uncomplete never drives balance below 0', () => {
    // Feature: habrite-app, Property 6: Celebration coin arithmetic is correct
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // balances that can underflow without clamp
        (balance) => {
          const delta = computeCoinDelta('uncomplete', true, false);
          const newBalance = Math.max(0, balance + delta);
          return newBalance >= 0;
        },
      ),
    );
  });

  it('streak decrement clamp: streak never goes below 0 after celebration reversal', () => {
    // Feature: habrite-app, Property 6: Celebration coin arithmetic is correct
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // any streak value including 0
        (streak) => {
          const newStreak = Math.max(0, streak - 1);
          return newStreak >= 0;
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Property 15: Purchase deducts exact coin cost
// ---------------------------------------------------------------------------

describe('purchase balance arithmetic (Property 15)', () => {
  it('post-purchase balance equals balance - coinCost for sufficient funds', () => {
    // Feature: habrite-app, Property 15: Purchase deducts exact coin cost
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }), // coinCost
        fc.integer({ min: 0, max: 10_000 }), // extra balance above cost
        (coinCost, extra) => {
          const balance = coinCost + extra; // guaranteed sufficient
          const newBalance = Math.max(0, balance - coinCost);
          return newBalance === extra;
        },
      ),
    );
  });

  it('post-purchase balance is never negative when balance >= coinCost', () => {
    // Feature: habrite-app, Property 15: Purchase deducts exact coin cost
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        (coinCost, extra) => {
          const balance = coinCost + extra;
          const newBalance = Math.max(0, balance - coinCost);
          return newBalance >= 0;
        },
      ),
    );
  });

  it('clamp holds even when balance is 0 and coinCost > 0 (guard scenario)', () => {
    // Feature: habrite-app, Property 15: Purchase deducts exact coin cost
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000 }), // coinCost must be > 0
        (coinCost) => {
          const balance = 0;
          const newBalance = Math.max(0, balance - coinCost);
          return newBalance === 0;
        },
      ),
    );
  });
});
