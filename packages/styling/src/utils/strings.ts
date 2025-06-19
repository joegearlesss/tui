import { z } from 'zod';

/**
 * String manipulation utilities for terminal text processing
 * Provides functions for text width calculation, truncation, padding, and formatting
 */

// Validation schemas
const StringUtilsSchema = z
  .object({
    text: z.string().describe('Input text to process'),
    width: z
      .number()
      .int('Width must be an integer')
      .min(0, 'Width must be non-negative')
      .describe('Target width for text operations'),
    char: z
      .string()
      .length(1, 'Character must be exactly one character')
      .describe('Character to use for padding or filling'),
  })
  .describe('String utility operation parameters');

const TruncateOptionsSchema = z
  .object({
    ellipsis: z
      .string()
      .optional()
      .describe('String to append when text is truncated (default: "...")'),
    position: z
      .enum(['end', 'middle', 'start'])
      .optional()
      .describe('Where to truncate the text (default: "end")'),
  })
  .describe('Options for text truncation');

const WrapOptionsSchema = z
  .object({
    breakWords: z
      .boolean()
      .optional()
      .describe('Whether to break words that exceed line width (default: false)'),
    indent: z.string().optional().describe('String to prepend to each wrapped line (default: "")'),
  })
  .describe('Options for text wrapping');

// Types
type TruncateOptions = z.infer<typeof TruncateOptionsSchema>;
type WrapOptions = z.infer<typeof WrapOptionsSchema>;

/**
 * String manipulation utilities namespace
 * Provides pure functions for text processing in terminal environments
 */
namespace StringUtils {
  /**
   * Calculates the display width of a string, accounting for ANSI escape sequences and wide characters
   * @param text - Text to measure
   * @returns Display width in terminal columns
   */
  export const displayWidth = (text: string): number => {
    // Remove ANSI escape sequences
    const cleanText = text.replace(/\u001b\[[0-9;]*m/g, '');

    let width = 0;
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const code = char.codePointAt(0);

      if (code === undefined) continue;

      // Handle wide characters (CJK, emojis, etc.)
      if (isWideCharacter(code)) {
        width += 2;
      } else if (isControlCharacter(code)) {
        // Control characters don't take up display space
        width += 0;
      } else {
        width += 1;
      }
    }

    return width;
  };

  /**
   * Truncates text to fit within specified width
   * @param text - Text to truncate
   * @param width - Maximum width
   * @param options - Truncation options
   * @returns Truncated text
   */
  export const truncate = (text: string, width: number, options: TruncateOptions = {}): string => {
    const { ellipsis = '...', position = 'end' } = options;

    if (displayWidth(text) <= width) {
      return text;
    }

    const ellipsisWidth = displayWidth(ellipsis);
    const availableWidth = width - ellipsisWidth;

    if (availableWidth <= 0) {
      return width === 0 ? '' : ellipsis.slice(0, width);
    }

    switch (position) {
      case 'start':
        return ellipsis + truncateFromStart(text, availableWidth);
      case 'middle': {
        const halfWidth = Math.floor(availableWidth / 2);
        const startPart = truncateFromEnd(text, halfWidth);
        const remainingWidth = availableWidth - displayWidth(startPart);
        const endPart = truncateFromStart(text, remainingWidth);
        return startPart + ellipsis + endPart;
      }
      default:
        return truncateFromEnd(text, availableWidth) + ellipsis;
    }
  };

  /**
   * Pads text to specified width with given character
   * @param text - Text to pad
   * @param width - Target width
   * @param char - Padding character
   * @param align - Alignment ('left', 'center', 'right')
   * @returns Padded text
   */
  export const pad = (
    text: string,
    width: number,
    char = ' ',
    align: 'left' | 'center' | 'right' = 'left'
  ): string => {
    const textWidth = displayWidth(text);

    if (textWidth >= width) {
      return text;
    }

    const paddingNeeded = width - textWidth;

    switch (align) {
      case 'center': {
        const leftPadding = Math.floor(paddingNeeded / 2);
        const rightPadding = paddingNeeded - leftPadding;
        return char.repeat(leftPadding) + text + char.repeat(rightPadding);
      }
      case 'right':
        return char.repeat(paddingNeeded) + text;
      default:
        return text + char.repeat(paddingNeeded);
    }
  };

  /**
   * Wraps text to fit within specified line width
   * @param text - Text to wrap
   * @param width - Maximum line width
   * @param options - Wrapping options
   * @returns Array of wrapped lines
   */
  export const wrap = (
    text: string,
    width: number,
    options: WrapOptions = {}
  ): readonly string[] => {
    const { breakWords = false, indent = '' } = options;

    if (width <= 0) {
      return [text];
    }

    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
        const testWidth = displayWidth(indent + testLine);

        if (testWidth <= width) {
          currentLine = testLine;
        } else {
          // Line would be too long
          if (currentLine !== '') {
            lines.push(indent + currentLine);
            currentLine = word;
          } else {
            // Single word is too long
            if (breakWords && displayWidth(indent + word) > width) {
              const brokenWords = breakWord(word, width - displayWidth(indent));
              for (let i = 0; i < brokenWords.length; i++) {
                lines.push(indent + brokenWords[i]);
              }
              currentLine = '';
            } else {
              lines.push(indent + word);
              currentLine = '';
            }
          }
        }
      }

      if (currentLine !== '') {
        lines.push(indent + currentLine);
      }
    }

    return lines;
  };

  /**
   * Repeats a string pattern to fill specified width
   * @param pattern - Pattern to repeat
   * @param width - Target width
   * @returns Repeated pattern truncated to exact width
   */
  export const repeat = (pattern: string, width: number): string => {
    if (width <= 0 || pattern === '') {
      return '';
    }

    const patternWidth = displayWidth(pattern);
    if (patternWidth === 0) {
      return '';
    }

    const repetitions = Math.ceil(width / patternWidth);
    const repeated = pattern.repeat(repetitions);

    return truncate(repeated, width, { ellipsis: '' });
  };

  /**
   * Strips ANSI escape sequences from text
   * @param text - Text containing ANSI sequences
   * @returns Clean text without ANSI sequences
   */
  export const stripAnsi = (text: string): string => {
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  };

  /**
   * Counts the number of lines in text
   * @param text - Text to count lines in
   * @returns Number of lines
   */
  export const lineCount = (text: string): number => {
    return text.split('\n').length;
  };

  /**
   * Splits text into lines
   * @param text - Text to split
   * @returns Array of lines
   */
  export const lines = (text: string): readonly string[] => {
    return text.split('\n');
  };

  /**
   * Joins lines with newline characters
   * @param lines - Array of lines to join
   * @returns Joined text
   */
  export const joinLines = (lines: readonly string[]): string => {
    return lines.join('\n');
  };

  /**
   * Normalizes whitespace in text (collapses multiple spaces, trims)
   * @param text - Text to normalize
   * @returns Normalized text
   */
  export const normalizeWhitespace = (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
  };

  /**
   * Indents all lines in text by specified amount
   * @param text - Text to indent
   * @param indent - Indentation string or number of spaces
   * @returns Indented text
   */
  export const indent = (text: string, indent: string | number): string => {
    const indentStr = typeof indent === 'number' ? ' '.repeat(indent) : indent;
    return text
      .split('\n')
      .map((line) => indentStr + line)
      .join('\n');
  };

  /**
   * Removes common leading whitespace from all lines
   * @param text - Text to dedent
   * @returns Dedented text
   */
  export const dedent = (text: string): string => {
    const lines = text.split('\n');

    // Find minimum indentation (ignoring empty lines)
    let minIndent = Number.POSITIVE_INFINITY;
    for (const line of lines) {
      if (line.trim() === '') continue;

      const match = line.match(/^(\s*)/);
      if (match) {
        minIndent = Math.min(minIndent, match[1].length);
      }
    }

    if (minIndent === Number.POSITIVE_INFINITY || minIndent === 0) {
      return text;
    }

    return lines.map((line) => line.slice(minIndent)).join('\n');
  };
}

// Helper functions
const isWideCharacter = (codePoint: number): boolean => {
  // East Asian Width property - Wide and Fullwidth characters
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) || // Hangul Jamo
    (codePoint >= 0x2329 && codePoint <= 0x232a) || // Left/Right-Pointing Angle Bracket
    (codePoint >= 0x2e80 && codePoint <= 0x2e99) || // CJK Radicals Supplement
    (codePoint >= 0x2e9b && codePoint <= 0x2ef3) ||
    (codePoint >= 0x2f00 && codePoint <= 0x2fd5) || // Kangxi Radicals
    (codePoint >= 0x2ff0 && codePoint <= 0x2ffb) || // Ideographic Description Characters
    (codePoint >= 0x3000 && codePoint <= 0x303e) || // CJK Symbols and Punctuation
    (codePoint >= 0x3041 && codePoint <= 0x3096) || // Hiragana
    (codePoint >= 0x3099 && codePoint <= 0x30ff) || // Katakana
    (codePoint >= 0x3105 && codePoint <= 0x312d) || // Bopomofo
    (codePoint >= 0x3131 && codePoint <= 0x318e) || // Hangul Compatibility Jamo
    (codePoint >= 0x3190 && codePoint <= 0x31ba) || // Kanbun
    (codePoint >= 0x31c0 && codePoint <= 0x31e3) || // CJK Strokes
    (codePoint >= 0x31f0 && codePoint <= 0x321e) || // Katakana Phonetic Extensions
    (codePoint >= 0x3220 && codePoint <= 0x3247) || // Enclosed CJK Letters and Months
    (codePoint >= 0x3250 && codePoint <= 0x32fe) || // Enclosed CJK Letters and Months
    (codePoint >= 0x3300 && codePoint <= 0x4dbf) || // CJK Compatibility
    (codePoint >= 0x4e00 && codePoint <= 0xa48c) || // CJK Unified Ideographs
    (codePoint >= 0xa490 && codePoint <= 0xa4c6) || // Yi Radicals
    (codePoint >= 0xa960 && codePoint <= 0xa97c) || // Hangul Jamo Extended-A
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) || // Hangul Syllables
    (codePoint >= 0xd7b0 && codePoint <= 0xd7c6) || // Hangul Jamo Extended-B
    (codePoint >= 0xf900 && codePoint <= 0xfaff) || // CJK Compatibility Ideographs
    (codePoint >= 0xfe10 && codePoint <= 0xfe19) || // Vertical Forms
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) || // CJK Compatibility Forms
    (codePoint >= 0xff00 && codePoint <= 0xff60) || // Fullwidth Forms
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) || // Fullwidth Forms
    (codePoint >= 0x1f300 && codePoint <= 0x1f64f) || // Emoji
    (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) || // Transport and Map Symbols
    (codePoint >= 0x1f700 && codePoint <= 0x1f77f) || // Alchemical Symbols
    (codePoint >= 0x1f780 && codePoint <= 0x1f7ff) || // Geometric Shapes Extended
    (codePoint >= 0x1f800 && codePoint <= 0x1f8ff) || // Supplemental Arrows-C
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) || // Supplemental Symbols and Pictographs
    (codePoint >= 0x20000 && codePoint <= 0x2fffd) || // CJK Unified Ideographs Extension B
    (codePoint >= 0x30000 && codePoint <= 0x3fffd) // CJK Unified Ideographs Extension C
  );
};

const isControlCharacter = (codePoint: number): boolean => {
  return (
    (codePoint >= 0x00 && codePoint <= 0x1f) || // C0 controls
    (codePoint >= 0x7f && codePoint <= 0x9f) // C1 controls
  );
};

const truncateFromEnd = (text: string, maxWidth: number): string => {
  let width = 0;
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = StringUtils.displayWidth(char);

    if (width + charWidth > maxWidth) {
      break;
    }

    result += char;
    width += charWidth;
  }

  return result;
};

const truncateFromStart = (text: string, maxWidth: number): string => {
  let width = 0;
  let startIndex = text.length;

  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    const charWidth = StringUtils.displayWidth(char);

    if (width + charWidth > maxWidth) {
      break;
    }

    width += charWidth;
    startIndex = i;
  }

  return text.slice(startIndex);
};

const breakWord = (word: string, maxWidth: number): readonly string[] => {
  if (maxWidth <= 0) {
    return [word];
  }

  const parts: string[] = [];
  let currentPart = '';

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const testPart = currentPart + char;

    if (StringUtils.displayWidth(testPart) <= maxWidth) {
      currentPart = testPart;
    } else {
      if (currentPart !== '') {
        parts.push(currentPart);
      }
      currentPart = char;
    }
  }

  if (currentPart !== '') {
    parts.push(currentPart);
  }

  return parts;
};

export { StringUtils, type TruncateOptions, type WrapOptions };
