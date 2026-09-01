import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AccessoryItem, type AccessoryState } from './AccessoryItem';
import { ACCESSORIES } from '@/constants/accessories';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import { useAccessoryStore } from '@/store/useAccessoryStore';
import { useHabitStore } from '@/store/useHabitStore';

interface WardrobeShelfProps {
  category: AccessoryCategory;
  onRequestPurchase: (accessory: Accessory) => void;
}

/** Thin walnut-brown hairline divider between shelf rows (Requirement 9.5). */
const WALNUT_DIVIDER = '#8B5E3C';

/**
 * A scrollable shelf of AccessoryItem rows for the active category, separated
 * by thin walnut-brown divider lines rather than individual cards
 * (Requirement 9.5). Tapping a row drives purchase / equip / no-op behaviour
 * based on the accessory's ownership state.
 *
 * _Requirements: 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12_
 */
export function WardrobeShelf({ category, onRequestPurchase }: WardrobeShelfProps) {
  const ownerships = useAccessoryStore((s) => s.ownerships);
  const equipAccessory = useAccessoryStore((s) => s.equipAccessory);
  const coinBalance = useHabitStore((s) => s.coinBalance);

  // Only render the accessories belonging to the active category (Req 9.4).
  const items = ACCESSORIES.filter((a) => a.category === category);

  function resolveState(accessory: Accessory): AccessoryState {
    const ownership = ownerships[accessory.id];
    if (ownership?.equipped) {
      return 'equipped';
    }
    if (ownership?.owned) {
      return 'owned';
    }
    return 'locked';
  }

  function handlePress(accessory: Accessory, state: AccessoryState) {
    if (state === 'equipped') {
      // Tapping an already-equipped accessory produces no state change (Req 9.6).
      return;
    }

    if (state === 'owned') {
      // Equip an owned-but-not-equipped accessory (Req 9.7).
      equipAccessory(accessory.id);
      return;
    }

    // Locked: gate on affordability.
    if (coinBalance >= accessory.coinCost) {
      // Affordable → parent surfaces the purchase confirmation prompt (Req 9.9).
      onRequestPurchase(accessory);
    } else {
      // Insufficient funds (Req 9.12).
      Alert.alert('Not enough coins yet.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {items.map((accessory, index) => {
        const state = resolveState(accessory);
        return (
          <View key={accessory.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <AccessoryItem
              accessory={accessory}
              state={state}
              coinBalance={coinBalance}
              onPress={() => handlePress(accessory, state)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: WALNUT_DIVIDER,
    marginHorizontal: 12,
  },
});
