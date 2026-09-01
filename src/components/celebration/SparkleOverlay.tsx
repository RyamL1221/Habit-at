import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/** Number of sparkle dots rendered inside the overlay. */
const SPARKLE_COUNT = 12;
/** Rendered pixel size of a single sparkle star. */
const SPARKLE_SIZE = 16;
/** Total celebration lifetime in ms (Requirement 15.3). */
const CELEBRATION_DURATION_MS = 2000;
/** Duration of a single grow/shrink half-cycle. */
const HALF_CYCLE_MS = 400;
/** Warm gold used for the sparkle stars. */
const SPARKLE_COLOR = '#F5C542';

interface SparkleOverlayProps {
  /** Drives the sparkle animation; when true the sparkles play. */
  visible: boolean;
  /** Bounds within which sparkles are randomly positioned. */
  containerDimensions: { width: number; height: number };
}

interface SparkleConfig {
  /** Horizontal position (top-left of the sparkle) in px. */
  x: number;
  /** Vertical position (top-left of the sparkle) in px. */
  y: number;
  /** Per-sparkle stagger delay in ms (0–800). */
  delay: number;
}

/** A simple four-point star path drawn within a SPARKLE_SIZE box. */
const STAR_PATH = 'M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z';

/**
 * A single animated sparkle. Reads its own shared value which is driven from
 * the parent so all sparkles start/stop together while retaining an
 * individual stagger delay.
 */
function Sparkle({ config, progress }: { config: SparkleConfig; progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value / 1.5,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: config.x, top: config.y },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Svg width={SPARKLE_SIZE} height={SPARKLE_SIZE} viewBox={`0 0 ${SPARKLE_SIZE} ${SPARKLE_SIZE}`}>
        <Path d={STAR_PATH} fill={SPARKLE_COLOR} />
      </Svg>
    </Animated.View>
  );
}

/**
 * SparkleOverlay — celebratory sparkles overlaid on the Terrarium.
 *
 * Renders {@link SPARKLE_COUNT} four-point stars at random positions within
 * `containerDimensions`. Each sparkle grows (0 → 1.5) and fades out on a
 * staggered loop. The animation auto-stops after {@link CELEBRATION_DURATION_MS}
 * (Requirement 15.3); the parent Terrarium clips the overlay via
 * `overflow: 'hidden'` (Requirement 15.1).
 */
export default function SparkleOverlay({ visible, containerDimensions }: SparkleOverlayProps) {
  // Precompute sparkle positions/delays once per dimension change so they stay
  // stable across re-renders while visible toggles.
  const configs = useMemo<SparkleConfig[]>(() => {
    const { width, height } = containerDimensions;
    return Array.from({ length: SPARKLE_COUNT }, () => ({
      x: Math.random() * Math.max(0, width - SPARKLE_SIZE),
      y: Math.random() * Math.max(0, height - SPARKLE_SIZE),
      delay: Math.random() * 800,
    }));
  }, [containerDimensions]);

  // One shared value per sparkle. SPARKLE_COUNT is a compile-time constant so
  // the hook count is stable across renders.
  const progressValues = Array.from({ length: SPARKLE_COUNT }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSharedValue(0),
  );

  useEffect(() => {
    if (!visible) {
      progressValues.forEach((sv) => {
        sv.value = 0;
      });
      return;
    }

    progressValues.forEach((sv, i) => {
      const delay = configs[i]?.delay ?? 0;
      // Two grow/shrink repeats keep each cycle within the ~2s budget. The
      // trailing withTiming(0) guarantees the sparkle ends fully hidden even
      // if the parent leaves the overlay mounted (Requirement 15.3).
      sv.value = withDelay(
        delay,
        withSequence(
          withRepeat(
            withSequence(
              withTiming(1.5, { duration: HALF_CYCLE_MS }),
              withTiming(0, { duration: HALF_CYCLE_MS }),
            ),
            2,
            false,
          ),
          withTiming(0, { duration: 0 }),
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, configs]);

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {configs.map((config, i) => (
        <Sparkle key={i} config={config} progress={progressValues[i]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    width: SPARKLE_SIZE,
    height: SPARKLE_SIZE,
  },
});
