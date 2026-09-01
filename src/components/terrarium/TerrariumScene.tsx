import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse } from 'react-native-svg';

import type { Accessory, GrowthStage } from '@/lib/types';
import Sprig from '@/components/sprig/Sprig';
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
 *   1. SkyGradient       — soft sky-to-mint LinearGradient filling the scene
 *   2. TerrainAccessory  — equipped Terrain item (placeholder pill for now)
 *   3. GroundMound       — moss-green SVG ellipse at the bottom center
 *   4. FurnitureAccessory— equipped Furniture items, additive (placeholders)
 *   5. Sprig             — the creature, centered and sitting on the mound
 *   6. HatAccessory      — equipped Hat item near Sprig's head (placeholder)
 *
 * Equipped accessories are derived from the accessory store by cross-referencing
 * the static ACCESSORIES catalogue. Since accessory art doesn't exist yet, each
 * equipped accessory renders as a small labeled placeholder pill in the correct
 * layer — preserving the layering structure for later art integration.
 *
 * _Requirements: 7.3, 7.4, 7.12_
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

  return (
    <View style={styles.container}>
      {/* Layer 1: Sky gradient — fills the entire scene. */}
      <LinearGradient
        colors={['#BFE3F5', '#E8F7EC']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer 2: Terrain accessory slot — placeholders at ground level. */}
      <View style={styles.terrainLayer} pointerEvents="none">
        {equippedTerrain.map((accessory) => (
          <AccessoryPlaceholder key={accessory.id} accessory={accessory} />
        ))}
      </View>

      {/* Layer 3: Ground mound — moss-green ellipse at the bottom center. */}
      <View style={styles.groundLayer} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 40">
          <Ellipse cx="50" cy="40" rx="55" ry="28" fill="#7CB342" />
        </Svg>
      </View>

      {/* Layer 4: Furniture accessory slots — additive placeholders. */}
      <View style={styles.furnitureLayer} pointerEvents="none">
        {equippedFurniture.map((accessory) => (
          <AccessoryPlaceholder key={accessory.id} accessory={accessory} />
        ))}
      </View>

      {/* Layer 5: Sprig — centered horizontally, sitting on the mound. */}
      <View style={styles.sprigLayer} pointerEvents="none">
        <Sprig stage={stage} wilting={wilting} size={sprigSize} />
      </View>

      {/* Layer 6: Hat accessory slot — near Sprig's head. */}
      <View style={styles.hatLayer} pointerEvents="none">
        {equippedHats.map((accessory) => (
          <AccessoryPlaceholder key={accessory.id} accessory={accessory} />
        ))}
      </View>
    </View>
  );
}

/**
 * A small rounded pill labeled with an accessory name. Stands in for the
 * eventual accessory SVG art so the layered scene stays testable.
 */
function AccessoryPlaceholder({ accessory }: { accessory: Accessory }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText} numberOfLines={1}>
        {accessory.name}
      </Text>
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
    bottom: 0,
    height: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    gap: 4,
  },
  groundLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '25%',
  },
  furnitureLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '18%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  sprigLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '20%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  hatLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '10%',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#7CB342',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  placeholderText: {
    fontSize: 12,
    color: '#33691E',
    fontWeight: '500',
  },
});
