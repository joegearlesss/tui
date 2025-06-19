import { describe, expect, test } from 'bun:test';
import { BoxModel, Position } from './positioning';

describe('Position utilities', () => {
  describe('Position constants', () => {
    test('should have correct constant values', () => {
      expect(Position.LEFT).toBe(0.0);
      expect(Position.CENTER).toBe(0.5);
      expect(Position.RIGHT).toBe(1.0);
      expect(Position.TOP).toBe(0.0);
      expect(Position.MIDDLE).toBe(0.5);
      expect(Position.BOTTOM).toBe(1.0);
    });
  });

  describe('isValidPosition', () => {
    test('should validate correct position values', () => {
      expect(Position.isValidPosition(0.0)).toBe(true);
      expect(Position.isValidPosition(0.5)).toBe(true);
      expect(Position.isValidPosition(1.0)).toBe(true);
      expect(Position.isValidPosition(0.25)).toBe(true);
      expect(Position.isValidPosition(0.75)).toBe(true);
    });

    test('should reject invalid position values', () => {
      expect(Position.isValidPosition(-0.1)).toBe(false);
      expect(Position.isValidPosition(1.1)).toBe(false);
      expect(Position.isValidPosition(-1)).toBe(false);
      expect(Position.isValidPosition(2)).toBe(false);
    });
  });

  describe('clampPosition', () => {
    test('should clamp values to valid range', () => {
      expect(Position.clampPosition(-0.5)).toBe(0.0);
      expect(Position.clampPosition(1.5)).toBe(1.0);
      expect(Position.clampPosition(0.5)).toBe(0.5);
      expect(Position.clampPosition(-10)).toBe(0.0);
      expect(Position.clampPosition(10)).toBe(1.0);
    });

    test('should not modify valid values', () => {
      expect(Position.clampPosition(0.0)).toBe(0.0);
      expect(Position.clampPosition(0.25)).toBe(0.25);
      expect(Position.clampPosition(1.0)).toBe(1.0);
    });
  });

  describe('calculateOffset', () => {
    test('should calculate correct offsets', () => {
      // Left alignment (position 0.0)
      expect(Position.calculateOffset(0.0, 100, 20)).toBe(0);

      // Center alignment (position 0.5)
      expect(Position.calculateOffset(0.5, 100, 20)).toBe(40);

      // Right alignment (position 1.0)
      expect(Position.calculateOffset(1.0, 100, 20)).toBe(80);

      // Custom position (0.25)
      expect(Position.calculateOffset(0.25, 100, 20)).toBe(20);
    });

    test('should handle edge cases', () => {
      // Content larger than container
      expect(Position.calculateOffset(0.5, 50, 100)).toBe(0);

      // Zero container size
      expect(Position.calculateOffset(0.5, 0, 10)).toBe(0);

      // Zero content size
      expect(Position.calculateOffset(0.5, 100, 0)).toBe(50);
    });

    test('should clamp invalid positions', () => {
      expect(Position.calculateOffset(-0.5, 100, 20)).toBe(0);
      expect(Position.calculateOffset(1.5, 100, 20)).toBe(80);
    });
  });

  describe('getHorizontalAlignment', () => {
    test('should return correct alignment strings', () => {
      expect(Position.getHorizontalAlignment(Position.LEFT)).toBe('left');
      expect(Position.getHorizontalAlignment(Position.CENTER)).toBe('center');
      expect(Position.getHorizontalAlignment(Position.RIGHT)).toBe('right');
      expect(Position.getHorizontalAlignment(0.0)).toBe('left');
      expect(Position.getHorizontalAlignment(0.5)).toBe('center');
      expect(Position.getHorizontalAlignment(1.0)).toBe('right');
    });

    test('should handle edge cases', () => {
      expect(Position.getHorizontalAlignment(-0.1)).toBe('left');
      expect(Position.getHorizontalAlignment(1.1)).toBe('right');
      expect(Position.getHorizontalAlignment(0.25)).toBe('center');
      expect(Position.getHorizontalAlignment(0.75)).toBe('center');
    });
  });

  describe('getVerticalAlignment', () => {
    test('should return correct alignment strings', () => {
      expect(Position.getVerticalAlignment(Position.TOP)).toBe('top');
      expect(Position.getVerticalAlignment(Position.MIDDLE)).toBe('middle');
      expect(Position.getVerticalAlignment(Position.BOTTOM)).toBe('bottom');
      expect(Position.getVerticalAlignment(0.0)).toBe('top');
      expect(Position.getVerticalAlignment(0.5)).toBe('middle');
      expect(Position.getVerticalAlignment(1.0)).toBe('bottom');
    });

    test('should handle edge cases', () => {
      expect(Position.getVerticalAlignment(-0.1)).toBe('top');
      expect(Position.getVerticalAlignment(1.1)).toBe('bottom');
      expect(Position.getVerticalAlignment(0.25)).toBe('middle');
      expect(Position.getVerticalAlignment(0.75)).toBe('middle');
    });
  });
});

describe('BoxModel utilities', () => {
  describe('createDimensions', () => {
    test('should create dimensions with all values specified', () => {
      const dimensions = BoxModel.createDimensions(1, 2, 3, 4);
      expect(dimensions).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should handle CSS-style shorthand (1 value)', () => {
      const dimensions = BoxModel.createDimensions(5);
      expect(dimensions).toEqual({
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      });
    });

    test('should handle CSS-style shorthand (2 values)', () => {
      const dimensions = BoxModel.createDimensions(2, 4);
      expect(dimensions).toEqual({
        top: 2,
        right: 4,
        bottom: 2,
        left: 4,
      });
    });

    test('should handle CSS-style shorthand (3 values)', () => {
      const dimensions = BoxModel.createDimensions(1, 2, 3);
      expect(dimensions).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 2,
      });
    });
  });

  describe('getHorizontalSpace', () => {
    test('should calculate horizontal space correctly', () => {
      const dimensions = { top: 1, right: 2, bottom: 3, left: 4 };
      expect(BoxModel.getHorizontalSpace(dimensions)).toBe(6); // 2 + 4
    });

    test('should handle zero values', () => {
      const dimensions = { top: 1, right: 0, bottom: 3, left: 0 };
      expect(BoxModel.getHorizontalSpace(dimensions)).toBe(0);
    });
  });

  describe('getVerticalSpace', () => {
    test('should calculate vertical space correctly', () => {
      const dimensions = { top: 1, right: 2, bottom: 3, left: 4 };
      expect(BoxModel.getVerticalSpace(dimensions)).toBe(4); // 1 + 3
    });

    test('should handle zero values', () => {
      const dimensions = { top: 0, right: 2, bottom: 0, left: 4 };
      expect(BoxModel.getVerticalSpace(dimensions)).toBe(0);
    });
  });

  describe('getTotalSpace', () => {
    test('should calculate total space correctly', () => {
      const dimensions = { top: 1, right: 2, bottom: 3, left: 4 };
      const total = BoxModel.getTotalSpace(dimensions);
      expect(total).toEqual({
        horizontal: 6, // 2 + 4
        vertical: 4, // 1 + 3
      });
    });
  });

  describe('addDimensions', () => {
    test('should add dimensions correctly', () => {
      const a = { top: 1, right: 2, bottom: 3, left: 4 };
      const b = { top: 5, right: 6, bottom: 7, left: 8 };
      const result = BoxModel.addDimensions(a, b);

      expect(result).toEqual({
        top: 6, // 1 + 5
        right: 8, // 2 + 6
        bottom: 10, // 3 + 7
        left: 12, // 4 + 8
      });
    });
  });

  describe('scaleDimensions', () => {
    test('should scale dimensions correctly', () => {
      const dimensions = { top: 2, right: 4, bottom: 6, left: 8 };
      const scaled = BoxModel.scaleDimensions(dimensions, 0.5);

      expect(scaled).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should round scaled values', () => {
      const dimensions = { top: 3, right: 3, bottom: 3, left: 3 };
      const scaled = BoxModel.scaleDimensions(dimensions, 0.5);

      expect(scaled).toEqual({
        top: 2, // Math.round(1.5) = 2
        right: 2,
        bottom: 2,
        left: 2,
      });
    });
  });

  describe('zero', () => {
    test('should create zero dimensions', () => {
      const zero = BoxModel.zero();
      expect(zero).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    });
  });

  describe('uniform', () => {
    test('should create uniform dimensions', () => {
      const uniform = BoxModel.uniform(5);
      expect(uniform).toEqual({
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      });
    });
  });
});
