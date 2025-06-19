/**
 * Table Component Builder
 *
 * Fluent API builder pattern for table construction following functional principles.
 * Provides method chaining while maintaining immutable core operations.
 */

import type { BorderConfig } from '../../border/types';
import { Table } from './operations';
import type { TableConfig, TableStyleFunction } from './types';

/**
 * Table builder namespace providing fluent API creation
 */
export namespace TableBuilder {
  /**
   * Creates a new table builder chain
   * @returns New TableChain instance for method chaining
   */
  export const create = () => new TableChain(Table.create());

  /**
   * Creates a table builder from an existing table configuration
   * @param config - Existing table configuration
   * @returns New TableChain instance for method chaining
   */
  export const from = (config: TableConfig) => new TableChain(config);
}

/**
 * TableChain class providing fluent API for table construction
 * Uses immutable operations from Table namespace under the hood
 */
export class TableChain {
  /**
   * Creates a new TableChain instance
   * @param config - Current table configuration (readonly)
   */
  constructor(private readonly config: TableConfig) {}

  /**
   * Sets the headers for the table
   * @param headerList - Array of header strings
   * @returns New TableChain instance with updated headers
   */
  headers(...headerList: readonly string[]): TableChain {
    return new TableChain(Table.headers(...headerList)(this.config));
  }

  /**
   * Sets the rows for the table
   * @param rowList - Array of row data where each row is an array of strings
   * @returns New TableChain instance with updated rows
   */
  rows(...rowList: readonly (readonly string[])[]): TableChain {
    return new TableChain(Table.rows(...rowList)(this.config));
  }

  /**
   * Adds a single row to the table
   * @param row - Array of cell values for the new row
   * @returns New TableChain instance with added row
   */
  addRow(row: readonly string[]): TableChain {
    return new TableChain(Table.addRow(row)(this.config));
  }

  /**
   * Adds multiple rows to the table
   * @param newRows - Array of rows to add
   * @returns New TableChain instance with added rows
   */
  addRows(newRows: readonly (readonly string[])[]): TableChain {
    return new TableChain(Table.addRows(newRows)(this.config));
  }

  /**
   * Sets the border configuration for the table
   * @param borderConfig - Border configuration to apply
   * @returns New TableChain instance with border
   */
  border(borderConfig: BorderConfig): TableChain {
    return new TableChain(Table.border(borderConfig)(this.config));
  }

  /**
   * Removes the border from the table
   * @returns New TableChain instance without border
   */
  noBorder(): TableChain {
    return new TableChain(Table.noBorder()(this.config));
  }

  /**
   * Sets the style function for the table
   * @param fn - Function that returns style config for specific cells
   * @returns New TableChain instance with style function
   */
  styleFunc(fn: TableStyleFunction): TableChain {
    return new TableChain(Table.styleFunc(fn)(this.config));
  }

  /**
   * Removes the style function from the table
   * @returns New TableChain instance without style function
   */
  noStyleFunc(): TableChain {
    return new TableChain(Table.noStyleFunc()(this.config));
  }

  /**
   * Sets the width for the table
   * @param tableWidth - Fixed width for the table
   * @returns New TableChain instance with width
   */
  width(tableWidth: number): TableChain {
    return new TableChain(Table.width(tableWidth)(this.config));
  }

  /**
   * Sets the height for the table
   * @param tableHeight - Fixed height for the table
   * @returns New TableChain instance with height
   */
  height(tableHeight: number): TableChain {
    return new TableChain(Table.height(tableHeight)(this.config));
  }

  /**
   * Sets both width and height for the table
   * @param tableWidth - Fixed width for the table
   * @param tableHeight - Fixed height for the table
   * @returns New TableChain instance with dimensions
   */
  dimensions(tableWidth: number, tableHeight: number): TableChain {
    return new TableChain(Table.dimensions(tableWidth, tableHeight)(this.config));
  }

  /**
   * Creates a table from a 2D array of data
   * @param data - 2D array where first row is headers and rest are data rows
   * @returns New TableChain instance with data from array
   */
  fromArray(data: readonly (readonly string[])[]): TableChain {
    return new TableChain(Table.fromArray(data));
  }

  /**
   * Builds and returns the final table configuration
   * @returns Immutable table configuration
   */
  build(): TableConfig {
    return this.config;
  }

  /**
   * Gets the current table configuration without building
   * @returns Current table configuration (readonly)
   */
  getConfig(): TableConfig {
    return this.config;
  }

  /**
   * Validates the current table configuration
   * @returns Validation result with errors and warnings
   */
  validate() {
    return Table.validate(this.config);
  }

  /**
   * Calculates metrics for the current table configuration
   * @returns Table metrics including dimensions and counts
   */
  calculateMetrics() {
    return Table.calculateMetrics(this.config);
  }

  /**
   * Checks if the current table configuration is empty
   * @returns True if table has no headers or rows
   */
  isEmpty(): boolean {
    return Table.isEmpty(this.config);
  }

  /**
   * Gets the number of columns in the current table
   * @returns Number of columns
   */
  getColumnCount(): number {
    return Table.getColumnCount(this.config);
  }

  /**
   * Gets the number of rows in the current table (excluding header)
   * @returns Number of data rows
   */
  getRowCount(): number {
    return Table.getRowCount(this.config);
  }

  /**
   * Gets the total number of rows including header
   * @returns Total number of rows including header
   */
  getTotalRowCount(): number {
    return Table.getTotalRowCount(this.config);
  }

  /**
   * Converts the current table configuration to a 2D array
   * @returns 2D array with headers as first row and data rows following
   */
  toArray(): readonly (readonly string[])[] {
    return Table.toArray(this.config);
  }

  /**
   * Creates a copy of the current table chain
   * @returns New TableChain instance with the same configuration
   */
  clone(): TableChain {
    return new TableChain(this.config);
  }

  /**
   * Applies a custom transformation function to the table configuration
   * @param transform - Function that takes a table config and returns a new one
   * @returns New TableChain instance with transformed configuration
   */
  transform(transform: (config: TableConfig) => TableConfig): TableChain {
    return new TableChain(transform(this.config));
  }

  /**
   * Conditionally applies a transformation if the condition is true
   * @param condition - Boolean condition to check
   * @param transform - Function to apply if condition is true
   * @returns New TableChain instance, potentially transformed
   */
  when(condition: boolean, transform: (chain: TableChain) => TableChain): TableChain {
    return condition ? transform(this) : this;
  }

  /**
   * Applies a transformation function to the table chain
   * @param transform - Function that takes a TableChain and returns a new one
   * @returns Result of the transformation function
   */
  pipe(transform: (chain: TableChain) => TableChain): TableChain {
    return transform(this);
  }
}
