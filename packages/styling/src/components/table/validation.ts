/**
 * Table Component Validation
 * 
 * Zod schemas for table component validation with detailed descriptions.
 * Follows development guidelines for comprehensive schema documentation.
 */

import { z } from 'zod';

/**
 * Schema for table cell position validation
 */
export const TableCellPositionSchema = z.object({
  row: z.number()
    .int('Row index must be an integer')
    .min(-1, 'Row index must be -1 (header) or greater')
    .describe('Row index - 0-based for data rows, -1 for header row'),
  col: z.number()
    .int('Column index must be an integer')
    .min(0, 'Column index must be 0 or greater')
    .describe('Column index - 0-based column position'),
}).describe('Table cell position with row and column indices');

/**
 * Schema for table render options validation
 */
export const TableRenderOptionsSchema = z.object({
  includeBorders: z.boolean()
    .describe('Whether to include borders when rendering the table'),
  applyStyling: z.boolean()
    .describe('Whether to apply cell styling during rendering'),
  columnWidths: z.array(
    z.number()
      .positive('Column width must be positive')
      .describe('Width of individual column in characters')
  )
    .optional()
    .describe('Optional array of custom column widths - if not provided, widths are auto-calculated'),
}).describe('Configuration options for table rendering behavior');

/**
 * Schema for table column configuration validation
 */
export const TableColumnConfigSchema = z.object({
  header: z.string()
    .min(1, 'Column header cannot be empty')
    .describe('Header text displayed at the top of the column'),
  width: z.number()
    .positive('Column width must be positive')
    .optional()
    .describe('Optional fixed width for this column in characters'),
  align: z.enum(['left', 'center', 'right'])
    .describe('Text alignment for all cells in this column'),
  styleFunc: z.function()
    .args(z.number(), z.string())
    .returns(z.any()) // StyleConfig type
    .optional()
    .describe('Optional function that returns style configuration for cells in this column'),
}).describe('Configuration for individual table columns including header, width, and styling');

/**
 * Schema for table row configuration validation
 */
export const TableRowConfigSchema = z.object({
  cells: z.array(
    z.string()
      .describe('Individual cell value as string')
  )
    .min(1, 'Row must have at least one cell')
    .describe('Array of cell values for this row'),
  styleFunc: z.function()
    .args(z.number(), z.string())
    .returns(z.any()) // StyleConfig type
    .optional()
    .describe('Optional function that returns style configuration for cells in this row'),
  isHeader: z.boolean()
    .describe('Whether this row should be treated as a header row with special styling'),
}).describe('Configuration for individual table rows including cell data and styling');

/**
 * Schema for table validation result
 */
export const TableValidationResultSchema = z.object({
  isValid: z.boolean()
    .describe('Whether the table configuration passed all validation checks'),
  errors: z.array(
    z.string()
      .describe('Individual validation error message')
  )
    .describe('Array of validation errors that prevent table rendering'),
  warnings: z.array(
    z.string()
      .describe('Individual validation warning message')
  )
    .describe('Array of validation warnings that may affect table appearance'),
}).describe('Result of table configuration validation including errors and warnings');

/**
 * Schema for table metrics validation
 */
export const TableMetricsSchema = z.object({
  totalWidth: z.number()
    .positive('Total width must be positive')
    .describe('Total width of the rendered table including borders and padding'),
  totalHeight: z.number()
    .positive('Total height must be positive')
    .describe('Total height of the rendered table including borders and padding'),
  columnWidths: z.array(
    z.number()
      .positive('Column width must be positive')
      .describe('Width of individual column in characters')
  )
    .describe('Array of calculated or specified column widths'),
  rowHeights: z.array(
    z.number()
      .positive('Row height must be positive')
      .describe('Height of individual row in lines')
  )
    .describe('Array of calculated row heights including header row'),
  columnCount: z.number()
    .int('Column count must be an integer')
    .positive('Column count must be positive')
    .describe('Total number of columns in the table'),
  rowCount: z.number()
    .int('Row count must be an integer')
    .positive('Row count must be positive')
    .describe('Total number of rows including header row'),
}).describe('Calculated metrics for table layout and rendering');

/**
 * Main table configuration schema with comprehensive validation
 */
export const TableConfigSchema = z.object({
  headers: z.array(
    z.string()
      .min(1, 'Header cannot be empty')
      .describe('Individual column header text')
  )
    .min(1, 'Table must have at least one header')
    .describe('Array of column headers displayed at the top of the table'),
  rows: z.array(
    z.array(
      z.string()
        .describe('Individual cell value as string')
    )
      .min(1, 'Row must have at least one cell')
      .describe('Individual row data as array of cell values')
  )
    .describe('Array of table rows, where each row is an array of cell values'),
  border: z.any() // BorderConfig type - will be validated by border module
    .optional()
    .describe('Optional border configuration for table styling'),
  styleFunc: z.function()
    .args(z.number(), z.number())
    .returns(z.any()) // StyleConfig type
    .optional()
    .describe('Optional function that returns style configuration for specific cells based on row and column indices'),
  width: z.number()
    .positive('Table width must be positive')
    .optional()
    .describe('Optional fixed width for the entire table in characters'),
  height: z.number()
    .positive('Table height must be positive')
    .optional()
    .describe('Optional fixed height for the entire table in lines'),
}).describe('Complete table configuration including headers, data, styling, and layout options');

/**
 * Schema for table style function validation
 */
export const TableStyleFunctionSchema = z.function()
  .args(
    z.number()
      .int('Row index must be an integer')
      .min(-1, 'Row index must be -1 (header) or greater')
      .describe('Row index - 0-based for data rows, -1 for header row'),
    z.number()
      .int('Column index must be an integer')
      .min(0, 'Column index must be 0 or greater')
      .describe('Column index - 0-based column position')
  )
  .returns(z.any()) // StyleConfig type - will be validated by style module
  .describe('Function that takes row and column indices and returns style configuration for that cell');

/**
 * Schema for table cell renderer function validation
 */
export const TableCellRendererSchema = z.function()
  .args(
    z.string()
      .describe('Cell value to be rendered'),
    TableCellPositionSchema
      .describe('Position information for the cell')
  )
  .returns(z.string())
  .describe('Function that takes cell value and position and returns formatted string for rendering');

/**
 * Schema for table border renderer function validation
 */
export const TableBorderRendererSchema = z.function()
  .args(
    z.any() // BorderConfig type
      .describe('Border configuration for the table'),
    TableMetricsSchema
      .describe('Table metrics for layout calculations')
  )
  .returns(z.object({
    top: z.string()
      .describe('Top border line'),
    middle: z.string()
      .describe('Middle separator line between header and data'),
    bottom: z.string()
      .describe('Bottom border line'),
    separator: z.string()
      .describe('Row separator line between data rows'),
  }))
  .describe('Function that generates border strings for table rendering');

/**
 * Type inference helpers for TypeScript integration
 */
export type TableConfigType = z.infer<typeof TableConfigSchema>;
export type TableCellPositionType = z.infer<typeof TableCellPositionSchema>;
export type TableRenderOptionsType = z.infer<typeof TableRenderOptionsSchema>;
export type TableColumnConfigType = z.infer<typeof TableColumnConfigSchema>;
export type TableRowConfigType = z.infer<typeof TableRowConfigSchema>;
export type TableValidationResultType = z.infer<typeof TableValidationResultSchema>;
export type TableMetricsType = z.infer<typeof TableMetricsSchema>;