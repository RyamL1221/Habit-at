/**
 * Date utilities for Habrite.
 * All functions operate in the device's local timezone using
 * getFullYear / getMonth / getDate (never UTC variants).
 */

/**
 * Zero-pads a number to a minimum of 2 digits.
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Zero-pads a number to a minimum of 4 digits (for the year component).
 */
function pad4(n: number): string {
  if (n < 10) return `000${n}`;
  if (n < 100) return `00${n}`;
  if (n < 1000) return `0${n}`;
  return `${n}`;
}

/**
 * Returns a "YYYY-MM-DD" string for the given Date in local timezone.
 */
export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const day = date.getDate();
  return `${pad4(year)}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Returns today's date as a "YYYY-MM-DD" string in the device's local timezone.
 */
export function today(): string {
  return localDateKey(new Date());
}

/**
 * Returns true if both Date objects fall on the same calendar day
 * in the device's local timezone.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
