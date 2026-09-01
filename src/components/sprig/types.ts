/**
 * Shared props for the four Sprig growth-stage SVG components.
 *
 * Each stage component is a pure presentational SVG composition (no store
 * access). `wilting` desaturates colors and droops the leaf group; `size`
 * controls the square render dimensions.
 */
export interface SprigStageProps {
  /** When true, illustration is desaturated and leaves droop. */
  wilting: boolean;
  /** Square render size in device-independent pixels. Defaults to 160. */
  size?: number;
}

/** Nature palette shared across all Sprig stages. */
export const SPRIG_COLORS = {
  stem: '#4CAF50',
  leafLight: '#66BB6A',
  leafDark: '#388E3C',
  flowerPink: '#F48FB1',
  flowerYellow: '#FFD54F',
  eye: '#2E3A2E',
  eyeHighlight: '#FFFFFF',
} as const;

/** Shared viewBox so all stages align on the same coordinate space. */
export const SPRIG_VIEWBOX = '0 0 100 100';

/** Filter id used to desaturate the illustration when wilting. */
export const WILT_FILTER_ID = 'sprig-wilt';
