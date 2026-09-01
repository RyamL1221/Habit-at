import type { GrowthStage } from './types';

/**
 * Computes the Status_Caption string displayed below the Terrarium.
 *
 * @param completedCount      Number of habits completed today (0–3)
 * @param isWilting           Whether Sprig is in the Wilting_State
 * @param growthStageJustChanged  Whether a Growth_Stage transition occurred during today's completion
 * @param newStage            The stage transitioned to (or null if no transition)
 * @returns                   Exact caption string per Requirements 7.5–7.11 / 6.5
 */
export function computeStatusCaption(
  completedCount: number,
  isWilting: boolean,
  growthStageJustChanged: boolean,
  newStage: GrowthStage | null,
): string {
  // Requirement 6.5 / 7.5: Wilting with no completions today
  if (isWilting && completedCount === 0) {
    return 'Sprig is looking a little droopy.';
  }

  // Requirement 7.6: No completions, not wilting
  if (completedCount === 0) {
    return 'Sprig is basking in the morning light.';
  }

  // Requirement 7.7: Partial completions (1 or 2), not wilting
  if (completedCount === 1 || completedCount === 2) {
    return 'Keep going — Sprig is cheering you on.';
  }

  // completedCount === 3: all habits done
  if (growthStageJustChanged && newStage === 'sprout') {
    // Requirement 7.9
    return 'Sprig has sprouted! A new chapter begins.';
  }

  if (growthStageJustChanged && newStage === 'bloom') {
    // Requirement 7.10
    return 'Sprig is blooming. Something beautiful is growing.';
  }

  if (growthStageJustChanged && newStage === 'flourishing') {
    // Requirement 7.11
    return "Sprig is flourishing. You've built something real.";
  }

  // Requirement 7.8: All done, no stage change (also covers seedling re-confirmation)
  return 'All three rituals done. Sprig grew a new leaf.';
}
