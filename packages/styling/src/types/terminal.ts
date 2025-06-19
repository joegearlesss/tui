import { z } from 'zod';

/**
 * Terminal capability detection schema
 */
export const TerminalCapabilitiesSchema = z
  .object({
    colorProfile: z
      .enum(['ascii', 'ansi', 'ansi256', 'truecolor'])
      .describe('Detected color profile capability of the terminal'),
    width: z
      .number()
      .min(1, 'Terminal width must be positive')
      .describe('Terminal width in character columns'),
    height: z
      .number()
      .min(1, 'Terminal height must be positive')
      .describe('Terminal height in character rows'),
    hasDarkBackground: z.boolean().describe('Whether terminal has dark background theme'),
    supportsUnicode: z.boolean().describe('Whether terminal supports Unicode characters'),
    supportsEmoji: z.boolean().describe('Whether terminal supports emoji rendering'),
  })
  .describe('Terminal capabilities and environment information');

export type TerminalCapabilities = z.infer<typeof TerminalCapabilitiesSchema>;

/**
 * ANSI escape sequence types
 */
export namespace ANSISequence {
  export const RESET = '\x1b[0m' as const;
  export const BOLD = '\x1b[1m' as const;
  export const DIM = '\x1b[2m' as const;
  export const ITALIC = '\x1b[3m' as const;
  export const UNDERLINE = '\x1b[4m' as const;
  export const BLINK = '\x1b[5m' as const;
  export const REVERSE = '\x1b[7m' as const;
  export const STRIKETHROUGH = '\x1b[9m' as const;
}

/**
 * Unicode character categories for width calculation
 */
export const UnicodeCharacterSchema = z
  .object({
    codePoint: z
      .number()
      .min(0, 'Unicode code point must be non-negative')
      .describe('Unicode code point value'),
    width: z
      .number()
      .min(0, 'Character width must be non-negative')
      .max(2, 'Character width cannot exceed 2')
      .describe('Display width in terminal columns (0=combining, 1=normal, 2=wide)'),
    category: z
      .enum(['control', 'combining', 'normal', 'wide', 'emoji'])
      .describe('Unicode character category for rendering'),
  })
  .describe('Unicode character information for proper width calculation');

export type UnicodeCharacter = z.infer<typeof UnicodeCharacterSchema>;
