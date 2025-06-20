import { AnsiGenerator } from './ansi-generator';
import type { StyleProperties } from '@tui/styling/style/style';
import type { TextAlignment, TextTransform, VerticalAlignment } from '@tui/styling/types';
import { StringUtils } from '@tui/styling/utils';
import { Result } from '@tui/styling/utils/result';

/**
 * Text rendering engine for advanced text formatting and layout
 */

export interface TextRenderOptions {
  readonly width?: number;
  readonly height?: number;
  readonly alignment?: TextAlignment;
  readonly verticalAlignment?: VerticalAlignment;
  readonly wrap?: boolean;
  readonly ellipsis?: string;
  readonly respectTerminalCapabilities?: boolean;
}

export interface TextRenderResult {
  readonly content: string;
  readonly lines: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly ansiBytes: number;
}

/**
 * Text Renderer namespace providing advanced text formatting capabilities
 */
export namespace TextRenderer {

  /**
   * Renders text with comprehensive formatting options
   * @param text - Text content to render
   * @param style - Style properties to apply
   * @param options - Text rendering options
   * @returns Result containing rendered text or error
   */
  export const render = (
    text: string,
    style: StyleProperties,
    options: TextRenderOptions = {}
  ): Result<TextRenderResult, string> => {
    try {
      // Apply text transformations
      let processedText = applyTransforms(text, style.transform);
      
      // Handle width constraints
      if (options.width !== undefined && options.width > 0) {
        processedText = handleWidth(processedText, options.width, options);
      }

      // Split into lines
      const lines = processedText.split('\n');

      // Apply alignment
      const alignedLines = options.alignment 
        ? lines.map(line => alignText(line, options.width || 0, options.alignment!))
        : lines;

      // Apply vertical alignment
      const finalLines = options.height !== undefined 
        ? applyVerticalAlignment(alignedLines, options.height, options.verticalAlignment)
        : alignedLines;

      // Apply ANSI styling to each line
      const styledLines = finalLines.map(line => {
        const renderResult = AnsiGenerator.render(line, style, {
          respectTerminalCapabilities: options.respectTerminalCapabilities
        });
        
        if (Result.isErr(renderResult)) {
          return line; // Fallback to unstyled text
        }
        
        return renderResult.value.content;
      });

      // Calculate final dimensions
      const actualWidth = Math.max(...styledLines.map(line => AnsiGenerator.measureWidth(line)));
      const actualHeight = styledLines.length;

      // Calculate total ANSI bytes
      const totalAnsiBytes = styledLines.reduce((sum, line) => {
        return sum + Buffer.byteLength(line, 'utf8');
      }, 0);

      const result: TextRenderResult = {
        content: styledLines.join('\n'),
        lines: styledLines,
        width: actualWidth,
        height: actualHeight,
        ansiBytes: totalAnsiBytes
      };

      return Result.ok(result);
    } catch (error) {
      return Result.err(`Failed to render text: ${error}`);
    }
  };

  /**
   * Renders text with word wrapping
   * @param text - Text to wrap
   * @param width - Maximum width
   * @param style - Style properties
   * @returns Result containing wrapped text
   */
  export const renderWrapped = (
    text: string,
    width: number,
    style: StyleProperties = {}
  ): Result<TextRenderResult, string> => {
    const options: TextRenderOptions = {
      width,
      wrap: true,
      alignment: style.horizontalAlignment || 'left'
    };

    return render(text, style, options);
  };

  /**
   * Renders text with ellipsis truncation
   * @param text - Text to truncate
   * @param width - Maximum width
   * @param style - Style properties
   * @param ellipsis - Ellipsis string (default: '...')
   * @returns Result containing truncated text
   */
  export const renderTruncated = (
    text: string,
    width: number,
    style: StyleProperties = {},
    ellipsis: string = '...'
  ): Result<TextRenderResult, string> => {
    const options: TextRenderOptions = {
      width,
      wrap: false,
      ellipsis
    };

    return render(text, style, options);
  };

  /**
   * Renders multi-line text with consistent alignment
   * @param lines - Array of text lines
   * @param style - Style properties
   * @param options - Rendering options
   * @returns Result containing aligned multi-line text
   */
  export const renderLines = (
    lines: readonly string[],
    style: StyleProperties = {},
    options: TextRenderOptions = {}
  ): Result<TextRenderResult, string> => {
    const text = lines.join('\n');
    return render(text, style, options);
  };

  /**
   * Renders text with padding
   * @param text - Text to pad
   * @param padding - Padding configuration
   * @param style - Style properties
   * @returns Result containing padded text
   */
  export const renderPadded = (
    text: string,
    padding: { top?: number; right?: number; bottom?: number; left?: number },
    style: StyleProperties = {}
  ): Result<TextRenderResult, string> => {
    try {
      const lines = text.split('\n');
      const maxWidth = Math.max(...lines.map(line => AnsiGenerator.measureWidth(line)));
      
      // Add horizontal padding
      const leftPad = ' '.repeat(padding.left || 0);
      const rightPad = ' '.repeat(padding.right || 0);
      const paddedLines = lines.map(line => leftPad + line + rightPad);

      // Add vertical padding
      const topPadding = Array(padding.top || 0).fill('');
      const bottomPadding = Array(padding.bottom || 0).fill('');
      const allLines = [...topPadding, ...paddedLines, ...bottomPadding];

      return renderLines(allLines, style);
    } catch (error) {
      return Result.err(`Failed to render padded text: ${error}`);
    }
  };

  // Private helper functions

  /**
   * Applies text transformations
   */
  const applyTransforms = (text: string, transform?: TextTransform): string => {
    if (!transform) return text;

    switch (transform) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.replace(/\b\w/g, char => char.toUpperCase());
      default:
        return text;
    }
  };

  /**
   * Handles width constraints with wrapping or truncation
   */
  const handleWidth = (
    text: string,
    width: number,
    options: TextRenderOptions
  ): string => {
    const lines = text.split('\n');
    const processedLines: string[] = [];

    for (const line of lines) {
      const lineWidth = AnsiGenerator.measureWidth(line);
      
      if (lineWidth <= width) {
        processedLines.push(line);
      } else if (options.wrap) {
        // Word wrap
        const wrappedLines = wrapLine(line, width);
        processedLines.push(...wrappedLines);
      } else {
        // Truncate with ellipsis
        const truncated = truncateLine(line, width, options.ellipsis || '...');
        processedLines.push(truncated);
      }
    }

    return processedLines.join('\n');
  };

  /**
   * Wraps a single line to fit within width
   */
  const wrapLine = (line: string, width: number): string[] => {
    if (width <= 0) return [line];

    const words = line.split(' ');
    const wrappedLines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = AnsiGenerator.measureWidth(testLine);

      if (testWidth <= width) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, break it
          wrappedLines.push(...breakWord(word, width));
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }

    return wrappedLines;
  };

  /**
   * Breaks a single word that's too long for the width
   */
  const breakWord = (word: string, width: number): string[] => {
    if (width <= 0) return [word];

    const chars = [...word]; // Handle unicode properly
    const chunks: string[] = [];
    
    for (let i = 0; i < chars.length; i += width) {
      chunks.push(chars.slice(i, i + width).join(''));
    }

    return chunks;
  };

  /**
   * Truncates a line with ellipsis
   */
  const truncateLine = (line: string, width: number, ellipsis: string): string => {
    if (width <= 0) return '';
    
    const ellipsisWidth = AnsiGenerator.measureWidth(ellipsis);
    const availableWidth = width - ellipsisWidth;
    
    if (availableWidth <= 0) {
      return ellipsis.slice(0, width);
    }

    const chars = [...line];
    let truncated = '';
    
    for (const char of chars) {
      if (AnsiGenerator.measureWidth(truncated + char) > availableWidth) {
        break;
      }
      truncated += char;
    }

    return truncated + ellipsis;
  };

  /**
   * Aligns text within a given width
   */
  const alignText = (text: string, width: number, alignment: TextAlignment): string => {
    if (width <= 0) return text;
    
    const textWidth = AnsiGenerator.measureWidth(text);
    
    if (textWidth >= width) return text;
    
    const padding = width - textWidth;
    
    switch (alignment) {
      case 'left':
        return text + ' '.repeat(padding);
      case 'right':
        return ' '.repeat(padding) + text;
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      default:
        return text;
    }
  };

  /**
   * Applies vertical alignment to an array of lines
   */
  const applyVerticalAlignment = (
    lines: readonly string[],
    height: number,
    alignment?: VerticalAlignment
  ): string[] => {
    if (height <= 0 || lines.length >= height) return [...lines];
    
    const padding = height - lines.length;
    const emptyLine = '';
    
    switch (alignment) {
      case 'top':
        return [...lines, ...Array(padding).fill(emptyLine)];
      case 'bottom':
        return [...Array(padding).fill(emptyLine), ...lines];
      case 'middle':
        const topPad = Math.floor(padding / 2);
        const bottomPad = padding - topPad;
        return [
          ...Array(topPad).fill(emptyLine),
          ...lines,
          ...Array(bottomPad).fill(emptyLine)
        ];
      default:
        return [...lines, ...Array(padding).fill(emptyLine)];
    }
  };
}