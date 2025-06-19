/**
 * Border Presets Tests
 *
 * Tests for predefined border configurations and preset functions
 */

import { describe, expect, test } from 'bun:test';
import { Border, BorderPresets } from './presets';

describe('Border Presets', () => {
  describe('Border namespace', () => {
    describe('normal()', () => {
      test('should create normal border configuration', () => {
        const border = Border.normal();

        expect(border.type).toBe('normal');
        expect(border.chars.top).toBe('─');
        expect(border.chars.right).toBe('│');
        expect(border.chars.bottom).toBe('─');
        expect(border.chars.left).toBe('│');
        expect(border.chars.topLeft).toBe('┌');
        expect(border.chars.topRight).toBe('┐');
        expect(border.chars.bottomLeft).toBe('└');
        expect(border.chars.bottomRight).toBe('┘');
        expect(border.sides).toEqual([true, true, true, true]);
      });

      test('should return immutable configuration', () => {
        const border = Border.normal();
        expect(Object.isFrozen(border.sides)).toBe(true);
      });

      test('should create new instance each time', () => {
        const border1 = Border.normal();
        const border2 = Border.normal();

        expect(border1).not.toBe(border2);
        expect(border1).toEqual(border2);
      });
    });

    describe('rounded()', () => {
      test('should create rounded border configuration', () => {
        const border = Border.rounded();

        expect(border.type).toBe('rounded');
        expect(border.chars.topLeft).toBe('╭');
        expect(border.chars.topRight).toBe('╮');
        expect(border.chars.bottomLeft).toBe('╰');
        expect(border.chars.bottomRight).toBe('╯');
        expect(border.chars.top).toBe('─');
        expect(border.chars.right).toBe('│');
        expect(border.chars.bottom).toBe('─');
        expect(border.chars.left).toBe('│');
        expect(border.sides).toEqual([true, true, true, true]);
      });
    });

    describe('thick()', () => {
      test('should create thick border configuration', () => {
        const border = Border.thick();

        expect(border.type).toBe('thick');
        expect(border.chars.top).toBe('━');
        expect(border.chars.right).toBe('┃');
        expect(border.chars.bottom).toBe('━');
        expect(border.chars.left).toBe('┃');
        expect(border.chars.topLeft).toBe('┏');
        expect(border.chars.topRight).toBe('┓');
        expect(border.chars.bottomLeft).toBe('┗');
        expect(border.chars.bottomRight).toBe('┛');
        expect(border.sides).toEqual([true, true, true, true]);
      });
    });

    describe('double()', () => {
      test('should create double border configuration', () => {
        const border = Border.double();

        expect(border.type).toBe('double');
        expect(border.chars.top).toBe('═');
        expect(border.chars.right).toBe('║');
        expect(border.chars.bottom).toBe('═');
        expect(border.chars.left).toBe('║');
        expect(border.chars.topLeft).toBe('╔');
        expect(border.chars.topRight).toBe('╗');
        expect(border.chars.bottomLeft).toBe('╚');
        expect(border.chars.bottomRight).toBe('╝');
        expect(border.sides).toEqual([true, true, true, true]);
      });
    });

    describe('custom()', () => {
      test('should create custom border with partial chars', () => {
        const customConfig = {
          chars: {
            top: '═',
            bottom: '═',
          },
        };

        const border = Border.custom(customConfig);

        expect(border.type).toBe('custom');
        expect(border.chars.top).toBe('═');
        expect(border.chars.bottom).toBe('═');
        // Should inherit other chars from normal border
        expect(border.chars.left).toBe('│');
        expect(border.chars.right).toBe('│');
        expect(border.chars.topLeft).toBe('┌');
        expect(border.sides).toEqual([true, true, true, true]);
      });

      test('should create custom border with custom sides', () => {
        const customConfig = {
          chars: {
            topLeft: '╔',
            topRight: '╗',
          },
          sides: [true, false, true, false] as const,
        };

        const border = Border.custom(customConfig);

        expect(border.type).toBe('custom');
        expect(border.chars.topLeft).toBe('╔');
        expect(border.chars.topRight).toBe('╗');
        expect(border.sides).toEqual([true, false, true, false]);
      });

      test('should handle empty custom config', () => {
        const border = Border.custom({ chars: {} });

        expect(border.type).toBe('custom');
        // Should be identical to normal border
        const normalBorder = Border.normal();
        expect(border.chars).toEqual(normalBorder.chars);
        expect(border.sides).toEqual(normalBorder.sides);
      });
    });

    describe('withSides()', () => {
      test('should modify border sides', () => {
        const baseBorder = Border.normal();
        const modifiedBorder = Border.withSides(baseBorder, true, false, true, false);

        expect(modifiedBorder.sides).toEqual([true, false, true, false]);
        expect(modifiedBorder.chars).toEqual(baseBorder.chars);
        expect(modifiedBorder.type).toBe(baseBorder.type);
      });

      test('should not modify original border', () => {
        const baseBorder = Border.normal();
        const originalSides = [...baseBorder.sides] as readonly [
          boolean,
          boolean,
          boolean,
          boolean,
        ];

        Border.withSides(baseBorder, false, false, false, false);

        expect(baseBorder.sides).toEqual(originalSides);
      });
    });

    describe('side-specific functions', () => {
      test('topOnly() should show only top border', () => {
        const border = Border.topOnly(Border.normal());
        expect(border.sides).toEqual([true, false, false, false]);
      });

      test('bottomOnly() should show only bottom border', () => {
        const border = Border.bottomOnly(Border.normal());
        expect(border.sides).toEqual([false, false, true, false]);
      });

      test('leftOnly() should show only left border', () => {
        const border = Border.leftOnly(Border.normal());
        expect(border.sides).toEqual([false, false, false, true]);
      });

      test('rightOnly() should show only right border', () => {
        const border = Border.rightOnly(Border.normal());
        expect(border.sides).toEqual([false, true, false, false]);
      });

      test('horizontalOnly() should show top and bottom borders', () => {
        const border = Border.horizontalOnly(Border.normal());
        expect(border.sides).toEqual([true, false, true, false]);
      });

      test('verticalOnly() should show left and right borders', () => {
        const border = Border.verticalOnly(Border.normal());
        expect(border.sides).toEqual([false, true, false, true]);
      });

      test('none() should hide all borders', () => {
        const border = Border.none(Border.normal());
        expect(border.sides).toEqual([false, false, false, false]);
      });
    });

    describe('immutability', () => {
      test('all border functions should return new objects', () => {
        const baseBorder = Border.normal();

        const topOnly = Border.topOnly(baseBorder);
        const bottomOnly = Border.bottomOnly(baseBorder);
        const withSides = Border.withSides(baseBorder, true, false, true, false);

        expect(topOnly).not.toBe(baseBorder);
        expect(bottomOnly).not.toBe(baseBorder);
        expect(withSides).not.toBe(baseBorder);

        expect(topOnly).not.toBe(bottomOnly);
        expect(bottomOnly).not.toBe(withSides);
      });
    });
  });

  describe('BorderPresets namespace', () => {
    test('should provide ready-to-use border configurations', () => {
      expect(BorderPresets.box).toBeDefined();
      expect(BorderPresets.roundedBox).toBeDefined();
      expect(BorderPresets.thickBox).toBeDefined();
      expect(BorderPresets.doubleBox).toBeDefined();
      expect(BorderPresets.horizontalLine).toBeDefined();
      expect(BorderPresets.verticalLine).toBeDefined();
      expect(BorderPresets.topLine).toBeDefined();
      expect(BorderPresets.bottomLine).toBeDefined();
      expect(BorderPresets.leftLine).toBeDefined();
      expect(BorderPresets.rightLine).toBeDefined();
    });

    test('box should be equivalent to normal border', () => {
      expect(BorderPresets.box).toEqual(Border.normal());
    });

    test('roundedBox should be equivalent to rounded border', () => {
      expect(BorderPresets.roundedBox).toEqual(Border.rounded());
    });

    test('thickBox should be equivalent to thick border', () => {
      expect(BorderPresets.thickBox).toEqual(Border.thick());
    });

    test('doubleBox should be equivalent to double border', () => {
      expect(BorderPresets.doubleBox).toEqual(Border.double());
    });

    test('line presets should have correct side configurations', () => {
      expect(BorderPresets.horizontalLine.sides).toEqual([true, false, true, false]);
      expect(BorderPresets.verticalLine.sides).toEqual([false, true, false, true]);
      expect(BorderPresets.topLine.sides).toEqual([true, false, false, false]);
      expect(BorderPresets.bottomLine.sides).toEqual([false, false, true, false]);
      expect(BorderPresets.leftLine.sides).toEqual([false, false, false, true]);
      expect(BorderPresets.rightLine.sides).toEqual([false, true, false, false]);
    });

    test('all presets should use normal border characters', () => {
      const normalChars = Border.normal().chars;

      expect(BorderPresets.horizontalLine.chars).toEqual(normalChars);
      expect(BorderPresets.verticalLine.chars).toEqual(normalChars);
      expect(BorderPresets.topLine.chars).toEqual(normalChars);
      expect(BorderPresets.bottomLine.chars).toEqual(normalChars);
      expect(BorderPresets.leftLine.chars).toEqual(normalChars);
      expect(BorderPresets.rightLine.chars).toEqual(normalChars);
    });
  });

  describe('Unicode character validation', () => {
    test('all preset borders should use valid Unicode box-drawing characters', () => {
      const borders = [Border.normal(), Border.rounded(), Border.thick(), Border.double()];

      for (const border of borders) {
        // Check that all characters are single Unicode characters
        for (const char of Object.values(border.chars)) {
          expect(char.length).toBeGreaterThan(0);
          expect(char.length).toBeLessThanOrEqual(2);
        }
      }
    });

    test('border characters should be visually distinct', () => {
      const border = Border.normal();

      // Horizontal and vertical characters should be different
      expect(border.chars.top).not.toBe(border.chars.left);
      expect(border.chars.bottom).not.toBe(border.chars.right);

      // Corner characters should be different from line characters
      expect(border.chars.topLeft).not.toBe(border.chars.top);
      expect(border.chars.topLeft).not.toBe(border.chars.left);
    });
  });

  describe('functional programming compliance', () => {
    test('all functions should be pure', () => {
      // Test that functions don't modify global state
      const border1 = Border.normal();
      const border2 = Border.normal();

      expect(border1).toEqual(border2);

      // Modify one border
      Border.topOnly(border1);

      // Original should be unchanged
      expect(border1).toEqual(border2);
    });

    test('all returned objects should be immutable', () => {
      const border = Border.normal();

      // Attempt to modify the border (should not work with readonly types)
      expect(() => {
        // @ts-expect-error - Testing immutability
        border.sides[0] = false;
      }).toThrow();
    });
  });
});
