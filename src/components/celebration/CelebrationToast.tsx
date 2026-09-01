import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';

interface CelebrationToastProps {
  /** Total coins earned for the day (always 25 for a full-completion). */
  coinsEarned: number;
  /** The updated streak count to display. */
  streak: number;
  /** Drives the slide-in / slide-out animation. */
  visible: boolean;
  /** Called after the toast has finished sliding out (~3.3s after becoming visible). */
  onDismiss: () => void;
}

/** Distance in px the toast travels below its resting position when hidden. */
const HIDDEN_OFFSET = 100;
/** Slide in/out animation duration. */
const SLIDE_DURATION = 300;
/** How long the toast stays fully visible before sliding out (Req 15.4). */
const VISIBLE_DURATION = 3000;

/**
 * CelebrationToast — a slide-in toast shown when the day's third habit is
 * completed. It reports the coins earned and the updated streak, then
 * auto-dismisses without user interaction.
 *
 * When `visible` becomes true the toast slides up from the bottom edge
 * (translateY 100 → 0), holds for 3 seconds, then slides back down
 * (0 → 100) and invokes `onDismiss`.
 *
 * Requirements: 3.3, 3.6, 15.2, 15.4
 */
export default function CelebrationToast({
  coinsEarned,
  streak,
  visible,
  onDismiss,
}: CelebrationToastProps) {
  const translateY = useSharedValue(HIDDEN_OFFSET);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacity.value = withSequence(
      withTiming(1, { duration: SLIDE_DURATION }),
      withDelay(VISIBLE_DURATION, withTiming(0, { duration: SLIDE_DURATION })),
    );

    translateY.value = withSequence(
      withTiming(0, { duration: SLIDE_DURATION }),
      withDelay(
        VISIBLE_DURATION,
        withTiming(HIDDEN_OFFSET, { duration: SLIDE_DURATION }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        }),
      ),
    );
  }, [visible, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.card}>
        <Text style={styles.coins}>+{coinsEarned} coins</Text>
        <Text style={styles.streak}>🔥 {streak} day streak</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.six,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#F59E0B',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  coins: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  streak: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
});
