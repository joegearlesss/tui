/**
 * Core type exports for the styling package
 */

export type {
  BorderDimensions,
  BorderRenderOptions,
} from '../border/rendering';
// Border types
export type {
  BorderChars,
  BorderCharsType,
  BorderConfig,
  BorderConfigType,
  BorderSidesType,
  BorderType,
  CustomBorderConfig,
  CustomBorderConfigType,
} from '../border/types';
// Component types
export type {
  TableBorderRenderer,
  TableCellPosition,
  TableCellRenderer,
  TableColumnConfig,
  TableConfig,
  TableMetrics,
  TableRenderOptions,
  TableRowConfig,
  TableStyleFunction,
  TableValidationResult,
} from '../components/table/types';
// Color types
export * from './color';
// Layout types
export * from './layout';
// Style types
export * from './style';
// Terminal types
export * from './terminal';
