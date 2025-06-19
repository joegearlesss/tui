import { z } from 'zod';

/**
 * Color profile types for terminal compatibility
 */
export const ColorProfileSchema = z
  .enum(['ascii', 'ansi', 'ansi256', 'truecolor'])
  .describe(
    'Terminal color profile - ascii (no color), ansi (16 colors), ansi256 (256 colors), truecolor (24-bit)'
  );

export type ColorProfile = z.infer<typeof ColorProfileSchema>;

/**
 * Basic ANSI color constants (4-bit)
 */
export namespace ANSIColor {
  export const BLACK = 0 as const;
  export const RED = 1 as const;
  export const GREEN = 2 as const;
  export const YELLOW = 3 as const;
  export const BLUE = 4 as const;
  export const MAGENTA = 5 as const;
  export const CYAN = 6 as const;
  export const WHITE = 7 as const;
  export const BRIGHT_BLACK = 8 as const;
  export const BRIGHT_RED = 9 as const;
  export const BRIGHT_GREEN = 10 as const;
  export const BRIGHT_YELLOW = 11 as const;
  export const BRIGHT_BLUE = 12 as const;
  export const BRIGHT_MAGENTA = 13 as const;
  export const BRIGHT_CYAN = 14 as const;
  export const BRIGHT_WHITE = 15 as const;
}

/**
 * RGB color values schema
 */
export const RGBColorSchema = z
  .object({
    r: z
      .number()
      .min(0, 'Red component must be 0-255')
      .max(255, 'Red component must be 0-255')
      .describe('Red color component (0-255)'),
    g: z
      .number()
      .min(0, 'Green component must be 0-255')
      .max(255, 'Green component must be 0-255')
      .describe('Green color component (0-255)'),
    b: z
      .number()
      .min(0, 'Blue component must be 0-255')
      .max(255, 'Blue component must be 0-255')
      .describe('Blue color component (0-255)'),
  })
  .describe('RGB color representation with 8-bit components');

export type RGBColor = z.infer<typeof RGBColorSchema>;

/**
 * HSL color representation schema
 */
export const HSLColorSchema = z
  .object({
    h: z
      .number()
      .min(0, 'Hue must be 0-360 degrees')
      .max(360, 'Hue must be 0-360 degrees')
      .describe('Hue component in degrees (0-360)'),
    s: z
      .number()
      .min(0, 'Saturation must be 0-100%')
      .max(100, 'Saturation must be 0-100%')
      .describe('Saturation component as percentage (0-100)'),
    l: z
      .number()
      .min(0, 'Lightness must be 0-100%')
      .max(100, 'Lightness must be 0-100%')
      .describe('Lightness component as percentage (0-100)'),
  })
  .describe('HSL color representation with hue, saturation, and lightness');

export type HSLColor = z.infer<typeof HSLColorSchema>;

/**
 * Hex color string schema
 */
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex color must be in format #RRGGBB')
  .describe('Hexadecimal color string in #RRGGBB format');

export type HexColor = z.infer<typeof HexColorSchema>;

/**
 * ANSI 256 color index schema
 */
export const ANSI256ColorSchema = z
  .number()
  .min(0, 'ANSI 256 color index must be 0-255')
  .max(255, 'ANSI 256 color index must be 0-255')
  .describe('ANSI 256 color palette index (0-255)');

export type ANSI256Color = z.infer<typeof ANSI256ColorSchema>;

/**
 * Complete color definition with fallbacks
 */
export const CompleteColorSchema = z
  .object({
    hex: HexColorSchema.optional().describe('Hexadecimal color representation'),
    trueColor: HexColorSchema.optional().describe('24-bit true color value - highest quality'),
    ansi256: ANSI256ColorSchema.optional().describe(
      '256-color palette index - medium quality fallback'
    ),
    ansi: z
      .number()
      .min(0, 'ANSI color must be 0-15')
      .max(15, 'ANSI color must be 0-15')
      .optional()
      .describe('16-color ANSI index - basic fallback'),
  })
  .describe('Complete color definition with quality fallbacks for different terminal capabilities');

export type CompleteColor = z.infer<typeof CompleteColorSchema>;

/**
 * Adaptive color for light/dark themes
 */
export const AdaptiveColorSchema = z
  .object({
    light: z
      .union([HexColorSchema, ANSI256ColorSchema, CompleteColorSchema])
      .describe('Color to use in light theme environments'),
    dark: z
      .union([HexColorSchema, ANSI256ColorSchema, CompleteColorSchema])
      .describe('Color to use in dark theme environments'),
  })
  .describe('Adaptive color that changes based on terminal background theme');

export type AdaptiveColor = z.infer<typeof AdaptiveColorSchema>;

/**
 * Color value union type
 */
export const ColorValueSchema = z
  .union([
    HexColorSchema,
    ANSI256ColorSchema,
    CompleteColorSchema,
    AdaptiveColorSchema,
    z.literal('transparent').describe('Transparent/no color'),
  ])
  .describe('Any valid color value - hex, ANSI, complete, adaptive, or transparent');

export type ColorValue = z.infer<typeof ColorValueSchema>;
