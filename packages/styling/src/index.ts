/**
 * @tui/styling - TypeScript/Bun reimplementation of Lip Gloss v2
 * Declarative terminal styling library with functional programming principles
 */

// Core exports
export { Style, StyleBuilder, StyleChain } from './style/style';
export { Color } from './color/color';
export { Position, BoxModel } from './layout/positioning';
export { ANSI } from './ansi/ansi';

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
} from './types';
