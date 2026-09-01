import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import type { Habit } from '@/lib/types';

/**
 * Helpers wrapping `expo-notifications` for scheduling and cancelling
 * daily habit reminders, and for checking / requesting OS permissions.
 *
 * Validates: Requirements 1.6, 1.7, 1.8, 1.9, 12.3, 12.4, 12.5
 */

const REMINDER_BODY = 'Time to complete your habit!';

/**
 * Parse an "HH:MM" 24-hour string into hour/minute numbers.
 * Returns null when the string is missing or malformed.
 */
function parseReminderTime(
  reminderTime: string | null
): { hour: number; minute: number } | null {
  if (!reminderTime) {
    return null;
  }
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(reminderTime.trim());
  if (!match) {
    return null;
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/**
 * Returns whether notification permission is currently granted by the OS.
 */
export async function checkPermissions(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/**
 * Requests notification permission from the OS and returns whether it was granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

/**
 * Schedules a daily repeating local notification for a habit's reminder time.
 * Returns the notification identifier, or an empty string when the habit has
 * no reminder time set (or the time is malformed).
 */
export async function scheduleHabitReminder(habit: Habit): Promise<string> {
  const parsed = parseReminderTime(habit.reminderTime);
  if (!parsed) {
    return '';
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: habit.name,
      body: REMINDER_BODY,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: parsed.hour,
      minute: parsed.minute,
      repeats: true,
    },
  });
}

/**
 * Cancels a previously scheduled habit reminder by its notification identifier.
 */
export async function cancelHabitReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Hook returning the notification helper functions, each memoised via useCallback.
 */
export function useNotifications() {
  return {
    checkPermissions: useCallback(checkPermissions, []),
    requestPermissions: useCallback(requestPermissions, []),
    scheduleHabitReminder: useCallback(scheduleHabitReminder, []),
    cancelHabitReminder: useCallback(cancelHabitReminder, []),
  };
}
