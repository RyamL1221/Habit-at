import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
 * confirmation prompt; confirming deducts coins and equips the item.
 *
 * _Requirements: 9.1, 9.9, 9.10, 9.11_
 */
export default function WardrobeScreen() {
  // Active category defaults to Hats on first open (Req 9.3).
  const [activeCategory, setActiveCategory] = useState<AccessoryCategory>('hats');

  // Sprig's current appearance mirrors the Home terrarium (Req 5.6, 9.1).
  const growthStage = useHabitStore((s) => s.growthStage);
  const isWilting = useHabitStore((s) => s.isWilting);

  const purchaseAccessory = useAccessoryStore((s) => s.purchaseAccessory);

  function handleRequestPurchase(accessory: Accessory) {
    // Purchase confirmation prompt showing name and cost (Req 9.9).
    Alert.alert(`Purchase ${accessory.name}?`, `Cost: ${accessory.coinCost} coins`, [
      // Cancel makes no changes to coins or accessory state (Req 9.11).
      { text: 'Cancel', style: 'cancel' },
      // Confirm deducts coins and marks the accessory owned + equipped (Req 9.10).
      { text: 'Confirm', onPress: () => purchaseAccessory(accessory.id) },
    ]);
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

      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      <View style={styles.shelf}>
        <WardrobeShelf category={activeCategory} onRequestPurchase={handleRequestPurchase} />
      </View>
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
  shelf: {
    flex: 1,
  },
});
