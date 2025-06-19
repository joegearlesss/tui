/**
 * Border Operations Tests
 * 
 * Tests for border manipulation operations
 */

import { describe, test, expect } from 'bun:test';
import { BorderOperations } from './operations';
import { Border } from './presets';
import type { BorderConfig } from './types';

describe('BorderOperations', () => {
  describe('merge()', () => {
    test('should merge two border configurations', () => {
      const base = Border.normal();
      const override = {
        type: 'custom' as const,
        chars: {
          top: '═',
          bottom: '═',
        },
      };
      
      const merged = BorderOperations.merge(base, override);
      
      expect(merged.type).toBe('custom');
      expect(merged.chars.top).toBe('═');
      expect(merged.chars.bottom).toBe('═');
      expect(merged.chars.left).toBe('│'); // From base
      expect(merged.chars.right).toBe('│'); // From base
      expect(merged.sides).toEqual(base.sides);
    });

    test('should override sides when provided', () => {
      const base = Border.normal();
      const override = {
        sides: [true, false, true, false] as const,
      };
      
      const merged = BorderOperations.merge(base, override);
      
      expect(merged.sides).toEqual([true, false, true, false]);
      expect(merged.chars).toEqual(base.chars);
      expect(merged.type).toBe(base.type);
    });

    test('should handle empty override', () => {
      const base = Border.normal();
      const merged = BorderOperations.merge(base, {});
      
      expect(merged).toEqual(base);
      expect(merged).not.toBe(base); // Should be new object
    });

    test('should not modify original borders', () => {
      const base = Border.normal();
      const originalBase = { ...base };
      const override = { type: 'custom' as const };
      
      BorderOperations.merge(base, override);
      
      expect(base).toEqual(originalBase);
    });
  });

  describe('updateChars()', () => {
    test('should update specific characters', () => {
      const border = Border.normal();
      const updated = BorderOperations.updateChars(border, {
        top: '═',
        bottom: '═',
      });
      
      expect(updated.chars.top).toBe('═');
      expect(updated.chars.bottom).toBe('═');
      expect(updated.chars.left).toBe('│'); // Unchanged
      expect(updated.chars.right).toBe('│'); // Unchanged
      expect(updated.sides).toEqual(border.sides);
      expect(updated.type).toBe(border.type);
    });

    test('should handle single character update', () => {
      const border = Border.normal();
      const updated = BorderOperations.updateChars(border, {
        topLeft: '╔',
      });
      
      expect(updated.chars.topLeft).toBe('╔');
      expect(updated.chars.topRight).toBe('┐'); // Unchanged
    });

    test('should handle empty character update', () => {
      const border = Border.normal();
      const updated = BorderOperations.updateChars(border, {});
      
      expect(updated).toEqual(border);
      expect(updated).not.toBe(border);
    });
  });

  describe('updateSides()', () => {
    test('should update border sides', () => {
      const border = Border.normal();
      const newSides = [true, false, true, false] as const;
      const updated = BorderOperations.updateSides(border, newSides);
      
      expect(updated.sides).toEqual(newSides);
      expect(updated.chars).toEqual(border.chars);
      expect(updated.type).toBe(border.type);
    });

    test('should handle all sides disabled', () => {
      const border = Border.normal();
      const updated = BorderOperations.updateSides(border, [false, false, false, false]);
      
      expect(updated.sides).toEqual([false, false, false, false]);
    });

    test('should not modify original border', () => {
      const border = Border.normal();
      const originalSides = [...border.sides];
      
      BorderOperations.updateSides(border, [false, false, false, false]);
      
      expect(border.sides).toEqual(originalSides);
    });
  });

  describe('toggleSide()', () => {
    test('should toggle top side', () => {
      const border = Border.normal(); // All sides true
      const toggled = BorderOperations.toggleSide(border, 'top');
      
      expect(toggled.sides).toEqual([false, true, true, true]);
    });

    test('should toggle right side', () => {
      const border = Border.normal();
      const toggled = BorderOperations.toggleSide(border, 'right');
      
      expect(toggled.sides).toEqual([true, false, true, true]);
    });

    test('should toggle bottom side', () => {
      const border = Border.normal();
      const toggled = BorderOperations.toggleSide(border, 'bottom');
      
      expect(toggled.sides).toEqual([true, true, false, true]);
    });

    test('should toggle left side', () => {
      const border = Border.normal();
      const toggled = BorderOperations.toggleSide(border, 'left');
      
      expect(toggled.sides).toEqual([true, true, true, false]);
    });

    test('should toggle from false to true', () => {
      const border = Border.none(Border.normal()); // All sides false
      const toggled = BorderOperations.toggleSide(border, 'top');
      
      expect(toggled.sides).toEqual([true, false, false, false]);
    });
  });

  describe('enableSides()', () => {
    test('should enable specific sides', () => {
      const border = Border.none(Border.normal()); // All sides false
      const enabled = BorderOperations.enableSides(border, ['top', 'bottom']);
      
      expect(enabled.sides).toEqual([true, false, true, false]);
    });

    test('should enable single side', () => {
      const border = Border.none(Border.normal());
      const enabled = BorderOperations.enableSides(border, ['right']);
      
      expect(enabled.sides).toEqual([false, true, false, false]);
    });

    test('should enable all sides', () => {
      const border = Border.none(Border.normal());
      const enabled = BorderOperations.enableSides(border, ['top', 'right', 'bottom', 'left']);
      
      expect(enabled.sides).toEqual([true, true, true, true]);
    });

    test('should handle empty array', () => {
      const border = Border.normal();
      const enabled = BorderOperations.enableSides(border, []);
      
      expect(enabled.sides).toEqual([false, false, false, false]);
    });
  });

  describe('disableSides()', () => {
    test('should disable specific sides', () => {
      const border = Border.normal(); // All sides true
      const disabled = BorderOperations.disableSides(border, ['top', 'bottom']);
      
      expect(disabled.sides).toEqual([false, true, false, true]);
    });

    test('should disable single side', () => {
      const border = Border.normal();
      const disabled = BorderOperations.disableSides(border, ['right']);
      
      expect(disabled.sides).toEqual([true, false, true, true]);
    });

    test('should disable all sides', () => {
      const border = Border.normal();
      const disabled = BorderOperations.disableSides(border, ['top', 'right', 'bottom', 'left']);
      
      expect(disabled.sides).toEqual([false, false, false, false]);
    });

    test('should handle empty array', () => {
      const border = Border.normal();
      const disabled = BorderOperations.disableSides(border, []);
      
      expect(disabled.sides).toEqual([true, true, true, true]);
    });
  });

  describe('convertStyle()', () => {
    test('should convert to rounded style', () => {
      const border = Border.topOnly(Border.normal());
      const converted = BorderOperations.convertStyle(border, 'rounded');
      
      expect(converted.type).toBe('rounded');
      expect(converted.chars.topLeft).toBe('╭');
      expect(converted.chars.topRight).toBe('╮');
      expect(converted.sides).toEqual([true, false, false, false]); // Preserved
    });

    test('should convert to thick style', () => {
      const border = Border.horizontalOnly(Border.normal());
      const converted = BorderOperations.convertStyle(border, 'thick');
      
      expect(converted.type).toBe('thick');
      expect(converted.chars.top).toBe('━');
      expect(converted.chars.bottom).toBe('━');
      expect(converted.sides).toEqual([true, false, true, false]); // Preserved
    });

    test('should convert to double style', () => {
      const border = Border.verticalOnly(Border.normal());
      const converted = BorderOperations.convertStyle(border, 'double');
      
      expect(converted.type).toBe('double');
      expect(converted.chars.left).toBe('║');
      expect(converted.chars.right).toBe('║');
      expect(converted.sides).toEqual([false, true, false, true]); // Preserved
    });

    test('should convert back to normal style', () => {
      const border = Border.rounded();
      const converted = BorderOperations.convertStyle(border, 'normal');
      
      expect(converted.type).toBe('normal');
      expect(converted.chars.topLeft).toBe('┌');
      expect(converted.chars.topRight).toBe('┐');
      expect(converted.sides).toEqual([true, true, true, true]);
    });
  });

  describe('inherit()', () => {
    test('should inherit from base with custom overrides', () => {
      const base = Border.rounded();
      const customConfig = {
        chars: {
          top: '═',
          bottom: '═',
        },
      };
      
      const inherited = BorderOperations.inherit(base, customConfig);
      
      expect(inherited.type).toBe('custom');
      expect(inherited.chars.top).toBe('═');
      expect(inherited.chars.bottom).toBe('═');
      expect(inherited.chars.topLeft).toBe('╭'); // From base
      expect(inherited.chars.topRight).toBe('╮'); // From base
      expect(inherited.sides).toEqual(base.sides);
    });

    test('should inherit with custom sides', () => {
      const base = Border.thick();
      const customConfig = {
        chars: {
          topLeft: '╔',
        },
        sides: [true, false, true, false] as const,
      };
      
      const inherited = BorderOperations.inherit(base, customConfig);
      
      expect(inherited.type).toBe('custom');
      expect(inherited.chars.topLeft).toBe('╔');
      expect(inherited.chars.top).toBe('━'); // From base
      expect(inherited.sides).toEqual([true, false, true, false]);
    });
  });

  describe('isEqual()', () => {
    test('should return true for identical borders', () => {
      const border1 = Border.normal();
      const border2 = Border.normal();
      
      expect(BorderOperations.isEqual(border1, border2)).toBe(true);
    });

    test('should return false for different types', () => {
      const border1 = Border.normal();
      const border2 = Border.rounded();
      
      expect(BorderOperations.isEqual(border1, border2)).toBe(false);
    });

    test('should return false for different characters', () => {
      const border1 = Border.normal();
      const border2 = BorderOperations.updateChars(border1, { top: '═' });
      
      expect(BorderOperations.isEqual(border1, border2)).toBe(false);
    });

    test('should return false for different sides', () => {
      const border1 = Border.normal();
      const border2 = Border.topOnly(border1);
      
      expect(BorderOperations.isEqual(border1, border2)).toBe(false);
    });

    test('should handle same reference', () => {
      const border = Border.normal();
      
      expect(BorderOperations.isEqual(border, border)).toBe(true);
    });
  });

  describe('hasVisibleSides()', () => {
    test('should return true for border with visible sides', () => {
      const border = Border.normal();
      
      expect(BorderOperations.hasVisibleSides(border)).toBe(true);
    });

    test('should return true for border with one visible side', () => {
      const border = Border.topOnly(Border.normal());
      
      expect(BorderOperations.hasVisibleSides(border)).toBe(true);
    });

    test('should return false for border with no visible sides', () => {
      const border = Border.none(Border.normal());
      
      expect(BorderOperations.hasVisibleSides(border)).toBe(false);
    });
  });

  describe('getVisibleSides()', () => {
    test('should return all sides for normal border', () => {
      const border = Border.normal();
      const visibleSides = BorderOperations.getVisibleSides(border);
      
      expect(visibleSides).toEqual(['top', 'right', 'bottom', 'left']);
    });

    test('should return only top for top-only border', () => {
      const border = Border.topOnly(Border.normal());
      const visibleSides = BorderOperations.getVisibleSides(border);
      
      expect(visibleSides).toEqual(['top']);
    });

    test('should return horizontal sides', () => {
      const border = Border.horizontalOnly(Border.normal());
      const visibleSides = BorderOperations.getVisibleSides(border);
      
      expect(visibleSides).toEqual(['top', 'bottom']);
    });

    test('should return empty array for no visible sides', () => {
      const border = Border.none(Border.normal());
      const visibleSides = BorderOperations.getVisibleSides(border);
      
      expect(visibleSides).toEqual([]);
    });
  });

  describe('minimize()', () => {
    test('should return border unchanged if it has visible sides', () => {
      const border = Border.normal();
      const minimized = BorderOperations.minimize(border);
      
      expect(minimized).toEqual(border);
    });

    test('should return invisible border for border with no visible sides', () => {
      const border = Border.none(Border.normal());
      const minimized = BorderOperations.minimize(border);
      
      expect(BorderOperations.hasVisibleSides(minimized)).toBe(false);
    });

    test('should preserve border with partial visibility', () => {
      const border = Border.topOnly(Border.normal());
      const minimized = BorderOperations.minimize(border);
      
      expect(minimized).toEqual(border);
    });
  });

  describe('immutability', () => {
    test('all operations should return new objects', () => {
      const border = Border.normal();
      
      const merged = BorderOperations.merge(border, {});
      const updated = BorderOperations.updateChars(border, {});
      const toggled = BorderOperations.toggleSide(border, 'top');
      
      expect(merged).not.toBe(border);
      expect(updated).not.toBe(border);
      expect(toggled).not.toBe(border);
    });

    test('operations should not modify original border', () => {
      const border = Border.normal();
      const originalBorder = JSON.parse(JSON.stringify(border));
      
      BorderOperations.updateChars(border, { top: '═' });
      BorderOperations.updateSides(border, [false, false, false, false]);
      BorderOperations.toggleSide(border, 'top');
      
      expect(border).toEqual(originalBorder);
    });
  });
});