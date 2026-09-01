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
 * Stage 2 — Bloom.
 * A full stem with several leaves and a single flower bud/bloom.
 */
export default function SprigBloom({ wilting, size = 160 }: SprigStageProps) {
  const droop = wilting ? 24 : 0;

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.2" />
        </Filter>
      </Defs>

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Body layer: mound + tall stem */}
        <G>
          <Ellipse cx="50" cy="90" rx="24" ry="6" fill={SPRIG_COLORS.leafDark} />
          <Path
            d="M50 88 C 45 64, 45 44, 50 30 C 55 44, 55 64, 50 88 Z"
            fill={SPRIG_COLORS.stem}
          />
        </G>

        {/* Leaf layer: several leaves */}
        <G>
          <Ellipse
            cx="36"
            cy="66"
            rx="12"
            ry="6"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${-22 + droop} 36 66)`}
          />
          <Ellipse
            cx="64"
            cy="66"
            rx="12"
            ry="6"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${22 - droop} 64 66)`}
          />
          <Ellipse
            cx="39"
            cy="52"
            rx="10"
            ry="5.5"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${-26 + droop} 39 52)`}
          />
          <Ellipse
            cx="61"
            cy="52"
            rx="10"
            ry="5.5"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${26 - droop} 61 52)`}
          />
        </G>

        {/* Flower layer: single bloom at the top */}
        <G>
          <Circle cx="50" cy="24" r="6" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="42" cy="28" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="58" cy="28" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="45" cy="18" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="55" cy="18" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="50" cy="23" r="3.5" fill={SPRIG_COLORS.flowerYellow} />
        </G>

        {/* Detail layer: cute eyes on the stem */}
        <G>
          <Circle cx="46" cy="42" r="2.8" fill={SPRIG_COLORS.eye} />
          <Circle cx="54" cy="42" r="2.8" fill={SPRIG_COLORS.eye} />
          <Circle cx="47" cy="41" r="1" fill={SPRIG_COLORS.eyeHighlight} />
          <Circle cx="55" cy="41" r="1" fill={SPRIG_COLORS.eyeHighlight} />
        </G>
      </G>
    </Svg>
  );
}
