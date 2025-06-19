/**
 * Border Rendering
 *
 * Provides functions for rendering borders around content using ANSI characters.
 * Handles border drawing, content placement, and proper spacing.
 */

import type { BorderConfig } from './types';

/**
 * Border rendering options for customizing output
 */
export interface BorderRenderOptions {
  /** Minimum width of the bordered content area */
  readonly minWidth?: number;
  /** Minimum height of the bordered content area */
  readonly minHeight?: number;
  /** Padding inside the border */
  readonly padding?: number;
  /** Whether to trim whitespace from content */
  readonly trimContent?: boolean;
}

/**
 * Information about rendered border dimensions
 */
export interface BorderDimensions {
  /** Total width including border */
  readonly totalWidth: number;
  /** Total height including border */
  readonly totalHeight: number;
  /** Content area width (excluding border) */
  readonly contentWidth: number;
  /** Content area height (excluding border) */
  readonly contentHeight: number;
  /** Whether border has visible top side */
  readonly hasTop: boolean;
  /** Whether border has visible right side */
  readonly hasRight: boolean;
  /** Whether border has visible bottom side */
  readonly hasBottom: boolean;
  /** Whether border has visible left side */
  readonly hasLeft: boolean;
}

/**
 * Border rendering functions following functional programming principles
 */
export namespace BorderRender {
  /**
   * Renders a border around the given content
   * @param border - Border configuration to use
   * @param content - Content to surround with border
   * @param options - Optional rendering configuration
   * @returns String with content surrounded by border
   */
  export const render = (
    border: BorderConfig,
    content: string,
    options: BorderRenderOptions = {}
  ): string => {
    const { minWidth = 0, minHeight = 0, padding = 0, trimContent = false } = options;

    // Process content
    const processedContent = trimContent ? content.trim() : content;
    const contentLines = processedContent.split('\n');

    // Calculate dimensions
    const dimensions = calculateDimensions(border, contentLines, minWidth, minHeight, padding);

    // Build the bordered content
    const lines: string[] = [];

    // Top border
    if (dimensions.hasTop) {
      lines.push(renderTopBorder(border, dimensions));
    }

    // Content with side borders
    const paddedContentLines = padContentLines(contentLines, dimensions, padding);
    for (const line of paddedContentLines) {
      lines.push(renderContentLine(border, line, dimensions));
    }

    // Bottom border
    if (dimensions.hasBottom) {
      lines.push(renderBottomBorder(border, dimensions));
    }

    return lines.join('\n');
  };

  /**
   * Calculates the dimensions needed for rendering a border
   * @param border - Border configuration
   * @param contentLines - Lines of content to be bordered
   * @param minWidth - Minimum content width
   * @param minHeight - Minimum content height
   * @param padding - Internal padding
   * @returns BorderDimensions with calculated sizes
   */
  export const calculateDimensions = (
    border: BorderConfig,
    contentLines: readonly string[],
    minWidth = 0,
    minHeight = 0,
    padding = 0
  ): BorderDimensions => {
    const [hasTop, hasRight, hasBottom, hasLeft] = border.sides;

    // Calculate content dimensions
    const maxContentLineWidth = Math.max(
      minWidth,
      ...contentLines.map((line) => getDisplayWidth(line))
    );
    const contentHeight = Math.max(minHeight, contentLines.length);

    // Add padding to content dimensions
    const paddedContentWidth = maxContentLineWidth + padding * 2;
    const paddedContentHeight = contentHeight + padding * 2;

    // Calculate total dimensions including borders
    const totalWidth = paddedContentWidth + (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
    const totalHeight = paddedContentHeight + (hasTop ? 1 : 0) + (hasBottom ? 1 : 0);

    return {
      totalWidth,
      totalHeight,
      contentWidth: paddedContentWidth,
      contentHeight: paddedContentHeight,
      hasTop,
      hasRight,
      hasBottom,
      hasLeft,
    };
  };

  /**
   * Renders the top border line
   * @param border - Border configuration
   * @param dimensions - Calculated border dimensions
   * @returns Top border line string
   */
  const renderTopBorder = (border: BorderConfig, dimensions: BorderDimensions): string => {
    const { chars } = border;
    const { contentWidth, hasLeft, hasRight } = dimensions;

    let line = '';

    // Left corner
    if (hasLeft) {
      line += chars.topLeft;
    }

    // Top line
    line += chars.top.repeat(contentWidth);

    // Right corner
    if (hasRight) {
      line += chars.topRight;
    }

    return line;
  };

  /**
   * Renders the bottom border line
   * @param border - Border configuration
   * @param dimensions - Calculated border dimensions
   * @returns Bottom border line string
   */
  const renderBottomBorder = (border: BorderConfig, dimensions: BorderDimensions): string => {
    const { chars } = border;
    const { contentWidth, hasLeft, hasRight } = dimensions;

    let line = '';

    // Left corner
    if (hasLeft) {
      line += chars.bottomLeft;
    }

    // Bottom line
    line += chars.bottom.repeat(contentWidth);

    // Right corner
    if (hasRight) {
      line += chars.bottomRight;
    }

    return line;
  };

  /**
   * Renders a content line with side borders
   * @param border - Border configuration
   * @param contentLine - Content line to render
   * @param dimensions - Calculated border dimensions
   * @returns Content line with side borders
   */
  const renderContentLine = (
    border: BorderConfig,
    contentLine: string,
    dimensions: BorderDimensions
  ): string => {
    const { chars } = border;
    const { contentWidth, hasLeft, hasRight } = dimensions;

    let line = '';

    // Left border
    if (hasLeft) {
      line += chars.left;
    }

    // Content with padding to fill width
    const paddedContent = padLine(contentLine, contentWidth);
    line += paddedContent;

    // Right border
    if (hasRight) {
      line += chars.right;
    }

    return line;
  };

  /**
   * Pads content lines to ensure proper height and applies internal padding
   * @param contentLines - Original content lines
   * @param dimensions - Calculated border dimensions
   * @param padding - Internal padding amount
   * @returns Padded content lines
   */
  const padContentLines = (
    contentLines: readonly string[],
    dimensions: BorderDimensions,
    padding: number
  ): readonly string[] => {
    const lines: string[] = [];

    // Top padding
    for (let i = 0; i < padding; i++) {
      lines.push('');
    }

    // Content lines
    for (const line of contentLines) {
      lines.push(' '.repeat(padding) + line);
    }

    // Fill remaining height
    const remainingHeight = dimensions.contentHeight - lines.length - padding;
    for (let i = 0; i < remainingHeight; i++) {
      lines.push('');
    }

    // Bottom padding
    for (let i = 0; i < padding; i++) {
      lines.push('');
    }

    return lines;
  };

  /**
   * Pads a line to the specified width
   * @param line - Line to pad
   * @param targetWidth - Target width
   * @returns Padded line
   */
  const padLine = (line: string, targetWidth: number): string => {
    const currentWidth = getDisplayWidth(line);
    const paddingNeeded = Math.max(0, targetWidth - currentWidth);
    return line + ' '.repeat(paddingNeeded);
  };

  /**
   * Gets the display width of a string (accounting for ANSI escape sequences)
   * @param text - Text to measure
   * @returns Display width in characters
   */
  const getDisplayWidth = (text: string): number => {
    // Remove ANSI escape sequences for width calculation
    const cleanText = text.replace(/\u001b\[[0-9;]*m/g, '');
    return cleanText.length;
  };

  /**
   * Creates a simple box around content using the specified border
   * @param border - Border configuration
   * @param content - Content to box
   * @returns Boxed content string
   */
  export const box = (border: BorderConfig, content: string): string => {
    return render(border, content);
  };

  /**
   * Creates a box with padding around content
   * @param border - Border configuration
   * @param content - Content to box
   * @param padding - Internal padding amount
   * @returns Boxed content with padding
   */
  export const boxWithPadding = (
    border: BorderConfig,
    content: string,
    padding: number
  ): string => {
    return render(border, content, { padding });
  };

  /**
   * Creates a box with minimum dimensions
   * @param border - Border configuration
   * @param content - Content to box
   * @param minWidth - Minimum content width
   * @param minHeight - Minimum content height
   * @returns Boxed content with minimum dimensions
   */
  export const boxWithMinSize = (
    border: BorderConfig,
    content: string,
    minWidth: number,
    minHeight: number
  ): string => {
    return render(border, content, { minWidth, minHeight });
  };
}
