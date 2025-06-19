import { describe, expect, test } from 'bun:test';
import { Color } from '../color';

describe('Color ANSI256 utilities', () => {
  describe('grayscale', () => {
    test('should generate grayscale colors', () => {
      expect(Color.ANSI256.grayscale(0)).toBe(232);
      expect(Color.ANSI256.grayscale(23)).toBe(255);
      expect(Color.ANSI256.grayscale(12)).toBe(244);
    });

    test('should clamp values to valid range', () => {
      expect(Color.ANSI256.grayscale(-5)).toBe(232);
      expect(Color.ANSI256.grayscale(30)).toBe(255);
    });
  });

  describe('rgb', () => {
    test('should generate RGB cube colors', () => {
      expect(Color.ANSI256.rgb(0, 0, 0)).toBe(16);
      expect(Color.ANSI256.rgb(5, 5, 5)).toBe(231);
      expect(Color.ANSI256.rgb(2, 3, 1)).toBe(16 + 36 * 2 + 6 * 3 + 1);
    });

    test('should clamp RGB values', () => {
      expect(Color.ANSI256.rgb(-1, 0, 0)).toBe(16);
      expect(Color.ANSI256.rgb(6, 0, 0)).toBe(16 + 36 * 5);
    });
  });

  describe('fromRgb', () => {
    test('should convert RGB to ANSI 256', () => {
      expect(Color.ANSI256.fromRgb(0, 0, 0)).toBe(16);
      expect(Color.ANSI256.fromRgb(255, 255, 255)).toBe(231);
      expect(Color.ANSI256.fromRgb(128, 128, 128)).toBe(145); // 16 + (36 * 2) + (6 * 2) + 2 where 2 = round(128/255 * 5)
    });
  });

  describe('toRgb', () => {
    test('should convert standard 16 colors', () => {
      expect(Color.ANSI256.toRgb(0)).toEqual({ r: 0, g: 0, b: 0 });
      expect(Color.ANSI256.toRgb(1)).toEqual({ r: 128, g: 0, b: 0 });
      expect(Color.ANSI256.toRgb(15)).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('should convert RGB cube colors', () => {
      expect(Color.ANSI256.toRgb(16)).toEqual({ r: 0, g: 0, b: 0 });
      expect(Color.ANSI256.toRgb(231)).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('should convert grayscale colors', () => {
      expect(Color.ANSI256.toRgb(232)).toEqual({ r: 8, g: 8, b: 8 });
      expect(Color.ANSI256.toRgb(255)).toEqual({ r: 238, g: 238, b: 238 });
    });

    test('should return undefined for invalid colors', () => {
      expect(Color.ANSI256.toRgb(-1)).toBeUndefined();
      expect(Color.ANSI256.toRgb(256)).toBeUndefined();
    });
  });

  describe('closest', () => {
    test('should find closest ANSI 256 color', () => {
      expect(Color.ANSI256.closest(0, 0, 0)).toBe(0);
      expect(Color.ANSI256.closest(255, 255, 255)).toBe(15);
      expect(Color.ANSI256.closest(255, 0, 0)).toBe(9);
    });
  });
});

describe('Color HSL utilities', () => {
  describe('fromRgb', () => {
    test('should convert RGB to HSL', () => {
      expect(Color.HSL.fromRgb({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
      expect(Color.HSL.fromRgb({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
      expect(Color.HSL.fromRgb({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 });
      expect(Color.HSL.fromRgb({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
    });
  });

  describe('toRgb', () => {
    test('should convert HSL to RGB', () => {
      expect(Color.HSL.toRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
      expect(Color.HSL.toRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
      expect(Color.HSL.toRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
      expect(Color.HSL.toRgb({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  describe('create', () => {
    test('should create valid HSL colors', () => {
      expect(Color.HSL.create(180, 50, 75)).toEqual({ h: 180, s: 50, l: 75 });
      expect(Color.HSL.create(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
      expect(Color.HSL.create(360, 100, 100)).toEqual({ h: 360, s: 100, l: 100 });
    });

    test('should reject invalid HSL values', () => {
      expect(Color.HSL.create(-10, 50, 50)).toBeUndefined();
      expect(Color.HSL.create(370, 50, 50)).toBeUndefined();
      expect(Color.HSL.create(180, -10, 50)).toBeUndefined();
      expect(Color.HSL.create(180, 110, 50)).toBeUndefined();
      expect(Color.HSL.create(180, 50, -10)).toBeUndefined();
      expect(Color.HSL.create(180, 50, 110)).toBeUndefined();
    });
  });
});

describe('Color manipulation utilities', () => {
  describe('lighten', () => {
    test('should lighten colors', () => {
      const result = Color.Manipulate.lighten('red', 20);
      expect(result).toBeDefined();

      // Should be lighter than original
      const original = Color.HSL.fromRgb({ r: 255, g: 0, b: 0 });
      const lightened = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(lightened.l).toBeGreaterThan(original.l);
    });

    test('should handle invalid colors', () => {
      expect(Color.Manipulate.lighten('invalid', 20)).toBeUndefined();
    });
  });

  describe('darken', () => {
    test('should darken colors', () => {
      const result = Color.Manipulate.darken('red', 20);
      expect(result).toBeDefined();

      // Should be darker than original
      const original = Color.HSL.fromRgb({ r: 255, g: 0, b: 0 });
      const darkened = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(darkened.l).toBeLessThan(original.l);
    });
  });

  describe('saturate', () => {
    test('should increase saturation', () => {
      const result = Color.Manipulate.saturate('#808080', 50);
      expect(result).toBeDefined();

      const original = Color.HSL.fromRgb({ r: 128, g: 128, b: 128 });
      const saturated = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(saturated.s).toBeGreaterThanOrEqual(original.s);
    });
  });

  describe('desaturate', () => {
    test('should decrease saturation', () => {
      const result = Color.Manipulate.desaturate('red', 50);
      expect(result).toBeDefined();

      const original = Color.HSL.fromRgb({ r: 255, g: 0, b: 0 });
      const desaturated = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(desaturated.s).toBeLessThan(original.s);
    });
  });

  describe('adjustHue', () => {
    test('should adjust hue', () => {
      const result = Color.Manipulate.adjustHue('red', 120);
      expect(result).toBeDefined();

      // Red (0°) + 120° should be green-ish
      const adjusted = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(adjusted.h).toBeCloseTo(120, 0);
    });

    test('should handle negative hue adjustments', () => {
      const result = Color.Manipulate.adjustHue('red', -60);
      expect(result).toBeDefined();

      const adjusted = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(adjusted.h).toBeCloseTo(300, 0);
    });
  });

  describe('mix', () => {
    test('should mix two colors', () => {
      const result = Color.Manipulate.mix('red', 'blue', 50);
      expect(result).toBeDefined();

      // 50/50 mix should be purple-ish
      const mixed = Color.hexToRgb(result!);
      expect(mixed!.r).toBeGreaterThan(0);
      expect(mixed!.b).toBeGreaterThan(0);
    });

    test('should handle different weights', () => {
      const result1 = Color.Manipulate.mix('red', 'blue', 75);
      const result2 = Color.Manipulate.mix('red', 'blue', 25);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).not.toBe(result2);
    });
  });

  describe('complement', () => {
    test('should find complement color', () => {
      const result = Color.Manipulate.complement('red');
      expect(result).toBeDefined();

      // Red's complement should be cyan-ish
      const complement = Color.HSL.fromRgb(Color.hexToRgb(result!)!);
      expect(complement.h).toBeCloseTo(180, 0);
    });
  });

  describe('invert', () => {
    test('should invert colors', () => {
      const result = Color.Manipulate.invert('#FF0000');
      expect(result).toBe('#00FFFF');

      const result2 = Color.Manipulate.invert('#000000');
      expect(result2).toBe('#FFFFFF');
    });
  });
});

describe('Color palette generation', () => {
  describe('monochromatic', () => {
    test('should generate monochromatic palette', () => {
      const palette = Color.Palette.monochromatic('red', 5);
      expect(palette).toHaveLength(5);

      // All colors should have same hue
      const hues = palette.map((color) => {
        const rgb = Color.hexToRgb(color)!;
        return Color.HSL.fromRgb(rgb).h;
      });

      // All hues should be the same (or close for red which can be 0 or 360)
      const firstHue = hues[0];
      if (firstHue !== undefined) {
        for (const hue of hues) {
          expect(
            hue === firstHue || Math.abs(hue - firstHue) < 5 || Math.abs(hue - firstHue) > 355
          ).toBe(true);
        }
      }
    });

    test('should handle invalid colors', () => {
      const palette = Color.Palette.monochromatic('invalid', 3);
      expect(palette).toEqual([]);
    });
  });

  describe('analogous', () => {
    test('should generate analogous palette', () => {
      const palette = Color.Palette.analogous('red', 3, 30);
      expect(palette).toHaveLength(3);

      // Colors should have different hues
      const hues = palette.map((color) => {
        const rgb = Color.hexToRgb(color)!;
        return Color.HSL.fromRgb(rgb).h;
      });

      expect(new Set(hues).size).toBeGreaterThan(1);
    });
  });

  describe('complementary', () => {
    test('should generate complementary palette', () => {
      const palette = Color.Palette.complementary('red');
      expect(palette).toHaveLength(2);

      const hues = palette.map((color) => {
        const rgb = Color.hexToRgb(color)!;
        return Color.HSL.fromRgb(rgb).h;
      });

      // Should be roughly 180 degrees apart
      if (hues[0] !== undefined && hues[1] !== undefined) {
        const diff = Math.abs(hues[1] - hues[0]);
        expect(diff).toBeCloseTo(180, 0);
      }
    });
  });

  describe('triadic', () => {
    test('should generate triadic palette', () => {
      const palette = Color.Palette.triadic('red');
      expect(palette).toHaveLength(3);
    });
  });

  describe('tetradic', () => {
    test('should generate tetradic palette', () => {
      const palette = Color.Palette.tetradic('red');
      expect(palette).toHaveLength(4);
    });
  });

  describe('splitComplementary', () => {
    test('should generate split-complementary palette', () => {
      const palette = Color.Palette.splitComplementary('red', 30);
      expect(palette).toHaveLength(3);
    });
  });
});
