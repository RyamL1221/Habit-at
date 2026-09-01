import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { GrowthStage } from '@/lib/types';

import SprigBloom from './SprigBloom';
import SprigFlourishing from './SprigFlourishing';
import SprigSeedling from './SprigSeedling';
import SprigSprout from './SprigSprout';

interface SprigProps {
  /** Current growth stage; selects which stage illustration renders. */
  stage: GrowthStage;
  /** When true, illustration is desaturated and leaves droop. */
  wilting: boolean;
  /** Square render size in device-independent pixels. Defaults to 160. */
  size?: number;
}

const STAGE_COMPONENTS = {
  seedling: SprigSeedling,
  sprout: SprigSprout,
  bloom: SprigBloom,
  flourishing: SprigFlourishing,
} as const;

/**
 * Sprig — the terrarium creature.
 *
 * Selects the correct growth-stage SVG based on `stage`, forwards the
 * `wilting`/`size` props, and owns a gentle idle bob animation (3000ms per
 * cycle) via react-native-reanimated.
 */
export default function Sprig({ stage, wilting, size = 160 }: SprigProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500 }),
        withTiming(0, { duration: 1500 }),
      ),
      -1,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const StageComponent = STAGE_COMPONENTS[stage];

  return (
    <Animated.View style={animatedStyle}>
      <StageComponent wilting={wilting} size={size} />
    </Animated.View>
  );
}
