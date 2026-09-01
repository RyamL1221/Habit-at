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
 * Stage 3 — Flourishing.
 * A full, lush plant with many leaves and multiple flowers.
 */
export default function SprigFlourishing({ wilting, size = 160 }: SprigStageProps) {
  const droop = wilting ? 26 : 0;

  return (
    <Svg width={size} height={size} viewBox={SPRIG_VIEWBOX}>
      <Defs>
        <Filter id={WILT_FILTER_ID}>
          <FeColorMatrix type="saturate" values="0.2" />
        </Filter>
      </Defs>

      <G filter={wilting ? `url(#${WILT_FILTER_ID})` : undefined}>
        {/* Body layer: wide mound + main stem */}
        <G>
          <Ellipse cx="50" cy="92" rx="28" ry="7" fill={SPRIG_COLORS.leafDark} />
          <Path
            d="M50 90 C 44 62, 44 40, 50 26 C 56 40, 56 62, 50 90 Z"
            fill={SPRIG_COLORS.stem}
          />
        </G>

        {/* Leaf layer: many leaves fanning out */}
        <G>
          <Ellipse
            cx="32"
            cy="70"
            rx="14"
            ry="6.5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${-24 + droop} 32 70)`}
          />
          <Ellipse
            cx="68"
            cy="70"
            rx="14"
            ry="6.5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${24 - droop} 68 70)`}
          />
          <Ellipse
            cx="35"
            cy="56"
            rx="12"
            ry="6"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${-28 + droop} 35 56)`}
          />
          <Ellipse
            cx="65"
            cy="56"
            rx="12"
            ry="6"
            fill={SPRIG_COLORS.leafDark}
            transform={`rotate(${28 - droop} 65 56)`}
          />
          <Ellipse
            cx="38"
            cy="44"
            rx="10"
            ry="5.5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${-30 + droop} 38 44)`}
          />
          <Ellipse
            cx="62"
            cy="44"
            rx="10"
            ry="5.5"
            fill={SPRIG_COLORS.leafLight}
            transform={`rotate(${30 - droop} 62 44)`}
          />
        </G>

        {/* Flower layer: multiple blooms */}
        <G>
          {/* Center flower */}
          <Circle cx="50" cy="20" r="6" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="43" cy="24" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="57" cy="24" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="46" cy="14" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="54" cy="14" r="5" fill={SPRIG_COLORS.flowerPink} />
          <Circle cx="50" cy="19" r="3.5" fill={SPRIG_COLORS.flowerYellow} />

          {/* Left flower */}
          <Circle cx="30" cy="34" r="4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="25" cy="37" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="35" cy="37" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="30" cy="30" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="30" cy="34" r="2.2" fill={SPRIG_COLORS.flowerPink} />

          {/* Right flower */}
          <Circle cx="70" cy="34" r="4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="65" cy="37" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="75" cy="37" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="70" cy="30" r="3.4" fill={SPRIG_COLORS.flowerYellow} />
          <Circle cx="70" cy="34" r="2.2" fill={SPRIG_COLORS.flowerPink} />
        </G>

        {/* Detail layer: cute eyes on the stem */}
        <G>
          <Circle cx="46" cy="40" r="3" fill={SPRIG_COLORS.eye} />
          <Circle cx="54" cy="40" r="3" fill={SPRIG_COLORS.eye} />
          <Circle cx="47.1" cy="39" r="1.1" fill={SPRIG_COLORS.eyeHighlight} />
          <Circle cx="55.1" cy="39" r="1.1" fill={SPRIG_COLORS.eyeHighlight} />
        </G>
      </G>
    </Svg>
  );
}
