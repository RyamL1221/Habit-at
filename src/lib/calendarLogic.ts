import { DayRecord } from './types';

/**
 * Determines the visual cell status for a calendar day in the Stats screen.
 *
 * Rules (Req 10.4 – 10.7):
 *   - future date  → 'future'   (never fill a cell that hasn't happened yet)
 *   - no record    → 'empty'    (past/today date with no stored DayRecord)
 *   - status 'complete' → 'complete'
 *   - status 'partial'  → 'partial'
 *   - status 'missed'   → 'empty'  (missed days render the same as no-record)
 *
 * @param record  The stored DayRecord for this date, or undefined if none exists.
 * @param dateKey The date being evaluated, in "YYYY-MM-DD" format.
 * @param today   Today's date, in "YYYY-MM-DD" format.
 */
export function computeCellStatus(
  record: DayRecord | undefined,
  dateKey: string,
  today: string,
): 'complete' | 'partial' | 'empty' | 'future' {
  // YYYY-MM-DD lexicographic order is equivalent to chronological order,
  // so a plain string comparison is sufficient and correct.
  if (dateKey > today) {
    return 'future';
  }

  if (record === undefined) {
    return 'empty';
  }

  if (record.status === 'complete') {
    return 'complete';
  }

  if (record.status === 'partial') {
    return 'partial';
  }

  // 'missed' (and any unexpected value) → empty cell
  return 'empty';
}
