import type {
  AdaptiveColor,
  ANSI256Color,
  ColorProfile,
  ColorValue,
  CompleteColor,
  HexColor,
  HSLColor,
  RGBColor,
} from '@tui/styling/types';

/**
 * Color utilities and parsing functions
 */
export namespace Color {
  // Basic ANSI color constants
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

  // Named color mappings
  const NAMED_COLORS: Record<string, HexColor> = {
    black: '#000000',
    red: '#FF0000',
    green: '#00FF00',
    yellow: '#FFFF00',
    blue: '#0000FF',
    magenta: '#FF00FF',
    cyan: '#00FFFF',
    white: '#FFFFFF',
    gray: '#808080',
    grey: '#808080',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    lime: '#00FF00',
    navy: '#000080',
    teal: '#008080',
    silver: '#C0C0C0',
    gold: '#FFD700',
    transparent: '#000000', // Special case
  } as const;

  // ANSI color mappings for named colors
  const ANSI_COLORS: Record<string, number> = {
    black: BLACK,
    red: RED,
    green: GREEN,
    yellow: YELLOW,
    blue: BLUE,
    magenta: MAGENTA,
    cyan: CYAN,
    white: WHITE,
    gray: BRIGHT_BLACK,
    grey: BRIGHT_BLACK,
  } as const;

  /**
   * ANSI 256 color palette utilities
   */
  export namespace ANSI256 {
    /**
     * Gets a grayscale color from the ANSI 256 palette
     * @param level - Grayscale level (0-23, where 0 is darkest, 23 is lightest)
     * @returns ANSI 256 color code
     */
    export const grayscale = (level: number): ANSI256Color => {
      const clampedLevel = Math.max(0, Math.min(23, Math.round(level)));
      return (232 + clampedLevel) as ANSI256Color;
    };

    /**
     * Gets a color from the 6x6x6 RGB cube in ANSI 256 palette
     * @param r - Red component (0-5)
     * @param g - Green component (0-5)
     * @param b - Blue component (0-5)
     * @returns ANSI 256 color code
     */
    export const rgb = (r: number, g: number, b: number): ANSI256Color => {
      const clampedR = Math.max(0, Math.min(5, Math.round(r)));
      const clampedG = Math.max(0, Math.min(5, Math.round(g)));
      const clampedB = Math.max(0, Math.min(5, Math.round(b)));
      return (16 + 36 * clampedR + 6 * clampedG + clampedB) as ANSI256Color;
    };

    /**
     * Converts RGB (0-255) to ANSI 256 RGB cube coordinates
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @returns ANSI 256 color code
     */
    export const fromRgb = (r: number, g: number, b: number): ANSI256Color => {
      const toAnsi = (component: number) => Math.round((component / 255) * 5);
      return rgb(toAnsi(r), toAnsi(g), toAnsi(b));
    };

    /**
     * Converts ANSI 256 color to RGB values
     * @param ansi - ANSI 256 color code
     * @returns RGB color object or undefined if invalid
     */
    export const toRgb = (ansi: number): RGBColor | undefined => {
      if (ansi < 0 || ansi > 255) return undefined;

      // Standard 16 colors
      if (ansi < 16) {
        const standardColors: RGBColor[] = [
          { r: 0, g: 0, b: 0 }, // 0: black
          { r: 128, g: 0, b: 0 }, // 1: red
          { r: 0, g: 128, b: 0 }, // 2: green
          { r: 128, g: 128, b: 0 }, // 3: yellow
          { r: 0, g: 0, b: 128 }, // 4: blue
          { r: 128, g: 0, b: 128 }, // 5: magenta
          { r: 0, g: 128, b: 128 }, // 6: cyan
          { r: 192, g: 192, b: 192 }, // 7: white
          { r: 128, g: 128, b: 128 }, // 8: bright black
          { r: 255, g: 0, b: 0 }, // 9: bright red
          { r: 0, g: 255, b: 0 }, // 10: bright green
          { r: 255, g: 255, b: 0 }, // 11: bright yellow
          { r: 0, g: 0, b: 255 }, // 12: bright blue
          { r: 255, g: 0, b: 255 }, // 13: bright magenta
          { r: 0, g: 255, b: 255 }, // 14: bright cyan
          { r: 255, g: 255, b: 255 }, // 15: bright white
        ];
        return standardColors[ansi];
      }

      // 6x6x6 RGB cube (16-231)
      if (ansi >= 16 && ansi <= 231) {
        const index = ansi - 16;
        const r = Math.floor(index / 36);
        const g = Math.floor((index % 36) / 6);
        const b = index % 6;

        const toRgb = (component: number) => (component === 0 ? 0 : 55 + component * 40);
        return { r: toRgb(r), g: toRgb(g), b: toRgb(b) };
      }

      // Grayscale (232-255)
      if (ansi >= 232 && ansi <= 255) {
        const level = ansi - 232;
        const value = 8 + level * 10;
        return { r: value, g: value, b: value };
      }

      return undefined;
    };

    /**
     * Finds the closest ANSI 256 color to an RGB color
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @returns Closest ANSI 256 color code
     */
    export const closest = (r: number, g: number, b: number): ANSI256Color => {
      let minDistance = Number.POSITIVE_INFINITY;
      let closestColor = 0;

      for (let i = 0; i < 256; i++) {
        const rgb = toRgb(i);
        if (!rgb) continue;

        const distance = Math.sqrt((r - rgb.r) ** 2 + (g - rgb.g) ** 2 + (b - rgb.b) ** 2);

        if (distance < minDistance) {
          minDistance = distance;
          closestColor = i;
        }
      }

      return closestColor as ANSI256Color;
    };
  }

  /**
   * HSL color space utilities and conversions
   */
  export namespace HSL {
    /**
     * Converts RGB to HSL
     * @param rgb - RGB color object
     * @returns HSL color object
     */
    export const fromRgb = (rgb: RGBColor): HSLColor => {
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;

      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

        switch (max) {
          case r:
            h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / diff + 2) / 6;
            break;
          case b:
            h = ((r - g) / diff + 4) / 6;
            break;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      };
    };

    /**
     * Converts HSL to RGB
     * @param hsl - HSL color object
     * @returns RGB color object
     */
    export const toRgb = (hsl: HSLColor): RGBColor => {
      const h = hsl.h / 360;
      const s = hsl.s / 100;
      const l = hsl.l / 100;

      const hue2rgb = (p: number, q: number, t: number): number => {
        let normalizedT = t;
        if (normalizedT < 0) normalizedT += 1;
        if (normalizedT > 1) normalizedT -= 1;
        if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
        if (normalizedT < 1 / 2) return q;
        if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
        return p;
      };

      let r: number;
      let g: number;
      let b: number;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    };

    /**
     * Creates an HSL color
     * @param h - Hue (0-360)
     * @param s - Saturation (0-100)
     * @param l - Lightness (0-100)
     * @returns HSL color object or undefined if invalid
     */
    export const create = (h: number, s: number, l: number): HSLColor | undefined => {
      if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
        return undefined;
      }
      return { h, s, l };
    };
  }

  /**
   * Color manipulation utilities
   */
  export namespace Manipulate {
    /**
     * Lightens a color by increasing its lightness
     * @param color - Color value to lighten
     * @param amount - Amount to lighten (0-100)
     * @returns Lightened color as hex
     */
    export const lighten = (color: ColorValue, amount: number): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const hsl = HSL.fromRgb(rgb);
      const newL = Math.min(100, hsl.l + Math.max(0, Math.min(100, amount)));
      const newRgb = HSL.toRgb({ ...hsl, l: newL });

      return rgbToHex(newRgb);
    };

    /**
     * Darkens a color by decreasing its lightness
     * @param color - Color value to darken
     * @param amount - Amount to darken (0-100)
     * @returns Darkened color as hex
     */
    export const darken = (color: ColorValue, amount: number): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const hsl = HSL.fromRgb(rgb);
      const newL = Math.max(0, hsl.l - Math.max(0, Math.min(100, amount)));
      const newRgb = HSL.toRgb({ ...hsl, l: newL });

      return rgbToHex(newRgb);
    };

    /**
     * Saturates a color by increasing its saturation
     * @param color - Color value to saturate
     * @param amount - Amount to saturate (0-100)
     * @returns Saturated color as hex
     */
    export const saturate = (color: ColorValue, amount: number): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const hsl = HSL.fromRgb(rgb);
      const newS = Math.min(100, hsl.s + Math.max(0, Math.min(100, amount)));
      const newRgb = HSL.toRgb({ ...hsl, s: newS });

      return rgbToHex(newRgb);
    };

    /**
     * Desaturates a color by decreasing its saturation
     * @param color - Color value to desaturate
     * @param amount - Amount to desaturate (0-100)
     * @returns Desaturated color as hex
     */
    export const desaturate = (color: ColorValue, amount: number): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const hsl = HSL.fromRgb(rgb);
      const newS = Math.max(0, hsl.s - Math.max(0, Math.min(100, amount)));
      const newRgb = HSL.toRgb({ ...hsl, s: newS });

      return rgbToHex(newRgb);
    };

    /**
     * Adjusts the hue of a color
     * @param color - Color value to adjust
     * @param degrees - Degrees to rotate hue (-360 to 360)
     * @returns Color with adjusted hue as hex
     */
    export const adjustHue = (color: ColorValue, degrees: number): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const hsl = HSL.fromRgb(rgb);
      let newH = hsl.h + degrees;

      // Normalize hue to 0-360 range
      while (newH < 0) newH += 360;
      while (newH >= 360) newH -= 360;

      const newRgb = HSL.toRgb({ ...hsl, h: newH });
      return rgbToHex(newRgb);
    };

    /**
     * Mixes two colors together
     * @param color1 - First color
     * @param color2 - Second color
     * @param weight - Weight of first color (0-100, default 50)
     * @returns Mixed color as hex
     */
    export const mix = (
      color1: ColorValue,
      color2: ColorValue,
      weight = 50
    ): HexColor | undefined => {
      const rgb1 = toRgb(color1);
      const rgb2 = toRgb(color2);
      if (!rgb1 || !rgb2) return undefined;

      const w = Math.max(0, Math.min(100, weight)) / 100;
      const w2 = 1 - w;

      const mixedRgb: RGBColor = {
        r: Math.round(rgb1.r * w + rgb2.r * w2),
        g: Math.round(rgb1.g * w + rgb2.g * w2),
        b: Math.round(rgb1.b * w + rgb2.b * w2),
      };

      return rgbToHex(mixedRgb);
    };

    /**
     * Gets the complement of a color (opposite on color wheel)
     * @param color - Color value
     * @returns Complement color as hex
     */
    export const complement = (color: ColorValue): HexColor | undefined => {
      return adjustHue(color, 180);
    };

    /**
     * Inverts a color
     * @param color - Color value to invert
     * @returns Inverted color as hex
     */
    export const invert = (color: ColorValue): HexColor | undefined => {
      const rgb = toRgb(color);
      if (!rgb) return undefined;

      const invertedRgb: RGBColor = {
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b,
      };

      return rgbToHex(invertedRgb);
    };
  }

  /**
   * Helper function to convert any color value to RGB
   * @param color - Color value to convert
   * @returns RGB color object or undefined if invalid
   */
  const toRgb = (color: ColorValue): RGBColor | undefined => {
    if (color === 'transparent') return undefined;

    if (typeof color === 'string') {
      // Try hex first
      const hex = parseHex(color);
      if (hex) return hexToRgb(hex);

      // Try named color
      const named = parseNamed(color);
      if (named) return hexToRgb(named);

      return undefined;
    }

    if (typeof color === 'number') {
      // ANSI 256 color
      return ANSI256.toRgb(color);
    }

    if (typeof color === 'object') {
      if ('r' in color && 'g' in color && 'b' in color) {
        return color as RGBColor;
      }

      if ('ansi' in color && color.ansi !== undefined) {
        return ANSI256.toRgb(color.ansi);
      }

      if ('hex' in color && color.hex) {
        return hexToRgb(color.hex);
      }

      if ('light' in color && 'dark' in color) {
        // For adaptive colors, use light variant
        return toRgb(color.light);
      }
    }

    return undefined;
  };

  /**
   * Parses a color string into a ColorValue
   * @param color - Color string (hex, named, or ANSI number)
   * @returns Parsed color value or undefined if invalid
   */
  export const parse = (color: string | number): ColorValue | undefined => {
    if (typeof color === 'number') {
      return parseANSI256(color);
    }

    if (typeof color === 'string') {
      const trimmed = color.trim().toLowerCase();

      // Handle transparent
      if (trimmed === 'transparent') {
        return 'transparent';
      }

      // Try hex color
      const hexResult = parseHex(trimmed);
      if (hexResult !== undefined) {
        return hexResult;
      }

      // Try named color
      const namedResult = parseNamed(trimmed);
      if (namedResult !== undefined) {
        return namedResult;
      }

      // Try ANSI number as string
      const ansiNumber = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(ansiNumber)) {
        return parseANSI256(ansiNumber);
      }
    }

    return undefined;
  };

  /**
   * Parses a hex color string
   * @param hex - Hex color string (with or without #)
   * @returns Hex color or undefined if invalid
   */
  export const parseHex = (hex: string): HexColor | undefined => {
    const cleaned = hex.startsWith('#') ? hex : `#${hex}`;

    // Validate hex format
    if (!/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      return undefined;
    }

    return cleaned.toUpperCase() as HexColor;
  };

  /**
   * Parses a named color
   * @param name - Color name
   * @returns Hex color or undefined if not found
   */
  export const parseNamed = (name: string): HexColor | undefined => {
    return NAMED_COLORS[name.toLowerCase()];
  };

  /**
   * Parses an ANSI 256 color index
   * @param index - ANSI color index (0-255)
   * @returns ANSI color index or undefined if invalid
   */
  export const parseANSI256 = (index: number): ANSI256Color | undefined => {
    if (!Number.isInteger(index) || index < 0 || index > 255) {
      return undefined;
    }
    return index;
  };

  /**
   * Creates an RGB color object
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns RGB color object or undefined if invalid
   */
  export const rgb = (r: number, g: number, b: number): RGBColor | undefined => {
    if (!isValidRGBComponent(r) || !isValidRGBComponent(g) || !isValidRGBComponent(b)) {
      return undefined;
    }
    return { r, g, b };
  };

  /**
   * Creates a complete color with fallbacks
   * @param options - Color options with fallbacks
   * @returns Complete color object
   */
  export const complete = (options: Partial<CompleteColor>): CompleteColor => {
    return {
      trueColor: options.trueColor,
      ansi256: options.ansi256,
      ansi: options.ansi,
    };
  };

  /**
   * Creates an adaptive color for light/dark themes
   * @param light - Color for light theme
   * @param dark - Color for dark theme
   * @returns Adaptive color object
   */
  export const adaptive = (
    light: string | number | CompleteColor,
    dark: string | number | CompleteColor
  ): AdaptiveColor => {
    return { light, dark };
  };

  /**
   * Creates a complete adaptive color
   * @param light - Complete color for light theme
   * @param dark - Complete color for dark theme
   * @returns Complete adaptive color
   */
  export const completeAdaptive = (light: CompleteColor, dark: CompleteColor): AdaptiveColor => {
    return { light, dark };
  };

  /**
   * Returns transparent color
   * @returns Transparent color value
   */
  export const noColor = (): 'transparent' => {
    return 'transparent';
  };

  /**
   * Converts RGB to hex color
   * @param rgb - RGB color object
   * @returns Hex color string
   */
  export const rgbToHex = (rgb: RGBColor): HexColor => {
    const toHex = (component: number): string => {
      const rounded = Math.round(Math.max(0, Math.min(255, component)));
      const hex = rounded.toString(16).padStart(2, '0');
      return hex.toUpperCase();
    };

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}` as HexColor;
  };

  /**
   * Converts hex to RGB color
   * @param hex - Hex color string
   * @returns RGB color object or undefined if invalid
   */
  export const hexToRgb = (hex: HexColor): RGBColor | undefined => {
    const match = hex.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
    if (!match || !match[1] || !match[2] || !match[3]) {
      return undefined;
    }

    return {
      r: Number.parseInt(match[1], 16),
      g: Number.parseInt(match[2], 16),
      b: Number.parseInt(match[3], 16),
    };
  };

  /**
   * Gets the best color value for a given color profile
   * @param color - Color value
   * @param profile - Target color profile
   * @returns Best available color for the profile
   */
  export const getColorForProfile = (
    color: ColorValue,
    profile: ColorProfile
  ): string | number | undefined => {
    if (color === 'transparent') {
      return undefined;
    }

    if (typeof color === 'string') {
      // Hex color
      if (profile === 'truecolor') {
        return color;
      }
      // For lower profiles, would need conversion logic
      return color;
    }

    if (typeof color === 'number') {
      // ANSI 256 color
      if (profile === 'truecolor' || profile === 'ansi256') {
        return color;
      }
      if (profile === 'ansi' && color <= 15) {
        return color;
      }
      return undefined;
    }

    if ('light' in color && 'dark' in color) {
      // Adaptive color - would need theme detection
      return getColorForProfile(color.light, profile);
    }

    if ('trueColor' in color || 'ansi256' in color || 'ansi' in color) {
      // Complete color
      switch (profile) {
        case 'truecolor':
          return color.trueColor ?? color.ansi256 ?? color.ansi;
        case 'ansi256':
          return color.ansi256 ?? color.ansi;
        case 'ansi':
          return color.ansi;
        default:
          return undefined;
      }
    }

    return undefined;
  };

  /**
   * Validates if a number is a valid RGB component
   * @param component - Component value to validate
   * @returns True if valid RGB component
   */
  const isValidRGBComponent = (component: number): boolean => {
    return Number.isInteger(component) && component >= 0 && component <= 255;
  };

  /**
   * Converts a color value to a complete color object
   * @param color - Color value to convert
   * @returns Complete color object or undefined if invalid
   */
  export const toComplete = (color: ColorValue): CompleteColor | undefined => {
    if (color === 'transparent') {
      return { ansi: undefined, hex: undefined };
    }

    if (typeof color === 'string') {
      // Try parsing as hex
      const hexColor = parseHex(color);
      if (hexColor) {
        return { ansi: undefined, hex: hexColor };
      }

      // Try parsing as named color - prioritize ANSI codes
      const namedColor = parseNamed(color);
      if (namedColor) {
        const ansiCode = ANSI_COLORS[color.toLowerCase()];
        return {
          ansi: ansiCode,
          hex: namedColor,
        };
      }

      return undefined;
    }

    if (typeof color === 'number') {
      // ANSI 256 color
      if (parseANSI256(color) !== undefined) {
        return { ansi: color, hex: undefined };
      }
      return undefined;
    }

    if (typeof color === 'object') {
      if ('ansi' in color) {
        // ANSI color object
        return { ansi: color.ansi, hex: undefined };
      }

      if ('r' in color && 'g' in color && 'b' in color) {
        // RGB color object - type guard ensures it's RGBColor
        const rgbColor = color as RGBColor;
        const hex = rgbToHex(rgbColor);
        return { ansi: undefined, hex };
      }

      if ('light' in color && 'dark' in color) {
        // Adaptive color - return light variant for now
        return toComplete(color.light);
      }

      // Complete color object
      return color as CompleteColor;
    }

    return undefined;
  };

  /**
   * Gets all available named colors
   * @returns Object with named color mappings
   */
  export const getNamedColors = (): Record<string, HexColor> => {
    return { ...NAMED_COLORS };
  };

  /**
   * Checks if a color name is valid
   * @param name - Color name to check
   * @returns True if color name exists
   */
  export const isValidColorName = (name: string): boolean => {
    return name.toLowerCase() in NAMED_COLORS;
  };

  /**
   * Color palette generation utilities
   */
  export namespace Palette {
    /**
     * Generates a monochromatic palette from a base color
     * @param baseColor - Base color for the palette
     * @param steps - Number of variations to generate (default 5)
     * @returns Array of hex colors
     */
    export const monochromatic = (baseColor: ColorValue, steps = 5): HexColor[] => {
      const rgb = toRgb(baseColor);
      if (!rgb) return [];

      const hsl = HSL.fromRgb(rgb);
      const palette: HexColor[] = [];

      for (let i = 0; i < steps; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i - Math.floor(steps / 2)) * 20));
        const newRgb = HSL.toRgb({ ...hsl, l: lightness });
        const hex = rgbToHex(newRgb);
        palette.push(hex);
      }

      return palette;
    };

    /**
     * Generates an analogous color palette
     * @param baseColor - Base color for the palette
     * @param steps - Number of colors to generate (default 3)
     * @param angle - Angle between colors in degrees (default 30)
     * @returns Array of hex colors
     */
    export const analogous = (baseColor: ColorValue, steps = 3, angle = 30): HexColor[] => {
      const rgb = toRgb(baseColor);
      if (!rgb) return [];

      const hsl = HSL.fromRgb(rgb);
      const palette: HexColor[] = [];

      for (let i = 0; i < steps; i++) {
        const hueOffset = (i - Math.floor(steps / 2)) * angle;
        let newHue = hsl.h + hueOffset;

        // Normalize hue
        while (newHue < 0) newHue += 360;
        while (newHue >= 360) newHue -= 360;

        const newRgb = HSL.toRgb({ ...hsl, h: newHue });
        const hex = rgbToHex(newRgb);
        palette.push(hex);
      }

      return palette;
    };

    /**
     * Generates a complementary color palette
     * @param baseColor - Base color for the palette
     * @returns Array with base color and its complement
     */
    export const complementary = (baseColor: ColorValue): HexColor[] => {
      const baseHex = toHex(baseColor);
      const complement = Manipulate.complement(baseColor);

      if (!baseHex || !complement) return [];
      return [baseHex, complement];
    };

    /**
     * Generates a triadic color palette
     * @param baseColor - Base color for the palette
     * @returns Array of three colors evenly spaced on color wheel
     */
    export const triadic = (baseColor: ColorValue): HexColor[] => {
      const baseHex = toHex(baseColor);
      const second = Manipulate.adjustHue(baseColor, 120);
      const third = Manipulate.adjustHue(baseColor, 240);

      if (!baseHex || !second || !third) return [];
      return [baseHex, second, third];
    };

    /**
     * Generates a tetradic (square) color palette
     * @param baseColor - Base color for the palette
     * @returns Array of four colors evenly spaced on color wheel
     */
    export const tetradic = (baseColor: ColorValue): HexColor[] => {
      const baseHex = toHex(baseColor);
      const second = Manipulate.adjustHue(baseColor, 90);
      const third = Manipulate.adjustHue(baseColor, 180);
      const fourth = Manipulate.adjustHue(baseColor, 270);

      if (!baseHex || !second || !third || !fourth) return [];
      return [baseHex, second, third, fourth];
    };

    /**
     * Generates a split-complementary color palette
     * @param baseColor - Base color for the palette
     * @param angle - Angle for split (default 30 degrees)
     * @returns Array with base color and two split complements
     */
    export const splitComplementary = (baseColor: ColorValue, angle = 30): HexColor[] => {
      const baseHex = toHex(baseColor);
      const first = Manipulate.adjustHue(baseColor, 180 - angle);
      const second = Manipulate.adjustHue(baseColor, 180 + angle);

      if (!baseHex || !first || !second) return [];
      return [baseHex, first, second];
    };
  }

  /**
   * Detects if the terminal has a dark background
   * Note: This is a best-effort detection and may not be 100% accurate
   * @returns Promise resolving to true if terminal has dark background, undefined if unknown
   */
  export const hasDarkBackground = async (): Promise<boolean | undefined> => {
    // Import Terminal here to avoid circular dependencies
    const { Terminal } = await import('../terminal/detection');
    const detection = await Terminal.detectBackground();
    return detection.isDark;
  };

  /**
   * Synchronous version of dark background detection (less accurate)
   * @returns True if terminal has dark background, undefined if unknown
   */
  export const hasDarkBackgroundSync = (): boolean | undefined => {
    // Import Terminal here to avoid circular dependencies
    try {
      // Use require to avoid top-level import
      const { Terminal } = require('../terminal/detection');
      const detection = Terminal.detectBackgroundSync();
      return detection.isDark;
    } catch {
      // Fallback if terminal detection is not available
      return undefined;
    }
  };

  /**
   * Helper function to convert any color value to hex
   * @param color - Color value to convert
   * @returns Hex color string or undefined if invalid
   */
  const toHex = (color: ColorValue): HexColor | undefined => {
    const rgb = toRgb(color);
    return rgb ? rgbToHex(rgb) : undefined;
  };
}
