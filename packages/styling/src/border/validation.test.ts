import { describe, expect, test } from 'bun:test';
import type { BorderChars, BorderConfig, CustomBorderConfig } from './types';
import { BorderValidation } from './validation';

const createValidBorderConfig = (): BorderConfig => ({
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
});

const createValidBorderChars = (): BorderChars => ({
  top: '─',
  right: '│',
  bottom: '─',
  left: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
});

describe('BorderValidation.validateBorderConfig', () => {
  test('validates correct border configuration', () => {
    const config = createValidBorderConfig();
    expect(() => BorderValidation.validateBorderConfig(config)).not.toThrow();
  });

  test('throws on invalid border configuration', () => {
    const invalidConfig = { type: 'invalid', chars: {}, sides: [] };
    expect(() => BorderValidation.validateBorderConfig(invalidConfig)).toThrow();
  });

  test('validates different border types', () => {
    const types = ['normal', 'rounded', 'thick', 'double', 'custom'] as const;

    for (const type of types) {
      const config = { ...createValidBorderConfig(), type };
      expect(() => BorderValidation.validateBorderConfig(config)).not.toThrow();
    }
  });
});

describe('BorderValidation.validateBorderChars', () => {
  test('validates correct border characters', () => {
    const chars = createValidBorderChars();
    expect(() => BorderValidation.validateBorderChars(chars)).not.toThrow();
  });

  test('throws on missing required characters', () => {
    const incompleteChars = { top: '─', right: '│' };
    expect(() => BorderValidation.validateBorderChars(incompleteChars)).toThrow();
  });

  test('validates ASCII border characters', () => {
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
    expect(() => BorderValidation.validateBorderChars(asciiChars)).not.toThrow();
  });
});

describe('BorderValidation.validateCustomBorderConfig', () => {
  test('validates custom border with all properties', () => {
    const customConfig: CustomBorderConfig = {
      chars: createValidBorderChars(),
      sides: [true, true, false, false],
    };
    expect(() => BorderValidation.validateCustomBorderConfig(customConfig)).not.toThrow();
  });

  test('validates custom border with chars only', () => {
    const customConfig: CustomBorderConfig = {
      chars: createValidBorderChars(),
    };
    expect(() => BorderValidation.validateCustomBorderConfig(customConfig)).not.toThrow();
  });
});

describe('BorderValidation.safeParseBorderConfig', () => {
  test('returns valid config on success', () => {
    const config = createValidBorderConfig();
    const result = BorderValidation.safeParseBorderConfig(config);
    expect(result).toEqual(config);
  });

  test('returns undefined on failure', () => {
    const invalidConfig = { invalid: 'data' };
    const result = BorderValidation.safeParseBorderConfig(invalidConfig);
    expect(result).toBeUndefined();
  });
});

describe('BorderValidation.safeParseBorderChars', () => {
  test('returns valid chars on success', () => {
    const chars = createValidBorderChars();
    const result = BorderValidation.safeParseBorderChars(chars);
    expect(result).toEqual(chars);
  });

  test('returns undefined on failure', () => {
    const invalidChars = { top: '─' };
    const result = BorderValidation.safeParseBorderChars(invalidChars);
    expect(result).toBeUndefined();
  });
});

describe('BorderValidation.hasVisibleSides', () => {
  test('returns true when border has visible sides', () => {
    const config = createValidBorderConfig();
    expect(BorderValidation.hasVisibleSides(config)).toBe(true);
  });

  test('returns true for partially visible border', () => {
    const config = { ...createValidBorderConfig(), sides: [true, false, false, false] as const };
    expect(BorderValidation.hasVisibleSides(config)).toBe(true);
  });

  test('returns false when no sides are visible', () => {
    const config = { ...createValidBorderConfig(), sides: [false, false, false, false] as const };
    expect(BorderValidation.hasVisibleSides(config)).toBe(false);
  });
});

describe('BorderValidation.isValidBoxDrawingChars', () => {
  test('returns true for Unicode box-drawing characters', () => {
    const chars = createValidBorderChars();
    expect(BorderValidation.isValidBoxDrawingChars(chars)).toBe(true);
  });

  test('returns true for ASCII box characters', () => {
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
    expect(BorderValidation.isValidBoxDrawingChars(asciiChars)).toBe(true);
  });

  test('returns false for invalid characters', () => {
    const invalidChars: BorderChars = {
      top: 'a',
      right: 'b',
      bottom: 'c',
      left: 'd',
      topLeft: 'e',
      topRight: 'f',
      bottomLeft: 'g',
      bottomRight: 'h',
    };
    expect(BorderValidation.isValidBoxDrawingChars(invalidChars)).toBe(false);
  });
});

describe('BorderValidation.formatValidationErrors', () => {
  test('formats validation errors with paths', () => {
    const invalidConfig = { type: 'invalid' };

    try {
      BorderValidation.validateBorderConfig(invalidConfig);
    } catch (error) {
      const formatted = BorderValidation.formatValidationErrors(error as any);
      expect(formatted).toBeInstanceOf(Array);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted[0]).toContain('type');
    }
  });
});

describe('BorderValidation.validateWithSuggestions', () => {
  test('returns success for valid configuration', () => {
    const config = createValidBorderConfig();
    const result = BorderValidation.validateWithSuggestions(config);

    expect(result.isValid).toBe(true);
    expect(result.border).toEqual(config);
    expect(result.errors).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });

  test('returns errors and suggestions for invalid configuration', () => {
    const invalidConfig = { type: 'invalid', chars: {}, sides: [] };
    const result = BorderValidation.validateWithSuggestions(invalidConfig);

    expect(result.isValid).toBe(false);
    expect(result.border).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  test('provides specific suggestions for common errors', () => {
    const configWithInvalidType = {
      type: 'invalid',
      chars: createValidBorderChars(),
      sides: [true, true, true, true],
    };
    const result = BorderValidation.validateWithSuggestions(configWithInvalidType);

    expect(
      result.suggestions.some((s) => s.includes('normal, rounded, thick, double, custom'))
    ).toBe(true);
  });

  test('removes duplicate suggestions', () => {
    const invalidConfig = {
      type: 'invalid',
      chars: { invalid: 'chars' },
      sides: [],
    };
    const result = BorderValidation.validateWithSuggestions(invalidConfig);

    const uniqueSuggestions = [...new Set(result.suggestions)];
    expect(result.suggestions).toEqual(uniqueSuggestions);
  });
});
