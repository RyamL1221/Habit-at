import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { today } from '@/lib/dateUtils';
import { useHabitStore } from '@/store/useHabitStore';

/**
 * Runs day-boundary evaluation when the app mounts and whenever it returns to
 * the foreground.
 *
 * Guards against duplicate evaluation on the same calendar day by tracking the
 * last-evaluated local date key in a ref; `evaluateDayOnOpen` only fires when
 * today's key differs from the last-evaluated key. This keeps streak/wilting
 * evaluation idempotent within a day (Req 4.6) while still resetting today's
 * completion state (Req 2.5) and re-hydrating on open (Req 13.2).
 *
 * Requirements: 2.5, 4.6, 13.2
 */
export function useDayCheck(): void {
  const evaluateDayOnOpen = useHabitStore((s) => s.evaluateDayOnOpen);
  const lastEvaluatedRef = useRef<string | null>(null);

  const check = useCallback(() => {
    const key = today();
    if (lastEvaluatedRef.current !== key) {
      lastEvaluatedRef.current = key;
      evaluateDayOnOpen(key);
    }
  }, [evaluateDayOnOpen]);

  useEffect(() => {
    // Evaluate immediately on mount.
    check();

    // Re-evaluate whenever the app returns to the foreground; the day may have
    // rolled over while the app was backgrounded.
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        check();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [check]);
}
