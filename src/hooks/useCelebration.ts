import { useCallback } from 'react';

import { useHabitStore } from '@/store/useHabitStore';

/**
 * Shape returned by {@link useCelebration}.
 */
export interface UseCelebrationResult {
  /** Whether the celebration overlay/toast should currently be visible. */
  active: boolean;
  /**
   * Placeholder trigger for API completeness.
   *
   * The celebration is owned entirely by the store: completing the third and
   * final habit inside `toggleHabit` sets `celebrationActive` to true
   * (Req 3.1, 3.8). Consumers therefore do not need to call `trigger()` to
   * start a celebration during normal use. It is exposed here so the hook's
   * surface reads as a complete state machine (`active` / `trigger` /
   * `dismiss`) and to give tests a stable reference. It is intentionally a
   * no-op.
   */
  trigger: () => void;
  /** Dismisses the active celebration (Req 3.5, 3.6). */
  dismiss: () => void;
}

/**
 * Celebration state-machine hook.
 *
 * `active` mirrors the store's `celebrationActive` flag, and `dismiss` clears
 * it via the store's `dismissCelebration` action. `trigger` is a documented
 * no-op because the store drives celebration activation on the third-habit
 * toggle.
 *
 * Requirements: 3.1, 3.5, 3.6, 3.8, 15.5
 */
export function useCelebration(): UseCelebrationResult {
  const active = useHabitStore((s) => s.celebrationActive);
  const dismissCelebration = useHabitStore((s) => s.dismissCelebration);

  const dismiss = useCallback(() => {
    dismissCelebration();
  }, [dismissCelebration]);

  // No-op: the store owns celebration activation (see UseCelebrationResult.trigger).
  const trigger = useCallback(() => {
    // Intentionally empty — celebration is triggered by toggleHabit in the store.
  }, []);

  return { active, trigger, dismiss };
}
