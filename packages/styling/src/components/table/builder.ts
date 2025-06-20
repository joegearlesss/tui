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
  export const create = () => TableChain.from(Table.create());

  /**
   * Creates a table builder from an existing table configuration
   * @param config - Existing table configuration
   * @returns New TableChain instance for method chaining
   */
  export const from = (config: TableConfig) => TableChain.from(config);
}

/**
 * Functional table chain interface for method chaining
 */
export interface TableChain {
  readonly config: TableConfig;

  // Configuration methods
  headers(...headerList: readonly string[]): TableChain;
  rows(...rowList: readonly (readonly string[])[]): TableChain;
  addRow(row: readonly string[]): TableChain;
  addRows(newRows: readonly (readonly string[])[]): TableChain;
  border(borderConfig: BorderConfig): TableChain;
  noBorder(): TableChain;
  borderRow(enabled?: boolean): TableChain;
  borderColumn(enabled?: boolean): TableChain;
  styleFunc(fn: TableStyleFunction): TableChain;
  noStyleFunc(): TableChain;
  width(tableWidth: number): TableChain;
  height(tableHeight: number): TableChain;
  dimensions(tableWidth: number, tableHeight: number): TableChain;
  fromArray(data: readonly (readonly string[])[]): TableChain;

  // Terminal methods
  build(): TableConfig;
  getConfig(): TableConfig;
  validate(): any;
  calculateMetrics(): any;
  isEmpty(): boolean;
  getColumnCount(): number;
  getRowCount(): number;
  getTotalRowCount(): number;
  toArray(): readonly (readonly string[])[];
  clone(): TableChain;
  transform(transform: (config: TableConfig) => TableConfig): TableChain;
  when(condition: boolean, transform: (chain: TableChain) => TableChain): TableChain;
  pipe(transform: (chain: TableChain) => TableChain): TableChain;
}

/**
 * Functional table chain namespace providing method chaining without classes
 */
export namespace TableChain {
  /**
   * Creates a table chain from configuration
   * @param config - Table configuration to wrap
   * @returns TableChain interface with method chaining
   */
  export const from = (config: TableConfig): TableChain => {
    return {
      config,

      // Configuration methods
      headers: (...headerList) => from(Table.headers(...headerList)(config)),
      rows: (...rowList) => from(Table.rows(...rowList)(config)),
      addRow: (row) => from(Table.addRow(row)(config)),
      addRows: (newRows) => from(Table.addRows(newRows)(config)),
      border: (borderConfig) => from(Table.border(borderConfig)(config)),
      noBorder: () => from(Table.noBorder()(config)),
      borderRow: (enabled = true) => from(Table.borderRow(enabled)(config)),
      borderColumn: (enabled = true) => from(Table.borderColumn(enabled)(config)),
      styleFunc: (fn) => from(Table.styleFunc(fn)(config)),
      noStyleFunc: () => from(Table.noStyleFunc()(config)),
      width: (tableWidth) => from(Table.width(tableWidth)(config)),
      height: (tableHeight) => from(Table.height(tableHeight)(config)),
      dimensions: (tableWidth, tableHeight) =>
        from(Table.dimensions(tableWidth, tableHeight)(config)),
      fromArray: (data) => from(Table.fromArray(data)),

      // Terminal methods
      build: () => config,
      getConfig: () => config,
      validate: () => Table.validate(config),
      calculateMetrics: () => Table.calculateMetrics(config),
      isEmpty: () => Table.isEmpty(config),
      getColumnCount: () => Table.getColumnCount(config),
      getRowCount: () => Table.getRowCount(config),
      getTotalRowCount: () => Table.getTotalRowCount(config),
      toArray: () => Table.toArray(config),
      clone: () => from(config),
      transform: (transform) => from(transform(config)),
      when: (condition, transform) => (condition ? transform(from(config)) : from(config)),
      pipe: (transform) => transform(from(config)),
    };
  };
}
