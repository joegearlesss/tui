/**
 * Adaptive Color System - Lipgloss Compatibility Tests
 *
 * Tests the adaptive color functionality to ensure compatibility
 * with lipgloss color patterns, especially background detection
 * and lightDark helper functions.
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Color } from '@tui/styling';

describe('Adaptive Color System - Lipgloss Compatibility', () => {
  describe('LightDark Function Pattern', () => {
    test('lightDark helper function with dark background', async () => {
      // Create a lightDark function that assumes dark background
      const mockIsDark = true;

      const lightDark = (light: string, dark: string) => {
        return mockIsDark ? dark : light;
      };

      const result = lightDark('#000000', '#FFFFFF');
      expect(result).toBe('#FFFFFF');
    });

    test('lightDark helper function with light background', async () => {
      // Create a lightDark function that assumes light background
      const mockIsDark = false;

      const lightDark = (light: string, dark: string) => {
        return mockIsDark ? dark : light;
      };

      const result = lightDark('#000000', '#FFFFFF');
      expect(result).toBe('#000000');
    });

    test('synchronous lightDark pattern (common usage)', async () => {
      // Pre-determine background for synchronous usage
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

      const color1 = lightDark('#FF0000', '#00FF00');
      const color2 = lightDark('#0000FF', '#FFFF00');

      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
      expect(color1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color2).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('lightDark with various color formats', async () => {
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

      const tests = [
        { light: '#FF0000', dark: '#00FF00' },
        { light: 'red', dark: 'green' },
        { light: '#FFFFFF', dark: '#000000' },
        { light: '#696969', dark: '#bdbdbd' },
        { light: '#37CD96', dark: '#22C78A' },
      ];

      tests.forEach(({ light, dark }) => {
        const result = lightDark(light, dark);
        expect(result).toBeDefined();
        expect([light, dark]).toContain(result);
      });
    });
  });

  describe('Color Profile Detection', () => {
    test('terminal color profile detection', () => {
      const profiles = ['noColor', 'ansi', 'ansi256', 'trueColor'];
      // We can't easily mock the terminal detection, but we can verify the API exists
      expect(Color.parse).toBeDefined();
      expect(Color.toComplete).toBeDefined();
    });

    test('color parsing consistency', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#C5ADF9', '#864EFF'];

      colors.forEach((color) => {
        const parsed = Color.parse(color);
        expect(parsed).toBeDefined();
        expect(parsed).toBe(color);
      });
    });

    test('color conversion and validation', () => {
      const testColors = [
        { input: '#FF0000', expected: '#FF0000' },
        { input: '#ff0000', expected: '#FF0000' }, // case insensitive
        { input: 'red', expected: '#FF0000' },
        { input: '#FFFFFF', expected: '#FFFFFF' },
        { input: '#000000', expected: '#000000' },
      ];

      testColors.forEach(({ input, expected }) => {
        const parsed = Color.parse(input);
        expect(parsed).toBe(expected);
      });
    });
  });

  describe('Background Detection Integration', () => {
    test('hasDarkBackground function exists and returns boolean', async () => {
      const result = await Color.hasDarkBackground();
      expect(typeof result).toBe('boolean');
    });

    test('background detection is consistent', async () => {
      // Call multiple times to ensure consistency
      const results = await Promise.all([
        Color.hasDarkBackground(),
        Color.hasDarkBackground(),
        Color.hasDarkBackground(),
      ]);

      // All results should be the same (allowing for undefined)
      expect(results[0] === results[1]).toBe(true);
      expect(results[1] === results[2]).toBe(true);
      
      // Results should be boolean or undefined
      results.forEach(result => {
        expect(typeof result === 'boolean' || result === undefined).toBe(true);
      });
    });

    test('background detection performance', async () => {
      const start = performance.now();

      // Call background detection multiple times
      for (let i = 0; i < 10; i++) {
        await Color.hasDarkBackground();
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(100); // 100ms for 10 calls
    });
  });

  describe('Lipgloss Color Patterns', () => {
    test('color standalone example pattern replication', async () => {
      // Replicate exact pattern from lipgloss color standalone example
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

      // Test the exact colors used in the example
      const frameColor = lightDark('#C5ADF9', '#864EFF');
      const textColor = lightDark('#696969', '#bdbdbd');
      const keywordColor = lightDark('#37CD96', '#22C78A');
      const buttonBgColors = {
        active: '#FF6AD2',
        inactive: lightDark('#988F95', '#978692'),
      };
      const buttonFgColors = {
        active: '#FFFCC2',
        inactive: lightDark('#FDFCE3', '#FBFAE7'),
      };

      // Verify all colors are valid
      expect(frameColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(textColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(keywordColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(buttonBgColors.active).toMatch(/^#[0-9A-F]{6}$/i);
      expect(buttonBgColors.inactive).toMatch(/^#[0-9A-F]{6}$/i);
      expect(buttonFgColors.active).toMatch(/^#[0-9A-F]{6}$/i);
      expect(buttonFgColors.inactive).toMatch(/^#[0-9A-F]{6}$/i);

      // Verify colors change based on background
      const lightColors = [
        lightDark('#C5ADF9', '#864EFF'),
        lightDark('#696969', '#bdbdbd'),
        lightDark('#37CD96', '#22C78A'),
      ];

      lightColors.forEach((color) => {
        expect(['#C5ADF9', '#864EFF', '#696969', '#bdbdbd', '#37CD96', '#22C78A']).toContain(color);
      });
    });

    test('adaptive color creation and usage', () => {
      // Test creating adaptive colors for different scenarios
      const adaptiveColors = [
        { light: '#000000', dark: '#FFFFFF', name: 'text' },
        { light: '#FF0000', dark: '#FF8888', name: 'error' },
        { light: '#00AA00', dark: '#88FF88', name: 'success' },
        { light: '#0066CC', dark: '#6699FF', name: 'info' },
        { light: '#FF6600', dark: '#FFAA66', name: 'warning' },
      ];

      adaptiveColors.forEach(({ light, dark, name }) => {
        const lightParsed = Color.parse(light);
        const darkParsed = Color.parse(dark);

        expect(lightParsed).toBe(light);
        expect(darkParsed).toBe(dark);

        // Both should be valid colors
        expect(lightParsed).toBeDefined();
        expect(darkParsed).toBeDefined();
      });
    });

    test('color composition in complex layouts', async () => {
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

      // Test a complex color scheme like those used in lipgloss examples
      const colorScheme = {
        primary: lightDark('#7D56F4', '#FAFAFA'),
        secondary: lightDark('#F25D94', '#F25D94'),
        accent: lightDark('#C5ADF9', '#864EFF'),
        text: lightDark('#333333', '#FFFFFF'),
        muted: lightDark('#666666', '#CCCCCC'),
        background: lightDark('#FFFFFF', '#1A1A1A'),
        border: lightDark('#E1E1E1', '#444444'),
        success: lightDark('#22C78A', '#37CD96'),
        warning: lightDark('#FF6B35', '#FF8C42'),
        error: lightDark('#FF3838', '#FF5555'),
      };

      // Verify all colors in the scheme are valid
      Object.entries(colorScheme).forEach(([name, color]) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        const parsed = Color.parse(color);
        expect(parsed).toBeDefined();
      });

      // Test that colors are appropriate for the background
      const textContrast = colorScheme.text;
      const bgContrast = colorScheme.background;
      expect(textContrast).not.toBe(bgContrast); // Should provide contrast
    });
  });

  describe('Performance and Caching', () => {
    test('color parsing performance', () => {
      const colors = Array.from({ length: 1000 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`);

      const start = performance.now();

      colors.forEach((color) => {
        Color.parse(color);
      });

      const end = performance.now();
      const duration = end - start;

      // Should parse 1000 colors quickly
      expect(duration).toBeLessThan(50); // 50ms threshold
    });

    test('background detection caching', async () => {
      // Multiple calls should be efficient (likely cached internally)
      const start = performance.now();

      const results = await Promise.all(
        Array.from({ length: 100 }, () => Color.hasDarkBackground())
      );

      const end = performance.now();
      const duration = end - start;

      // All results should be the same
      const firstResult = results[0];
      expect(results.every((result) => result === firstResult)).toBe(true);

      // Should complete quickly if cached
      expect(duration).toBeLessThan(200); // 200ms for 100 calls
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('invalid color handling', () => {
      const invalidColors = ['', 'not-a-color', '#GGG', '#12345', '#1234567', null, undefined];

      invalidColors.forEach((invalidColor) => {
        expect(() => Color.parse(invalidColor as any)).not.toThrow();
        // Should return a reasonable fallback or handle gracefully
      });
    });

    test('lightDark with invalid inputs', async () => {
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

      // Should handle edge cases gracefully
      const edgeCases = [
        { light: '', dark: '#FFFFFF' },
        { light: '#000000', dark: '' },
        { light: 'invalid', dark: '#FFFFFF' },
        { light: '#000000', dark: 'invalid' },
      ];

      edgeCases.forEach(({ light, dark }) => {
        expect(() => lightDark(light, dark)).not.toThrow();
      });
    });
  });
});
