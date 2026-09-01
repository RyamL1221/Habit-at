import { StyleSheet, Text, View } from 'react-native';

import { useHabitStore } from '@/store/useHabitStore';

const AMBER_ACCENT = '#C8860D';
const MUTED_TEXT = '#9E9E9E';

/**
 * Summary row for the Stats screen showing the user's current Streak and
 * cumulative completed Days (Req 10.9). Both values are read live from
 * `useHabitStore` so the summary stays in sync with the rest of the app.
 *
 * Requirements: 10.9
 */
export function StatsSummary() {
  const streak = useHabitStore((s) => s.streak);
  const cumulativeCompletedDays = useHabitStore((s) => s.cumulativeCompletedDays);

  return (
    <View style={styles.row} accessibilityRole="summary">
      <View style={styles.card}>
        <Text style={styles.value} accessibilityLabel={`${streak} day streak`}>
          🔥 {streak}
        </Text>
        <Text style={styles.label}>day streak</Text>
      </View>

      <View style={styles.card}>
        <Text
          style={styles.value}
          accessibilityLabel={`${cumulativeCompletedDays} days completed`}
        >
          ✅ {cumulativeCompletedDays}
        </Text>
        <Text style={styles.label}>days completed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD3',
    backgroundColor: '#FBF7EF',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: AMBER_ACCENT,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: MUTED_TEXT,
  },
});
