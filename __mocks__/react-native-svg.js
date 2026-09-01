/**
 * Mock for react-native-svg in Jest environments.
 * Replaces all SVG components with plain React elements so tests can run
 * without native SVG bridge dependencies.
 */
const React = require('react');

const createSvgMock = (name) => {
  const Component = ({ children, ...props }) =>
    React.createElement(name, props, children);
  Component.displayName = name;
  return Component;
};

const Svg = createSvgMock('Svg');

module.exports = {
  __esModule: true,
  default: Svg,
  Svg,
  Circle: createSvgMock('Circle'),
  ClipPath: createSvgMock('ClipPath'),
  Defs: createSvgMock('Defs'),
  Ellipse: createSvgMock('Ellipse'),
  ForeignObject: createSvgMock('ForeignObject'),
  G: createSvgMock('G'),
  Image: createSvgMock('Image'),
  Line: createSvgMock('Line'),
  LinearGradient: createSvgMock('LinearGradient'),
  Marker: createSvgMock('Marker'),
  Mask: createSvgMock('Mask'),
  Path: createSvgMock('Path'),
  Pattern: createSvgMock('Pattern'),
  Polygon: createSvgMock('Polygon'),
  Polyline: createSvgMock('Polyline'),
  RadialGradient: createSvgMock('RadialGradient'),
  Rect: createSvgMock('Rect'),
  Stop: createSvgMock('Stop'),
  Symbol: createSvgMock('Symbol'),
  Text: createSvgMock('Text'),
  TextPath: createSvgMock('TextPath'),
  TSpan: createSvgMock('TSpan'),
  Use: createSvgMock('Use'),
  // Animated variants
  AnimatedGroup: createSvgMock('AnimatedGroup'),
  AnimatedPath: createSvgMock('AnimatedPath'),
  // Filters
  ColorMatrix: createSvgMock('ColorMatrix'),
  Filter: createSvgMock('Filter'),
  FeColorMatrix: createSvgMock('FeColorMatrix'),
};
