import { LayoutRenderer } from './layout-renderer';
import { TextRenderer } from './text-renderer';
import { AnsiGenerator } from './ansi-generator';
import type { StyleProperties } from '@tui/styling/style/style';
import type { TextAlignment, VerticalAlignment } from '@tui/styling/types';
import { Result } from '@tui/styling/utils/result';

/**
 * Enhanced Layout System
 * Integrates with the rendering engine for advanced layout operations
 */

export interface EnhancedJoinOptions {
  readonly separator?: string;
  readonly spacing?: number;
  readonly alignment?: TextAlignment | VerticalAlignment;
  readonly style?: StyleProperties;
  readonly respectTerminalCapabilities?: boolean;
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface LayoutBlock {
  readonly content: string;
  readonly style?: StyleProperties;
  readonly width?: number;
  readonly height?: number;
  readonly weight?: number; // For flexible sizing
}

export interface LayoutResult {
  readonly content: string;
  readonly width: number;
  readonly height: number;
  readonly blocks: readonly LayoutBlock[];
}

/**
 * Enhanced Layout namespace providing advanced layout operations
 */
export namespace EnhancedLayout {

  /**
   * Joins content blocks horizontally with enhanced styling and spacing options
   * @param blocks - Array of layout blocks to join
   * @param options - Enhanced join options
   * @returns Result containing joined layout or error
   */
  export const joinHorizontal = (
    blocks: readonly LayoutBlock[],
    options: EnhancedJoinOptions = {}
  ): Result<LayoutResult, string> => {
    try {
      if (blocks.length === 0) {
        return Result.ok({
          content: '',
          width: 0,
          height: 0,
          blocks: []
        });
      }

      if (blocks.length === 1) {
        const block = blocks[0];
        const styledResult = applyBlockStyle(block, options);
        if (Result.isErr(styledResult)) {
          return styledResult;
        }

        const { width, height } = measureBlock(block.content);
        return Result.ok({
          content: styledResult.value,
          width,
          height,
          blocks
        });
      }

      // Apply styles to all blocks
      const styledBlocks: string[] = [];
      for (const block of blocks) {
        const styledResult = applyBlockStyle(block, options);
        if (Result.isErr(styledResult)) {
          return styledResult;
        }
        styledBlocks.push(styledResult.value);
      }

      // Use the layout renderer for joining
      const joinResult = LayoutRenderer.joinHorizontal(styledBlocks, {
        separator: options.separator,
        spacing: options.spacing,
        alignment: options.alignment as TextAlignment
      });

      if (Result.isErr(joinResult)) {
        return joinResult;
      }

      // Calculate original dimensions from unstiled blocks for accurate measurement
      const originalContent = blocks.map(b => b.content);
      const originalJoinResult = LayoutRenderer.joinHorizontal(originalContent, {
        separator: options.separator,
        spacing: options.spacing,
        alignment: options.alignment as TextAlignment
      });
      
      const { width, height } = Result.isOk(originalJoinResult) 
        ? measureBlock(originalJoinResult.value)
        : measureBlock(joinResult.value);
      
      return Result.ok({
        content: joinResult.value,
        width,
        height,
        blocks
      });
    } catch (error) {
      return Result.err(`Failed to join horizontally: ${error}`);
    }
  };

  /**
   * Joins content blocks vertically with enhanced styling and spacing options
   * @param blocks - Array of layout blocks to join
   * @param options - Enhanced join options
   * @returns Result containing joined layout or error
   */
  export const joinVertical = (
    blocks: readonly LayoutBlock[],
    options: EnhancedJoinOptions = {}
  ): Result<LayoutResult, string> => {
    try {
      if (blocks.length === 0) {
        return Result.ok({
          content: '',
          width: 0,
          height: 0,
          blocks: []
        });
      }

      if (blocks.length === 1) {
        const block = blocks[0];
        const styledResult = applyBlockStyle(block, options);
        if (Result.isErr(styledResult)) {
          return styledResult;
        }

        const { width, height } = measureBlock(block.content);
        return Result.ok({
          content: styledResult.value,
          width,
          height,
          blocks
        });
      }

      // Apply styles to all blocks
      const styledBlocks: string[] = [];
      for (const block of blocks) {
        const styledResult = applyBlockStyle(block, options);
        if (Result.isErr(styledResult)) {
          return styledResult;
        }
        styledBlocks.push(styledResult.value);
      }

      // Use the layout renderer for joining
      const joinResult = LayoutRenderer.joinVertical(styledBlocks, {
        separator: options.separator,
        spacing: options.spacing,
        alignment: options.alignment as TextAlignment
      });

      if (Result.isErr(joinResult)) {
        return joinResult;
      }

      // Calculate original dimensions from unstiled blocks for accurate measurement
      const originalContent = blocks.map(b => b.content);
      const originalJoinResult = LayoutRenderer.joinVertical(originalContent, {
        separator: options.separator,
        spacing: options.spacing,
        alignment: options.alignment as TextAlignment
      });
      
      const { width, height } = Result.isOk(originalJoinResult) 
        ? measureBlock(originalJoinResult.value)
        : measureBlock(joinResult.value);
      
      return Result.ok({
        content: joinResult.value,
        width,
        height,
        blocks
      });
    } catch (error) {
      return Result.err(`Failed to join vertically: ${error}`);
    }
  };

  /**
   * Creates a grid layout from blocks
   * @param blocks - Array of layout blocks
   * @param columns - Number of columns in the grid
   * @param options - Layout options
   * @returns Result containing grid layout or error
   */
  export const grid = (
    blocks: readonly LayoutBlock[],
    columns: number,
    options: EnhancedJoinOptions = {}
  ): Result<LayoutResult, string> => {
    try {
      if (columns <= 0) {
        return Result.err('Grid columns must be greater than 0');
      }

      if (blocks.length === 0) {
        return Result.ok({
          content: '',
          width: 0,
          height: 0,
          blocks: []
        });
      }

      // Group blocks into rows
      const rows: LayoutBlock[][] = [];
      for (let i = 0; i < blocks.length; i += columns) {
        rows.push(blocks.slice(i, i + columns));
      }

      // Create horizontal layouts for each row
      const rowResults: LayoutResult[] = [];
      for (const row of rows) {
        const rowResult = joinHorizontal(row, options);
        if (Result.isErr(rowResult)) {
          return rowResult;
        }
        rowResults.push(rowResult.value);
      }

      // Join rows vertically
      const rowBlocks: LayoutBlock[] = rowResults.map(row => ({
        content: row.content,
        width: row.width,
        height: row.height
      }));

      return joinVertical(rowBlocks, options);
    } catch (error) {
      return Result.err(`Failed to create grid: ${error}`);
    }
  };

  /**
   * Creates a flexible layout with weighted distribution
   * @param blocks - Array of layout blocks with weights
   * @param direction - Layout direction ('horizontal' | 'vertical')
   * @param totalSize - Total size to distribute
   * @param options - Layout options
   * @returns Result containing flexible layout or error
   */
  export const flexible = (
    blocks: readonly LayoutBlock[],
    direction: 'horizontal' | 'vertical',
    totalSize: number,
    options: EnhancedJoinOptions = {}
  ): Result<LayoutResult, string> => {
    try {
      if (blocks.length === 0 || totalSize <= 0) {
        return Result.ok({
          content: '',
          width: 0,
          height: 0,
          blocks: []
        });
      }

      // Calculate total weight
      const totalWeight = blocks.reduce((sum, block) => sum + (block.weight || 1), 0);

      // Calculate sizes for each block
      const sizedBlocks: LayoutBlock[] = blocks.map(block => {
        const weight = block.weight || 1;
        const blockSize = Math.floor((weight / totalWeight) * totalSize);
        
        if (direction === 'horizontal') {
          return {
            ...block,
            width: blockSize,
            height: block.height
          };
        } else {
          return {
            ...block,
            width: block.width,
            height: blockSize
          };
        }
      });

      // Apply sizing constraints and render blocks
      const constrainedBlocks: LayoutBlock[] = [];
      for (const block of sizedBlocks) {
        const constrainedResult = applyConstraints(block, options);
        if (Result.isErr(constrainedResult)) {
          return constrainedResult;
        }
        constrainedBlocks.push(constrainedResult.value);
      }

      // Join blocks in the specified direction
      if (direction === 'horizontal') {
        return joinHorizontal(constrainedBlocks, options);
      } else {
        return joinVertical(constrainedBlocks, options);
      }
    } catch (error) {
      return Result.err(`Failed to create flexible layout: ${error}`);
    }
  };

  /**
   * Creates a tabular layout with aligned columns
   * @param rows - Array of row data
   * @param columnWidths - Array of column widths (or 'auto')
   * @param options - Layout options
   * @returns Result containing table layout or error
   */
  export const table = (
    rows: readonly (readonly LayoutBlock[])[],
    columnWidths: readonly (number | 'auto')[],
    options: EnhancedJoinOptions = {}
  ): Result<LayoutResult, string> => {
    try {
      if (rows.length === 0) {
        return Result.ok({
          content: '',
          width: 0,
          height: 0,
          blocks: []
        });
      }

      // Calculate auto column widths
      const calculatedWidths = columnWidths.map((width, colIndex) => {
        if (width !== 'auto') return width;
        
        // Find maximum width for this column
        let maxWidth = 0;
        for (const row of rows) {
          if (row[colIndex]) {
            const { width: blockWidth } = measureBlock(row[colIndex].content);
            maxWidth = Math.max(maxWidth, blockWidth);
          }
        }
        return maxWidth;
      });

      // Create rows with properly sized columns
      const tableRows: LayoutBlock[] = [];
      for (const row of rows) {
        const paddedCells: LayoutBlock[] = row.map((cell, colIndex) => {
          const targetWidth = calculatedWidths[colIndex] || 0;
          
          // Pad or truncate cell content to target width
          const cellResult = TextRenderer.render(cell.content, cell.style || {}, {
            width: targetWidth,
            alignment: 'left'
          });

          if (Result.isErr(cellResult)) {
            return cell; // Fallback to original cell
          }

          return {
            ...cell,
            content: cellResult.value.content,
            width: targetWidth
          };
        });

        const rowResult = joinHorizontal(paddedCells, {
          ...options,
          separator: options.separator || ' '
        });

        if (Result.isOk(rowResult)) {
          tableRows.push({
            content: rowResult.value.content,
            width: rowResult.value.width,
            height: rowResult.value.height
          });
        }
      }

      // Join all rows vertically
      return joinVertical(tableRows, options);
    } catch (error) {
      return Result.err(`Failed to create table: ${error}`);
    }
  };

  // Helper functions

  /**
   * Applies styling to a layout block
   */
  const applyBlockStyle = (
    block: LayoutBlock,
    options: EnhancedJoinOptions
  ): Result<string, string> => {
    if (!block.style && !options.style) {
      return Result.ok(block.content);
    }

    const combinedStyle = { ...options.style, ...block.style };
    const renderResult = TextRenderer.render(block.content, combinedStyle, {
      respectTerminalCapabilities: options.respectTerminalCapabilities
    });

    return Result.map(renderResult, result => result.content);
  };

  /**
   * Measures a block's dimensions
   */
  const measureBlock = (content: string): { width: number; height: number } => {
    const width = AnsiGenerator.measureWidth(content);
    const height = AnsiGenerator.measureHeight(content);
    return { width, height };
  };

  /**
   * Applies size constraints to a block
   */
  const applyConstraints = (
    block: LayoutBlock,
    options: EnhancedJoinOptions
  ): Result<LayoutBlock, string> => {
    try {
      let content = block.content;
      let { width, height } = measureBlock(content);

      // Apply width constraints
      if (options.minWidth && width < options.minWidth) {
        const padding = options.minWidth - width;
        content = content.split('\n').map(line => 
          line + ' '.repeat(padding)
        ).join('\n');
        width = options.minWidth;
      }

      if (options.maxWidth && width > options.maxWidth) {
        const renderResult = TextRenderer.renderTruncated(
          content, 
          options.maxWidth, 
          block.style || {}
        );
        if (Result.isOk(renderResult)) {
          content = renderResult.value.content;
          width = Math.min(width, options.maxWidth);
        }
      }

      // Apply height constraints
      const lines = content.split('\n');
      if (options.minHeight && height < options.minHeight) {
        const paddingLines = options.minHeight - height;
        content = [...lines, ...Array(paddingLines).fill('')].join('\n');
        height = options.minHeight;
      }

      if (options.maxHeight && height > options.maxHeight) {
        content = lines.slice(0, options.maxHeight).join('\n');
        height = Math.min(height, options.maxHeight);
      }

      return Result.ok({
        ...block,
        content,
        width,
        height
      });
    } catch (error) {
      return Result.err(`Failed to apply constraints: ${error}`);
    }
  };
}