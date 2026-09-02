import { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

/**
 * AccessoryArt
 *
 * Renders an equipped accessory as standalone SVG art (no chip background)
 * for placement inside the TerrariumScene:
 *   - Hats sit on the Sprig's head.
 *   - Furniture and Terrain sit in the background/ground.
 *
 * Art is keyed by the accessory's stable id. Each piece is drawn within a
 * 48x48 viewBox so callers can size it uniformly.
 */
interface AccessoryArtProps {
  accessoryId: string;
  size: number;
}

const SAGE = '#8FB98A';
const SAGE_DARK = '#6E9C69';

export function AccessoryArt({ accessoryId, size }: AccessoryArtProps) {
  // Unique suffix so SVG <Defs> ids never collide across multiple instances
  // (e.g. the wardrobe mini-terrarium rendering the same art as a shelf row).
  const uid = useId().replace(/:/g, '');
  const Art = ART[accessoryId];
  if (!Art) {
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Art uid={uid} />
    </Svg>
  );
}

interface ArtProps {
  uid: string;
}

// ---- Hats -----------------------------------------------------------------

function FlowerCrown() {
  const petals = [
    { cx: 12, cy: 26 },
    { cx: 19, cy: 21 },
    { cx: 26, cy: 19 },
    { cx: 33, cy: 21 },
    { cx: 38, cy: 26 },
  ];
  return (
    <G>
      <Path
        d="M9 28 Q24 18 39 28"
        stroke={SAGE_DARK}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {petals.map((p, i) => (
        <G key={i}>
          <Circle cx={p.cx} cy={p.cy} r={4} fill="#E9A9C0" />
          <Circle cx={p.cx} cy={p.cy} r={1.6} fill="#F2D06B" />
        </G>
      ))}
    </G>
  );
}

function TinyMushroomCap() {
  return (
    <G>
      <Path d="M8 27 Q24 6 40 27 Z" fill="#D9534F" />
      <Circle cx={17} cy={21} r={2.6} fill="#FBE9E7" />
      <Circle cx={27} cy={18} r={2.2} fill="#FBE9E7" />
      <Circle cx={32} cy={23} r={2} fill="#FBE9E7" />
    </G>
  );
}

function LeafBeret() {
  return (
    <G>
      <Ellipse cx={24} cy={24} rx={16} ry={9} fill={SAGE} />
      <Ellipse cx={24} cy={22} rx={12} ry={6} fill={SAGE_DARK} />
      <Path
        d="M24 14 q3 -3 6 -2"
        stroke={SAGE_DARK}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

// ---- Furniture ------------------------------------------------------------

function PebbleBench() {
  return (
    <G>
      <Rect x={7} y={26} width={34} height={6} rx={3} fill="#B8A188" />
      <Rect x={11} y={32} width={4} height={9} rx={2} fill="#8C7860" />
      <Rect x={33} y={32} width={4} height={9} rx={2} fill="#8C7860" />
      <Circle cx={16} cy={24} r={3} fill="#CFC3B2" />
      <Circle cx={24} cy={23} r={3.5} fill="#DED3C3" />
      <Circle cx={32} cy={24} r={3} fill="#CFC3B2" />
    </G>
  );
}

function GlowLantern({ uid }: ArtProps) {
  const gradId = `lantern-glow-${uid}`;
  return (
    <G>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE08A" />
          <Stop offset="1" stopColor="#F2B33D" />
        </LinearGradient>
      </Defs>
      <Path d="M20 9 q4 -5 8 0" stroke="#6E5A3A" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Rect x={16} y={11} width={16} height={4} rx={2} fill="#6E5A3A" />
      <Rect x={15} y={15} width={18} height={22} rx={5} fill={`url(#${gradId})`} />
      <Circle cx={24} cy={26} r={4.5} fill="#FFF6D6" />
      <Rect x={15} y={36} width={18} height={4} rx={2} fill="#6E5A3A" />
    </G>
  );
}

function DewdropBowl() {
  return (
    <G>
      <Path d="M9 24 A15 15 0 0 0 39 24 Z" fill="#C9B79E" />
      <Ellipse cx={24} cy={24} rx={15} ry={4} fill="#A8927A" />
      <Ellipse cx={24} cy={24} rx={12} ry={3} fill="#8FD3E8" />
      <Path d="M24 11 C 28 18 27 22 24 22 C 21 22 20 18 24 11 Z" fill="#BDE7F2" />
    </G>
  );
}

// ---- Terrain --------------------------------------------------------------

function MossCarpet() {
  return (
    <G>
      <Ellipse cx={24} cy={30} rx={22} ry={8} fill={SAGE} />
      <Ellipse cx={24} cy={28} rx={22} ry={6} fill="#A6CE9F" />
      <Circle cx={11} cy={26} r={2.4} fill={SAGE_DARK} />
      <Circle cx={20} cy={25} r={2.8} fill={SAGE_DARK} />
      <Circle cx={30} cy={26} r={2.4} fill={SAGE_DARK} />
      <Circle cx={38} cy={28} r={2.2} fill={SAGE_DARK} />
    </G>
  );
}

function PebblePath() {
  return (
    <G>
      <Ellipse cx={24} cy={30} rx={22} ry={7} fill="#E7DECF" />
      <Ellipse cx={12} cy={30} rx={4.5} ry={3} fill="#C3B49C" />
      <Ellipse cx={22} cy={29} rx={5} ry={3.2} fill="#D2C4AC" />
      <Ellipse cx={33} cy={30} rx={4.5} ry={3} fill="#C3B49C" />
      <Ellipse cx={17} cy={33} rx={3.2} ry={2} fill="#B9A88E" />
      <Ellipse cx={28} cy={33} rx={3.2} ry={2} fill="#B9A88E" />
    </G>
  );
}

function FernGrove() {
  return (
    <G>
      <Ellipse cx={24} cy={34} rx={20} ry={6} fill="#CBE1BF" />
      {[14, 24, 34].map((x, i) => (
        <G key={i}>
          <Path
            d={`M${x} 34 C ${x - 2} 26 ${x - 2} 20 ${x} 13`}
            stroke={SAGE_DARK}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path d={`M${x} 19 l -4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 19 l 4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 25 l -4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 25 l 4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      ))}
    </G>
  );
}

/** Maps each accessory id to its scene art component. */
const ART: Record<string, (props: ArtProps) => React.JSX.Element> = {
  'hat-flower-crown': FlowerCrown,
  'hat-tiny-mushroom': TinyMushroomCap,
  'hat-leaf-beret': LeafBeret,
  'furn-pebble-bench': PebbleBench,
  'furn-lantern': GlowLantern,
  'furn-water-bowl': DewdropBowl,
  'terr-moss-carpet': MossCarpet,
  'terr-pebble-path': PebblePath,
  'terr-fern-grove': FernGrove,
};
