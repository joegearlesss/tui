/**
 * @tui/styling - TypeScript/Bun reimplementation of Lip Gloss v2
 * Declarative terminal styling library with functional programming principles
 */

// Core exports
export { Style, StyleBuilder, StyleChain } from './style/style';
export { Color } from './color/color';
export { Position, BoxModel } from './layout/positioning';
export { Layout, Measurement } from './layout/joining';
export { ANSI } from './ansi/ansi';

// Border system exports
export {
  Border,
  BorderPresets,
  BorderOperations,
  BorderBuilder,
  BorderChain,
  BorderRender,
  BorderValidation,
  // Convenience exports
  normalBorder,
  roundedBorder,
  thickBorder,
  doubleBorder,
  customBorder,
  boxBorder,
  roundedBoxBorder,
  thickBoxBorder,
  doubleBoxBorder,
  horizontalLineBorder,
  verticalLineBorder,
  topLineBorder,
  bottomLineBorder,
  leftLineBorder,
  rightLineBorder,
} from './border';

// Type exports
export type {
  // Color types
  ColorValue,
  RGBColor,
  HSLColor,
  HexColor,
  ANSI256Color,
  CompleteColor,
  AdaptiveColor,
  ColorProfile,
  // Layout types
  BoxDimensions,
  SizeConstraints,
  HorizontalPosition,
  VerticalPosition,
  TextAlignment,
  VerticalAlignment,
  // Style types
  StyleProperties,
  TextTransform,
  // Border types
  BorderType,
  BorderChars,
  BorderConfig,
  CustomBorderConfig,
  BorderRenderOptions,
  BorderDimensions,
} from './types';
