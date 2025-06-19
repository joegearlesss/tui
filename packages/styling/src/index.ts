/**
 * @tui/styling - TypeScript/Bun reimplementation of Lip Gloss v2
 * Declarative terminal styling library with functional programming principles
 */

export { ANSI } from './ansi/ansi';
// Border system exports
export {
  Border,
  BorderBuilder,
  BorderChain,
  BorderOperations,
  BorderPresets,
  BorderRender,
  BorderValidation,
  bottomLineBorder,
  boxBorder,
  customBorder,
  doubleBorder,
  doubleBoxBorder,
  horizontalLineBorder,
  leftLineBorder,
  // Convenience exports
  normalBorder,
  rightLineBorder,
  roundedBorder,
  roundedBoxBorder,
  thickBorder,
  thickBoxBorder,
  topLineBorder,
  verticalLineBorder,
} from './border';
export { Color } from './color/color';
// Component system exports
export {
  Table,
  TableBuilder,
  TableRender,
} from './components';
export { Layout, Measurement } from './layout/joining';
export { BoxModel, Position } from './layout/positioning';
// Core exports
export { Style, StyleBuilder, StyleChain } from './style/style';

// Type exports
export type {
  AdaptiveColor,
  ANSI256Color,
  BorderChars,
  BorderConfig,
  BorderDimensions,
  BorderRenderOptions,
  // Border types
  BorderType,
  // Layout types
  BoxDimensions,
  ColorProfile,
  // Color types
  ColorValue,
  CompleteColor,
  CustomBorderConfig,
  HexColor,
  HorizontalPosition,
  HSLColor,
  RGBColor,
  SizeConstraints,
  // Style types
  StyleProperties,
  TableBorderRenderer,
  TableCellPosition,
  TableCellRenderer,
  TableColumnConfig,
  // Table types
  TableConfig,
  TableMetrics,
  TableRenderOptions,
  TableRowConfig,
  TableStyleFunction,
  TableValidationResult,
  TextAlignment,
  TextTransform,
  VerticalAlignment,
  VerticalPosition,
} from './types';
