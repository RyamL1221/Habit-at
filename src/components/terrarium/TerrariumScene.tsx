import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { GrowthStage } from '@/lib/types';
import Sprig from '@/components/sprig/Sprig';
import { AccessoryArt } from '@/components/terrarium/AccessoryArt';
import { useAccessoryStore } from '@/store/useAccessoryStore';
import { ACCESSORIES } from '@/constants/accessories';

interface TerrariumSceneProps {
  /** Current growth stage forwarded to the Sprig creature. */
  stage: GrowthStage;
  /** When true, the Sprig is rendered in its wilting state. */
  wilting: boolean;
  /** Square render size for the Sprig, in device-independent pixels. */
  sprigSize?: number;
}

/**
 * TerrariumScene — the layered interior of the terrarium.
 *
 * Layers are stacked with absolute-positioned Views in bottom→top order:
 *   1. SkyGradient        — soft off-white / mint background filling the scene
 *   2. TerrainAccessory   — equipped Terrain item, wide on the ground
 *   3. FurnitureAccessory — equipped Furniture items, additive, on the ground
 *   4. Sprig (+ Hat)      — the creature with any equipped Hat on its head
 *
 * Equipped accessories are derived from the accessory store by cross-referencing
 * the static ACCESSORIES catalogue, and rendered as real SVG art via
 * {@link AccessoryArt}: hats ride on the Sprig, furniture and terrain sit in
 * the background.
 *
 * _Requirements: 7.3, 7.4, 7.12, 9.10, 9.13, 9.14, 9.15_
 */
export default function TerrariumScene({
  stage,
  wilting,
  sprigSize = 160,
}: TerrariumSceneProps) {
  const ownerships = useAccessoryStore((s) => s.ownerships);

  // Equipped accessories grouped by category (Requirement 7.12).
  const equipped = ACCESSORIES.filter((a) => ownerships[a.id]?.equipped);
  const equippedTerrain = equipped.filter((a) => a.category === 'terrain');
  const equippedFurniture = equipped.filter((a) => a.category === 'furniture');
  const equippedHats = equipped.filter((a) => a.category === 'hats');

  // Accessory art sized relative to Sprig so the scene scales together.
  const terrainSize = sprigSize * 1.15;
  const furnitureSize = sprigSize * 0.5;
  const hatSize = sprigSize * 0.55;

  // The equipped hat (Hats are mutually exclusive, so at most one).
  const hat = equippedHats[0];

  return (
    <View style={styles.container}>
      {/* Layer 1: Soft background — pale off-white to mint. */}
      <LinearGradient
        colors={['#F4FAF0', '#E8F3E0']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer 2: Terrain accessory — wide, at ground level behind Sprig. */}
      <View style={styles.terrainLayer} pointerEvents="none">
        {equippedTerrain.map((accessory) => (
          <AccessoryArt key={accessory.id} accessoryId={accessory.id} size={terrainSize} />
        ))}
      </View>

      {/* Layer 3: Furniture accessories — additive, spread along the ground. */}
      <View style={styles.furnitureLayer} pointerEvents="none">
        {equippedFurniture.map((accessory) => (
          <AccessoryArt key={accessory.id} accessoryId={accessory.id} size={furnitureSize} />
        ))}
      </View>

      {/* Layer 4: Sprig with an equipped Hat resting on its head. */}
      <View style={styles.sprigLayer} pointerEvents="none">
        <View style={{ width: sprigSize, height: sprigSize }}>
          <Sprig stage={stage} wilting={wilting} size={sprigSize} />

          {hat ? (
            <View
              style={[
                styles.hatSlot,
                {
                  width: hatSize,
                  height: hatSize,
                  // Center over the Sprig's head. In the Sprig viewBox the
                  // body/head top sits near ~54% of the height, so anchoring
                  // the hat's mid at ~50% crowns the head.
                  left: (sprigSize - hatSize) / 2,
                  top: sprigSize * 0.5 - hatSize / 2,
                },
              ]}
            >
              <AccessoryArt accessoryId={hat.id} size={hatSize} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  },
  terrainLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '4%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  furnitureLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '10%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  sprigLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '8%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  hatSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
