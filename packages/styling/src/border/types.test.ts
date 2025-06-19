/**
 * Border Types Tests
 * 
 * Tests for border type definitions and Zod schemas
 */

import { describe, test, expect } from 'bun:test';
import { z } from 'zod';
import {
  BorderCharsSchema,
  BorderSidesSchema,
  BorderConfigSchema,
  CustomBorderConfigSchema,
  type BorderConfig,
  type BorderChars,
  type CustomBorderConfig,
} from './types';

describe('Border Types', () => {
  describe('BorderCharsSchema', () => {
    test('should validate valid border characters', () => {
      const validChars: BorderChars = {
        top: '─',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      expect(() => BorderCharsSchema.parse(validChars)).not.toThrow();
      const result = BorderCharsSchema.parse(validChars);
      expect(result).toEqual(validChars);
    });

    test('should validate ASCII border characters', () => {
      const asciiChars: BorderChars = {
        top: '-',
        right: '|',
        bottom: '-',
        left: '|',
        topLeft: '+',
        topRight: '+',
        bottomLeft: '+',
        bottomRight: '+',
      };

      expect(() => BorderCharsSchema.parse(asciiChars)).not.toThrow();
    });

    test('should reject empty characters', () => {
      const invalidChars = {
        top: '',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      expect(() => BorderCharsSchema.parse(invalidChars)).toThrow();
    });

    test('should reject characters that are too long', () => {
      const invalidChars = {
        top: '───',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      expect(() => BorderCharsSchema.parse(invalidChars)).toThrow();
    });

    test('should accept 2-character Unicode sequences', () => {
      const validChars = {
        top: '🔥',
        right: '🌟',
        bottom: '🔥',
        left: '🌟',
        topLeft: '✨',
        topRight: '✨',
        bottomLeft: '✨',
        bottomRight: '✨',
      };

      expect(() => BorderCharsSchema.parse(validChars)).not.toThrow();
    });

    test('should have descriptive error messages', () => {
      try {
        BorderCharsSchema.parse({
          top: '',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.errors[0].message).toContain('Top border character cannot be empty');
      }
    });
  });

  describe('BorderSidesSchema', () => {
    test('should validate valid border sides array', () => {
      const validSides = [true, true, true, true] as const;
      expect(() => BorderSidesSchema.parse(validSides)).not.toThrow();
      
      const result = BorderSidesSchema.parse(validSides);
      expect(result).toEqual(validSides);
    });

    test('should validate mixed border sides', () => {
      const mixedSides = [true, false, true, false] as const;
      expect(() => BorderSidesSchema.parse(mixedSides)).not.toThrow();
    });

    test('should validate all false sides', () => {
      const noSides = [false, false, false, false] as const;
      expect(() => BorderSidesSchema.parse(noSides)).not.toThrow();
    });

    test('should reject wrong array length', () => {
      const wrongLength = [true, true, true];
      expect(() => BorderSidesSchema.parse(wrongLength)).toThrow();
    });

    test('should reject non-boolean values', () => {
      const invalidTypes = [true, 'false', true, false];
      expect(() => BorderSidesSchema.parse(invalidTypes)).toThrow();
    });
  });

  describe('BorderConfigSchema', () => {
    test('should validate complete border configuration', () => {
      const validConfig: BorderConfig = {
        type: 'normal',
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true],
      };

      expect(() => BorderConfigSchema.parse(validConfig)).not.toThrow();
      const result = BorderConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    test('should validate all border types', () => {
      const types = ['normal', 'rounded', 'thick', 'double', 'custom'] as const;
      
      for (const type of types) {
        const config = {
          type,
          chars: {
            top: '─',
            right: '│',
            bottom: '─',
            left: '│',
            topLeft: '┌',
            topRight: '┐',
            bottomLeft: '└',
            bottomRight: '┘',
          },
          sides: [true, true, true, true],
        };

        expect(() => BorderConfigSchema.parse(config)).not.toThrow();
      }
    });

    test('should reject invalid border type', () => {
      const invalidConfig = {
        type: 'invalid',
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true],
      };

      expect(() => BorderConfigSchema.parse(invalidConfig)).toThrow();
    });

    test('should reject missing required fields', () => {
      const incompleteConfig = {
        type: 'normal',
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        // Missing sides
      };

      expect(() => BorderConfigSchema.parse(incompleteConfig)).toThrow();
    });
  });

  describe('CustomBorderConfigSchema', () => {
    test('should validate custom border with partial chars', () => {
      const customConfig: CustomBorderConfig = {
        chars: {
          top: '═',
          bottom: '═',
        },
      };

      expect(() => CustomBorderConfigSchema.parse(customConfig)).not.toThrow();
    });

    test('should validate custom border with sides', () => {
      const customConfig: CustomBorderConfig = {
        chars: {
          topLeft: '╔',
          topRight: '╗',
        },
        sides: [true, false, true, false],
      };

      expect(() => CustomBorderConfigSchema.parse(customConfig)).not.toThrow();
    });

    test('should validate empty custom config', () => {
      const emptyConfig: CustomBorderConfig = {
        chars: {},
      };

      expect(() => CustomBorderConfigSchema.parse(emptyConfig)).not.toThrow();
    });

    test('should reject invalid partial chars', () => {
      const invalidConfig = {
        chars: {
          top: '',
          bottom: '═',
        },
      };

      expect(() => CustomBorderConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('Schema descriptions', () => {
    test('should have descriptions on all schemas', () => {
      expect(BorderCharsSchema.description).toBeDefined();
      expect(BorderSidesSchema.description).toBeDefined();
      expect(BorderConfigSchema.description).toBeDefined();
      expect(CustomBorderConfigSchema.description).toBeDefined();
    });

    test('should have descriptions on all char fields', () => {
      const shape = BorderCharsSchema.shape;
      const charFields = ['top', 'right', 'bottom', 'left', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
      
      for (const field of charFields) {
        expect(shape[field].description).toBeDefined();
        expect(shape[field].description).toContain('Unicode character');
      }
    });
  });

  describe('Type inference', () => {
    test('should infer correct types from schemas', () => {
      // This test ensures TypeScript type inference works correctly
      const chars = BorderCharsSchema.parse({
        top: '─',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      });

      // TypeScript should infer the correct type
      const topChar: string = chars.top;
      expect(topChar).toBe('─');

      const sides = BorderSidesSchema.parse([true, false, true, false]);
      const firstSide: boolean = sides[0];
      expect(firstSide).toBe(true);
    });
  });
});