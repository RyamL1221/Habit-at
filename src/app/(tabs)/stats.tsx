import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarGrid } from '@/components/stats/CalendarGrid';
import { StatsSummary } from '@/components/stats/StatsSummary';

/**
 * Stats screen — the third Bottom_Nav destination. Shows the current Streak
 * and cumulative completed Days summary on top, with a scrollable month
 * calendar of completion history below.
 *
 * Requirements: 10.1
 */
export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatsSummary />
        <CalendarGrid />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
});
