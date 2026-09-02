import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import Terrarium from '@/components/terrarium/Terrarium';
import { CategoryTabs } from '@/components/wardrobe/CategoryTabs';
import { WardrobeShelf } from '@/components/wardrobe/WardrobeShelf';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import { useAccessoryStore } from '@/store/useAccessoryStore';
import { useHabitStore } from '@/store/useHabitStore';

/**
 * Wardrobe screen — a mini Terrarium preview sits above an underlined
 * category-tab selector and a scrollable shelf of accessories for the active
 * category. Tapping a locked-but-affordable accessory surfaces a purchase
 * confirmation dialog; confirming deducts coins and equips the item.
 *
 * A small coin-tools row lets you grant +10 coins or reset the balance to 0
 * for quickly trying out purchases.
 *
 * _Requirements: 9.1, 9.9, 9.10, 9.11_
 */
export default function WardrobeScreen() {
  // Active category defaults to Hats on first open (Req 9.3).
  const [activeCategory, setActiveCategory] = useState<AccessoryCategory>('hats');

  // The accessory pending purchase confirmation (null when no dialog is open).
  const [pendingPurchase, setPendingPurchase] = useState<Accessory | null>(null);

  // Transient "not enough coins" notice text (null when hidden).
  const [notice, setNotice] = useState<string | null>(null);

  // Sprig's current appearance mirrors the Home terrarium (Req 5.6, 9.1).
  const growthStage = useHabitStore((s) => s.growthStage);
  const isWilting = useHabitStore((s) => s.isWilting);
  const coinBalance = useHabitStore((s) => s.coinBalance);
  const grantCoins = useHabitStore((s) => s.grantCoins);
  const resetCoins = useHabitStore((s) => s.resetCoins);

  const purchaseAccessory = useAccessoryStore((s) => s.purchaseAccessory);

  // A locked-but-affordable item was tapped → open the confirmation dialog
  // (Req 9.9). Uses an in-app modal instead of Alert.alert so it works on web.
  function handleRequestPurchase(accessory: Accessory) {
    setNotice(null);
    setPendingPurchase(accessory);
  }

  // Not enough coins to buy the tapped item (Req 9.12).
  function handleInsufficientFunds(accessory: Accessory) {
    setNotice(`Not enough coins for ${accessory.name} (needs ${accessory.coinCost}).`);
  }

  // Confirm deducts coins and marks the accessory owned + equipped (Req 9.10).
  function confirmPurchase() {
    if (pendingPurchase) {
      purchaseAccessory(pendingPurchase.id);
    }
    setPendingPurchase(null);
  }

  // Cancel makes no changes to coins or accessory state (Req 9.11).
  function cancelPurchase() {
    setPendingPurchase(null);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Mini Terrarium preview (Req 9.1). */}
      <View style={styles.preview}>
        <Terrarium
          height={200}
          showCelebration={false}
          stage={growthStage}
          wilting={isWilting}
          sprigSize={140}
        />
      </View>

      {/* Coin tools: current balance + grant / reset buttons. */}
      <View style={styles.coinTools}>
        <View style={styles.balanceGroup}>
          <View style={styles.coinDot} />
          <Text style={styles.balanceText}>{coinBalance}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable
            onPress={() => grantCoins(10)}
            accessibilityRole="button"
            accessibilityLabel="Grant 10 coins"
            style={({ pressed }) => [styles.button, styles.grantButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>+10 coins</Text>
          </Pressable>

          <Pressable
            onPress={resetCoins}
            accessibilityRole="button"
            accessibilityLabel="Reset coins to zero"
            style={({ pressed }) => [styles.button, styles.resetButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      <View style={styles.shelf}>
        <WardrobeShelf
          category={activeCategory}
          onRequestPurchase={handleRequestPurchase}
          onInsufficientFunds={handleInsufficientFunds}
        />

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </View>

      {/* Purchase confirmation (cross-platform; works on web + native). */}
      <ConfirmDialog
        visible={pendingPurchase !== null}
        title={pendingPurchase ? `Purchase ${pendingPurchase.name}?` : ''}
        message={pendingPurchase ? `Cost: ${pendingPurchase.coinCost} coins` : undefined}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmPurchase}
        onCancel={cancelPurchase}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  preview: {
    padding: 12,
  },
  coinTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  balanceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E6B422',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C4433',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  grantButton: {
    backgroundColor: '#7BA876',
  },
  resetButton: {
    backgroundColor: '#B07A6A',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shelf: {
    flex: 1,
  },
  notice: {
    textAlign: 'center',
    color: '#B23A48',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
