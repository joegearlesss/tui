/**
 * Table Component Types
 *
 * Defines the core types and interfaces for the table component system.
 * Based on OVERVIEW-v2.internal.md Section 5 (Component System) specification.
 */

import type { BorderConfig } from '../../border/types';
import type { StyleProperties } from '../../style/style';

/**
 * Table configuration interface with readonly properties for immutability
 */
export interface TableConfig {
  /** Table headers - array of column header strings */
  readonly headers: readonly string[];

  /** Table rows - array of row data where each row is an array of cell strings */
  readonly rows: readonly (readonly string[])[];

  /** Optional border configuration for the table */
  readonly border: BorderConfig | undefined;

  /** Optional style function that returns style config for specific cells */
  readonly styleFunc: ((row: number, col: number) => StyleProperties) | undefined;

  /** Optional fixed width for the table */
  readonly width: number | undefined;

  /** Optional fixed height for the table */
  readonly height: number | undefined;
}

/**
 * Table cell position information
 */
export interface TableCellPosition {
  /** Row index (0-based, -1 for header row) */
  readonly row: number;

  /** Column index (0-based) */
  readonly col: number;
}

/**
 * Table rendering options
 */
export interface TableRenderOptions {
  /** Whether to include borders in rendering */
  readonly includeBorders: boolean;

  /** Whether to apply cell styling */
  readonly applyStyling: boolean;

  /** Custom column widths (if not provided, auto-calculated) */
  readonly columnWidths: readonly number[] | undefined;
}

/**
 * Table column configuration
 */
export interface TableColumnConfig {
  /** Column header text */
  readonly header: string;

  /** Optional fixed width for this column */
  readonly width: number | undefined;

  /** Text alignment for this column */
  readonly align: 'left' | 'center' | 'right';

  /** Optional style function specific to this column */
  readonly styleFunc: ((row: number, value: string) => StyleProperties) | undefined;
}

/**
 * Table row configuration
 */
export interface TableRowConfig {
  /** Row data - array of cell values */
  readonly cells: readonly string[];

  /** Optional style function for this entire row */
  readonly styleFunc: ((col: number, value: string) => StyleProperties) | undefined;

  /** Whether this row should be treated as a header row */
  readonly isHeader: boolean;
}

/**
 * Table validation result
 */
export interface TableValidationResult {
  /** Whether the table configuration is valid */
  readonly isValid: boolean;

  /** Array of validation error messages */
  readonly errors: readonly string[];

  /** Array of validation warnings */
  readonly warnings: readonly string[];
}

/**
 * Table metrics for layout calculations
 */
export interface TableMetrics {
  /** Total table width including borders */
  readonly totalWidth: number;

  /** Total table height including borders */
  readonly totalHeight: number;

  /** Width of each column */
  readonly columnWidths: readonly number[];

  /** Height of each row */
  readonly rowHeights: readonly number[];

  /** Number of columns */
  readonly columnCount: number;

  /** Number of rows (including header) */
  readonly rowCount: number;
}

/**
 * Type for table style function - takes row and column indices and returns style config
 */
export type TableStyleFunction = (row: number, col: number) => StyleProperties;

/**
 * Type for table cell renderer function - takes cell value and position and returns formatted string
 */
export type TableCellRenderer = (value: string, position: TableCellPosition) => string;

/**
 * Type for table border renderer function - takes border config and table metrics and returns border strings
 */
export type TableBorderRenderer = (
  border: BorderConfig,
  metrics: TableMetrics
) => {
  readonly top: string;
  readonly middle: string;
  readonly bottom: string;
  readonly separator: string;
};
