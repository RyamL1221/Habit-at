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
 * Stage 1 — Sprout.
 * A taller stem with more leaves than the seedling.
 */
export default function SprigSprout({ wilting, size = 160 }: SprigStageProps) {
  const droop = wilting ? 22 : 0;

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.2" />
        </Filter>
      </Defs>

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Body layer: mound + taller stem */}
        <G>
          <Ellipse cx="50" cy="88" rx="22" ry="6" fill={SPRIG_COLORS.leafDark} />
          <Path
            d="M50 86 C 46 66, 46 52, 50 40 C 54 52, 54 66, 50 86 Z"
            fill={SPRIG_COLORS.stem}
          />
        </G>

        {/* Leaf layer: four leaves along the stem */}
        <G>
          <Ellipse
            cx="38"
            cy="62"
            rx="11"
            ry="6"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${-20 + droop} 38 62)`}
          />
          <Ellipse
            cx="62"
            cy="62"
            rx="11"
            ry="6"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${20 - droop} 62 62)`}
          />
          <Ellipse
            cx="41"
            cy="48"
            rx="9"
            ry="5"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${-25 + droop} 41 48)`}
          />
          <Ellipse
            cx="59"
            cy="48"
            rx="9"
            ry="5"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${25 - droop} 59 48)`}
          />
        </G>

        {/* Detail layer: cute eyes near top of stem */}
        <G>
          <Circle cx="46" cy="46" r="2.6" fill={SPRIG_COLORS.eye} />
          <Circle cx="54" cy="46" r="2.6" fill={SPRIG_COLORS.eye} />
          <Circle cx="46.9" cy="45.1" r="0.9" fill={SPRIG_COLORS.eyeHighlight} />
          <Circle cx="54.9" cy="45.1" r="0.9" fill={SPRIG_COLORS.eyeHighlight} />
        </G>
      </G>
    </Svg>
  );
}
