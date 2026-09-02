import Svg, {
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
 * Stage 1 — Sprout.
 * The blob creature grows a touch taller with a fuller two-pair sprout.
 */
export default function SprigSprout({ wilting, size = 160 }: SprigStageProps) {
  const sproutTilt = wilting ? -14 : 8;
  const smilePath = wilting ? 'M44 68 Q50 70 56 68' : 'M44 67 Q50 73 56 67';

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.25" />
        </Filter>
      </Defs>

      <Ellipse cx="50" cy="86" rx="36" ry="9.5" fill={SPRIG_COLORS.ground} />

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Sprout: taller stalk with two pairs of leaves. */}
        <G transform={`rotate(${sproutTilt} 52 42)`}>
          <Path
            d="M52 56 C 51 46, 51 38, 52 33"
            stroke={SPRIG_COLORS.stalk}
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
          <Ellipse cx="46" cy="34" rx="5" ry="3" fill={SPRIG_COLORS.leaf} transform="rotate(-34 46 34)" />
          <Ellipse cx="57.5" cy="33" rx="5.4" ry="3.2" fill={SPRIG_COLORS.leaf} transform="rotate(30 57.5 33)" />
          <Ellipse cx="48" cy="43" rx="4.4" ry="2.6" fill={SPRIG_COLORS.leaf} transform="rotate(-24 48 43)" />
          <Ellipse cx="56" cy="43" rx="4.4" ry="2.6" fill={SPRIG_COLORS.leaf} transform="rotate(24 56 43)" />
        </G>

        {/* Body: slightly larger rounded blob. */}
        <Rect x="32" y="52" width="36" height="33" rx="16.5" fill={SPRIG_COLORS.body} />

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
