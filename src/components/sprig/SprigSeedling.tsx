import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeColorMatrix,
  Filter,
  G,
  Path,
} from 'react-native-svg';

import { SPRIG_COLORS, SPRIG_VIEWBOX, SprigStageProps, WILT_FILTER_ID } from './types';

/**
 * Stage 0 — Seedling.
 * A small sprout with a short stem and one to two tiny leaves.
 */
export default function SprigSeedling({ wilting, size = 160 }: SprigStageProps) {
  // Leaves droop (rotate down) when wilting, upright otherwise.
  const leftLeafRotation = wilting ? 25 : -18;
  const rightLeafRotation = wilting ? -25 : 18;

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.2" />
        </Filter>
      </Defs>

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Body layer: mound + short stem */}
        <G>
          <Ellipse cx="50" cy="86" rx="20" ry="6" fill={SPRIG_COLORS.leafDark} />
          <Path
            d="M50 84 C 47 70, 47 62, 50 54 C 53 62, 53 70, 50 84 Z"
            fill={SPRIG_COLORS.stem}
          />
        </G>

        {/* Leaf layer: two tiny leaves */}
        <G>
          <Ellipse
            cx="42"
            cy="60"
            rx="9"
            ry="5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${leftLeafRotation} 42 60)`}
          />
          <Ellipse
            cx="58"
            cy="60"
            rx="9"
            ry="5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${rightLeafRotation} 58 60)`}
          />
        </G>

        {/* Detail layer: cute eyes */}
        <G>
          <Circle cx="46" cy="64" r="2.4" fill={SPRIG_COLORS.eye} />
          <Circle cx="54" cy="64" r="2.4" fill={SPRIG_COLORS.eye} />
          <Circle cx="46.8" cy="63.2" r="0.8" fill={SPRIG_COLORS.eyeHighlight} />
          <Circle cx="54.8" cy="63.2" r="0.8" fill={SPRIG_COLORS.eyeHighlight} />
        </G>
      </G>
    </Svg>
  );
}
