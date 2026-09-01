import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { GrowthStage } from '@/lib/types';
import TerrariumScene from './TerrariumScene';

interface TerrariumProps {
  /** Outer container height in device-independent pixels (≥40% screen height). */
  height: number;
  /**
   * Whether a celebration is currently active. Exposed for the parent to drive
   * the SparkleOverlay (created in task 10.1, integrated on Home in task 15.1);
   * the overlay itself is passed in via `children`.
   */
  showCelebration: boolean;
  /** Current growth stage forwarded to the Sprig creature. */
  stage: GrowthStage;
  /** When true, the Sprig is rendered in its wilting state. */
  wilting: boolean;
  /** Square render size for the Sprig, in device-independent pixels. */
  sprigSize?: number;
  /**
   * Optional overlay content (e.g. SparkleOverlay) rendered absolutely on top
   * of the scene. Clipped to the frame via `overflow: 'hidden'`.
   */
  children?: ReactNode;
}

/**
 * Terrarium — the wood-framed container that houses the layered TerrariumScene.
 *
 * Renders a rounded, walnut-brown "wood frame" border around the scene. The
 * frame clips its contents (`overflow: 'hidden'`) so any sparkle overlay passed
 * as `children` stays contained within the terrarium bounds.
 *
 * The `showCelebration` prop is passed through for the parent to decide whether
 * to mount a SparkleOverlay into `children`; the Terrarium itself only manages
 * the frame and layering slot.
 *
 * _Requirements: 7.1, 7.2, 14.1_
 */
export default function Terrarium({
  height,
  showCelebration: _showCelebration,
  stage,
  wilting,
  sprigSize,
  children,
}: TerrariumProps) {
  return (
    <View style={[styles.frame, { height }]}>
      {/* The layered interior fills the frame. */}
      <TerrariumScene stage={stage} wilting={wilting} sprigSize={sprigSize} />

      {/* Overlay slot: SparkleOverlay (or any children) sits on top, clipped
          to the frame by the container's overflow: 'hidden'. */}
      {children != null && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#8B5E3C', // walnut brown wood frame
    overflow: 'hidden',
    backgroundColor: '#E8F7EC',
  },
});
