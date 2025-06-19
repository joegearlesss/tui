import { describe, expect, test } from 'bun:test';
import { Color } from './color';

describe('Color utilities', () => {
  describe('Color constants', () => {
    test('should have correct ANSI color values', () => {
      expect(Color.BLACK).toBe(0);
      expect(Color.RED).toBe(1);
      expect(Color.GREEN).toBe(2);
      expect(Color.YELLOW).toBe(3);
      expect(Color.BLUE).toBe(4);
      expect(Color.MAGENTA).toBe(5);
      expect(Color.CYAN).toBe(6);
      expect(Color.WHITE).toBe(7);
      expect(Color.BRIGHT_BLACK).toBe(8);
      expect(Color.BRIGHT_WHITE).toBe(15);
    });
  });

  describe('parse', () => {
    test('should parse hex colors', () => {
      expect(Color.parse('#FF0000')).toBe('#FF0000');
      expect(Color.parse('#00ff00')).toBe('#00FF00');
      expect(Color.parse('#0000FF')).toBe('#0000FF');
    });

    test('should parse named colors', () => {
      expect(Color.parse('red')).toBe('#FF0000');
      expect(Color.parse('green')).toBe('#00FF00');
      expect(Color.parse('blue')).toBe('#0000FF');
      expect(Color.parse('transparent')).toBe('transparent');
    });

    test('should parse ANSI numbers', () => {
      expect(Color.parse(0)).toBe(0);
      expect(Color.parse(255)).toBe(255);
      expect(Color.parse('196')).toBe(196);
    });

    test('should handle invalid colors', () => {
      expect(Color.parse('invalid')).toBeUndefined();
      expect(Color.parse('#GG0000')).toBeUndefined();
      expect(Color.parse(-1)).toBeUndefined();
      expect(Color.parse(256)).toBeUndefined();
    });

    test('should handle case insensitive named colors', () => {
      expect(Color.parse('RED')).toBe('#FF0000');
      expect(Color.parse('Red')).toBe('#FF0000');
      expect(Color.parse('rEd')).toBe('#FF0000');
    });
  });

  describe('parseHex', () => {
    test('should parse valid hex colors', () => {
      expect(Color.parseHex('#FF0000')).toBe('#FF0000');
      expect(Color.parseHex('FF0000')).toBe('#FF0000');
      expect(Color.parseHex('#00ff00')).toBe('#00FF00');
    });

    test('should reject invalid hex colors', () => {
      expect(Color.parseHex('#FF00')).toBeUndefined();
      expect(Color.parseHex('#FF0000FF')).toBeUndefined();
      expect(Color.parseHex('#GG0000')).toBeUndefined();
      expect(Color.parseHex('invalid')).toBeUndefined();
    });

    test('should normalize hex colors to uppercase', () => {
      expect(Color.parseHex('#ff0000')).toBe('#FF0000');
      expect(Color.parseHex('#aAbBcC')).toBe('#AABBCC');
    });
  });

  describe('parseNamed', () => {
    test('should parse standard named colors', () => {
      expect(Color.parseNamed('red')).toBe('#FF0000');
      expect(Color.parseNamed('green')).toBe('#00FF00');
      expect(Color.parseNamed('blue')).toBe('#0000FF');
      expect(Color.parseNamed('white')).toBe('#FFFFFF');
      expect(Color.parseNamed('black')).toBe('#000000');
    });

    test('should handle case insensitive names', () => {
      expect(Color.parseNamed('RED')).toBe('#FF0000');
      expect(Color.parseNamed('Red')).toBe('#FF0000');
      expect(Color.parseNamed('rEd')).toBe('#FF0000');
    });

    test('should return undefined for invalid names', () => {
      expect(Color.parseNamed('invalid')).toBeUndefined();
      expect(Color.parseNamed('')).toBeUndefined();
      expect(Color.parseNamed('notacolor')).toBeUndefined();
    });

    test('should support color aliases', () => {
      expect(Color.parseNamed('gray')).toBe('#808080');
      expect(Color.parseNamed('grey')).toBe('#808080');
    });
  });

  describe('parseANSI256', () => {
    test('should parse valid ANSI 256 values', () => {
      expect(Color.parseANSI256(0)).toBe(0);
      expect(Color.parseANSI256(128)).toBe(128);
      expect(Color.parseANSI256(255)).toBe(255);
    });

    test('should reject invalid ANSI 256 values', () => {
      expect(Color.parseANSI256(-1)).toBeUndefined();
      expect(Color.parseANSI256(256)).toBeUndefined();
      expect(Color.parseANSI256(1.5)).toBeUndefined();
      expect(Color.parseANSI256(Number.NaN)).toBeUndefined();
    });
  });

  describe('rgb', () => {
    test('should create valid RGB colors', () => {
      expect(Color.rgb(255, 0, 0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(Color.rgb(0, 255, 0)).toEqual({ r: 0, g: 255, b: 0 });
      expect(Color.rgb(0, 0, 255)).toEqual({ r: 0, g: 0, b: 255 });
    });

    test('should reject invalid RGB values', () => {
      expect(Color.rgb(-1, 0, 0)).toBeUndefined();
      expect(Color.rgb(256, 0, 0)).toBeUndefined();
      expect(Color.rgb(255, -1, 0)).toBeUndefined();
      expect(Color.rgb(255, 256, 0)).toBeUndefined();
      expect(Color.rgb(255, 0, -1)).toBeUndefined();
      expect(Color.rgb(255, 0, 256)).toBeUndefined();
    });

    test('should handle boundary values', () => {
      expect(Color.rgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
      expect(Color.rgb(255, 255, 255)).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('complete', () => {
    test('should create complete color with all options', () => {
      const complete = Color.complete({
        trueColor: '#FF0000',
        ansi256: 196,
        ansi: 1,
      });

      expect(complete).toEqual({
        trueColor: '#FF0000',
        ansi256: 196,
        ansi: 1,
      });
    });

    test('should create complete color with partial options', () => {
      const complete = Color.complete({
        trueColor: '#FF0000',
      });

      expect(complete).toEqual({
        trueColor: '#FF0000',
        ansi256: undefined,
        ansi: undefined,
      });
    });

    test('should create empty complete color', () => {
      const complete = Color.complete({});

      expect(complete).toEqual({
        trueColor: undefined,
        ansi256: undefined,
        ansi: undefined,
      });
    });
  });

  describe('adaptive', () => {
    test('should create adaptive color', () => {
      const adaptive = Color.adaptive('#000000', '#FFFFFF');

      expect(adaptive).toEqual({
        light: '#000000',
        dark: '#FFFFFF',
      });
    });

    test('should work with different color types', () => {
      const adaptive = Color.adaptive('#000000', 255);

      expect(adaptive).toEqual({
        light: '#000000',
        dark: 255,
      });
    });
  });

  describe('noColor', () => {
    test('should return transparent', () => {
      expect(Color.noColor()).toBe('transparent');
    });
  });

  describe('rgbToHex', () => {
    test('should convert RGB to hex', () => {
      expect(Color.rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000');
      expect(Color.rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00FF00');
      expect(Color.rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000FF');
      expect(Color.rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF');
      expect(Color.rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    });

    test('should handle intermediate values', () => {
      expect(Color.rgbToHex({ r: 128, g: 128, b: 128 })).toBe('#808080');
      expect(Color.rgbToHex({ r: 255, g: 165, b: 0 })).toBe('#FFA500');
    });

    test('should round fractional values', () => {
      expect(Color.rgbToHex({ r: 255.7, g: 0.3, b: 0.8 })).toBe('#FF0001');
    });
  });

  describe('hexToRgb', () => {
    test('should convert hex to RGB', () => {
      expect(Color.hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(Color.hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(Color.hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(Color.hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(Color.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    test('should handle lowercase hex', () => {
      expect(Color.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(Color.hexToRgb('#aabbcc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    test('should return undefined for invalid hex', () => {
      expect(Color.hexToRgb('#FF00' as never)).toBeUndefined();
      expect(Color.hexToRgb('#GG0000' as never)).toBeUndefined();
      expect(Color.hexToRgb('FF0000' as never)).toBeUndefined();
    });
  });

  describe('getColorForProfile', () => {
    test('should handle transparent color', () => {
      expect(Color.getColorForProfile('transparent', 'truecolor')).toBeUndefined();
      expect(Color.getColorForProfile('transparent', 'ansi')).toBeUndefined();
    });

    test('should handle hex colors', () => {
      expect(Color.getColorForProfile('#FF0000', 'truecolor')).toBe('#FF0000');
      expect(Color.getColorForProfile('#FF0000', 'ansi256')).toBe('#FF0000');
    });

    test('should handle ANSI colors', () => {
      expect(Color.getColorForProfile(196, 'truecolor')).toBe(196);
      expect(Color.getColorForProfile(196, 'ansi256')).toBe(196);
      expect(Color.getColorForProfile(196, 'ansi')).toBeUndefined();
      expect(Color.getColorForProfile(7, 'ansi')).toBe(7);
    });

    test('should handle complete colors', () => {
      const complete = {
        trueColor: '#FF0000',
        ansi256: 196,
        ansi: 1,
      };

      expect(Color.getColorForProfile(complete, 'truecolor')).toBe('#FF0000');
      expect(Color.getColorForProfile(complete, 'ansi256')).toBe(196);
      expect(Color.getColorForProfile(complete, 'ansi')).toBe(1);
    });

    test('should handle adaptive colors', () => {
      const adaptive = {
        light: '#000000',
        dark: '#FFFFFF',
      };

      // Should use light color (would need theme detection in real implementation)
      expect(Color.getColorForProfile(adaptive, 'truecolor')).toBe('#000000');
    });
  });

  describe('utility functions', () => {
    test('getNamedColors should return all named colors', () => {
      const named = Color.getNamedColors();
      expect(named.red).toBe('#FF0000');
      expect(named.green).toBe('#00FF00');
      expect(named.blue).toBe('#0000FF');
      expect(Object.keys(named).length).toBeGreaterThan(10);
    });

    test('isValidColorName should validate color names', () => {
      expect(Color.isValidColorName('red')).toBe(true);
      expect(Color.isValidColorName('RED')).toBe(true);
      expect(Color.isValidColorName('invalid')).toBe(false);
      expect(Color.isValidColorName('')).toBe(false);
    });

    test('toComplete should return ANSI codes for named colors', () => {
      const red = Color.toComplete('red');
      expect(red).toEqual({ ansi: 1, hex: '#FF0000' });

      const blue = Color.toComplete('blue');
      expect(blue).toEqual({ ansi: 4, hex: '#0000FF' });
    });

    test('toComplete should return hex only for hex colors', () => {
      const color = Color.toComplete('#FF0000');
      expect(color).toEqual({ ansi: undefined, hex: '#FF0000' });
    });
  });

  describe('background detection', () => {
    test('hasDarkBackground should return background detection result', async () => {
      const result = await Color.hasDarkBackground();
      expect(typeof result === 'boolean' || result === undefined).toBe(true);
    });

    test('hasDarkBackgroundSync should return background detection result', () => {
      const result = Color.hasDarkBackgroundSync();
      expect(typeof result === 'boolean' || result === undefined).toBe(true);
    });

    test('hasDarkBackgroundSync should handle missing terminal module gracefully', () => {
      // This test ensures the function doesn't throw when terminal detection fails
      expect(() => Color.hasDarkBackgroundSync()).not.toThrow();
    });
  });
});
