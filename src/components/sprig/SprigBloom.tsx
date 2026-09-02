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

/**
 * Stage 2 — Bloom.
 * The blob creature with a fuller sprout and a single small flower.
 */
export default function SprigBloom({ wilting, size = 160 }: SprigStageProps) {
  const sproutTilt = wilting ? -14 : 8;
  const smilePath = wilting ? 'M44 68 Q50 70 56 68' : 'M44 67 Q50 73 56 67';

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.25" />
        </Filter>
      </Defs>

      <Ellipse cx="50" cy="86" rx="37" ry="10" fill={SPRIG_COLORS.ground} />

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Sprout with leaves + a single bloom. */}
        <G transform={`rotate(${sproutTilt} 52 40)`}>
          <Path
            d="M52 56 C 51 44, 51 36, 52 30"
            stroke={SPRIG_COLORS.stalk}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
          <Ellipse cx="45" cy="42" rx="5" ry="3" fill={SPRIG_COLORS.leaf} transform="rotate(-30 45 42)" />
          <Ellipse cx="59" cy="42" rx="5" ry="3" fill={SPRIG_COLORS.leaf} transform="rotate(30 59 42)" />
          {/* Small flower at the tip. */}
          <G>
            <Circle cx="52" cy="27" r="3.4" fill={SPRIG_COLORS.flowerPink} />
            <Circle cx="47.6" cy="29.5" r="3" fill={SPRIG_COLORS.flowerPink} />
            <Circle cx="56.4" cy="29.5" r="3" fill={SPRIG_COLORS.flowerPink} />
            <Circle cx="49.4" cy="24.6" r="3" fill={SPRIG_COLORS.flowerPink} />
            <Circle cx="54.6" cy="24.6" r="3" fill={SPRIG_COLORS.flowerPink} />
            <Circle cx="52" cy="27" r="2" fill={SPRIG_COLORS.flowerYellow} />
          </G>
        </G>

        {/* Body. */}
        <Rect x="31" y="51" width="38" height="34" rx="17" fill={SPRIG_COLORS.body} />

        {/* Face. */}
        <G stroke={SPRIG_COLORS.face} strokeWidth={1.9} strokeLinecap="round" fill="none">
          <Path d="M42 61 Q45 58 48 61" />
          <Path d="M52 61 Q55 58 58 61" />
          <Path d={smilePath} />
        </G>
      </G>
    </Svg>
  );
}
