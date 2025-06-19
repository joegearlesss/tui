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
// Core exports
export { Style, StyleBuilder, StyleChain } from './style/style';
// Terminal integration exports
export {
  Terminal,
  AnsiEscape,
  Unicode,
  Compatibility,
} from './terminal';

// Utils exports
export {
  StringUtils,
  FunctionalUtils,
  CachingUtils,
  ValidationUtils,
  EmailSchema,
  UrlSchema,
  UuidSchema,
  ColorHexSchema,
  PortSchema,
  PositiveIntegerSchema,
  NonNegativeIntegerSchema,
  PercentageSchema,
  NormalizedPercentageSchema,
} from './utils';

// Type exports
export type {
  AdaptiveColor,
  ANSI256Color,
  BackgroundDetection,
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
  TerminalEnvironment,
  TextAlignment,
  TextTransform,
  // Utils types
  TruncateOptions,
  WrapOptions,
  Predicate,
  Mapper,
  Reducer,
  Comparator,
  CacheOptions,
  CacheStats,
  CacheEntry,
  ValidationResult,
  ValidatorFunction,
  VerticalAlignment,
  VerticalPosition,
} from './types';
