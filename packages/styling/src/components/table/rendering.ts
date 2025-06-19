/**
 * Table Component Rendering
 *
 * Core rendering engine for table components with ANSI styling support.
 * Handles border rendering, cell formatting, and layout calculations.
 */

import { Border } from '../../border/presets';
import type { BorderConfig } from '../../border/types';
import { Layout } from '../../layout/joining';
import type { StyleProperties } from '../../style/style';
import { Style } from '../../style/style';
import { Table } from './operations';
import type { TableConfig, TableMetrics, TableRenderOptions } from './types';

/**
 * Table rendering namespace containing all rendering functions
 */
export namespace TableRender {
  /**
   * Default render options
   */
  const DEFAULT_RENDER_OPTIONS: TableRenderOptions = {
    includeBorders: true,
    applyStyling: true,
    columnWidths: undefined,
  };

  /**
   * Renders a table configuration to a string
   * @param table - Table configuration to render
   * @param options - Optional rendering options
   * @returns Rendered table as string
   */
  export const render = (table: TableConfig, options: Partial<TableRenderOptions> = {}): string => {
    const renderOptions = { ...DEFAULT_RENDER_OPTIONS, ...options };

    // Handle empty table
    if (Table.isEmpty(table)) {
      return '';
    }

    // Validate table before rendering
    const validation = Table.validate(table);
    if (!validation.isValid) {
      throw new Error(`Cannot render invalid table: ${validation.errors.join(', ')}`);
    }

    // Calculate metrics
    const metrics = Table.calculateMetrics(table);
    const columnWidths = renderOptions.columnWidths ?? metrics.columnWidths;

    // Build table parts
    const parts: string[] = [];

    // Top border
    if (renderOptions.includeBorders && table.border) {
      parts.push(renderTopBorder(table.border, columnWidths));
    }

    // Header row
    if (table.headers.length > 0) {
      const headerRow = renderRow(
        table.headers,
        columnWidths,
        Table.HEADER_ROW,
        table,
        renderOptions
      );
      parts.push(headerRow);

      // Header separator
      if (renderOptions.includeBorders && table.border) {
        parts.push(renderMiddleBorder(table.border, columnWidths));
      }
    }

    // Data rows
    table.rows.forEach((row, rowIndex) => {
      const renderedRow = renderRow(row, columnWidths, rowIndex, table, renderOptions);
      parts.push(renderedRow);

      // Row separator (except for last row)
      if (renderOptions.includeBorders && table.border && rowIndex < table.rows.length - 1) {
        parts.push(renderRowSeparator(table.border, columnWidths));
      }
    });

    // Bottom border
    if (renderOptions.includeBorders && table.border) {
      parts.push(renderBottomBorder(table.border, columnWidths));
    }

    return parts.join('\n');
  };

  /**
   * Renders a single table row
   * @param rowData - Array of cell values
   * @param columnWidths - Array of column widths
   * @param rowIndex - Row index (-1 for header)
   * @param table - Table configuration for styling
   * @param options - Render options
   * @returns Rendered row as string
   */
  const renderRow = (
    rowData: readonly string[],
    columnWidths: readonly number[],
    rowIndex: number,
    table: TableConfig,
    options: TableRenderOptions
  ): string => {
    const cells: string[] = [];
    const borderChar = table.border ? getBorderChars(table.border).right : '';

    // Left border
    if (table.border) {
      cells.push(borderChar);
    }

    // Render each cell
    rowData.forEach((cellValue, colIndex) => {
      const width = columnWidths[colIndex] ?? 10;
      const cellStyle = options.applyStyling
        ? Table.getCellStyle(table, rowIndex, colIndex)
        : undefined;

      const formattedCell = renderCell(cellValue, width, cellStyle);
      cells.push(formattedCell);

      // Column separator (except for last column)
      if (table.border && colIndex < rowData.length - 1) {
        cells.push(borderChar);
      }
    });

    // Right border
    if (table.border) {
      cells.push(borderChar);
    }

    return cells.join('');
  };

  /**
   * Renders a single table cell
   * @param value - Cell value
   * @param width - Cell width
   * @param style - Optional cell style
   * @returns Rendered cell as string
   */
  const renderCell = (value: string, width: number, style?: StyleProperties): string => {
    // Truncate or pad the value to fit the width
    const padding = 1; // Space on each side
    const contentWidth = width - padding * 2;

    let content =
      value.length > contentWidth ? `${value.substring(0, contentWidth - 3)}...` : value;

    // Pad to content width
    content = content.padEnd(contentWidth);

    // Add padding
    const paddedContent = ` ${content} `;

    // Apply styling if provided
    if (style) {
      return Style.render(style, paddedContent);
    }

    return paddedContent;
  };

  /**
   * Renders the top border of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @returns Top border string
   */
  const renderTopBorder = (border: BorderConfig, columnWidths: readonly number[]): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.topLeft);

    columnWidths.forEach((width, index) => {
      parts.push(chars.top.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(chars.topJunction || chars.top);
      }
    });

    parts.push(chars.topRight);
    return parts.join('');
  };

  /**
   * Renders the middle border (header separator) of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @returns Middle border string
   */
  const renderMiddleBorder = (border: BorderConfig, columnWidths: readonly number[]): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.leftJunction || chars.left);

    columnWidths.forEach((width, index) => {
      parts.push(chars.top.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(chars.middleJunction || chars.top);
      }
    });

    parts.push(chars.rightJunction || chars.right);
    return parts.join('');
  };

  /**
   * Renders a row separator border
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @returns Row separator string
   */
  const renderRowSeparator = (border: BorderConfig, columnWidths: readonly number[]): string => {
    // For now, use the same as middle border
    // Could be customized for different separator styles
    return renderMiddleBorder(border, columnWidths);
  };

  /**
   * Renders the bottom border of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @returns Bottom border string
   */
  const renderBottomBorder = (border: BorderConfig, columnWidths: readonly number[]): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.bottomLeft);

    columnWidths.forEach((width, index) => {
      parts.push(chars.bottom.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(chars.bottomJunction || chars.bottom);
      }
    });

    parts.push(chars.bottomRight);
    return parts.join('');
  };

  /**
   * Gets border characters from border configuration
   * @param border - Border configuration
   * @returns Border characters object
   */
  const getBorderChars = (border: BorderConfig) => {
    // Extract border characters from border config
    // This assumes the border config has a chars property
    const chars = (border as { chars?: Record<string, string> }).chars || {};

    return {
      top: chars.top || '─',
      right: chars.right || '│',
      bottom: chars.bottom || '─',
      left: chars.left || '│',
      topLeft: chars.topLeft || '┌',
      topRight: chars.topRight || '┐',
      bottomLeft: chars.bottomLeft || '└',
      bottomRight: chars.bottomRight || '┘',
      topJunction: chars.topJunction || '┬',
      bottomJunction: chars.bottomJunction || '┴',
      leftJunction: chars.leftJunction || '├',
      rightJunction: chars.rightJunction || '┤',
      middleJunction: chars.middleJunction || '┼',
    };
  };

  /**
   * Renders a table with automatic column width calculation
   * @param table - Table configuration
   * @returns Rendered table string
   */
  export const renderAuto = (table: TableConfig): string => {
    return render(table, { columnWidths: undefined });
  };

  /**
   * Renders a table without borders
   * @param table - Table configuration
   * @returns Rendered table string without borders
   */
  export const renderNoBorder = (table: TableConfig): string => {
    return render(table, { includeBorders: false });
  };

  /**
   * Renders a table without styling
   * @param table - Table configuration
   * @returns Rendered table string without cell styling
   */
  export const renderNoStyle = (table: TableConfig): string => {
    return render(table, { applyStyling: false });
  };

  /**
   * Renders a table with custom column widths
   * @param table - Table configuration
   * @param widths - Array of column widths
   * @returns Rendered table string with custom widths
   */
  export const renderWithWidths = (table: TableConfig, widths: readonly number[]): string => {
    return render(table, { columnWidths: widths });
  };

  /**
   * Renders a simple table (no borders, no styling)
   * @param table - Table configuration
   * @returns Simple rendered table string
   */
  export const renderSimple = (table: TableConfig): string => {
    return render(table, {
      includeBorders: false,
      applyStyling: false,
    });
  };

  /**
   * Gets the rendered width of a table
   * @param table - Table configuration
   * @returns Width of the rendered table in characters
   */
  export const getRenderedWidth = (table: TableConfig): number => {
    const metrics = Table.calculateMetrics(table);
    return metrics.totalWidth;
  };

  /**
   * Gets the rendered height of a table
   * @param table - Table configuration
   * @returns Height of the rendered table in lines
   */
  export const getRenderedHeight = (table: TableConfig): number => {
    const metrics = Table.calculateMetrics(table);
    return metrics.totalHeight;
  };

  /**
   * Gets the rendered dimensions of a table
   * @param table - Table configuration
   * @returns Tuple of [width, height] in characters and lines
   */
  export const getRenderedDimensions = (table: TableConfig): readonly [number, number] => {
    const metrics = Table.calculateMetrics(table);
    return [metrics.totalWidth, metrics.totalHeight] as const;
  };
}
