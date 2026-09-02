/**
 * Shared props for the four Sprig growth-stage SVG components.
 *
 * Each stage component is a pure presentational SVG composition (no store
 * access). `wilting` desaturates colors and softens the sprout; `size`
 * controls the square render dimensions.
 */
export interface SprigStageProps {
  /** When true, illustration is desaturated and the sprout droops. */
  wilting: boolean;
  /** Square render size in device-independent pixels. Defaults to 160. */
  size?: number;
}

/**
 * Soft sage palette matching the reference art: a rounded blob body, a small
 * two-leaf sprout, a gentle smiley face, and a pale ground ellipse.
 */
export const SPRIG_COLORS = {
  /** Main rounded body blob. */
  body: '#8FB98A',
  /** Slightly deeper sage for the sprout leaves / subtle shading. */
  leaf: '#7BA876',
  /** Short stalk connecting the sprout leaves to the head. */
  stalk: '#6E9C69',
  /** Pale ground ellipse the creature sits on. */
  ground: '#DCEBD2',
  /** Dark sage used for the eyes and smile stroke. */
  face: '#3E5C3A',
  /** Flower accents for later growth stages. */
  flowerPink: '#E9A9C0',
  flowerYellow: '#F2D06B',
} as const;

/** Shared viewBox so all stages align on the same coordinate space. */
export const SPRIG_VIEWBOX = '0 0 100 100';

/** Filter id used to desaturate the illustration when wilting. */
export const WILT_FILTER_ID = 'sprig-wilt';
