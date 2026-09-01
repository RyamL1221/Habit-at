import { GrowthStage } from './types';

/**
 * Maps cumulative completed days to a Growth_Stage.
 *
 * Thresholds:
 *   [0–3]  → 'seedling'
 *   [4–7]  → 'sprout'
 *   [8–13] → 'bloom'
 *   [≥14]  → 'flourishing'
 *
 * Input is clamped to Math.max(0, n) before applying thresholds.
 *
 * Pure function — no side effects, no store access.
 */
export function computeGrowthStage(completedDays: number): GrowthStage {
  const n = Math.max(0, completedDays);

  if (n <= 3) return 'seedling';
  if (n <= 7) return 'sprout';
  if (n <= 13) return 'bloom';
  return 'flourishing';
}
