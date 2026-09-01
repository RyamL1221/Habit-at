/**
 * Validates a habit name string against the rules in Requirements 1.4 and 1.5.
 *
 * @param name  The habit name string to validate.
 * @returns     `{ valid: true }` when the name is acceptable, or
 *              `{ valid: false, error: string }` with the exact error message.
 */
export function validateHabitName(name: string): { valid: boolean; error?: string } {
  // Requirement 1.4 / 12.7: reject empty or whitespace-only strings
  if (name.trim().length === 0) {
    return { valid: false, error: 'Habit name cannot be empty.' };
  }

  // Requirement 1.5 / 12.7: reject names longer than 60 characters (trimmed)
  if (name.trim().length > 60) {
    return { valid: false, error: 'Habit name must be 60 characters or fewer.' };
  }

  return { valid: true };
}
