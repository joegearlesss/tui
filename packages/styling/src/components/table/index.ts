/**
 * Table Component Index
 *
 * Main exports for the table component following the OVERVIEW-v2 specification.
 * Provides both functional API and builder pattern for table creation and manipulation.
 */

// Builder pattern
export { TableBuilder, TableChain } from './builder';
// Core operations namespace
export { Table } from './operations';
// Rendering functions
export { TableRender } from './rendering';
// Core types
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
} from './types';
export type {
  TableCellPositionType,
  TableColumnConfigType,
  TableConfigType,
  TableMetricsType,
  TableRenderOptionsType,
  TableRowConfigType,
  TableValidationResultType,
} from './validation';
// Validation schemas and types
export {
  TableBorderRendererSchema,
  TableCellPositionSchema,
  TableCellRendererSchema,
  TableColumnConfigSchema,
  TableConfigSchema,
  TableMetricsSchema,
  TableRenderOptionsSchema,
  TableRowConfigSchema,
  TableStyleFunctionSchema,
  TableValidationResultSchema,
} from './validation';

// Convenience function for direct rendering (matches OVERVIEW-v2 API)
import { TableRender } from './rendering';
export const render = TableRender.render;
