import { useRouter } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CelebrationToast from '@/components/celebration/CelebrationToast';
import SparkleOverlay from '@/components/celebration/SparkleOverlay';
import { Checklist } from '@/components/checklist/Checklist';
import { StatusCaption } from '@/components/terrarium/StatusCaption';
import Terrarium from '@/components/terrarium/Terrarium';
import { Spacing } from '@/constants/theme';
import { useDayCheck } from '@/hooks/useDayCheck';
import { useHabitStore } from '@/store/useHabitStore';

/** Fraction of window height the Terrarium occupies (≥40%, Req 14.1). */
const TERRARIUM_HEIGHT_RATIO = 0.42;
/** Total coins earned on a full-completion day (Req 15.2). */
const DAY_COMPLETION_COINS = 25;

/**
 * Home screen — the emotional heart of Habrite.
 *
 * Layout (Req 14.1–14.6):
 * - Fixed header row: settings button (→ '/settings') and 🔥 streak indicator.
 * - Fixed Terrarium occupying ≥40% of screen height, with the SparkleOverlay
 *   mounted as children while a celebration is active (Req 15.1, 15.6).
 * - Fixed StatusCaption immediately below the Terrarium (Req 14.2).
 * - Scrollable Checklist area below (Req 14.3, 14.6) — only this region scrolls.
 * - CelebrationToast rendered absolutely at root level (Req 15.2, 15.5).
 *
 * `useDayCheck()` runs the day-boundary evaluation on mount / foreground.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  useDayCheck();

  const growthStage = useHabitStore((s) => s.growthStage);
  const isWilting = useHabitStore((s) => s.isWilting);
  const streak = useHabitStore((s) => s.streak);
  const celebrationActive = useHabitStore((s) => s.celebrationActive);
  const dismissCelebration = useHabitStore((s) => s.dismissCelebration);

  const terrariumHeight = height * TERRARIUM_HEIGHT_RATIO;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {/* Fixed header row (Req 14.4) */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.iconButton}
          hitSlop={8}
        >
          <Text style={styles.icon}>⚙️</Text>
        </Pressable>

        <View style={styles.streak} accessibilityLabel={`Streak ${streak} days`}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakCount}>{streak}</Text>
        </View>
      </View>

      {/* Fixed Terrarium (Req 14.1) */}
      <View style={styles.terrariumWrap}>
        <Terrarium
          height={terrariumHeight}
          stage={growthStage}
          wilting={isWilting}
          showCelebration={celebrationActive}
        >
          {celebrationActive ? (
            <SparkleOverlay
              visible={celebrationActive}
              containerDimensions={{ width, height: terrariumHeight }}
            />
          ) : null}
        </Terrarium>
      </View>

      {/* Fixed Status caption (Req 14.2) */}
      <View style={styles.captionWrap}>
        <StatusCaption />
      </View>

      {/* Scrollable checklist area (Req 14.3, 14.6) */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Checklist />
      </ScrollView>

      {/* Celebration toast, root-level absolute (Req 15.2, 15.5) */}
      <CelebrationToast
        visible={celebrationActive}
        coinsEarned={DAY_COMPLETION_COINS}
        streak={streak}
        onDismiss={dismissCelebration}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  iconButton: {
    padding: Spacing.one,
  },
  icon: {
    fontSize: 22,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: Spacing.one,
  },
  terrariumWrap: {
    paddingHorizontal: Spacing.four,
  },
  captionWrap: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
});
