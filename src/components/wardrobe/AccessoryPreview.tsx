import { Fragment } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * AccessoryPreview
 *
 * Renders a small SVG illustration of what an accessory looks like, keyed by
 * the accessory's stable id. Used in the wardrobe shelves (hats / furniture /
 * terrain) so each row previews the item instead of a plain colored dot.
 *
 * When `locked` is true the preview is drawn desaturated (a soft gray tint via
 * reduced opacity) so it reads as "not yet owned".
 */
interface AccessoryPreviewProps {
  accessoryId: string;
  size?: number;
  locked?: boolean;
}

const SAGE = '#8FB98A';
const SAGE_DARK = '#6E9C69';

export function AccessoryPreview({ accessoryId, size = 44, locked = false }: AccessoryPreviewProps) {
  const Art = PREVIEWS[accessoryId] ?? FallbackPreview;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Soft rounded background tile so every preview reads as a chip. */}
      <Rect x="0" y="0" width="48" height="48" rx="12" fill="#F1F6EC" />
      <G opacity={locked ? 0.35 : 1}>
        <Art />
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Per-accessory art. Each returns SVG children drawn within a 48x48 viewBox.
// ---------------------------------------------------------------------------

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
    <Fragment>
      {/* Vine band */}
      <Path d="M9 28 Q24 18 39 28" stroke={SAGE_DARK} strokeWidth={3} fill="none" strokeLinecap="round" />
      {petals.map((p, i) => (
        <G key={i}>
          <Circle cx={p.cx} cy={p.cy} r={4} fill="#E9A9C0" />
          <Circle cx={p.cx} cy={p.cy} r={1.6} fill="#F2D06B" />
        </G>
      ))}
    </Fragment>
  );
}

function TinyMushroomCap() {
  return (
    <Fragment>
      {/* Cap */}
      <Path d="M10 27 Q24 8 38 27 Z" fill="#D9534F" />
      <Circle cx={18} cy={21} r={2.4} fill="#FBE9E7" />
      <Circle cx={27} cy={18} r={2} fill="#FBE9E7" />
      <Circle cx={31} cy={23} r={1.8} fill="#FBE9E7" />
      {/* Stem */}
      <Rect x={20} y={27} width={8} height={11} rx={3} fill="#F5EFE1" />
    </Fragment>
  );
}

function LeafBeret() {
  return (
    <Fragment>
      <Ellipse cx={24} cy={24} rx={15} ry={9} fill={SAGE} />
      <Ellipse cx={24} cy={22} rx={11} ry={6} fill={SAGE_DARK} />
      {/* Little stem nub */}
      <Path d="M24 15 q3 -3 6 -2" stroke={SAGE_DARK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </Fragment>
  );
}

// ---- Furniture ------------------------------------------------------------

function PebbleBench() {
  return (
    <Fragment>
      {/* Seat */}
      <Rect x={9} y={24} width={30} height={6} rx={3} fill="#B8A188" />
      {/* Legs */}
      <Rect x={12} y={30} width={4} height={8} rx={2} fill="#8C7860" />
      <Rect x={32} y={30} width={4} height={8} rx={2} fill="#8C7860" />
      {/* Pebbles on top */}
      <Circle cx={17} cy={22} r={3} fill="#CFC3B2" />
      <Circle cx={24} cy={21} r={3.5} fill="#DED3C3" />
      <Circle cx={31} cy={22} r={3} fill="#CFC3B2" />
    </Fragment>
  );
}

function GlowLantern() {
  return (
    <Fragment>
      <Defs>
        <LinearGradient id="lantern-glow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE08A" />
          <Stop offset="1" stopColor="#F2B33D" />
        </LinearGradient>
      </Defs>
      {/* Top ring + handle */}
      <Path d="M20 10 q4 -5 8 0" stroke="#6E5A3A" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Rect x={17} y={12} width={14} height={4} rx={2} fill="#6E5A3A" />
      {/* Glass body */}
      <Rect x={16} y={16} width={16} height={20} rx={5} fill="url(#lantern-glow)" />
      <Circle cx={24} cy={26} r={4} fill="#FFF6D6" />
      {/* Base */}
      <Rect x={16} y={35} width={16} height={4} rx={2} fill="#6E5A3A" />
    </Fragment>
  );
}

function DewdropBowl() {
  return (
    <Fragment>
      {/* Bowl */}
      <Path d="M10 24 A14 14 0 0 0 38 24 Z" fill="#C9B79E" />
      <Ellipse cx={24} cy={24} rx={14} ry={4} fill="#A8927A" />
      {/* Water */}
      <Ellipse cx={24} cy={24} rx={11} ry={3} fill="#8FD3E8" />
      {/* Dewdrop */}
      <Path d="M24 12 C 28 18 27 22 24 22 C 21 22 20 18 24 12 Z" fill="#BDE7F2" />
    </Fragment>
  );
}

// ---- Terrain --------------------------------------------------------------

function MossCarpet() {
  return (
    <Fragment>
      <Ellipse cx={24} cy={30} rx={17} ry={7} fill={SAGE} />
      <Ellipse cx={24} cy={29} rx={17} ry={5} fill="#A6CE9F" />
      {/* Moss tufts */}
      <Circle cx={15} cy={27} r={2.2} fill={SAGE_DARK} />
      <Circle cx={22} cy={26} r={2.6} fill={SAGE_DARK} />
      <Circle cx={30} cy={27} r={2.2} fill={SAGE_DARK} />
      <Circle cx={34} cy={29} r={2} fill={SAGE_DARK} />
    </Fragment>
  );
}

function PebblePath() {
  return (
    <Fragment>
      <Ellipse cx={24} cy={31} rx={17} ry={6} fill="#E7DECF" />
      <Ellipse cx={15} cy={31} rx={4} ry={2.6} fill="#C3B49C" />
      <Ellipse cx={23} cy={30} rx={4.5} ry={3} fill="#D2C4AC" />
      <Ellipse cx={31} cy={31} rx={4} ry={2.6} fill="#C3B49C" />
      <Ellipse cx={19} cy={33} rx={3} ry={2} fill="#B9A88E" />
      <Ellipse cx={28} cy={33} rx={3} ry={2} fill="#B9A88E" />
    </Fragment>
  );
}

function FernGrove() {
  return (
    <Fragment>
      <Ellipse cx={24} cy={34} rx={16} ry={5} fill="#DCEBD2" />
      {/* Three fern fronds */}
      {[16, 24, 32].map((x, i) => (
        <G key={i}>
          <Path
            d={`M${x} 34 C ${x - 2} 26 ${x - 2} 20 ${x} 14`}
            stroke={SAGE_DARK}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path d={`M${x} 20 l -4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 20 l 4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 26 l -4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={`M${x} 26 l 4 -2`} stroke={SAGE} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      ))}
    </Fragment>
  );
}

function FallbackPreview() {
  return <Circle cx={24} cy={24} r={12} fill={SAGE} />;
}

/** Maps each accessory id to its preview art component. */
const PREVIEWS: Record<string, () => React.JSX.Element> = {
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
