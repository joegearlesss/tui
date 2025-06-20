/**
 * Table Component Validation
 *
 * Zod schemas for table component validation with detailed descriptions.
 * Follows development guidelines for comprehensive schema documentation.
 */

import { z } from 'zod';
import { Result } from '../../utils/result';
import type { BorderConfig } from '../../border/types';
import type { TableConfig, TableStyleFunction, TableValidationResult } from './types';

/**
 * Schema for table cell position validation
 */
export const TableCellPositionSchema = z
  .object({
    row: z
      .number()
      .int('Row index must be an integer')
      .min(-1, 'Row index must be -1 (header) or greater')
      .describe('Row index - 0-based for data rows, -1 for header row'),
    col: z
      .number()
      .int('Column index must be an integer')
      .min(0, 'Column index must be 0 or greater')
      .describe('Column index - 0-based column position'),
  })
  .describe('Table cell position with row and column indices');

/**
 * Schema for table render options validation
 */
export const TableRenderOptionsSchema = z
  .object({
    includeBorders: z.boolean().describe('Whether to include borders when rendering the table'),
    applyStyling: z.boolean().describe('Whether to apply cell styling during rendering'),
    columnWidths: z
      .array(
        z
          .number()
          .positive('Column width must be positive')
          .describe('Width of individual column in characters')
      )
      .optional()
      .describe(
        'Optional array of custom column widths - if not provided, widths are auto-calculated'
      ),
  })
  .describe('Configuration options for table rendering behavior');

/**
 * Schema for table column configuration validation
 */
export const TableColumnConfigSchema = z
  .object({
    header: z
      .string()
      .min(1, 'Column header cannot be empty')
      .describe('Header text displayed at the top of the column'),
    width: z
      .number()
      .positive('Column width must be positive')
      .optional()
      .describe('Optional fixed width for this column in characters'),
    align: z
      .enum(['left', 'center', 'right'])
      .describe('Text alignment for all cells in this column'),
    styleFunc: z
      .function()
      .args(
        z.number().describe('Row index for the cell being styled'),
        z.string().describe('Cell content value')
      )
      .returns(z.any()) // StyleConfig type
      .optional()
      .describe('Optional function that returns style configuration for cells in this column'),
  })
  .describe('Configuration for individual table columns including header, width, and styling');

/**
 * Schema for table row configuration validation
 */
export const TableRowConfigSchema = z
  .object({
    cells: z
      .array(z.string().describe('Individual cell value as string'))
      .min(1, 'Row must have at least one cell')
      .describe('Array of cell values for this row'),
    styleFunc: z
      .function()
      .args(
        z.number().describe('Column index for the cell being styled'),
        z.string().describe('Cell content value')
      )
      .returns(z.any()) // StyleConfig type
      .optional()
      .describe('Optional function that returns style configuration for cells in this row'),
    isHeader: z
      .boolean()
      .describe('Whether this row should be treated as a header row with special styling'),
  })
  .describe('Configuration for individual table rows including cell data and styling');

/**
 * Schema for table validation result
 */
export const TableValidationResultSchema = z
  .object({
    isValid: z.boolean().describe('Whether the table configuration passed all validation checks'),
    errors: z
      .array(z.string().describe('Individual validation error message'))
      .describe('Array of validation errors that prevent table rendering'),
    warnings: z
      .array(z.string().describe('Individual validation warning message'))
      .describe('Array of validation warnings that may affect table appearance'),
  })
  .describe('Result of table configuration validation including errors and warnings');

/**
 * Schema for table metrics validation
 */
export const TableMetricsSchema = z
  .object({
    totalWidth: z
      .number()
      .positive('Total width must be positive')
      .describe('Total width of the rendered table including borders and padding'),
    totalHeight: z
      .number()
      .positive('Total height must be positive')
      .describe('Total height of the rendered table including borders and padding'),
    columnWidths: z
      .array(
        z
          .number()
          .positive('Column width must be positive')
          .describe('Width of individual column in characters')
      )
      .describe('Array of calculated or specified column widths'),
    rowHeights: z
      .array(
        z
          .number()
          .positive('Row height must be positive')
          .describe('Height of individual row in lines')
      )
      .describe('Array of calculated row heights including header row'),
    columnCount: z
      .number()
      .int('Column count must be an integer')
      .positive('Column count must be positive')
      .describe('Total number of columns in the table'),
    rowCount: z
      .number()
      .int('Row count must be an integer')
      .positive('Row count must be positive')
      .describe('Total number of rows including header row'),
  })
  .describe('Calculated metrics for table layout and rendering');

/**
 * Main table configuration schema with comprehensive validation
 */
export const TableConfigSchema = z
  .object({
    headers: z
      .array(z.string().describe('Individual column header text'))
      .describe('Array of column headers displayed at the top of the table'),
    rows: z
      .array(
        z
          .array(z.string().describe('Individual cell value as string'))
          .describe('Individual row data as array of cell values')
      )
      .describe('Array of table rows, where each row is an array of cell values'),
    border: z
      .any() // BorderConfig type - will be validated by border module
      .optional()
      .describe('Optional border configuration for table styling'),
    styleFunc: z
      .function()
      .args(z.number(), z.number())
      .returns(z.any()) // StyleConfig type
      .optional()
      .describe(
        'Optional function that returns style configuration for specific cells based on row and column indices'
      ),
    width: z
      .number()
      .positive('Table width must be positive')
      .optional()
      .describe('Optional fixed width for the entire table in characters'),
    height: z
      .number()
      .positive('Table height must be positive')
      .optional()
      .describe('Optional fixed height for the entire table in lines'),
  })
  .describe('Complete table configuration including headers, data, styling, and layout options');

/**
 * Schema for table style function validation
 */
export const TableStyleFunctionSchema = z
  .function()
  .args(
    z
      .number()
      .int('Row index must be an integer')
      .min(-1, 'Row index must be -1 (header) or greater')
      .describe('Row index - 0-based for data rows, -1 for header row'),
    z
      .number()
      .int('Column index must be an integer')
      .min(0, 'Column index must be 0 or greater')
      .describe('Column index - 0-based column position')
  )
  .returns(z.any()) // StyleConfig type - will be validated by style module
  .describe(
    'Function that takes row and column indices and returns style configuration for that cell'
  );

/**
 * Schema for table cell renderer function validation
 */
export const TableCellRendererSchema = z
  .function()
  .args(
    z.string().describe('Cell value to be rendered'),
    TableCellPositionSchema.describe('Position information for the cell')
  )
  .returns(z.string())
  .describe(
    'Function that takes cell value and position and returns formatted string for rendering'
  );

/**
 * Schema for table border renderer function validation
 */
export const TableBorderRendererSchema = z
  .function()
  .args(
    z
      .any() // BorderConfig type
      .describe('Border configuration for the table'),
    TableMetricsSchema.describe('Table metrics for layout calculations')
  )
  .returns(
    z.object({
      top: z.string().describe('Top border line'),
      middle: z.string().describe('Middle separator line between header and data'),
      bottom: z.string().describe('Bottom border line'),
      separator: z.string().describe('Row separator line between data rows'),
    })
  )
  .describe('Function that generates border strings for table rendering');

/**
 * Table validation namespace with comprehensive validation functions
 */
export namespace TableValidation {
  /**
   * Validates a complete table configuration
   */
  export const validateTableConfig = (config: TableConfig): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic structure
    if (!Array.isArray(config.headers)) {
      errors.push('Headers must be an array');
    }

    if (!Array.isArray(config.rows)) {
      errors.push('Rows must be an array');
    }

    if (config.width !== undefined && config.width <= 0) {
      errors.push('Width must be a positive number');
    }

    if (config.height !== undefined && config.height <= 0) {
      errors.push('Height must be a positive number');
    }

    if (config.styleFunc !== undefined && typeof config.styleFunc !== 'function') {
      errors.push('Style function must be a function');
    }

    // Validate headers
    if (Array.isArray(config.headers)) {
      const headerValidation = validateHeaders(config.headers);
      errors.push(...headerValidation.errors);
      warnings.push(...headerValidation.warnings);
    }

    // Validate rows
    if (Array.isArray(config.rows) && Array.isArray(config.headers)) {
      const rowValidation = validateRows(config.rows, config.headers.length);
      errors.push(...rowValidation.errors);
      warnings.push(...rowValidation.warnings);
    }

    // Validate border
    if (config.border !== undefined) {
      const borderValidation = validateBorderConfig(config.border);
      errors.push(...borderValidation.errors);
      warnings.push(...borderValidation.warnings);
    }

    // Validate style function
    if (config.styleFunc !== undefined) {
      const styleFuncValidation = validateStyleFunction(config.styleFunc);
      errors.push(...styleFuncValidation.errors);
      warnings.push(...styleFuncValidation.warnings);
    }

    // Validate overall structure
    const structureValidation = validateTableStructure(config);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates table headers
   */
  export const validateHeaders = (headers: readonly string[]): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    headers.forEach((header, index) => {
      if (typeof header !== 'string') {
        errors.push(`Header at index ${index} must be a string`);
      } else {
        if (header === '') {
          warnings.push(`Header at index ${index} is empty`);
        }
        if (header.length > 50) {
          warnings.push(`Header at index ${index} is very long (${header.length} characters)`);
        }
      }
    });

    // Check for duplicates
    const seen = new Set<string>();
    for (const header of headers) {
      if (typeof header === 'string') {
        if (seen.has(header)) {
          errors.push(`Duplicate header found: ${header}`);
        }
        seen.add(header);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates table rows
   */
  export const validateRows = (
    rows: readonly (readonly string[])[],
    expectedColumnCount: number
  ): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push(`Row at index ${rowIndex} must be an array`);
        return;
      }

      if (row.length !== expectedColumnCount) {
        errors.push(`Row ${rowIndex} has ${row.length} columns, expected ${expectedColumnCount}`);
      }

      row.forEach((cell, cellIndex) => {
        if (typeof cell !== 'string') {
          errors.push(`Cell at row ${rowIndex}, column ${cellIndex} must be a string`);
        } else if (cell.length > 100) {
          warnings.push(
            `Cell at row ${rowIndex}, column ${cellIndex} is very long (${cell.length} characters)`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates border configuration
   */
  export const validateBorderConfig = (border: BorderConfig | undefined): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (border === undefined) {
      return { isValid: true, errors, warnings };
    }

    if (typeof border !== 'object' || border === null) {
      errors.push('Border configuration must be an object');
      return { isValid: false, errors, warnings };
    }

    const validTypes = ['normal', 'rounded', 'thick', 'double', 'custom'];
    if (!validTypes.includes(border.type)) {
      errors.push(`Invalid border type: ${border.type}`);
    }

    if (!border.chars) {
      errors.push('Border chars configuration is required');
    } else {
      const requiredChars = [
        'top',
        'right',
        'bottom',
        'left',
        'topLeft',
        'topRight',
        'bottomLeft',
        'bottomRight',
      ];
      for (const charName of requiredChars) {
        if (!(charName in border.chars)) {
          errors.push(`Missing border character: ${charName}`);
        } else if (typeof border.chars[charName as keyof typeof border.chars] !== 'string') {
          errors.push(`Border character ${charName} must be a string`);
        }
      }
    }

    if (!Array.isArray(border.sides) || border.sides.length !== 4) {
      errors.push('Sides array must have exactly 4 elements');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates style function
   */
  export const validateStyleFunction = (
    styleFunc: TableStyleFunction | undefined
  ): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (styleFunc === undefined) {
      return { isValid: true, errors, warnings };
    }

    if (typeof styleFunc !== 'function') {
      errors.push('Style function must be a function');
      return { isValid: false, errors, warnings };
    }

    try {
      const result = styleFunc(0, 0);
      if (typeof result !== 'object' || result === null) {
        errors.push('Style function must return an object');
      }
    } catch (error) {
      errors.push(
        `Style function throws an error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates overall table structure
   */
  export const validateTableStructure = (config: TableConfig): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Early return if basic structure is invalid
    if (!config.headers || !config.rows) {
      return { isValid: true, errors, warnings }; // Let other validators handle missing arrays
    }

    // Check for large tables that might impact performance
    if (config.headers.length > 20) {
      warnings.push(
        `Table has a large number of columns (${config.headers.length}), which may impact performance`
      );
    }

    if (config.rows.length > 500) {
      warnings.push(
        `Table has a large number of rows (${config.rows.length}), which may impact performance`
      );
    }

    // Check column count consistency
    const expectedColumns = config.headers.length;
    config.rows.forEach((row, rowIndex) => {
      if (Array.isArray(row) && row.length !== expectedColumns) {
        errors.push(`Row ${rowIndex} has ${row.length} columns, expected ${expectedColumns}`);
      }
    });

    // Check for circular references (basic check)
    try {
      JSON.stringify(config);
    } catch (_error) {
      errors.push('Circular reference detected in table structure');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates enumerator function (for compatibility with tree validation pattern)
   */
  export const validateEnumeratorFunction = (enumerator: unknown): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof enumerator !== 'function') {
      errors.push('Enumerator must be a function');
      return { isValid: false, errors, warnings };
    }

    try {
      const testNode = { value: 'test', children: [], style: undefined, expanded: true };
      const result = (enumerator as any)(testNode, 0, false, false);
      if (typeof result !== 'string') {
        errors.push('Enumerator function must return a string');
      }
    } catch (error) {
      errors.push(
        `Enumerator function throws an error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  // Result-based validation functions for functional error handling

  /**
   * Validates a complete table configuration using Result type
   */
  export const validateTableConfigSafe = (config: unknown): Result<TableConfig, z.ZodError> => {
    const result = TableConfigSchema.safeParse(config);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table cell position using Result type
   */
  export const validateTableCellPositionSafe = (position: unknown): Result<z.infer<typeof TableCellPositionSchema>, z.ZodError> => {
    const result = TableCellPositionSchema.safeParse(position);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table render options using Result type
   */
  export const validateTableRenderOptionsSafe = (options: unknown): Result<z.infer<typeof TableRenderOptionsSchema>, z.ZodError> => {
    const result = TableRenderOptionsSchema.safeParse(options);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table column configuration using Result type
   */
  export const validateTableColumnConfigSafe = (column: unknown): Result<z.infer<typeof TableColumnConfigSchema>, z.ZodError> => {
    const result = TableColumnConfigSchema.safeParse(column);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table row configuration using Result type
   */
  export const validateTableRowConfigSafe = (row: unknown): Result<z.infer<typeof TableRowConfigSchema>, z.ZodError> => {
    const result = TableRowConfigSchema.safeParse(row);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table metrics using Result type
   */
  export const validateTableMetricsSafe = (metrics: unknown): Result<z.infer<typeof TableMetricsSchema>, z.ZodError> => {
    const result = TableMetricsSchema.safeParse(metrics);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table style function using Result type
   */
  export const validateTableStyleFunctionSafe = (styleFunc: unknown): Result<TableStyleFunction, z.ZodError> => {
    const result = TableStyleFunctionSchema.safeParse(styleFunc);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table cell renderer using Result type
   */
  export const validateTableCellRendererSafe = (renderer: unknown): Result<z.infer<typeof TableCellRendererSchema>, z.ZodError> => {
    const result = TableCellRendererSchema.safeParse(renderer);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };

  /**
   * Validates table border renderer using Result type
   */
  export const validateTableBorderRendererSafe = (renderer: unknown): Result<z.infer<typeof TableBorderRendererSchema>, z.ZodError> => {
    const result = TableBorderRendererSchema.safeParse(renderer);
    return result.success ? Result.ok(result.data) : Result.err(result.error);
  };
}

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
