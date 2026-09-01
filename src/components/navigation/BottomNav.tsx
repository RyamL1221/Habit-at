import type { BottomTabBarProps } from 'expo-router/tabs';
import { useMemo } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useHabitStore } from '@/store/useHabitStore';

/**
 * Custom bottom tab bar for the three main screens (Home, Wardrobe, Stats)
 * plus a live coin-balance pill.
 *
 * Requirements:
 *  - 8.1  Coin balance shown next to a coin icon while the App is open
 *  - 8.2  Coin balance updates live without navigation / manual refresh
 *  - 11.1 Exactly three nav items, each with a distinct icon and short label
 *  - 11.2 Tapping a non-active item navigates to that screen
 *  - 11.3 Active item rendered in a distinct style from inactive items
 *  - 11.4 Bar remains fixed at the bottom on all three main screens
 *  - 11.5 Tapping the already-active item performs no navigation
 */

/** Amber accent for the active tab (Req 11.3). */
const ACTIVE_COLOR = '#F59E0B';
/** Muted gray for inactive tabs (Req 11.3). */
const INACTIVE_COLOR = '#9CA3AF';

const ICON_SIZE = 24;

/** Short, ≤10-char labels for each route (Req 11.1). */
const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  wardrobe: 'Wardrobe',
  stats: 'Stats',
};

type IconProps = { color: ColorValue; size: number };

/** Flame icon — Home tab. */
function FlameIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c1.5 3 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.2.4-2.1 1-3 .2 1 .9 1.7 1.7 1.7.8 0 1.3-.6 1.3-1.4C11.5 6 10 4.5 12 2Z"
        fill={color}
      />
    </Svg>
  );
}

/** Hanger icon — Wardrobe tab. */
function HangerIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M12 8a2 2 0 1 1 2-2" />
        <Path d="M12 8 4 15h16L12 8Z" />
      </G>
    </Svg>
  );
}

/** Calendar icon — Stats tab. */
function CalendarIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={3.5} y={5} width={17} height={15} rx={2} />
        <Path d="M3.5 9h17M8 3.5v3M16 3.5v3" />
      </G>
    </Svg>
  );
}

/** Coin icon for the balance pill. */
function CoinIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="#FBBF24" stroke="#D97706" strokeWidth={1.5} />
      <Path
        d="M12 7v10M9.5 9.2a2.5 2.5 0 0 1 2.5-1.7c1.4 0 2.5.8 2.5 2s-1.1 1.7-2.5 1.7-2.5.5-2.5 1.7.9 1.9 2.5 1.9a2.5 2.5 0 0 0 2.5-1.7"
        stroke="#D97706"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function TabIcon({ routeName, color }: { routeName: string; color: ColorValue }) {
  switch (routeName) {
    case 'index':
      return <FlameIcon color={color} size={ICON_SIZE} />;
    case 'wardrobe':
      return <HangerIcon color={color} size={ICON_SIZE} />;
    case 'stats':
      return <CalendarIcon color={color} size={ICON_SIZE} />;
    default:
      return null;
  }
}

export default function BottomNav({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  // Live coin balance — re-renders on any balance change (Req 8.1, 8.2).
  const coinBalance = useHabitStore((s) => s.coinBalance);

  const bottomInset = useMemo(() => Math.max(insets.bottom, 8), [insets.bottom]);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Live coin balance pill (Req 8.1, 8.2) */}
      <View style={styles.coinPill}>
        <CoinIcon size={18} />
        <Text style={styles.coinText} accessibilityLabel={`Coin balance ${coinBalance}`}>
          {coinBalance}
        </Text>
      </View>

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const color: ColorValue = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          const { options } = descriptors[route.key];
          const label =
            TAB_LABELS[route.name] ??
            (typeof options.title === 'string' ? options.title : route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            // Tapping the active tab does nothing (Req 11.5).
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <TabIcon routeName={route.name} color={color} />
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fixed at the bottom of the viewport on all main screens (Req 11.4).
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  coinPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
