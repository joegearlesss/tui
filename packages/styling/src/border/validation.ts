/**
 * Border Validation
 *
 * Zod schemas and validation functions for border configurations.
 * Provides runtime type safety with descriptive error messages.
 */

import { z } from 'zod';
import type { BorderChars, BorderConfig, CustomBorderConfig } from './types';
import {
  BorderCharsSchema,
  BorderConfigSchema,
  BorderSidesSchema,
  CustomBorderConfigSchema,
} from './types';

/**
 * Border validation namespace providing validation functions and enhanced schemas
 */
export namespace BorderValidation {
  /**
   * Validates a complete border configuration
   * @param data - Data to validate as BorderConfig
   * @returns Validated BorderConfig
   * @throws ZodError if validation fails
   */
  export const validateBorderConfig = (data: unknown): BorderConfig => {
    return BorderConfigSchema.parse(data);
  };

  /**
   * Validates border characters configuration
   * @param data - Data to validate as BorderChars
   * @returns Validated BorderChars
   * @throws ZodError if validation fails
   */
  export const validateBorderChars = (data: unknown): BorderChars => {
    return BorderCharsSchema.parse(data);
  };

  /**
   * Validates custom border configuration
   * @param data - Data to validate as CustomBorderConfig
   * @returns Validated CustomBorderConfig
   * @throws ZodError if validation fails
   */
  export const validateCustomBorderConfig = (data: unknown): CustomBorderConfig => {
    const parsed = CustomBorderConfigSchema.parse(data);
    return {
      chars: parsed.chars,
      ...(parsed.sides && { sides: parsed.sides }),
    } as CustomBorderConfig;
  };

  /**
   * Safely validates a border configuration, returning undefined on failure
   * @param data - Data to validate
   * @returns Validated BorderConfig or undefined if validation fails
   */
  export const safeParseBorderConfig = (data: unknown): BorderConfig | undefined => {
    const result = BorderConfigSchema.safeParse(data);
    return result.success ? result.data : undefined;
  };

  /**
   * Safely validates border characters, returning undefined on failure
   * @param data - Data to validate
   * @returns Validated BorderChars or undefined if validation fails
   */
  export const safeParseBorderChars = (data: unknown): BorderChars | undefined => {
    const result = BorderCharsSchema.safeParse(data);
    return result.success ? result.data : undefined;
  };

  /**
   * Validates that a border configuration has at least one visible side
   * @param border - Border configuration to validate
   * @returns True if border has visible sides, false otherwise
   */
  export const hasVisibleSides = (border: BorderConfig): boolean => {
    return border.sides.some((side) => side);
  };

  /**
   * Enhanced border configuration schema with additional validation rules
   */
  export const EnhancedBorderConfigSchema = BorderConfigSchema.refine(
    (border) => hasVisibleSides(border),
    {
      message: 'Border must have at least one visible side',
      path: ['sides'],
    }
  ).describe('Enhanced border configuration with visibility validation');

  /**
   * Schema for validating border characters with Unicode validation
   */
  export const UnicodeAwareBorderCharsSchema = z
    .object({
      top: z
        .string()
        .min(1, 'Top border character cannot be empty')
        .max(2, 'Top border character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Top border character must be valid Unicode'
        )
        .describe('Unicode character used for the top border line'),
      right: z
        .string()
        .min(1, 'Right border character cannot be empty')
        .max(2, 'Right border character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Right border character must be valid Unicode'
        )
        .describe('Unicode character used for the right border line'),
      bottom: z
        .string()
        .min(1, 'Bottom border character cannot be empty')
        .max(2, 'Bottom border character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Bottom border character must be valid Unicode'
        )
        .describe('Unicode character used for the bottom border line'),
      left: z
        .string()
        .min(1, 'Left border character cannot be empty')
        .max(2, 'Left border character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Left border character must be valid Unicode'
        )
        .describe('Unicode character used for the left border line'),
      topLeft: z
        .string()
        .min(1, 'Top-left corner character cannot be empty')
        .max(2, 'Top-left corner character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Top-left corner character must be valid Unicode'
        )
        .describe('Unicode character used for the top-left corner'),
      topRight: z
        .string()
        .min(1, 'Top-right corner character cannot be empty')
        .max(2, 'Top-right corner character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Top-right corner character must be valid Unicode'
        )
        .describe('Unicode character used for the top-right corner'),
      bottomLeft: z
        .string()
        .min(1, 'Bottom-left corner character cannot be empty')
        .max(2, 'Bottom-left corner character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Bottom-left corner character must be valid Unicode'
        )
        .describe('Unicode character used for the bottom-left corner'),
      bottomRight: z
        .string()
        .min(1, 'Bottom-right corner character cannot be empty')
        .max(2, 'Bottom-right corner character should be 1-2 Unicode characters')
        .refine(
          (char) => /^[\u0020-\u007E\u00A0-\uFFFF]+$/.test(char),
          'Bottom-right corner character must be valid Unicode'
        )
        .describe('Unicode character used for the bottom-right corner'),
    })
    .describe('Unicode-aware border character set with validation');

  /**
   * Validates that border characters are appropriate box-drawing characters
   * @param chars - Border characters to validate
   * @returns True if characters are valid box-drawing characters
   */
  export const isValidBoxDrawingChars = (chars: BorderChars): boolean => {
    // Common box-drawing Unicode ranges
    const boxDrawingRanges = [
      [0x2500, 0x257f], // Box Drawing
      [0x2580, 0x259f], // Block Elements
    ];

    const isBoxDrawingChar = (char: string): boolean => {
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) return false;

      return boxDrawingRanges.some(([start, end]) => {
        if (start === undefined || end === undefined) return false;
        return codePoint >= start && codePoint <= end;
      });
    };

    return Object.values(chars).every(
      (char) => char.length === 1 && (isBoxDrawingChar(char) || /^[+\-|]$/.test(char))
    );
  };

  /**
   * Schema for validating that border uses proper box-drawing characters
   */
  export const BoxDrawingBorderCharsSchema = BorderCharsSchema.refine(
    (chars) => isValidBoxDrawingChars(chars),
    {
      message: 'Border characters should be valid box-drawing Unicode characters',
    }
  ).describe('Border characters validated for proper box-drawing Unicode');

  /**
   * Comprehensive border configuration schema with all validations
   */
  export const ComprehensiveBorderConfigSchema = z
    .object({
      type: z
        .enum(['normal', 'rounded', 'thick', 'double', 'custom'])
        .describe('Border style type - determines the character set and appearance'),
      chars: UnicodeAwareBorderCharsSchema.describe('Unicode characters used to draw the border'),
      sides: BorderSidesSchema.describe('Visibility settings for each border side'),
    })
    .refine((border) => hasVisibleSides(border), {
      message: 'Border must have at least one visible side',
      path: ['sides'],
    })
    .describe('Comprehensive border configuration with full validation');

  /**
   * Generates validation error messages for border configurations
   * @param error - Zod validation error
   * @returns Human-readable error messages
   */
  export const formatValidationErrors = (error: z.ZodError): readonly string[] => {
    return error.errors.map((err) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });
  };

  /**
   * Validates and provides suggestions for fixing invalid border configurations
   * @param data - Data to validate
   * @returns Validation result with suggestions
   */
  export const validateWithSuggestions = (
    data: unknown
  ): {
    readonly isValid: boolean;
    readonly border?: BorderConfig;
    readonly errors: readonly string[];
    readonly suggestions: readonly string[];
  } => {
    const result = BorderConfigSchema.safeParse(data);

    if (result.success) {
      return {
        isValid: true,
        border: result.data,
        errors: [],
        suggestions: [],
      };
    }

    const errors = formatValidationErrors(result.error);
    const suggestions: string[] = [];

    // Generate suggestions based on common errors
    for (const error of result.error.errors) {
      if (error.path.includes('chars')) {
        suggestions.push('Consider using standard box-drawing characters like ─, │, ┌, ┐, └, ┘');
      }
      if (error.path.includes('sides')) {
        suggestions.push('Ensure at least one border side is set to true');
      }
      if (error.path.includes('type')) {
        suggestions.push('Border type must be one of: normal, rounded, thick, double, custom');
      }
    }

    return {
      isValid: false,
      errors,
      suggestions: [...new Set(suggestions)], // Remove duplicates
    };
  };
}
