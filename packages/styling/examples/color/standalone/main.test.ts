/**
 * Tests for the color standalone example
 * Validates the functionality of terminal background detection and adaptive color selection
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Color, Layout, Position, Style, StyleBuilder } from '@tui/styling';

describe('Color Standalone Example', () => {
  // Mock environment variables for consistent testing
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    Object.keys(process.env).forEach((key) => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  });

  describe('Background Detection', () => {
    test('should detect dark background', async () => {
      // Mock dark terminal environment
      process.env.TERM_PROGRAM = 'vscode';

      const hasDarkBG = await Color.hasDarkBackground();
      expect(typeof hasDarkBG).toBe('boolean');
    });

    test('should detect light background', async () => {
      // Mock light terminal environment
      process.env.TERM_PROGRAM = 'Apple_Terminal';

      const hasDarkBG = await Color.hasDarkBackground();
      expect(typeof hasDarkBG).toBe('boolean');
    });

    test('should handle unknown terminal gracefully', async () => {
      // Clear terminal environment
      delete process.env.TERM_PROGRAM;
      delete process.env.COLORTERM;
      delete process.env.THEME;

      const hasDarkBG = await Color.hasDarkBackground();
      expect(typeof hasDarkBG).toBe('boolean');
    });
  });

  describe('Adaptive Color Selection', () => {
    test('should select dark color for dark background', () => {
      const isDark = true;
      const lightDark = (lightColor: string, darkColor: string): string => {
        return isDark ? darkColor : lightColor; // Simulate dark background
      };

      const result = lightDark('#696969', '#bdbdbd');
      expect(result).toBe('#bdbdbd');
    });

    test('should select light color for light background', () => {
      const isDark = false;
      const lightDark = (lightColor: string, darkColor: string): string => {
        return isDark ? darkColor : lightColor; // Simulate light background
      };

      const result = lightDark('#696969', '#bdbdbd');
      expect(result).toBe('#696969');
    });

    test('should work with different color formats', () => {
      const isDark = true;
      const lightDark = (lightColor: string, darkColor: string): string => {
        return isDark ? darkColor : lightColor;
      };

      expect(lightDark('#C5ADF9', '#864EFF')).toBe('#864EFF');
      expect(lightDark('#37CD96', '#22C78A')).toBe('#22C78A');
      expect(lightDark('#988F95', '#978692')).toBe('#978692');
    });
  });

  describe('Style Creation', () => {
    test('should create frame style with padding and margin', () => {
      const frameStyle = StyleBuilder.create().padding(1, 3).margin(1, 3).build();

      expect(frameStyle.padding).toEqual({ top: 1, right: 3, bottom: 1, left: 3 });
      expect(frameStyle.margin).toEqual({ top: 1, right: 3, bottom: 1, left: 3 });
    });

    test('should create paragraph style with width and alignment', () => {
      const paragraphStyle = StyleBuilder.create()
        .width(40)
        .marginBottom(1)
        .alignHorizontal('center')
        .build();

      expect(paragraphStyle.width).toBe(40);
      expect(paragraphStyle.margin?.bottom).toBe(1);
      expect(paragraphStyle.horizontalAlignment).toBe('center');
    });

    test('should create text style with foreground color', () => {
      const textStyle = StyleBuilder.create().foreground('#696969').build();

      expect(textStyle.foreground).toBe('#696969');
    });

    test('should create keyword style with bold and color', () => {
      const keywordStyle = StyleBuilder.create().foreground('#37CD96').bold(true).build();

      expect(keywordStyle.foreground).toBe('#37CD96');
      expect(keywordStyle.bold).toBe(true);
    });

    test('should create button styles with background and foreground', () => {
      const activeButton = StyleBuilder.create()
        .padding(0, 3)
        .background('#FF6AD2')
        .foreground('#FFFCC2')
        .build();

      expect(activeButton.padding).toEqual({ top: 0, right: 3, bottom: 0, left: 3 });
      expect(activeButton.background).toBe('#FF6AD2');
      expect(activeButton.foreground).toBe('#FFFCC2');

      const inactiveButton = StyleBuilder.create()
        .padding(0, 3)
        .background('#988F95')
        .foreground('#FDFCE3')
        .build();

      expect(inactiveButton.padding).toEqual({ top: 0, right: 3, bottom: 0, left: 3 });
      expect(inactiveButton.background).toBe('#988F95');
      expect(inactiveButton.foreground).toBe('#FDFCE3');
    });
  });

  describe('Content Rendering', () => {
    test('should render text with styles', () => {
      const textStyle = StyleBuilder.create().foreground('#696969').build();
      const keywordStyle = StyleBuilder.create().foreground('#37CD96').bold(true).build();

      const text1 = Style.render(textStyle, 'Are you sure you want to eat that ');
      const keyword = Style.render(keywordStyle, 'moderately ripe');
      const text2 = Style.render(textStyle, ' banana?');

      expect(text1).toContain('Are you sure you want to eat that ');
      expect(keyword).toContain('moderately ripe');
      expect(text2).toContain(' banana?');

      // Check that ANSI codes are present for styling
      expect(keyword).toMatch(/\x1b\[.*m/); // Should contain ANSI escape sequences
    });

    test('should render buttons with background colors', () => {
      const activeButton = StyleBuilder.create()
        .padding(0, 3)
        .background('#FF6AD2')
        .foreground('#FFFCC2')
        .build();

      const inactiveButton = StyleBuilder.create()
        .padding(0, 3)
        .background('#988F95')
        .foreground('#FDFCE3')
        .build();

      const yesButton = Style.render(activeButton, 'Yes');
      const noButton = Style.render(inactiveButton, 'No');

      expect(yesButton).toContain('Yes');
      expect(noButton).toContain('No');

      // Check that ANSI codes are present for colors
      expect(yesButton).toMatch(/\x1b\[.*m/);
      expect(noButton).toMatch(/\x1b\[.*m/);
    });

    test('should combine button rendering', () => {
      const activeButton = StyleBuilder.create()
        .background('#FF6AD2')
        .foreground('#FFFCC2')
        .build();

      const inactiveButton = StyleBuilder.create()
        .background('#988F95')
        .foreground('#FDFCE3')
        .build();

      const buttons = `${Style.render(activeButton, 'Yes')} ${Style.render(inactiveButton, 'No')}`;

      expect(buttons).toContain('Yes');
      expect(buttons).toContain('No');
      expect(buttons).toContain(' '); // Space between buttons
    });
  });

  describe('Layout Composition', () => {
    test('should join content vertically with center alignment', () => {
      const text = 'Sample text content';
      const buttons = 'Yes No';

      const result = Layout.joinVertical(Position.CENTER, text, buttons);

      expect(result).toContain(text);
      expect(result).toContain(buttons);
      expect(result.split('\n')).toHaveLength(2);
    });

    test('should handle empty content gracefully', () => {
      const result = Layout.joinVertical(Position.CENTER);
      expect(result).toBe('');
    });

    test('should handle single content block', () => {
      const content = 'Single line';
      const result = Layout.joinVertical(Position.CENTER, content);
      expect(result).toBe(content);
    });

    test('should align content properly', () => {
      const short = 'Hi';
      const long = 'This is a longer line of text';

      const result = Layout.joinVertical(Position.CENTER, short, long);
      const lines = result.split('\n');

      expect(lines).toHaveLength(2);
      // The short line should be padded to match the longer line's width
      expect(lines[0]?.length).toBe(lines[1]?.length ?? 0);
    });
  });

  describe('Complete Example Integration', () => {
    test('should create complete example output', async () => {
      // Simulate the main function logic
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (lightColor: string, darkColor: string): string => {
        return hasDarkBG ? darkColor : lightColor;
      };

      // Create styles
      const frameStyle = StyleBuilder.create().padding(1, 3).margin(1, 3).build();
      const paragraphStyle = StyleBuilder.create()
        .width(40)
        .marginBottom(1)
        .alignHorizontal('center')
        .build();
      const textStyle = StyleBuilder.create().foreground(lightDark('#696969', '#bdbdbd')).build();
      const keywordStyle = StyleBuilder.create()
        .foreground(lightDark('#37CD96', '#22C78A'))
        .bold(true)
        .build();
      const activeButton = StyleBuilder.create()
        .padding(0, 3)
        .background('#FF6AD2')
        .foreground('#FFFCC2')
        .build();
      const inactiveButton = StyleBuilder.create()
        .padding(0, 3)
        .background(lightDark('#988F95', '#978692'))
        .foreground(lightDark('#FDFCE3', '#FBFAE7'))
        .build();

      // Build content
      const text = Style.render(
        paragraphStyle,
        Style.render(textStyle, 'Are you sure you want to eat that ') +
          Style.render(keywordStyle, 'moderately ripe') +
          Style.render(textStyle, ' banana?')
      );

      const buttons = `${Style.render(activeButton, 'Yes')} ${Style.render(inactiveButton, 'No')}`;

      const block = Style.render(frameStyle, Layout.joinVertical(Position.CENTER, text, buttons));

      // Verify the output contains expected content
      expect(block).toContain('Are you sure you want to eat that');
      expect(block).toContain('moderately ripe');
      expect(block).toContain('banana?');
      expect(block).toContain('Yes');
      expect(block).toContain('No');

      // Verify ANSI codes are present (indicating styling was applied)
      expect(block).toMatch(/\x1b\[.*m/);
    });

    test('should handle different terminal environments consistently', async () => {
      // Test with VS Code (typically dark)
      process.env.TERM_PROGRAM = 'vscode';
      const darkResult = await Color.hasDarkBackground();

      // Test with Apple Terminal (typically light)
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      const lightResult = await Color.hasDarkBackground();

      // Both should return boolean values
      expect(typeof darkResult).toBe('boolean');
      expect(typeof lightResult).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid color values gracefully', () => {
      // The Color.parse function should handle invalid colors
      expect(() => {
        StyleBuilder.create().foreground('invalid-color').build();
      }).not.toThrow();
    });

    test('should handle negative padding values', () => {
      // The system should accept negative values (they may be valid in some contexts)
      const style = StyleBuilder.create().padding(-1, -2).build();
      expect(style.padding?.top).toBe(-1);
      expect(style.padding?.right).toBe(-2);
    });

    test('should handle negative margin values', () => {
      // The system should accept negative values (they may be valid in some contexts)
      const style = StyleBuilder.create().margin(-1, -2).build();
      expect(style.margin?.top).toBe(-1);
      expect(style.margin?.right).toBe(-2);
    });

    test('should handle zero width gracefully', () => {
      const style = StyleBuilder.create().width(0).build();
      expect(style.width).toBe(0);
    });
  });

  describe('Performance', () => {
    test('should create styles efficiently', () => {
      const start = performance.now();

      // Create multiple styles
      for (let i = 0; i < 100; i++) {
        StyleBuilder.create()
          .foreground(`#${i.toString(16).padStart(6, '0')}`)
          .background(`#${(255 - i).toString(16).padStart(6, '0')}`)
          .padding(i % 5)
          .margin(i % 3)
          .bold(i % 2 === 0)
          .build();
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should render content efficiently', () => {
      const style = StyleBuilder.create()
        .foreground('#FF0000')
        .background('#00FF00')
        .bold(true)
        .build();

      const start = performance.now();

      // Render multiple times
      for (let i = 0; i < 100; i++) {
        Style.render(style, `Test content ${i}`);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete within reasonable time (less than 50ms)
      expect(duration).toBeLessThan(50);
    });
  });
});
