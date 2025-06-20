/**
 * Table Component Rendering
 *
 * Core rendering engine for table components with ANSI styling support.
 * Handles border rendering, cell formatting, and layout calculations.
 */

import type { BorderConfig } from '../../border/types';
import type { StyleProperties } from '../../style/style';
import { Style } from '../../style/style';
import { Table } from './operations';
import type { TableConfig, TableRenderOptions } from './types';

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
      parts.push(renderTopBorder(table.border, columnWidths, table));
    }

    // Header row
    if (table.headers.length > 0) {
      const headerRowLines = renderRow(
        table.headers,
        columnWidths,
        Table.HEADER_ROW,
        table,
        renderOptions
      );
      parts.push(...headerRowLines);

      // Header separator
      if (renderOptions.includeBorders && table.border) {
        parts.push(renderMiddleBorder(table.border, columnWidths, table));
      }
    }

    // Data rows
    table.rows.forEach((row, rowIndex) => {
      const renderedRowLines = renderRow(row, columnWidths, rowIndex, table, renderOptions);
      parts.push(...renderedRowLines);

      // Row separator (except for last row)
      if (
        renderOptions.includeBorders &&
        table.border &&
        table.borderRow &&
        rowIndex < table.rows.length - 1
      ) {
        parts.push(renderRowSeparator(table.border, columnWidths, table));
      }
    });

    // Bottom border
    if (renderOptions.includeBorders && table.border) {
      parts.push(renderBottomBorder(table.border, columnWidths, table));
    }

    return parts.join('\n');
  };

  /**
   * Renders a single table row with multi-row cell support
   * @param rowData - Array of cell values
   * @param columnWidths - Array of column widths
   * @param rowIndex - Row index (-1 for header)
   * @param table - Table configuration for styling
   * @param options - Render options
   * @returns Array of rendered row strings (may be multiple lines)
   */
  const renderRow = (
    rowData: readonly string[],
    columnWidths: readonly number[],
    rowIndex: number,
    table: TableConfig,
    options: TableRenderOptions
  ): string[] => {
    const borderChar = table.border ? getBorderChars(table.border).right : '';

    // Headers should never wrap - use single line rendering
    if (rowIndex === Table.HEADER_ROW) {
      return [renderSingleLineRow(rowData, columnWidths, rowIndex, table, options)];
    }

    // First, get all wrapped lines for each cell
    const cellLines: string[][] = [];
    let maxLines = 1;

    rowData.forEach((cellValue, colIndex) => {
      const width = columnWidths[colIndex] ?? 10;
      const cellStyle = options.applyStyling
        ? Table.getCellStyle(table, rowIndex, colIndex)
        : undefined;

      const leftPadding = cellStyle?.padding?.left ?? 1;
      const rightPadding = cellStyle?.padding?.right ?? 1;
      const totalHorizontalPadding = leftPadding + rightPadding;
      const contentWidth = width - totalHorizontalPadding;

      const wrappedLines = wrapText(cellValue, contentWidth);

      // Format each line as a cell
      const formattedLines = wrappedLines.map((line) => {
        let content = line;

        // Apply styling to raw content first, if provided
        if (cellStyle) {
          const styleForContent = { ...cellStyle };
          styleForContent.padding = undefined;
          styleForContent.width = undefined;
          styleForContent.horizontalAlignment = undefined;
          content = Style.render(styleForContent, content);
        }

        // Handle text alignment within the content width
        const visibleLength = content.replace(/\x1b\[[0-9;]*m/g, '').length;
        const paddingNeeded = contentWidth - visibleLength;

        if (paddingNeeded > 0) {
          const alignment = cellStyle?.horizontalAlignment || 'left';

          switch (alignment) {
            case 'center': {
              const leftPadding = Math.floor(paddingNeeded / 2);
              const rightPadding = paddingNeeded - leftPadding;
              content = '\u00A0'.repeat(leftPadding) + content + '\u00A0'.repeat(rightPadding);
              break;
            }
            case 'right': {
              content = '\u00A0'.repeat(paddingNeeded) + content;
              break;
            }
            default: {
              content = content + '\u00A0'.repeat(paddingNeeded);
              break;
            }
          }
        }

        // Add cell padding
        const leftPad = '\u00A0'.repeat(leftPadding);
        const rightPad = '\u00A0'.repeat(rightPadding);
        return `${leftPad}${content}${rightPad}`;
      });

      cellLines.push(formattedLines);
      maxLines = Math.max(maxLines, formattedLines.length);
    });

    // Now pad all cells to have the same number of lines
    cellLines.forEach((formattedLines, colIndex) => {
      const cellStyle = options.applyStyling
        ? Table.getCellStyle(table, rowIndex, colIndex)
        : undefined;

      const leftPadding = cellStyle?.padding?.left ?? 1;
      const rightPadding = cellStyle?.padding?.right ?? 1;
      const width = columnWidths[colIndex] ?? 10;
      const totalHorizontalPadding = leftPadding + rightPadding;
      const contentWidth = width - totalHorizontalPadding;

      // Pad with empty cells if needed
      while (formattedLines.length < maxLines) {
        let emptyContent = '';

        // Apply styling to empty content if provided
        if (cellStyle) {
          const styleForContent = { ...cellStyle };
          styleForContent.padding = undefined;
          styleForContent.width = undefined;
          styleForContent.horizontalAlignment = undefined;
          emptyContent = Style.render(styleForContent, emptyContent);
        }

        // Handle alignment for empty content (just add spaces)
        const visibleLength = emptyContent.replace(/\x1b\[[0-9;]*m/g, '').length;
        const paddingNeeded = contentWidth - visibleLength;
        if (paddingNeeded > 0) {
          emptyContent = emptyContent + '\u00A0'.repeat(paddingNeeded);
        }

        // Add cell padding
        const leftPad = '\u00A0'.repeat(leftPadding);
        const rightPad = '\u00A0'.repeat(rightPadding);
        formattedLines.push(`${leftPad}${emptyContent}${rightPad}`);
      }
    });

    // Now build each row line
    const rowLines: string[] = [];
    for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
      const lineCells: string[] = [];

      // Left border
      if (table.border) {
        lineCells.push(borderChar);
      }

      // Add each cell for this line
      cellLines.forEach((cellLineArray, colIndex) => {
        lineCells.push(cellLineArray[lineIndex]);

        // Column separator (except for last column)
        if (table.border && table.borderColumn && colIndex < cellLines.length - 1) {
          lineCells.push(borderChar);
        }
      });

      // Right border
      if (table.border) {
        lineCells.push(borderChar);
      }

      rowLines.push(lineCells.join(''));
    }

    return rowLines;
  };

  /**
   * Renders a single line row (used for headers and non-wrapping rows)
   * @param rowData - Array of cell values
   * @param columnWidths - Array of column widths
   * @param rowIndex - Row index (-1 for header)
   * @param table - Table configuration for styling
   * @param options - Render options
   * @returns Single rendered row string
   */
  const renderSingleLineRow = (
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
      if (table.border && table.borderColumn && colIndex < rowData.length - 1) {
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
   * Wraps text to fit within a specified width, breaking on word boundaries
   * @param text - Text to wrap
   * @param width - Maximum width per line
   * @returns Array of wrapped lines
   */
  const wrapText = (text: string, width: number): string[] => {
    if (text.length <= width) {
      return [text];
    }

    const lines: string[] = [];
    let currentLine = '';
    const words = text.split(' ');

    for (const word of words) {
      // If adding this word would exceed the width
      if (currentLine.length + word.length + (currentLine.length > 0 ? 1 : 0) > width) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than width, break it
          lines.push(word.substring(0, width));
          currentLine = word.substring(width);
        }
      } else {
        if (currentLine.length > 0) {
          currentLine += ' ';
        }
        currentLine += word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  };

  /**
   * Renders a single table cell
   * @param value - Cell value
   * @param width - Cell width
   * @param style - Optional cell style
   * @returns Rendered cell as string
   */
  const renderCell = (value: string, width: number, style?: StyleProperties): string => {
    // Get padding from style, default to 1 space on each side
    const leftPadding = style?.padding?.left ?? 1;
    const rightPadding = style?.padding?.right ?? 1;
    const totalHorizontalPadding = leftPadding + rightPadding;

    const contentWidth = width - totalHorizontalPadding;

    // For single-line cells, truncate with ellipsis if too long
    let content =
      value.length > contentWidth ? `${value.substring(0, contentWidth - 3)}...` : value;

    // Apply styling to raw content first, if provided
    if (style) {
      // Create a style without padding, width, and alignment since we handle those manually
      const styleForContent = { ...style };
      styleForContent.padding = undefined;
      styleForContent.width = undefined;
      styleForContent.horizontalAlignment = undefined;
      content = Style.render(styleForContent, content);
    }

    // Handle text alignment within the content width
    const visibleLength = content.replace(/\x1b\[[0-9;]*m/g, '').length;
    const paddingNeeded = contentWidth - visibleLength;

    if (paddingNeeded > 0) {
      const alignment = style?.horizontalAlignment || 'left';

      switch (alignment) {
        case 'center': {
          const leftPadding = Math.floor(paddingNeeded / 2);
          const rightPadding = paddingNeeded - leftPadding;
          content = '\u00A0'.repeat(leftPadding) + content + '\u00A0'.repeat(rightPadding);
          break;
        }
        case 'right': {
          content = '\u00A0'.repeat(paddingNeeded) + content;
          break;
        }
        default: {
          content = content + '\u00A0'.repeat(paddingNeeded);
          break;
        }
      }
    }

    // Add cell padding
    const leftPad = '\u00A0'.repeat(leftPadding);
    const rightPad = '\u00A0'.repeat(rightPadding);
    const paddedContent = `${leftPad}${content}${rightPad}`;

    return paddedContent;
  };

  /**
   * Renders the top border of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @param table - Table configuration for borderColumn setting
   * @returns Top border string
   */
  const renderTopBorder = (
    border: BorderConfig,
    columnWidths: readonly number[],
    table?: TableConfig
  ): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.topLeft);

    columnWidths.forEach((width, index) => {
      parts.push(chars.top.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(table?.borderColumn ? chars.topJunction || chars.top : chars.top);
      }
    });

    parts.push(chars.topRight);
    return parts.join('');
  };

  /**
   * Renders the middle border (header separator) of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @param table - Table configuration for borderColumn setting
   * @returns Middle border string
   */
  const renderMiddleBorder = (
    border: BorderConfig,
    columnWidths: readonly number[],
    table?: TableConfig
  ): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.leftJunction || chars.left);

    columnWidths.forEach((width, index) => {
      parts.push(chars.top.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(table?.borderColumn ? chars.middleJunction || chars.top : chars.top);
      }
    });

    parts.push(chars.rightJunction || chars.right);
    return parts.join('');
  };

  /**
   * Renders a row separator border
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @param table - Table configuration for borderColumn setting
   * @returns Row separator string
   */
  const renderRowSeparator = (
    border: BorderConfig,
    columnWidths: readonly number[],
    table?: TableConfig
  ): string => {
    // For now, use the same as middle border
    // Could be customized for different separator styles
    return renderMiddleBorder(border, columnWidths, table);
  };

  /**
   * Renders the bottom border of a table
   * @param border - Border configuration
   * @param columnWidths - Array of column widths
   * @param table - Table configuration for borderColumn setting
   * @returns Bottom border string
   */
  const renderBottomBorder = (
    border: BorderConfig,
    columnWidths: readonly number[],
    table?: TableConfig
  ): string => {
    const chars = getBorderChars(border);
    const parts: string[] = [];

    parts.push(chars.bottomLeft);

    columnWidths.forEach((width, index) => {
      parts.push(chars.bottom.repeat(width));
      if (index < columnWidths.length - 1) {
        parts.push(table?.borderColumn ? chars.bottomJunction || chars.bottom : chars.bottom);
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
    const chars = border.chars;

    // Determine junction characters based on border type
    let junctionChars;
    switch (border.type) {
      case 'thick':
        junctionChars = {
          topJunction: '┳',
          bottomJunction: '┻',
          leftJunction: '┣',
          rightJunction: '┫',
          middleJunction: '╋',
        };
        break;
      case 'double':
        junctionChars = {
          topJunction: '╦',
          bottomJunction: '╩',
          leftJunction: '╠',
          rightJunction: '╣',
          middleJunction: '╬',
        };
        break;
      default:
        junctionChars = {
          topJunction: '┬',
          bottomJunction: '┴',
          leftJunction: '├',
          rightJunction: '┤',
          middleJunction: '┼',
        };
        break;
    }

    return {
      top: chars.top || '─',
      right: chars.right || '│',
      bottom: chars.bottom || '─',
      left: chars.left || '│',
      topLeft: chars.topLeft || '┌',
      topRight: chars.topRight || '┐',
      bottomLeft: chars.bottomLeft || '└',
      bottomRight: chars.bottomRight || '┘',
      ...junctionChars,
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
