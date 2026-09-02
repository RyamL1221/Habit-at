import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeColorMatrix,
  Filter,
  G,
  Path,
  Rect,
} from 'react-native-svg';

import { SPRIG_COLORS, SPRIG_VIEWBOX, SprigStageProps, WILT_FILTER_ID } from './types';

/** A small five-petal flower centered at (cx, cy). */
function Flower({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={SPRIG_COLORS.flowerPink} />
      <Circle cx={cx - r * 1.3} cy={cy + r * 0.75} r={r * 0.9} fill={SPRIG_COLORS.flowerPink} />
      <Circle cx={cx + r * 1.3} cy={cy + r * 0.75} r={r * 0.9} fill={SPRIG_COLORS.flowerPink} />
      <Circle cx={cx - r * 0.8} cy={cy - r * 0.9} r={r * 0.9} fill={SPRIG_COLORS.flowerPink} />
      <Circle cx={cx + r * 0.8} cy={cy - r * 0.9} r={r * 0.9} fill={SPRIG_COLORS.flowerPink} />
      <Circle cx={cx} cy={cy} r={r * 0.6} fill={SPRIG_COLORS.flowerYellow} />
    </G>
  );
}

/**
 * Stage 3 — Flourishing.
 * The fullest blob creature: a lush sprout with several flowers and rosy cheeks.
 */
export default function SprigFlourishing({ wilting, size = 160 }: SprigStageProps) {
  const sproutTilt = wilting ? -12 : 6;
  const smilePath = wilting ? 'M43 68 Q50 70 57 68' : 'M43 67 Q50 74 57 67';

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.25" />
        </Filter>
      </Defs>

      <Ellipse cx="50" cy="87" rx="40" ry="10.5" fill={SPRIG_COLORS.ground} />

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Lush sprout: stalk, leaves, and three flowers. */}
        <G transform={`rotate(${sproutTilt} 52 38)`}>
          <Path
            d="M52 54 C 51 42, 51 32, 52 26"
            stroke={SPRIG_COLORS.stalk}
            strokeWidth={2.8}
            strokeLinecap="round"
            fill="none"
          />
          <Ellipse cx="43" cy="42" rx="5.4" ry="3.2" fill={SPRIG_COLORS.leaf} transform="rotate(-32 43 42)" />
          <Ellipse cx="61" cy="42" rx="5.4" ry="3.2" fill={SPRIG_COLORS.leaf} transform="rotate(32 61 42)" />
          <Ellipse cx="46" cy="33" rx="4.6" ry="2.8" fill={SPRIG_COLORS.leaf} transform="rotate(-26 46 33)" />
          <Ellipse cx="58" cy="33" rx="4.6" ry="2.8" fill={SPRIG_COLORS.leaf} transform="rotate(26 58 33)" />
          <Flower cx={52} cy={24} r={3.2} />
          <Flower cx={43} cy={30} r={2.6} />
          <Flower cx={61} cy={30} r={2.6} />
        </G>

        {/* Body: largest rounded blob. */}
        <Rect x="30" y="50" width="40" height="35" rx="17.5" fill={SPRIG_COLORS.body} />

        {/* Rosy cheeks. */}
        <Circle cx="37" cy="65" r="2.6" fill={SPRIG_COLORS.flowerPink} opacity={0.7} />
        <Circle cx="63" cy="65" r="2.6" fill={SPRIG_COLORS.flowerPink} opacity={0.7} />

        {/* Face. */}
        <G stroke={SPRIG_COLORS.face} strokeWidth={2} strokeLinecap="round" fill="none">
          <Path d="M41 61 Q44.5 57.5 48 61" />
          <Path d="M52 61 Q55.5 57.5 59 61" />
          <Path d={smilePath} />
        </G>
      </G>
    </Svg>
  );
}
