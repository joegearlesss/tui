/**
 * @tui/styling - TypeScript/Bun reimplementation of Lip Gloss v2
 * Declarative terminal styling library with functional programming principles
 */

export { ANSI } from './ansi/ansi';
export { print, isOutputTTY, stripAllAnsi } from './output';
// Canvas and Layer system exports
export { Canvas, newCanvas, Layer, newLayer } from './canvas';
// Border system exports
export {
  Border,
  BorderBuilder,
  BorderChain,
  BorderOperations,
  BorderPresets,
  BorderRender,
  BorderValidation,
  asciiBorder,
  asciiBoxBorder,
  blockBorder,
  blockBoxBorder,
  bottomLineBorder,
  boxBorder,
  customBorder,
  doubleBorder,
  doubleBoxBorder,
  hiddenBorder,
  hiddenBoxBorder,
  horizontalLineBorder,
  innerHalfBlockBorder,
  innerHalfBlockBoxBorder,
  leftLineBorder,
  markdownBorder,
  markdownBoxBorder,
  // Convenience exports
  normalBorder,
  outerHalfBlockBorder,
  outerHalfBlockBoxBorder,
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
  Enumerator,
  List,
  ListBuilder,
  ListRenderer,
  Table,
  TableBuilder,
  TableRender,
  Tree,
  TreeBuilder,
  TreeEnumerator,
  TreeNode,
  TreeRenderer,
} from './components';
export { Layout, Measurement } from './layout/joining';
export { BoxModel, Position } from './layout/positioning';
// Rendering engine exports
export {
  RenderingEngine,
  AnsiGenerator,
  TextRenderer,
  LayoutRenderer,
  CanvasRenderer,
} from './rendering';
// Core exports
export { Style, StyleBuilder, StyleChain } from './style/style';
// Terminal type exports
export type {
  BackgroundDetection,
  TerminalEnvironment,
} from './terminal';
// Terminal integration exports
export {
  AnsiEscape,
  Compatibility,
  Terminal,
  Unicode,
} from './terminal';
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
  // Terminal types
  TerminalCapabilities,
  TextAlignment,
  TextTransform,
  VerticalAlignment,
  VerticalPosition,
} from './types';
// Utils type exports
export type {
  CacheEntry,
  CacheOptions,
  CacheStats,
  Comparator,
  Mapper,
  Predicate,
  Reducer,
  TruncateOptions,
  ValidationResult,
  ValidatorFunction,
  WrapOptions,
} from './utils';
// Utils exports
export {
  CachingUtils,
  ColorHexSchema,
  EmailSchema,
  FunctionalUtils,
  NonNegativeIntegerSchema,
  NormalizedPercentageSchema,
  PercentageSchema,
  PortSchema,
  PositiveIntegerSchema,
  StringUtils,
  UrlSchema,
  UuidSchema,
  ValidationUtils,
} from './utils';
