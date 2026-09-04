import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Accessory } from '@/lib/types';

import { AccessoryPreview } from './AccessoryPreview';

export type AccessoryState = 'locked' | 'owned' | 'equipped';

interface AccessoryItemProps {
  accessory: Accessory;
  state: AccessoryState;
  coinBalance: number;
  onPress: () => void;
}

/** Amber highlight used for the equipped-state outline. */
const AMBER = '#D9A441';
/** Walnut-brown divider / neutral text tone. */
const WALNUT = '#5C4433';
/** Coin indicator gold. */
const COIN_GOLD = '#E6B422';

function LockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" accessibilityLabel="locked">
      <Path
        d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9zm3 4a1.5 1.5 0 0 1 1 2.6V19a1 1 0 1 1-2 0v-2.4A1.5 1.5 0 0 1 12 14z"
        fill={WALNUT}
      />
    </Svg>
  );
}

export function AccessoryItem({ accessory, state, coinBalance, onPress }: AccessoryItemProps) {
  const isLocked = state === 'locked';
  const isEquipped = state === 'equipped';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isEquipped, disabled: false }}
      style={[styles.row, isEquipped && styles.rowEquipped]}
    >
      {/* Preview of what the accessory looks like. */}
      <AccessoryPreview accessoryId={accessory.id} size={44} locked={isLocked} />

      <View style={styles.labelColumn}>
        <Text style={[styles.name, isLocked && styles.nameLocked]} numberOfLines={1}>
          {accessory.name}
        </Text>
        {isEquipped ? <Text style={styles.equippedTag}>Equipped · tap to remove</Text> : null}
      </View>

      {isLocked ? (
        <View style={styles.lockGroup}>
          <View style={styles.priceGroup}>
            <View style={styles.coinDot} />
            <Text style={styles.priceText}>{accessory.coinCost}</Text>
          </View>
          <LockIcon />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  rowEquipped: {
    borderColor: AMBER,
  },
  labelColumn: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  nameLocked: {
    color: '#8A8A8A',
  },
  equippedTag: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: AMBER,
  },
  lockGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COIN_GOLD,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: WALNUT,
  },
});
