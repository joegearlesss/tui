/**
 * Layout Joining and Placement Functions
 *
 * Implementation of Layout.joinHorizontal(), Layout.joinVertical(), and Layout.place()
 * functions as specified in OVERVIEW.internal.md Section 4.
 */

import type { HorizontalPosition, VerticalPosition } from '@tui/styling/types';

/**
 * Options for content placement
 */
export interface PlaceOptions {
  readonly whitespace?: boolean;
  readonly tabWidth?: number;
  readonly whitespaceChars?: string;
  readonly whitespaceStyle?: import('../style/style').StyleProperties;
}

/**
 * Layout utilities for joining and placing content blocks
 */
export namespace Layout {
  /**
   * Joins content blocks horizontally with specified vertical alignment
   * @param align - Vertical alignment ('top' | 'middle' | 'bottom') or numeric position (0.0-1.0)
   * @param blocks - Content blocks to join horizontally
   * @returns Joined content as a single string
   */
  export const joinHorizontal = (
    align: VerticalPosition | number,
    ...blocks: readonly string[]
  ): string => {
    if (blocks.length === 0) return '';
    if (blocks.length === 1) return blocks[0] ?? '';

    // Split each block into lines
    const blockLines = blocks.map((block) => (block ?? '').split('\n'));

    // Find the maximum height
    const maxHeight = Math.max(...blockLines.map((lines) => lines.length));

    // Normalize alignment value
    const alignValue =
      typeof align === 'string'
        ? align === 'top'
          ? 0
          : align === 'middle'
            ? 0.5
            : 1
        : Math.max(0, Math.min(1, align));

    // Pad each block to the same height based on alignment
    const paddedBlocks = blockLines.map((lines) => {
      const height = lines.length;
      const padding = maxHeight - height;

      if (padding === 0) return lines;

      const topPadding = Math.floor(padding * alignValue);
      const bottomPadding = padding - topPadding;

      return [...Array(topPadding).fill(''), ...lines, ...Array(bottomPadding).fill('')];
    });

    // Join lines horizontally
    const result: string[] = [];
    for (let i = 0; i < maxHeight; i++) {
      const line = paddedBlocks.map((block) => block[i] || '').join('');
      result.push(line);
    }

    return result.join('\n');
  };

  /**
   * Joins content blocks vertically with specified horizontal alignment
   * @param align - Horizontal alignment ('left' | 'center' | 'right') or numeric position (0.0-1.0)
   * @param blocks - Content blocks to join vertically
   * @returns Joined content as a single string
   */
  export const joinVertical = (
    align: HorizontalPosition | number,
    ...blocks: readonly string[]
  ): string => {
    if (blocks.length === 0) return '';
    if (blocks.length === 1) return blocks[0] ?? '';

    // Split each block into lines and find max width
    const blockLines = blocks.map((block) => (block ?? '').split('\n'));
    const maxWidth = Math.max(...blockLines.flat().map((line) => getDisplayWidth(line)));

    // Normalize alignment value
    const alignValue =
      typeof align === 'string'
        ? align === 'left'
          ? 0
          : align === 'center'
            ? 0.5
            : 1
        : Math.max(0, Math.min(1, align));

    // Align each line within its block
    const alignedBlocks = blockLines.map((lines) =>
      lines.map((line) => {
        const width = getDisplayWidth(line);
        const padding = maxWidth - width;

        if (padding === 0) return line;

        const leftPadding = Math.round(padding * alignValue);
        const rightPadding = padding - leftPadding;

        return ' '.repeat(leftPadding) + line + ' '.repeat(rightPadding);
      })
    );

    // Join all blocks vertically
    return alignedBlocks.map((lines) => lines.join('\n')).join('\n');
  };

  /**
   * Places content within a box of specified dimensions with alignment
   * @param width - Width of the container box
   * @param height - Height of the container box
   * @param hAlign - Horizontal alignment ('left' | 'center' | 'right') or numeric position
   * @param vAlign - Vertical alignment ('top' | 'middle' | 'bottom') or numeric position
   * @param content - Content to place within the box
   * @param options - Additional placement options
   * @returns Content placed within the specified box dimensions
   */
  export const place = (
    width: number,
    height: number,
    hAlign: HorizontalPosition | number,
    vAlign: VerticalPosition | number,
    content: string,
    options?: PlaceOptions
  ): string => {
    if (width <= 0 || height <= 0) return '';

    const lines = content.split('\n');
    const contentHeight = lines.length;
    const _contentWidth = Math.max(...lines.map((line) => getDisplayWidth(line)));

    // Get whitespace characters and styling
    const whitespaceChars = options?.whitespaceChars || ' ';
    let whitespaceUnit = whitespaceChars;

    // Apply styling to whitespace if provided
    if (options?.whitespaceStyle && whitespaceChars !== ' ') {
      const { Style } = require('../style/style');
      whitespaceUnit = Style.render(options.whitespaceStyle, whitespaceChars);
    }

    // Normalize alignment values
    const hAlignValue =
      typeof hAlign === 'string'
        ? hAlign === 'left'
          ? 0
          : hAlign === 'center'
            ? 0.5
            : 1
        : Math.max(0, Math.min(1, hAlign));

    const vAlignValue =
      typeof vAlign === 'string'
        ? vAlign === 'top'
          ? 0
          : vAlign === 'middle'
            ? 0.5
            : 1
        : Math.max(0, Math.min(1, vAlign));

    // Helper function to repeat whitespace pattern
    const repeatWhitespace = (count: number): string => {
      if (count <= 0) return '';
      if (whitespaceChars === ' ') return ' '.repeat(count);

      // For custom whitespace patterns, repeat the pattern to fill the space
      const pattern = whitespaceUnit;
      const patternLength = getDisplayWidth(whitespaceChars);
      const fullRepeats = Math.floor(count / patternLength);
      const remainder = count % patternLength;

      let result = pattern.repeat(fullRepeats);
      if (remainder > 0) {
        // Add partial pattern for remainder
        result += whitespaceChars.slice(0, remainder);
        if (options?.whitespaceStyle && whitespaceChars !== ' ') {
          const { Style } = require('../style/style');
          const partialPattern = Style.render(
            options.whitespaceStyle,
            whitespaceChars.slice(0, remainder)
          );
          result = pattern.repeat(fullRepeats) + partialPattern;
        }
      }

      return result;
    };

    // Calculate vertical positioning
    const verticalPadding = Math.max(0, height - contentHeight);
    const topPadding = Math.floor(verticalPadding * vAlignValue);
    const bottomPadding = verticalPadding - topPadding;

    // Create the result lines
    const result: string[] = [];

    // Add top padding
    for (let i = 0; i < topPadding; i++) {
      result.push(repeatWhitespace(width));
    }

    // Add content lines with horizontal alignment
    for (const line of lines) {
      const lineWidth = getDisplayWidth(line);
      const horizontalPadding = Math.max(0, width - lineWidth);
      const leftPadding = Math.floor(horizontalPadding * hAlignValue);
      const rightPadding = horizontalPadding - leftPadding;

      const leftPad = repeatWhitespace(leftPadding);
      const rightPad = repeatWhitespace(rightPadding);
      const paddedLine = leftPad + line + rightPad;

      // Ensure exact width by truncating if necessary
      const finalLine =
        getDisplayWidth(paddedLine) > width ? paddedLine.slice(0, width) : paddedLine;
      result.push(finalLine);
    }

    // Add bottom padding
    for (let i = 0; i < bottomPadding; i++) {
      result.push(repeatWhitespace(width));
    }

    return result.slice(0, height).join('\n'); // Ensure exact height
  };
}

/**
 * Text measurement utilities
 */
export namespace Measurement {
  /**
   * Calculates the display width of text (excluding ANSI escape sequences)
   * @param text - Text to measure
   * @returns Display width in characters (max width of all lines)
   */
  export const width = (text: string): number => {
    if (!text) return 0;
    const lines = text.split('\n');
    return Math.max(...lines.map((line) => getDisplayWidth(line)));
  };

  /**
   * Calculates the height of text (number of lines)
   * @param text - Text to measure
   * @returns Height in lines
   */
  export const height = (text: string): number => {
    return text.split('\n').length;
  };

  /**
   * Calculates both width and height of text
   * @param text - Text to measure
   * @returns Tuple of [width, height]
   */
  export const size = (text: string): readonly [number, number] => {
    if (!text) return [0, 1] as const;
    const lines = text.split('\n');
    const textWidth = Math.max(...lines.map((line) => getDisplayWidth(line)));
    const textHeight = lines.length;
    return [textWidth, textHeight] as const;
  };
}

/**
 * Helper function to calculate display width excluding ANSI escape sequences
 * @param text - Text to measure
 * @returns Display width
 */
function getDisplayWidth(text: string): number {
  if (!text) return 0;
  // Remove ANSI escape sequences for accurate width calculation
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  return stripped.length;
}
