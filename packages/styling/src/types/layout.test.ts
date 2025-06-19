import { describe, expect, test } from 'bun:test';
import { BoxDimensionsSchema, Position, PositionSchema, SizeConstraintsSchema } from './layout';

describe('Layout Types', () => {
  describe('Position constants', () => {
    test('should have correct position values', () => {
      expect(Position.LEFT).toBe(0.0);
      expect(Position.CENTER).toBe(0.5);
      expect(Position.RIGHT).toBe(1.0);
      expect(Position.TOP).toBe(0.0);
      expect(Position.MIDDLE).toBe(0.5);
      expect(Position.BOTTOM).toBe(1.0);
    });
  });

  describe('PositionSchema validation', () => {
    test('should validate correct position values', () => {
      expect(() => PositionSchema.parse(0.0)).not.toThrow();
      expect(() => PositionSchema.parse(0.5)).not.toThrow();
      expect(() => PositionSchema.parse(1.0)).not.toThrow();
      expect(() => PositionSchema.parse(0.25)).not.toThrow();
    });

    test('should reject invalid position values', () => {
      expect(() => PositionSchema.parse(-0.1)).toThrow('Position must be between 0.0 and 1.0');
      expect(() => PositionSchema.parse(1.1)).toThrow('Position must be between 0.0 and 1.0');
      expect(() => PositionSchema.parse(-1)).toThrow();
      expect(() => PositionSchema.parse(2)).toThrow();
    });
  });

  describe('BoxDimensionsSchema validation', () => {
    test('should validate correct box dimensions', () => {
      const validDimensions = {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      };

      expect(() => BoxDimensionsSchema.parse(validDimensions)).not.toThrow();

      const result = BoxDimensionsSchema.parse(validDimensions);
      expect(result).toEqual(validDimensions);
    });

    test('should reject negative dimensions', () => {
      const invalidDimensions = {
        top: -1,
        right: 2,
        bottom: 3,
        left: 4,
      };

      expect(() => BoxDimensionsSchema.parse(invalidDimensions)).toThrow(
        'Top dimension must be non-negative'
      );
    });

    test('should allow zero dimensions', () => {
      const zeroDimensions = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };

      expect(() => BoxDimensionsSchema.parse(zeroDimensions)).not.toThrow();
    });
  });

  describe('SizeConstraintsSchema validation', () => {
    test('should validate size constraints with all fields', () => {
      const constraints = {
        width: 80,
        height: 24,
        maxWidth: 120,
        maxHeight: 40,
      };

      expect(() => SizeConstraintsSchema.parse(constraints)).not.toThrow();
    });

    test('should validate size constraints with optional fields', () => {
      const constraints = {
        width: 80,
      };

      expect(() => SizeConstraintsSchema.parse(constraints)).not.toThrow();

      const result = SizeConstraintsSchema.parse(constraints);
      expect(result.width).toBe(80);
      expect(result.height).toBeUndefined();
    });

    test('should reject negative size values', () => {
      const invalidConstraints = {
        width: -10,
      };

      expect(() => SizeConstraintsSchema.parse(invalidConstraints)).toThrow(
        'Width must be non-negative'
      );
    });

    test('should allow zero size values', () => {
      const zeroConstraints = {
        width: 0,
        height: 0,
      };

      expect(() => SizeConstraintsSchema.parse(zeroConstraints)).not.toThrow();
    });
  });
});
