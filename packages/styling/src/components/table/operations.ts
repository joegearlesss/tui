/**
 * Table Component Operations
 *
 * Core functional operations for table manipulation following functional programming principles.
 * All operations are pure functions that return new table configurations.
 */

import type { BorderConfig } from '../../border/types';
import type { StyleProperties } from '../../style/style';
import type {
  TableCellPosition,
  TableConfig,
  TableMetrics,
  TableStyleFunction,
  TableValidationResult,
} from './types';
import { TableConfigSchema, TableValidationResultSchema } from './validation';

/**
 * Table namespace containing all table manipulation functions
 */
export namespace Table {
  /** Constant representing the header row index */
  export const HEADER_ROW = -1;

  /**
   * Creates a new empty table configuration
   * @returns Empty table configuration with default values
   */
  export const create = (): TableConfig => ({
    headers: [],
    rows: [],
    border: undefined,
    styleFunc: undefined,
    width: undefined,
    height: undefined,
  });

  /**
   * Sets the headers for a table configuration
   * @param headerList - Array of header strings
   * @returns Function that takes a table config and returns new config with headers
   */
  export const headers =
    (...headerList: readonly string[]) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      headers: headerList,
    });

  /**
   * Sets the rows for a table configuration
   * @param rowList - Array of row data where each row is an array of strings
   * @returns Function that takes a table config and returns new config with rows
   */
  export const rows =
    (...rowList: readonly (readonly string[])[]) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      rows: rowList,
    });

  /**
   * Adds a single row to a table configuration
   * @param row - Array of cell values for the new row
   * @returns Function that takes a table config and returns new config with added row
   */
  export const addRow =
    (row: readonly string[]) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      rows: [...table.rows, row],
    });

  /**
   * Adds multiple rows to a table configuration
   * @param newRows - Array of rows to add
   * @returns Function that takes a table config and returns new config with added rows
   */
  export const addRows =
    (newRows: readonly (readonly string[])[]) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      rows: [...table.rows, ...newRows],
    });

  /**
   * Sets the border configuration for a table
   * @param borderConfig - Border configuration to apply
   * @returns Function that takes a table config and returns new config with border
   */
  export const border =
    (borderConfig: BorderConfig) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      border: borderConfig,
    });

  /**
   * Removes the border from a table configuration
   * @returns Function that takes a table config and returns new config without border
   */
  export const noBorder =
    () =>
    (table: TableConfig): TableConfig => ({
      ...table,
      border: undefined,
    });

  /**
   * Sets the style function for a table configuration
   * @param fn - Function that returns style config for specific cells
   * @returns Function that takes a table config and returns new config with style function
   */
  export const styleFunc =
    (fn: TableStyleFunction) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      styleFunc: fn,
    });

  /**
   * Removes the style function from a table configuration
   * @returns Function that takes a table config and returns new config without style function
   */
  export const noStyleFunc =
    () =>
    (table: TableConfig): TableConfig => ({
      ...table,
      styleFunc: undefined,
    });

  /**
   * Sets the width for a table configuration
   * @param tableWidth - Fixed width for the table
   * @returns Function that takes a table config and returns new config with width
   */
  export const width =
    (tableWidth: number) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      width: tableWidth,
    });

  /**
   * Sets the height for a table configuration
   * @param tableHeight - Fixed height for the table
   * @returns Function that takes a table config and returns new config with height
   */
  export const height =
    (tableHeight: number) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      height: tableHeight,
    });

  /**
   * Sets both width and height for a table configuration
   * @param tableWidth - Fixed width for the table
   * @param tableHeight - Fixed height for the table
   * @returns Function that takes a table config and returns new config with dimensions
   */
  export const dimensions =
    (tableWidth: number, tableHeight: number) =>
    (table: TableConfig): TableConfig => ({
      ...table,
      width: tableWidth,
      height: tableHeight,
    });

  /**
   * Validates a table configuration
   * @param table - Table configuration to validate
   * @returns Validation result with errors and warnings
   */
  export const validate = (table: TableConfig): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate using Zod schema
      TableConfigSchema.parse(table);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`Schema validation failed: ${error.message}`);
      }
    }

    // Custom validation logic
    if (table.headers.length === 0) {
      errors.push('Table must have at least one header');
    }

    // Check row consistency
    if (table.rows.length > 0) {
      const headerCount = table.headers.length;
      table.rows.forEach((row, index) => {
        if (row.length !== headerCount) {
          warnings.push(
            `Row ${index} has ${row.length} cells but table has ${headerCount} headers`
          );
        }
      });
    }

    // Check for empty cells
    table.rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell.trim() === '') {
          warnings.push(`Empty cell at row ${rowIndex}, column ${cellIndex}`);
        }
      });
    });

    // Check width constraints
    if (table.width !== undefined && table.width < table.headers.length * 3) {
      warnings.push('Table width may be too small for the number of columns');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Calculates metrics for a table configuration
   * @param table - Table configuration to analyze
   * @returns Table metrics including dimensions and counts
   */
  export const calculateMetrics = (table: TableConfig): TableMetrics => {
    const columnCount = table.headers.length;
    const rowCount = table.rows.length + 1; // +1 for header row

    // Calculate column widths based on content
    const columnWidths = table.headers.map((header, colIndex) => {
      let maxWidth = header.length;

      for (const row of table.rows) {
        if (row[colIndex]) {
          maxWidth = Math.max(maxWidth, row[colIndex].length);
        }
      }

      return maxWidth + 2; // Add padding
    });

    // Calculate row heights (assuming single line cells for now)
    const rowHeights = new Array(rowCount).fill(1);

    // Calculate total dimensions
    const totalWidth =
      columnWidths.reduce((sum, width) => sum + width, 0) + (table.border ? columnCount + 1 : 0); // Add border space
    const totalHeight = rowCount + (table.border ? 3 : 0); // Add border space

    return {
      totalWidth: table.width ?? totalWidth,
      totalHeight: table.height ?? totalHeight,
      columnWidths,
      rowHeights,
      columnCount,
      rowCount,
    };
  };

  /**
   * Gets the style for a specific cell
   * @param table - Table configuration
   * @param row - Row index (-1 for header)
   * @param col - Column index
   * @returns Style configuration for the cell, or undefined if no style function
   */
  export const getCellStyle = (
    table: TableConfig,
    row: number,
    col: number
  ): StyleProperties | undefined => {
    if (table.styleFunc) {
      return table.styleFunc(row, col);
    }
    return undefined;
  };

  /**
   * Gets the value of a specific cell
   * @param table - Table configuration
   * @param row - Row index (-1 for header)
   * @param col - Column index
   * @returns Cell value as string, or empty string if cell doesn't exist
   */
  export const getCellValue = (table: TableConfig, row: number, col: number): string => {
    if (row === HEADER_ROW) {
      return table.headers[col] ?? '';
    }

    if (row >= 0 && row < table.rows.length) {
      return table.rows[row]?.[col] ?? '';
    }

    return '';
  };

  /**
   * Checks if a table configuration is empty
   * @param table - Table configuration to check
   * @returns True if table has no headers or rows
   */
  export const isEmpty = (table: TableConfig): boolean => {
    return table.headers.length === 0 && table.rows.length === 0;
  };

  /**
   * Gets the number of columns in a table
   * @param table - Table configuration
   * @returns Number of columns
   */
  export const getColumnCount = (table: TableConfig): number => {
    return table.headers.length;
  };

  /**
   * Gets the number of rows in a table (excluding header)
   * @param table - Table configuration
   * @returns Number of data rows
   */
  export const getRowCount = (table: TableConfig): number => {
    return table.rows.length;
  };

  /**
   * Gets the total number of rows including header
   * @param table - Table configuration
   * @returns Total number of rows including header
   */
  export const getTotalRowCount = (table: TableConfig): number => {
    return table.rows.length + (table.headers.length > 0 ? 1 : 0);
  };

  /**
   * Creates a table configuration from a 2D array of data
   * @param data - 2D array where first row is headers and rest are data rows
   * @returns Table configuration
   */
  export const fromArray = (data: readonly (readonly string[])[]): TableConfig => {
    if (data.length === 0) {
      return create();
    }

    const [headerRow, ...dataRows] = data;
    return {
      ...create(),
      headers: headerRow ?? [],
      rows: dataRows,
    };
  };

  /**
   * Converts a table configuration to a 2D array
   * @param table - Table configuration to convert
   * @returns 2D array with headers as first row and data rows following
   */
  export const toArray = (table: TableConfig): readonly (readonly string[])[] => {
    if (table.headers.length === 0) {
      return table.rows;
    }
    return [table.headers, ...table.rows];
  };
}
