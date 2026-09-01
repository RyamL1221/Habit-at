import * as fc from 'fast-check';
import { computeGrowthStage } from '../growthStage';
import type { GrowthStage } from '../types';

const VALID_STAGES: GrowthStage[] = ['seedling', 'sprout', 'bloom', 'flourishing'];

// Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
describe('computeGrowthStage — Property 12: Growth stage mapping is monotone and correct', () => {
  it('returns "seedling" for n in [0, 3]', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (n) => {
        expect(computeGrowthStage(n)).toBe('seedling');
      }),
    );
  });

  it('returns "sprout" for n in [4, 7]', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 7 }), (n) => {
        expect(computeGrowthStage(n)).toBe('sprout');
      }),
    );
  });

  it('returns "bloom" for n in [8, 13]', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 13 }), (n) => {
        expect(computeGrowthStage(n)).toBe('bloom');
      }),
    );
  });

  it('returns "flourishing" for n >= 14', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: 14, max: 10_000 }), (n) => {
        expect(computeGrowthStage(n)).toBe('flourishing');
      }),
    );
  });

  it('clamps negative values to 0 and returns "seedling"', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: -10_000, max: -1 }), (n) => {
        expect(computeGrowthStage(n)).toBe('seedling');
      }),
    );
  });

  it('always returns one of the four valid GrowthStage values', () => {
    // Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
    fc.assert(
      fc.property(fc.integer({ min: -10_000, max: 10_000 }), (n) => {
        expect(VALID_STAGES).toContain(computeGrowthStage(n));
      }),
    );
  });
});
