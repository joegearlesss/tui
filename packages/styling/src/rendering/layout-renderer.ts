import { TextRenderer } from './text-renderer';
import { AnsiGenerator } from './ansi-generator';
import type { StyleProperties } from '@tui/styling/style/style';
import type { HorizontalPosition, VerticalPosition, TextAlignment } from '@tui/styling/types';
import { Result } from '@tui/styling/utils/result';

/**
 * Layout rendering engine for positioning and composition
 */

export interface LayoutDimensions {
  readonly width: number;
  readonly height: number;
}

export interface LayoutPosition {
  readonly x: number;
  readonly y: number;
}

export interface LayoutBox {
  readonly position: LayoutPosition;
  readonly dimensions: LayoutDimensions;
  readonly content: string;
  readonly style?: StyleProperties;
}

export interface JoinOptions {
  readonly separator?: string;
  readonly alignment?: TextAlignment;
  readonly spacing?: number;
}

/**
 * Layout Renderer namespace providing composition and positioning utilities
 */
export namespace LayoutRenderer {

  /**
   * Joins multiple content blocks horizontally
   * @param blocks - Array of content blocks to join
   * @param options - Join options
   * @returns Result containing joined content or error
   */
  export const joinHorizontal = (
    blocks: readonly string[],
    options: JoinOptions = {}
  ): Result<string, string> => {
    try {
      const { separator = '', spacing = 0 } = options;
      
      if (blocks.length === 0) {
        return Result.ok('');
      }

      if (blocks.length === 1) {
        return Result.ok(blocks[0]);
      }

      // Split each block into lines
      const blockLines = blocks.map(block => block.split('\n'));
      const maxLines = Math.max(...blockLines.map(lines => lines.length));
      
      // Normalize all blocks to have the same number of lines
      const normalizedBlocks = blockLines.map(lines => {
        const blockWidth = Math.max(...lines.map(line => AnsiGenerator.measureWidth(line)));
        const paddedLines = [...lines];
        
        // Pad to same height
        while (paddedLines.length < maxLines) {
          paddedLines.push(' '.repeat(blockWidth));
        }
        
        return { lines: paddedLines, width: blockWidth };
      });

      // Join lines horizontally
      const resultLines: string[] = [];
      for (let i = 0; i < maxLines; i++) {
        const lineParts: string[] = [];
        
        for (let j = 0; j < normalizedBlocks.length; j++) {
          const block = normalizedBlocks[j];
          let line = block.lines[i] || '';
          
          // Pad line to block width for consistent alignment
          const lineWidth = AnsiGenerator.measureWidth(line);
          if (lineWidth < block.width) {
            line += ' '.repeat(block.width - lineWidth);
          }
          
          lineParts.push(line);
        }
        
        // Join with separator and spacing
        const spacer = ' '.repeat(spacing);
        const joinedLine = lineParts.join(separator + spacer);
        resultLines.push(joinedLine);
      }

      return Result.ok(resultLines.join('\n'));
    } catch (error) {
      return Result.err(`Failed to join horizontally: ${error}`);
    }
  };

  /**
   * Joins multiple content blocks vertically
   * @param blocks - Array of content blocks to join
   * @param options - Join options
   * @returns Result containing joined content or error
   */
  export const joinVertical = (
    blocks: readonly string[],
    options: JoinOptions = {}
  ): Result<string, string> => {
    try {
      const { separator = '', alignment = 'left', spacing = 0 } = options;
      
      if (blocks.length === 0) {
        return Result.ok('');
      }

      if (blocks.length === 1) {
        return Result.ok(blocks[0]);
      }

      // Calculate maximum width for alignment
      const blockLines = blocks.map(block => block.split('\n'));
      const allLines = blockLines.flat();
      const maxWidth = Math.max(...allLines.map(line => AnsiGenerator.measureWidth(line)));

      // Align and join blocks
      const resultParts: string[] = [];
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const lines = block.split('\n');
        
        // Align each line within the block
        const alignedLines = lines.map(line => alignLine(line, maxWidth, alignment));
        const alignedBlock = alignedLines.join('\n');
        
        resultParts.push(alignedBlock);
        
        // Add separator and spacing (except for the last block)
        if (i < blocks.length - 1) {
          if (separator) {
            resultParts.push(separator);
          }
          if (spacing > 0) {
            resultParts.push('\n'.repeat(spacing));
          }
        }
      }

      return Result.ok(resultParts.join('\n'));
    } catch (error) {
      return Result.err(`Failed to join vertically: ${error}`);
    }
  };

  /**
   * Positions content at specific coordinates within a canvas
   * @param content - Content to position
   * @param position - Target position
   * @param canvasDimensions - Canvas dimensions
   * @returns Result containing positioned content or error
   */
  export const placeAt = (
    content: string,
    position: LayoutPosition,
    canvasDimensions: LayoutDimensions
  ): Result<string, string> => {
    try {
      const { x, y } = position;
      const { width: canvasWidth, height: canvasHeight } = canvasDimensions;
      
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) {
        return Result.err(`Position (${x}, ${y}) is outside canvas bounds (${canvasWidth}x${canvasHeight})`);
      }

      // Create canvas filled with spaces
      const canvas: string[][] = Array(canvasHeight)
        .fill(null)
        .map(() => Array(canvasWidth).fill(' '));

      // Split content into lines and place on canvas
      const contentLines = content.split('\n');
      
      for (let lineIndex = 0; lineIndex < contentLines.length; lineIndex++) {
        const targetY = y + lineIndex;
        if (targetY >= canvasHeight) break;
        
        const line = contentLines[lineIndex];
        const chars = [...line]; // Handle unicode properly
        
        for (let charIndex = 0; charIndex < chars.length; charIndex++) {
          const targetX = x + charIndex;
          if (targetX >= canvasWidth) break;
          
          canvas[targetY][targetX] = chars[charIndex];
        }
      }

      // Convert canvas back to string
      const result = canvas.map(row => row.join('')).join('\n');
      return Result.ok(result);
    } catch (error) {
      return Result.err(`Failed to place content: ${error}`);
    }
  };

  /**
   * Creates a layout box with content and positioning information
   * @param content - Content for the box
   * @param position - Box position
   * @param style - Optional style properties
   * @returns Layout box
   */
  export const createBox = (
    content: string,
    position: LayoutPosition,
    style?: StyleProperties
  ): LayoutBox => {
    const lines = content.split('\n');
    const width = Math.max(...lines.map(line => AnsiGenerator.measureWidth(line)));
    const height = lines.length;

    return {
      position,
      dimensions: { width, height },
      content,
      style
    };
  };

  /**
   * Renders multiple layout boxes onto a canvas
   * @param boxes - Array of layout boxes to render
   * @param canvasDimensions - Canvas dimensions
   * @returns Result containing rendered canvas or error
   */
  export const renderBoxes = (
    boxes: readonly LayoutBox[],
    canvasDimensions: LayoutDimensions
  ): Result<string, string> => {
    try {
      // Create empty canvas
      const { width: canvasWidth, height: canvasHeight } = canvasDimensions;
      const canvas: string[][] = Array(canvasHeight)
        .fill(null)
        .map(() => Array(canvasWidth).fill(' '));

      // Render each box onto the canvas
      for (const box of boxes) {
        const { position, content, style } = box;
        
        // Apply style if provided
        let styledContent = content;
        if (style) {
          const renderResult = TextRenderer.render(content, style);
          if (Result.isOk(renderResult)) {
            styledContent = renderResult.value.content;
          }
        }
        
        // Place content on canvas
        const lines = styledContent.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const targetY = position.y + lineIndex;
          if (targetY < 0 || targetY >= canvasHeight) continue;
          
          const line = lines[lineIndex];
          const chars = [...line];
          
          for (let charIndex = 0; charIndex < chars.length; charIndex++) {
            const targetX = position.x + charIndex;
            if (targetX < 0 || targetX >= canvasWidth) continue;
            
            canvas[targetY][targetX] = chars[charIndex];
          }
        }
      }

      // Convert canvas to string
      const result = canvas.map(row => row.join('')).join('\n');
      return Result.ok(result);
    } catch (error) {
      return Result.err(`Failed to render boxes: ${error}`);
    }
  };

  /**
   * Calculates optimal layout for multiple boxes with automatic positioning
   * @param contents - Array of content strings
   * @param canvasDimensions - Available canvas space
   * @param layout - Layout strategy ('horizontal' | 'vertical' | 'grid')
   * @returns Result containing positioned boxes or error
   */
  export const autoLayout = (
    contents: readonly string[],
    canvasDimensions: LayoutDimensions,
    layout: 'horizontal' | 'vertical' | 'grid' = 'vertical'
  ): Result<readonly LayoutBox[], string> => {
    try {
      if (contents.length === 0) {
        return Result.ok([]);
      }

      const boxes: LayoutBox[] = [];
      
      switch (layout) {
        case 'horizontal':
          return layoutHorizontal(contents, canvasDimensions);
        case 'vertical':
          return layoutVertical(contents, canvasDimensions);
        case 'grid':
          return layoutGrid(contents, canvasDimensions);
        default:
          return Result.err(`Unknown layout strategy: ${layout}`);
      }
    } catch (error) {
      return Result.err(`Failed to auto-layout: ${error}`);
    }
  };

  // Private helper functions

  /**
   * Aligns a line within a given width
   */
  const alignLine = (line: string, width: number, alignment: TextAlignment): string => {
    const lineWidth = AnsiGenerator.measureWidth(line);
    
    if (lineWidth >= width) return line;
    
    const padding = width - lineWidth;
    
    switch (alignment) {
      case 'left':
        return line + ' '.repeat(padding);
      case 'right':
        return ' '.repeat(padding) + line;
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + line + ' '.repeat(rightPad);
      default:
        return line;
    }
  };

  /**
   * Layouts content horizontally
   */
  const layoutHorizontal = (
    contents: readonly string[],
    canvasDimensions: LayoutDimensions
  ): Result<readonly LayoutBox[], string> => {
    const boxes: LayoutBox[] = [];
    let currentX = 0;
    
    for (const content of contents) {
      const lines = content.split('\n');
      const contentWidth = Math.max(...lines.map(line => AnsiGenerator.measureWidth(line)));
      
      if (currentX + contentWidth > canvasDimensions.width) {
        break; // No more space
      }
      
      boxes.push(createBox(content, { x: currentX, y: 0 }));
      currentX += contentWidth + 1; // Add spacing
    }
    
    return Result.ok(boxes);
  };

  /**
   * Layouts content vertically
   */
  const layoutVertical = (
    contents: readonly string[],
    canvasDimensions: LayoutDimensions
  ): Result<readonly LayoutBox[], string> => {
    const boxes: LayoutBox[] = [];
    let currentY = 0;
    
    for (const content of contents) {
      const contentHeight = content.split('\n').length;
      
      if (currentY + contentHeight > canvasDimensions.height) {
        break; // No more space
      }
      
      boxes.push(createBox(content, { x: 0, y: currentY }));
      currentY += contentHeight + 1; // Add spacing
    }
    
    return Result.ok(boxes);
  };

  /**
   * Layouts content in a grid
   */
  const layoutGrid = (
    contents: readonly string[],
    canvasDimensions: LayoutDimensions
  ): Result<readonly LayoutBox[], string> => {
    const boxes: LayoutBox[] = [];
    
    // Calculate grid dimensions
    const cols = Math.floor(Math.sqrt(contents.length));
    const rows = Math.ceil(contents.length / cols);
    
    const cellWidth = Math.floor(canvasDimensions.width / cols);
    const cellHeight = Math.floor(canvasDimensions.height / rows);
    
    for (let i = 0; i < contents.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      if (y + cellHeight <= canvasDimensions.height) {
        boxes.push(createBox(contents[i], { x, y }));
      }
    }
    
    return Result.ok(boxes);
  };
}