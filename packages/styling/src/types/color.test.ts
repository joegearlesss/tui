import { describe, expect, test } from 'bun:test';
import {
  AdaptiveColorSchema,
  ANSI256ColorSchema,
  ANSIColor,
  ColorValueSchema,
  CompleteColorSchema,
  HexColorSchema,
  RGBColorSchema,
} from './color';

describe('Color Types', () => {
  describe('ANSIColor constants', () => {
    test('should have correct ANSI color values', () => {
      expect(ANSIColor.BLACK).toBe(0);
      expect(ANSIColor.RED).toBe(1);
      expect(ANSIColor.GREEN).toBe(2);
      expect(ANSIColor.YELLOW).toBe(3);
      expect(ANSIColor.BLUE).toBe(4);
      expect(ANSIColor.MAGENTA).toBe(5);
      expect(ANSIColor.CYAN).toBe(6);
      expect(ANSIColor.WHITE).toBe(7);
      expect(ANSIColor.BRIGHT_BLACK).toBe(8);
      expect(ANSIColor.BRIGHT_WHITE).toBe(15);
    });
  });

  describe('RGBColorSchema validation', () => {
    test('should validate correct RGB values', () => {
      const validRGB = { r: 255, g: 128, b: 0 };
      expect(() => RGBColorSchema.parse(validRGB)).not.toThrow();

      const result = RGBColorSchema.parse(validRGB);
      expect(result).toEqual(validRGB);
    });

    test('should reject invalid RGB values', () => {
      expect(() => RGBColorSchema.parse({ r: -1, g: 128, b: 0 })).toThrow(
        'Red component must be 0-255'
      );
      expect(() => RGBColorSchema.parse({ r: 256, g: 128, b: 0 })).toThrow(
        'Red component must be 0-255'
      );
      expect(() => RGBColorSchema.parse({ r: 255, g: -1, b: 0 })).toThrow(
        'Green component must be 0-255'
      );
      expect(() => RGBColorSchema.parse({ r: 255, g: 256, b: 0 })).toThrow(
        'Green component must be 0-255'
      );
    });

    test('should allow boundary RGB values', () => {
      expect(() => RGBColorSchema.parse({ r: 0, g: 0, b: 0 })).not.toThrow();
      expect(() => RGBColorSchema.parse({ r: 255, g: 255, b: 255 })).not.toThrow();
    });
  });

  describe('HexColorSchema validation', () => {
    test('should validate correct hex colors', () => {
      expect(() => HexColorSchema.parse('#FF0000')).not.toThrow();
      expect(() => HexColorSchema.parse('#00ff00')).not.toThrow();
      expect(() => HexColorSchema.parse('#0000FF')).not.toThrow();
      expect(() => HexColorSchema.parse('#123ABC')).not.toThrow();
    });

    test('should reject invalid hex colors', () => {
      expect(() => HexColorSchema.parse('FF0000')).toThrow('Hex color must be in format #RRGGBB');
      expect(() => HexColorSchema.parse('#FF00')).toThrow('Hex color must be in format #RRGGBB');
      expect(() => HexColorSchema.parse('#FF0000FF')).toThrow(
        'Hex color must be in format #RRGGBB'
      );
      expect(() => HexColorSchema.parse('#GG0000')).toThrow('Hex color must be in format #RRGGBB');
    });
  });

  describe('ANSI256ColorSchema validation', () => {
    test('should validate correct ANSI 256 values', () => {
      expect(() => ANSI256ColorSchema.parse(0)).not.toThrow();
      expect(() => ANSI256ColorSchema.parse(128)).not.toThrow();
      expect(() => ANSI256ColorSchema.parse(255)).not.toThrow();
    });

    test('should reject invalid ANSI 256 values', () => {
      expect(() => ANSI256ColorSchema.parse(-1)).toThrow('ANSI 256 color index must be 0-255');
      expect(() => ANSI256ColorSchema.parse(256)).toThrow('ANSI 256 color index must be 0-255');
    });
  });

  describe('CompleteColorSchema validation', () => {
    test('should validate complete color with all fields', () => {
      const completeColor = {
        trueColor: '#FF0000',
        ansi256: 196,
        ansi: 1,
      };

      expect(() => CompleteColorSchema.parse(completeColor)).not.toThrow();
    });

    test('should validate complete color with partial fields', () => {
      const partialColor = {
        trueColor: '#FF0000',
      };

      expect(() => CompleteColorSchema.parse(partialColor)).not.toThrow();

      const result = CompleteColorSchema.parse(partialColor);
      expect(result.trueColor).toBe('#FF0000');
      expect(result.ansi256).toBeUndefined();
    });

    test('should validate empty complete color', () => {
      expect(() => CompleteColorSchema.parse({})).not.toThrow();
    });
  });

  describe('AdaptiveColorSchema validation', () => {
    test('should validate adaptive color with hex values', () => {
      const adaptiveColor = {
        light: '#000000',
        dark: '#FFFFFF',
      };

      expect(() => AdaptiveColorSchema.parse(adaptiveColor)).not.toThrow();
    });

    test('should validate adaptive color with mixed types', () => {
      const adaptiveColor = {
        light: '#000000',
        dark: 255,
      };

      expect(() => AdaptiveColorSchema.parse(adaptiveColor)).not.toThrow();
    });

    test('should require both light and dark values', () => {
      expect(() => AdaptiveColorSchema.parse({ light: '#000000' })).toThrow();
      expect(() => AdaptiveColorSchema.parse({ dark: '#FFFFFF' })).toThrow();
    });
  });

  describe('ColorValueSchema validation', () => {
    test('should validate all color value types', () => {
      expect(() => ColorValueSchema.parse('#FF0000')).not.toThrow();
      expect(() => ColorValueSchema.parse(196)).not.toThrow();
      expect(() => ColorValueSchema.parse('transparent')).not.toThrow();
      expect(() => ColorValueSchema.parse({ light: '#000000', dark: '#FFFFFF' })).not.toThrow();
      expect(() => ColorValueSchema.parse({ trueColor: '#FF0000', ansi: 1 })).not.toThrow();
    });

    test('should reject invalid color values', () => {
      expect(() => ColorValueSchema.parse('invalid')).toThrow();
      expect(() => ColorValueSchema.parse(-1)).toThrow();
      expect(() => ColorValueSchema.parse(256)).toThrow();
    });
  });
});
