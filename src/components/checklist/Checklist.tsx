import { StyleSheet, View } from 'react-native';

import { useHabitStore } from '@/store/useHabitStore';

import { HabitRow } from './HabitRow';

/**
 * Renders the three-habit daily checklist. Each row is driven by the shared
 * Zustand store: completion state is derived from `todayCompletedIds` and
 * toggling routes through the store's `toggleHabit` action.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function Checklist() {
  const habits = useHabitStore((state) => state.habits);
  const todayCompletedIds = useHabitStore((state) => state.todayCompletedIds);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);

  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          completed={todayCompletedIds.includes(habit.id)}
          onToggle={() => toggleHabit(habit.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
