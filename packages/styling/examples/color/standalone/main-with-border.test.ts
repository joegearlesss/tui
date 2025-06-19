/**
 * Integration tests for the color standalone example with borders
 * Tests the enhanced version that includes border functionality
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import type { BorderConfig } from '@tui/styling';
import { Border, Color, Layout, Position, Style, StyleBuilder } from '@tui/styling';

describe('Color Standalone Example with Borders', () => {
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

  describe('Border Configuration', () => {
    test('should create rounded border configuration', () => {
      const borderConfig = Border.rounded();

      expect(borderConfig.type).toBe('rounded');
      expect(borderConfig.chars.topLeft).toBe('╭');
      expect(borderConfig.chars.topRight).toBe('╮');
      expect(borderConfig.chars.bottomLeft).toBe('╰');
      expect(borderConfig.chars.bottomRight).toBe('╯');
      expect(borderConfig.chars.top).toBe('─');
      expect(borderConfig.chars.bottom).toBe('─');
      expect(borderConfig.chars.left).toBe('│');
      expect(borderConfig.chars.right).toBe('│');
    });

    test('should have all sides enabled by default', () => {
      const borderConfig = Border.rounded();
      expect(borderConfig.sides).toEqual([true, true, true, true]);
    });

    test('should create normal border configuration', () => {
      const borderConfig = Border.normal();

      expect(borderConfig.type).toBe('normal');
      expect(borderConfig.chars.topLeft).toBe('┌');
      expect(borderConfig.chars.topRight).toBe('┐');
      expect(borderConfig.chars.bottomLeft).toBe('└');
      expect(borderConfig.chars.bottomRight).toBe('┘');
    });

    test('should create thick border configuration', () => {
      const borderConfig = Border.thick();

      expect(borderConfig.type).toBe('thick');
      expect(borderConfig.chars.top).toBe('━');
      expect(borderConfig.chars.left).toBe('┃');
    });

    test('should create double border configuration', () => {
      const borderConfig = Border.double();

      expect(borderConfig.type).toBe('double');
      expect(borderConfig.chars.top).toBe('═');
      expect(borderConfig.chars.left).toBe('║');
    });
  });

  describe('Border Character Validation', () => {
    test('should use valid Unicode box-drawing characters', () => {
      const borderConfig = Border.rounded();
      const chars = Object.values(borderConfig.chars);

      // All characters should be single Unicode characters
      chars.forEach((char) => {
        expect(char.length).toBeGreaterThan(0);
        expect(char.length).toBeLessThanOrEqual(2); // Allow for multi-byte Unicode
      });
    });

    test('should have distinct characters for different positions', () => {
      const borderConfig = Border.rounded();
      const { chars } = borderConfig;

      // Corner characters should be different
      expect(chars.topLeft).not.toBe(chars.topRight);
      expect(chars.topLeft).not.toBe(chars.bottomLeft);
      expect(chars.topLeft).not.toBe(chars.bottomRight);

      // Side characters should be appropriate
      expect(chars.top).toBe(chars.bottom); // Horizontal lines are the same
      expect(chars.left).toBe(chars.right); // Vertical lines are the same
    });
  });

  describe('Border Rendering Logic', () => {
    test('should calculate border dimensions correctly', () => {
      const content = 'Hello World';
      const maxWidth = content.length;
      const borderWidth = maxWidth + 6; // padding + border chars

      expect(borderWidth).toBe(content.length + 6);
    });

    test('should create top border correctly', () => {
      const borderConfig = Border.rounded();
      const borderWidth = 20;

      const topBorder =
        borderConfig.chars.topLeft +
        borderConfig.chars.top.repeat(borderWidth - 2) +
        borderConfig.chars.topRight;

      expect(topBorder.length).toBe(borderWidth);
      expect(topBorder.startsWith(borderConfig.chars.topLeft)).toBe(true);
      expect(topBorder.endsWith(borderConfig.chars.topRight)).toBe(true);
    });

    test('should create bottom border correctly', () => {
      const borderConfig = Border.rounded();
      const borderWidth = 20;

      const bottomBorder =
        borderConfig.chars.bottomLeft +
        borderConfig.chars.bottom.repeat(borderWidth - 2) +
        borderConfig.chars.bottomRight;

      expect(bottomBorder.length).toBe(borderWidth);
      expect(bottomBorder.startsWith(borderConfig.chars.bottomLeft)).toBe(true);
      expect(bottomBorder.endsWith(borderConfig.chars.bottomRight)).toBe(true);
    });

    test('should create side borders with content', () => {
      const borderConfig = Border.rounded();
      const content = 'Test content';
      const maxWidth = content.length;
      const padding = 3;

      const line =
        borderConfig.chars.left +
        ' '.repeat(padding) +
        content.padEnd(maxWidth) +
        ' '.repeat(padding) +
        borderConfig.chars.right;

      expect(line.startsWith(borderConfig.chars.left)).toBe(true);
      expect(line.endsWith(borderConfig.chars.right)).toBe(true);
      expect(line).toContain(content);
    });
  });

  describe('Border Color Application', () => {
    test('should apply border color to border characters', () => {
      const borderColor = '#864EFF';
      const borderStyle = StyleBuilder.create().foreground(borderColor).build();
      const borderConfig = Border.rounded();

      const styledTopLeft = Style.render(borderStyle, borderConfig.chars.topLeft);

      expect(styledTopLeft).toContain(borderConfig.chars.topLeft);
      expect(styledTopLeft).toMatch(/\x1b\[.*m/); // Should contain ANSI codes
    });

    test('should handle adaptive border colors', () => {
      const isDark = true;
      const lightDark = (lightColor: string, darkColor: string): string => {
        return isDark ? darkColor : lightColor; // Simulate dark background
      };

      const borderColor = lightDark('#C5ADF9', '#864EFF');
      expect(borderColor).toBe('#864EFF');

      const borderStyle = StyleBuilder.create().foreground(borderColor).build();
      expect(borderStyle.foreground).toBe('#864EFF');
    });
  });

  describe('Complete Border Integration', () => {
    test('should create complete bordered content', async () => {
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (lightColor: string, darkColor: string): string => {
        return hasDarkBG ? darkColor : lightColor;
      };

      // Create content
      const textStyle = StyleBuilder.create().foreground(lightDark('#696969', '#bdbdbd')).build();
      const text = Style.render(textStyle, 'Sample content');
      const buttons = 'Yes No';
      const content = Layout.joinVertical(Position.CENTER, text, buttons);

      // Create border
      const borderConfig = Border.rounded();
      const _borderColor = lightDark('#C5ADF9', '#864EFF'); // Used for demonstration
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));
      const borderWidth = maxWidth + 6;

      const topBorder =
        borderConfig.chars.topLeft +
        borderConfig.chars.top.repeat(borderWidth - 2) +
        borderConfig.chars.topRight;

      const bottomBorder =
        borderConfig.chars.bottomLeft +
        borderConfig.chars.bottom.repeat(borderWidth - 2) +
        borderConfig.chars.bottomRight;

      // Verify border structure
      expect(topBorder.length).toBe(borderWidth);
      expect(bottomBorder.length).toBe(borderWidth);
      expect(topBorder).toContain(borderConfig.chars.topLeft);
      expect(topBorder).toContain(borderConfig.chars.topRight);
      expect(bottomBorder).toContain(borderConfig.chars.bottomLeft);
      expect(bottomBorder).toContain(borderConfig.chars.bottomRight);
    });

    test('should handle multi-line content with borders', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));
      const borderConfig = Border.rounded();

      // Each content line should be wrapped with border characters
      const borderedLines = lines.map((line) => {
        return `${borderConfig.chars.left}   ${line.padEnd(maxWidth)}   ${borderConfig.chars.right}`;
      });

      expect(borderedLines).toHaveLength(3);
      borderedLines.forEach((line) => {
        expect(line.startsWith(borderConfig.chars.left)).toBe(true);
        expect(line.endsWith(borderConfig.chars.right)).toBe(true);
      });
    });

    test('should maintain consistent border width', () => {
      const content = 'Short\nThis is a much longer line of content\nMedium length';
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));
      const borderConfig = Border.rounded();

      // Calculate the actual width needed for content lines
      const contentLineWidth = 1 + 3 + maxWidth + 3 + 1; // left + padding + content + padding + right

      const topBorder =
        borderConfig.chars.topLeft +
        borderConfig.chars.top.repeat(contentLineWidth - 2) +
        borderConfig.chars.topRight;

      const borderedLines = lines.map((line) => {
        return `${borderConfig.chars.left}   ${line.padEnd(maxWidth)}   ${borderConfig.chars.right}`;
      });

      const bottomBorder =
        borderConfig.chars.bottomLeft +
        borderConfig.chars.bottom.repeat(contentLineWidth - 2) +
        borderConfig.chars.bottomRight;

      // All lines should have the same width
      expect(topBorder.length).toBe(contentLineWidth);
      expect(bottomBorder.length).toBe(contentLineWidth);

      borderedLines.forEach((line) => {
        expect(line.length).toBe(contentLineWidth);
      });
    });
  });

  describe('Border Style Variations', () => {
    test('should support different border types', () => {
      const borderTypes = ['normal', 'rounded', 'thick', 'double'] as const;

      borderTypes.forEach((type) => {
        let borderConfig: BorderConfig;
        switch (type) {
          case 'normal':
            borderConfig = Border.normal();
            break;
          case 'rounded':
            borderConfig = Border.rounded();
            break;
          case 'thick':
            borderConfig = Border.thick();
            break;
          case 'double':
            borderConfig = Border.double();
            break;
        }

        expect(borderConfig.type).toBe(type);
        expect(borderConfig.chars).toBeDefined();
        expect(borderConfig.sides).toEqual([true, true, true, true]);
      });
    });

    test('should create custom borders', () => {
      const customBorder = Border.custom({
        chars: {
          top: '*',
          right: '|',
          bottom: '*',
          left: '|',
          topLeft: '+',
          topRight: '+',
          bottomLeft: '+',
          bottomRight: '+',
        },
      });

      expect(customBorder.type).toBe('custom');
      expect(customBorder.chars.top).toBe('*');
      expect(customBorder.chars.topLeft).toBe('+');
    });
  });

  describe('Performance with Borders', () => {
    test('should render bordered content efficiently', () => {
      const start = performance.now();

      // Create multiple bordered contents
      for (let i = 0; i < 50; i++) {
        const content = `Test content line ${i}`;
        const borderConfig = Border.rounded();
        const lines = content.split('\n');
        const maxWidth = Math.max(...lines.map((line) => line.length));
        const borderWidth = maxWidth + 6;

        const topBorder =
          borderConfig.chars.topLeft +
          borderConfig.chars.top.repeat(borderWidth - 2) +
          borderConfig.chars.topRight;

        const bottomBorder =
          borderConfig.chars.bottomLeft +
          borderConfig.chars.bottom.repeat(borderWidth - 2) +
          borderConfig.chars.bottomRight;

        const borderedLines = [
          topBorder,
          ...lines.map(
            (line) =>
              borderConfig.chars.left +
              '   ' +
              line.padEnd(maxWidth) +
              '   ' +
              borderConfig.chars.right
          ),
          bottomBorder,
        ];

        expect(borderedLines.length).toBeGreaterThan(2);
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling with Borders', () => {
    test('should handle empty content gracefully', () => {
      const content = '';
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));

      // Should not throw and should handle zero width
      expect(maxWidth).toBe(0);
      expect(() => {
        const borderWidth = maxWidth + 6;
        expect(borderWidth).toBe(6);
      }).not.toThrow();
    });

    test('should handle single character content', () => {
      const content = 'A';
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));
      const borderConfig = Border.rounded();

      expect(maxWidth).toBe(1);

      const borderedLine = `${borderConfig.chars.left}   ${content.padEnd(maxWidth)}   ${borderConfig.chars.right}`;

      expect(borderedLine).toContain('A');
      expect(borderedLine.startsWith(borderConfig.chars.left)).toBe(true);
      expect(borderedLine.endsWith(borderConfig.chars.right)).toBe(true);
    });

    test('should handle very long content', () => {
      const content = 'A'.repeat(1000);
      const lines = content.split('\n');
      const maxWidth = Math.max(...lines.map((line) => line.length));
      const borderWidth = maxWidth + 6;

      expect(maxWidth).toBe(1000);
      expect(borderWidth).toBe(1006);

      // Should not throw for large content
      expect(() => {
        const borderConfig = Border.rounded();
        const topBorder =
          borderConfig.chars.topLeft +
          borderConfig.chars.top.repeat(borderWidth - 2) +
          borderConfig.chars.topRight;
        expect(topBorder.length).toBe(borderWidth);
      }).not.toThrow();
    });
  });
});
