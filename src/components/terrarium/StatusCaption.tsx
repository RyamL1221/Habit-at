import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { computeStatusCaption } from '@/lib/statusCaption';
import type { GrowthStage } from '@/lib/types';
import { useHabitStore } from '@/store/useHabitStore';

export interface StatusCaptionProps {
  /**
   * Whether a Growth_Stage transition occurred during today's completion.
   * The Home screen can pass this transient info; defaults to steady-state.
   */
  growthStageJustChanged?: boolean;
  /** The stage transitioned to, or null when no transition occurred. */
  newStage?: GrowthStage | null;
}

/**
 * Renders the single italic Status_Caption line below the Terrarium.
 *
 * The caption text is derived from live store values via `computeStatusCaption`.
 * Stage-change info is transient and not persisted, so the Home screen may pass
 * it in as props; by default the caption reflects the steady-state message.
 *
 * Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 14.2
 */
export function StatusCaption({
  growthStageJustChanged = false,
  newStage = null,
}: StatusCaptionProps) {
  const todayCompletedIds = useHabitStore((s) => s.todayCompletedIds);
  const isWilting = useHabitStore((s) => s.isWilting);

  const completedCount = todayCompletedIds.length;

  const caption = computeStatusCaption(
    completedCount,
    isWilting,
    growthStageJustChanged,
    newStage,
  );

  return (
    <ThemedText themeColor="textSecondary" style={styles.caption}>
      {caption}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
