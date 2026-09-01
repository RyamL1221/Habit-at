/**
 * Computes the coin delta for a habit toggle action.
 *
 * The minimum clamp (Math.max(0, balance + delta)) is applied at the call site
 * in the store — NOT here. This function only returns the raw delta.
 *
 * @param action              'complete' or 'uncomplete'
 * @param celebrationWasTriggered  Whether today's celebration was already triggered
 *                                 (used when undoing the third habit)
 * @param isThirdHabit        Whether this completion is the third and final habit
 *                            for today (triggers celebration bonus)
 * @returns                   The integer coin delta to apply to the balance
 */
export function computeCoinDelta(
  action: 'complete' | 'uncomplete',
  celebrationWasTriggered: boolean,
  isThirdHabit: boolean,
): number {
  if (action === 'complete') {
    // Third habit completing today: +5 habit coin + 10 bonus = +15
    if (isThirdHabit) {
      return 15;
    }
    // Normal habit completion: +5
    return 5;
  }

  // action === 'uncomplete'
  // Undoing after celebration was triggered: reverse the full 15
  if (celebrationWasTriggered) {
    return -15;
  }
  // Normal habit uncompletion: -5
  return -5;
}
