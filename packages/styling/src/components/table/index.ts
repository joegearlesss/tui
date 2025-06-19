/**
 * Table Component Index
 *
 * Main exports for the table component following the OVERVIEW-v2 specification.
 * Provides both functional API and builder pattern for table creation and manipulation.
 */

// Core types
export type {
  TableConfig,
  TableCellPosition,
  TableRenderOptions,
  TableColumnConfig,
  TableRowConfig,
  TableValidationResult,
  TableMetrics,
  TableStyleFunction,
  TableCellRenderer,
  TableBorderRenderer,
} from './types';

// Validation schemas and types
export {
  TableConfigSchema,
  TableCellPositionSchema,
  TableRenderOptionsSchema,
  TableColumnConfigSchema,
  TableRowConfigSchema,
  TableValidationResultSchema,
  TableMetricsSchema,
  TableStyleFunctionSchema,
  TableCellRendererSchema,
  TableBorderRendererSchema,
} from './validation';

export type {
  TableConfigType,
  TableCellPositionType,
  TableRenderOptionsType,
  TableColumnConfigType,
  TableRowConfigType,
  TableValidationResultType,
  TableMetricsType,
} from './validation';

// Core operations namespace
export { Table } from './operations';

// Builder pattern
export { TableBuilder, TableChain } from './builder';

// Rendering functions
export { TableRender } from './rendering';

// Convenience function for direct rendering (matches OVERVIEW-v2 API)
import { TableRender } from './rendering';
export const render = TableRender.render;
