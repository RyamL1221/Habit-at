import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { Habit } from '@/lib/types';

const ACCENT_GREEN = '#4CAF50';
const CHECKBOX_SIZE = 32;

/**
 * A leaf silhouette path drawn within a 24x24 viewBox. Rendered filled with the
 * primary accent green when the habit is completed, or as an outline otherwise.
 */
const LEAF_PATH =
  'M4 20 C4 10 10 4 20 4 C20 14 14 20 4 20 Z M6 18 C11 15 15 11 18 6';

interface HabitRowProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}

export function HabitRow({ habit, completed, onToggle }: HabitRowProps) {
  const scale = useSharedValue(1);

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.85 + (scale.value - 0.9) * 1.5,
  }));

  const handlePress = () => {
    // Micro-bounce: scale 1 -> 0.9 -> 1 over ~100ms (Req 2.2)
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withTiming(1, { duration: 50 }),
    );
    onToggle();
  };

  return (
    <Pressable
      style={styles.row}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={habit.name}
    >
      <Animated.View style={[styles.checkbox, checkboxStyle]}>
        <Svg width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} viewBox="0 0 24 24">
          <Path
            d={LEAF_PATH}
            fill={completed ? ACCENT_GREEN : 'none'}
            stroke={completed ? ACCENT_GREEN : '#9E9E9E'}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, completed && styles.labelCompleted]}>
          {habit.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  labelCompleted: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
});
