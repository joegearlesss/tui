/**
 * Border Builder Tests
 *
 * Tests for the fluent API border builder
 */

import { describe, expect, test } from 'bun:test';
import { BorderBuilder, BorderChain } from './builder';
import { Border } from './presets';

describe('BorderBuilder', () => {
  describe('BorderBuilder namespace', () => {
    test('create() should return BorderChain with normal border', () => {
      const chain = BorderBuilder.create();

      expect(chain).toBeInstanceOf(BorderChain);
      expect(chain.build()).toEqual(Border.normal());
    });

    test('from() should create BorderChain from existing border', () => {
      const roundedBorder = Border.rounded();
      const chain = BorderBuilder.from(roundedBorder);

      expect(chain.build()).toEqual(roundedBorder);
    });

    test('normal() should create BorderChain with normal border', () => {
      const chain = BorderBuilder.normal();

      expect(chain.build()).toEqual(Border.normal());
    });

    test('rounded() should create BorderChain with rounded border', () => {
      const chain = BorderBuilder.rounded();

      expect(chain.build()).toEqual(Border.rounded());
    });

    test('thick() should create BorderChain with thick border', () => {
      const chain = BorderBuilder.thick();

      expect(chain.build()).toEqual(Border.thick());
    });

    test('double() should create BorderChain with double border', () => {
      const chain = BorderBuilder.double();

      expect(chain.build()).toEqual(Border.double());
    });

    test('custom() should create BorderChain with custom border', () => {
      const customConfig = {
        chars: {
          top: '═',
          bottom: '═',
        },
      };
      const chain = BorderBuilder.custom(customConfig);

      expect(chain.build()).toEqual(Border.custom(customConfig));
    });
  });

  describe('BorderChain', () => {
    describe('character modification methods', () => {
      test('chars() should update multiple characters', () => {
        const result = BorderBuilder.create()
          .chars({
            top: '═',
            bottom: '═',
            topLeft: '╔',
            topRight: '╗',
          })
          .build();

        expect(result.chars.top).toBe('═');
        expect(result.chars.bottom).toBe('═');
        expect(result.chars.topLeft).toBe('╔');
        expect(result.chars.topRight).toBe('╗');
        expect(result.chars.left).toBe('│'); // Unchanged
      });

      test('topChar() should update top character', () => {
        const result = BorderBuilder.create().topChar('═').build();

        expect(result.chars.top).toBe('═');
        expect(result.chars.bottom).toBe('─'); // Unchanged
      });

      test('rightChar() should update right character', () => {
        const result = BorderBuilder.create().rightChar('║').build();

        expect(result.chars.right).toBe('║');
        expect(result.chars.left).toBe('│'); // Unchanged
      });

      test('bottomChar() should update bottom character', () => {
        const result = BorderBuilder.create().bottomChar('═').build();

        expect(result.chars.bottom).toBe('═');
        expect(result.chars.top).toBe('─'); // Unchanged
      });

      test('leftChar() should update left character', () => {
        const result = BorderBuilder.create().leftChar('║').build();

        expect(result.chars.left).toBe('║');
        expect(result.chars.right).toBe('│'); // Unchanged
      });

      test('corners() should update all corner characters', () => {
        const result = BorderBuilder.create().corners('╔', '╗', '╚', '╝').build();

        expect(result.chars.topLeft).toBe('╔');
        expect(result.chars.topRight).toBe('╗');
        expect(result.chars.bottomLeft).toBe('╚');
        expect(result.chars.bottomRight).toBe('╝');
      });
    });

    describe('side modification methods', () => {
      test('sides() should set all side visibility', () => {
        const result = BorderBuilder.create().sides(true, false, true, false).build();

        expect(result.sides).toEqual([true, false, true, false]);
      });

      test('topOnly() should show only top side', () => {
        const result = BorderBuilder.create().topOnly().build();

        expect(result.sides).toEqual([true, false, false, false]);
      });

      test('rightOnly() should show only right side', () => {
        const result = BorderBuilder.create().rightOnly().build();

        expect(result.sides).toEqual([false, true, false, false]);
      });

      test('bottomOnly() should show only bottom side', () => {
        const result = BorderBuilder.create().bottomOnly().build();

        expect(result.sides).toEqual([false, false, true, false]);
      });

      test('leftOnly() should show only left side', () => {
        const result = BorderBuilder.create().leftOnly().build();

        expect(result.sides).toEqual([false, false, false, true]);
      });

      test('horizontalOnly() should show top and bottom sides', () => {
        const result = BorderBuilder.create().horizontalOnly().build();

        expect(result.sides).toEqual([true, false, true, false]);
      });

      test('verticalOnly() should show left and right sides', () => {
        const result = BorderBuilder.create().verticalOnly().build();

        expect(result.sides).toEqual([false, true, false, true]);
      });

      test('allSides() should show all sides', () => {
        const result = BorderBuilder.create().noSides().allSides().build();

        expect(result.sides).toEqual([true, true, true, true]);
      });

      test('noSides() should hide all sides', () => {
        const result = BorderBuilder.create().noSides().build();

        expect(result.sides).toEqual([false, false, false, false]);
      });

      test('enableSides() should enable specific sides', () => {
        const result = BorderBuilder.create().noSides().enableSides(['top', 'bottom']).build();

        expect(result.sides).toEqual([true, false, true, false]);
      });

      test('disableSides() should disable specific sides', () => {
        const result = BorderBuilder.create().disableSides(['right', 'left']).build();

        expect(result.sides).toEqual([true, false, true, false]);
      });

      test('toggleSide() should toggle specific side', () => {
        const result = BorderBuilder.create().toggleSide('top').build();

        expect(result.sides).toEqual([false, true, true, true]);
      });
    });

    describe('style modification methods', () => {
      test('style() should convert to different style', () => {
        const result = BorderBuilder.create().topOnly().style('rounded').build();

        expect(result.type).toBe('rounded');
        expect(result.chars.topLeft).toBe('╭');
        expect(result.sides).toEqual([true, false, false, false]); // Preserved
      });
    });

    describe('advanced methods', () => {
      test('merge() should merge with another border configuration', () => {
        const other = {
          type: 'custom' as const,
          chars: {
            top: '═',
            right: '║',
            bottom: '═',
            left: '║',
            topLeft: '╔',
            topRight: '╗',
            bottomLeft: '╚',
            bottomRight: '╝',
          },
        };

        const result = BorderBuilder.create().merge(other).build();

        expect(result.type).toBe('custom');
        expect(result.chars.top).toBe('═');
        expect(result.chars.left).toBe('║'); // From override
      });

      test('inherit() should inherit from base with custom config', () => {
        const base = Border.thick();
        const customConfig = {
          chars: {
            topLeft: '╔',
          },
          sides: [true, false, true, false] as const,
        };

        const result = BorderBuilder.create().inherit(base, customConfig).build();

        expect(result.type).toBe('custom');
        expect(result.chars.topLeft).toBe('╔');
        expect(result.chars.top).toBe('━'); // From base
        expect(result.sides).toEqual([true, false, true, false]);
      });
    });

    describe('query methods', () => {
      test('hasVisibleSides() should return correct visibility status', () => {
        const chainWithSides = BorderBuilder.create();
        const chainWithoutSides = BorderBuilder.create().noSides();

        expect(chainWithSides.hasVisibleSides()).toBe(true);
        expect(chainWithoutSides.hasVisibleSides()).toBe(false);
      });

      test('getVisibleSides() should return array of visible sides', () => {
        const chain = BorderBuilder.create().horizontalOnly();

        expect(chain.getVisibleSides()).toEqual(['top', 'bottom']);
      });

      test('isEqual() should compare with another border', () => {
        const chain1 = BorderBuilder.create();
        const chain2 = BorderBuilder.create();
        const chain3 = BorderBuilder.create().topOnly();

        expect(chain1.isEqual(chain2.build())).toBe(true);
        expect(chain1.isEqual(chain3.build())).toBe(false);
      });

      test('get() should return border configuration (alias for build)', () => {
        const chain = BorderBuilder.create().topOnly();

        expect(chain.get()).toEqual(chain.build());
      });
    });

    describe('method chaining', () => {
      test('should support complex method chaining', () => {
        const result = BorderBuilder.create()
          .style('rounded')
          .topChar('═')
          .bottomChar('═')
          .corners('╔', '╗', '╚', '╝')
          .horizontalOnly()
          .build();

        expect(result.type).toBe('rounded');
        expect(result.chars.top).toBe('═');
        expect(result.chars.bottom).toBe('═');
        expect(result.chars.topLeft).toBe('╔');
        expect(result.chars.topRight).toBe('╗');
        expect(result.chars.bottomLeft).toBe('╚');
        expect(result.chars.bottomRight).toBe('╝');
        expect(result.sides).toEqual([true, false, true, false]);
      });

      test('should support starting from different border types', () => {
        const result = BorderBuilder.thick().rightChar('║').leftChar('║').verticalOnly().build();

        expect(result.type).toBe('thick');
        expect(result.chars.right).toBe('║');
        expect(result.chars.left).toBe('║');
        expect(result.sides).toEqual([false, true, false, true]);
      });

      test('should support conditional chaining', () => {
        let chain = BorderBuilder.rounded();

        const useThickBorder = true;
        if (useThickBorder) {
          chain = chain.style('thick');
        }

        const showOnlyHorizontal = true;
        if (showOnlyHorizontal) {
          chain = chain.horizontalOnly();
        }

        const result = chain.build();

        expect(result.type).toBe('thick');
        expect(result.sides).toEqual([true, false, true, false]);
      });
    });

    describe('immutability', () => {
      test('each method should return new BorderChain instance', () => {
        const original = BorderBuilder.create();
        const modified = original.topOnly();

        expect(modified).not.toBe(original);
        expect(original.build().sides).toEqual([true, true, true, true]);
        expect(modified.build().sides).toEqual([true, false, false, false]);
      });

      test('build() should return immutable configuration', () => {
        const chain = BorderBuilder.create();
        const config1 = chain.build();
        const config2 = chain.build();

        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2); // Different objects
      });

      test('chaining should not affect previous chain instances', () => {
        const base = BorderBuilder.create();
        const step1 = base.topOnly();
        const step2 = step1.style('rounded');
        const step3 = step2.rightChar('║');

        expect(base.build().sides).toEqual([true, true, true, true]);
        expect(step1.build().sides).toEqual([true, false, false, false]);
        expect(step2.build().type).toBe('rounded');
        expect(step3.build().chars.right).toBe('║');

        // Previous steps should be unchanged
        expect(step1.build().type).toBe('normal');
        expect(step2.build().chars.right).toBe('│');
      });
    });

    describe('error handling', () => {
      test('should handle invalid side names gracefully', () => {
        // This test ensures TypeScript prevents invalid side names
        const chain = BorderBuilder.create();

        // These should work
        expect(() => chain.toggleSide('top')).not.toThrow();
        expect(() => chain.toggleSide('right')).not.toThrow();
        expect(() => chain.toggleSide('bottom')).not.toThrow();
        expect(() => chain.toggleSide('left')).not.toThrow();

        // TypeScript should prevent invalid side names at compile time
        // chain.toggleSide('invalid');
      });
    });

    describe('functional programming compliance', () => {
      test('all methods should be pure functions', () => {
        const chain = BorderBuilder.create();
        const config = chain.build();

        // Perform operations
        chain.topOnly();
        chain.style('rounded');
        chain.chars({ top: '═' });

        // Original should be unchanged
        expect(chain.build()).toEqual(config);
      });

      test('should support function composition patterns', () => {
        const applyCustomStyle = (chain: BorderChain) => chain.style('rounded').horizontalOnly();

        const applyCustomChars = (chain: BorderChain) => chain.topChar('═').bottomChar('═');

        const result = BorderBuilder.create().pipe(applyCustomStyle).pipe(applyCustomChars).build();

        expect(result.type).toBe('rounded');
        expect(result.chars.top).toBe('═');
        expect(result.chars.bottom).toBe('═');
        expect(result.sides).toEqual([true, false, true, false]);

        // Also test manual composition
        const manualResult = applyCustomChars(applyCustomStyle(BorderBuilder.create())).build();

        expect(manualResult.type).toBe('rounded');
        expect(manualResult.chars.top).toBe('═');
        expect(manualResult.chars.bottom).toBe('═');
        expect(manualResult.sides).toEqual([true, false, true, false]);
      });
    });
  });
});
