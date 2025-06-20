import { describe, test, expect } from 'bun:test';
import { Result } from '../utils/result';
import { BorderValidation } from './validation';
import type { BorderConfig, BorderChars, CustomBorderConfig } from './types';

describe('Border Validation - Result Types', () => {
  describe('validateBorderConfigSafe', () => {
    test('returns Ok for valid border configuration', () => {
      const validBorder: BorderConfig = {
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
        sides: [true, true, true, true], // top, right, bottom, left
      };

      const result = BorderValidation.validateBorderConfigSafe(validBorder);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.chars.top).toBe('─');
        expect(result.value.sides).toEqual([true, true, true, true]);
      }
    });

    test('returns Err for invalid border configuration', () => {
      const invalidBorder = {
        chars: {
          top: '', // Invalid: empty string
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

      const result = BorderValidation.validateBorderConfigSafe(invalidBorder);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    test('returns Err for missing required fields', () => {
      const incompleteBorder = {
        chars: {
          top: '─',
          // Missing required fields
        },
      };

      const result = BorderValidation.validateBorderConfigSafe(incompleteBorder);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateBorderCharsSafe', () => {
    test('returns Ok for valid border characters', () => {
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

      const result = BorderValidation.validateBorderCharsSafe(validChars);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.top).toBe('─');
        expect(result.value.topLeft).toBe('┌');
      }
    });

    test('returns Err for invalid border characters', () => {
      const invalidChars = {
        top: '', // Invalid: empty string
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      const result = BorderValidation.validateBorderCharsSafe(invalidChars);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues).toBeDefined();
      }
    });

    test('handles Unicode characters correctly', () => {
      const unicodeChars: BorderChars = {
        top: '═',
        right: '║',
        bottom: '═',
        left: '║',
        topLeft: '╔',
        topRight: '╗',
        bottomLeft: '╚',
        bottomRight: '╝',
      };

      const result = BorderValidation.validateBorderCharsSafe(unicodeChars);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.top).toBe('═');
        expect(result.value.topLeft).toBe('╔');
      }
    });
  });

  describe('validateCustomBorderConfigSafe', () => {
    test('returns Ok for valid custom border configuration', () => {
      const validCustom: CustomBorderConfig = {
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
        sides: [true, true, false, true], // top, right, no bottom, left
      };

      const result = BorderValidation.validateCustomBorderConfigSafe(validCustom);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.chars.top).toBe('─');
        expect(result.value.sides).toEqual([true, true, false, true]);
      }
    });

    test('returns Ok for custom border with only chars', () => {
      const customWithOnlyChars = {
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
        // No sides specified - should be valid
      };

      const result = BorderValidation.validateCustomBorderConfigSafe(customWithOnlyChars);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.chars.top).toBe('═');
        expect(result.value.sides).toBeUndefined();
      }
    });

    test('returns Err for invalid custom border configuration', () => {
      const invalidCustom = {
        chars: {
          top: '', // Invalid: empty
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

      const result = BorderValidation.validateCustomBorderConfigSafe(invalidCustom);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues).toBeDefined();
      }
    });
  });

  describe('Functional composition', () => {
    test('can chain validation operations', () => {
      const borderData = {
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

      const result = Result.chain(
        BorderValidation.validateBorderConfigSafe(borderData),
        (border) => {
          // Additional validation logic
          const hasAllSides = border.sides.every(side => side);
          return hasAllSides 
            ? Result.ok(border)
            : Result.err(new Error('Border must have all sides enabled'));
        }
      );

      expect(Result.isOk(result)).toBe(true);
    });

    test('can map validation results', () => {
      const borderData = {
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

      const result = Result.map(
        BorderValidation.validateBorderConfigSafe(borderData),
        (border) => ({
          ...border,
          validated: true,
        })
      );

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.validated).toBe(true);
      }
    });

    test('can handle multiple validations with Result.all', () => {
      const borderChars = {
        top: '─',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      const validations = [
        BorderValidation.validateBorderCharsSafe(borderChars),
        BorderValidation.validateBorderCharsSafe(borderChars),
        BorderValidation.validateBorderCharsSafe(borderChars),
      ];

      const allResults = Result.all(validations);
      
      expect(Result.isOk(allResults)).toBe(true);
      if (Result.isOk(allResults)) {
        expect(allResults.value.length).toBe(3);
        expect(allResults.value[0].top).toBe('─');
      }
    });

    test('Result.all fails fast on first error', () => {
      const validChars = {
        top: '─',
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      const invalidChars = {
        top: '', // Invalid
        right: '│',
        bottom: '─',
        left: '│',
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
      };

      const validations = [
        BorderValidation.validateBorderCharsSafe(validChars),
        BorderValidation.validateBorderCharsSafe(invalidChars), // This will fail
        BorderValidation.validateBorderCharsSafe(validChars),
      ];

      const allResults = Result.all(validations);
      
      expect(Result.isErr(allResults)).toBe(true);
      if (Result.isErr(allResults)) {
        expect(allResults.error.issues).toBeDefined();
      }
    });
  });

  describe('Error handling patterns', () => {
    test('can provide fallback values on validation failure', () => {
      const invalidBorder = { invalid: 'data' };
      
      const defaultBorder: BorderConfig = {
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

      const result = BorderValidation.validateBorderConfigSafe(invalidBorder);
      const finalBorder = Result.unwrapOr(result, defaultBorder);
      
      expect(finalBorder).toBe(defaultBorder);
      expect(finalBorder.chars.top).toBe('─');
    });

    test('can log errors without affecting the Result', () => {
      const invalidBorder = { invalid: 'data' };
      let errorLogged = false;

      const result = Result.tapErr(
        BorderValidation.validateBorderConfigSafe(invalidBorder),
        (error) => {
          errorLogged = true;
          // In real code, this would be actual logging
          expect(error.issues).toBeDefined();
        }
      );

      expect(Result.isErr(result)).toBe(true);
      expect(errorLogged).toBe(true);
    });
  });
});