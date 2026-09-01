import type { DayRecord, DayCompletionStatus } from './types';

/**
 * Evaluates the new streak value given the current streak, the most recent
 * day record (if any), and today's date key ("YYYY-MM-DD").
 *
 * Rules:
 * - No history (lastDayRecord is undefined): no change, no reset.
 * - Last record is from today (same dateKey): idempotent — no change, no reset.
 * - Last record status is 'complete': increment streak by 1.
 * - Last record status is 'partial' or 'missed': reset streak to 0.
 */
export function evaluateStreak(
  currentStreak: number,
  lastDayRecord: DayRecord | undefined,
  today: string,
): { newStreak: number; resetOccurred: boolean } {
  // No history at all — first launch
  if (lastDayRecord === undefined) {
    return { newStreak: currentStreak, resetOccurred: false };
  }

  // Same-day call — idempotent, do nothing
  if (lastDayRecord.dateKey === today) {
    return { newStreak: currentStreak, resetOccurred: false };
  }

  // Previous day was fully complete — reward the streak
  if (lastDayRecord.status === 'complete') {
    return { newStreak: currentStreak + 1, resetOccurred: false };
  }

  // Previous day was partial or missed — reset streak
  return { newStreak: 0, resetOccurred: true };
}

/**
 * Derives the completion status for a single day from the set of completed
 * habit IDs and the full set of habit IDs.
 *
 * - Empty completedIds → 'missed'
 * - All habit IDs completed → 'complete'
 * - Any other non-zero count → 'partial'
 */
export function computeDayStatus(
  completedIds: string[],
  habitIds: string[],
): DayCompletionStatus {
  if (completedIds.length === 0) {
    return 'missed';
  }

  if (completedIds.length === habitIds.length) {
    return 'complete';
  }

  return 'partial';
}
