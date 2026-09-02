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
 * Stage 0 — Seedling.
 * A soft rounded blob creature with a single two-leaf sprout, a happy face,
 * sitting on a pale ground ellipse. Matches the reference art.
 */
export default function SprigSeedling({ wilting, size = 160 }: SprigStageProps) {
  // When wilting, the sprout leans/droops and the smile flattens a little.
  const sproutTilt = wilting ? -14 : 8;
  const smilePath = wilting
    ? 'M44 68 Q50 70 56 68' // gentle flat mouth
    : 'M44 67 Q50 73 56 67'; // happy smile

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.25" />
        </Filter>
      </Defs>

      {/* Ground ellipse sits outside the wilt filter so it stays pale. */}
      <Ellipse cx="50" cy="86" rx="34" ry="9" fill={SPRIG_COLORS.ground} />

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Sprout: short stalk + two little leaves rising from the head. */}
        <G transform={`rotate(${sproutTilt} 52 46)`}>
          <Path
            d="M52 58 C 51 50, 51 44, 52 40"
            stroke={SPRIG_COLORS.stalk}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Ellipse
            cx="47.5"
            cy="41"
            rx="4.6"
            ry="2.8"
            fill={SPRIG_COLORS.leaf}
            transform="rotate(-32 47.5 41)"
          />
          <Ellipse
            cx="56"
            cy="40"
            rx="5"
            ry="3"
            fill={SPRIG_COLORS.leaf}
            transform="rotate(28 56 40)"
          />
        </G>

        {/* Body: soft rounded-square blob. */}
        <Rect x="34" y="54" width="32" height="30" rx="15" fill={SPRIG_COLORS.body} />

        {/* Face: happy closed-arc eyes + smile. */}
        <G
          stroke={SPRIG_COLORS.face}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        >
          <Path d="M43 62 Q45.5 59 48 62" />
          <Path d="M52 62 Q54.5 59 57 62" />
          <Path d={smilePath} />
        </G>
      </G>
    </Svg>
  );
}
