/**
 * Border System Types
 *
 * Defines the core types for the border system following functional programming principles.
 * Based on OVERVIEW-v2 Section 3 (Border System) specification.
 */

import { z } from 'zod';

/**
 * Border type variants supported by the styling system
 */
export type BorderType = 'normal' | 'rounded' | 'thick' | 'double' | 'custom';

/**
 * Character set used to render borders
 * Each border style defines specific Unicode characters for drawing
 */
export interface BorderChars {
  readonly top: string;
  readonly right: string;
  readonly bottom: string;
  readonly left: string;
  readonly topLeft: string;
  readonly topRight: string;
  readonly bottomLeft: string;
  readonly bottomRight: string;
}

/**
 * Complete border configuration with immutable properties
 * Follows functional programming principles with readonly fields
 */
export interface BorderConfig {
  readonly type: BorderType;
  readonly chars: BorderChars;
  readonly sides: readonly [boolean, boolean, boolean, boolean]; // top, right, bottom, left
}

/**
 * Custom border configuration for user-defined border styles
 */
export interface CustomBorderConfig {
  readonly chars: Partial<BorderChars>;
  readonly sides?: readonly [boolean, boolean, boolean, boolean];
}

// Zod validation schemas with detailed descriptions

/**
 * Schema for validating border character sets
 */
export const BorderCharsSchema = z
  .object({
    top: z
      .string()
      .min(1, 'Top border character cannot be empty')
      .max(2, 'Top border character should be 1-2 Unicode characters')
      .describe('Unicode character used for the top border line'),
    right: z
      .string()
      .min(1, 'Right border character cannot be empty')
      .max(2, 'Right border character should be 1-2 Unicode characters')
      .describe('Unicode character used for the right border line'),
    bottom: z
      .string()
      .min(1, 'Bottom border character cannot be empty')
      .max(2, 'Bottom border character should be 1-2 Unicode characters')
      .describe('Unicode character used for the bottom border line'),
    left: z
      .string()
      .min(1, 'Left border character cannot be empty')
      .max(2, 'Left border character should be 1-2 Unicode characters')
      .describe('Unicode character used for the left border line'),
    topLeft: z
      .string()
      .min(1, 'Top-left corner character cannot be empty')
      .max(2, 'Top-left corner character should be 1-2 Unicode characters')
      .describe('Unicode character used for the top-left corner'),
    topRight: z
      .string()
      .min(1, 'Top-right corner character cannot be empty')
      .max(2, 'Top-right corner character should be 1-2 Unicode characters')
      .describe('Unicode character used for the top-right corner'),
    bottomLeft: z
      .string()
      .min(1, 'Bottom-left corner character cannot be empty')
      .max(2, 'Bottom-left corner character should be 1-2 Unicode characters')
      .describe('Unicode character used for the bottom-left corner'),
    bottomRight: z
      .string()
      .min(1, 'Bottom-right corner character cannot be empty')
      .max(2, 'Bottom-right corner character should be 1-2 Unicode characters')
      .describe('Unicode character used for the bottom-right corner'),
  })
  .describe('Complete set of Unicode characters used to render a border');

/**
 * Schema for validating border side visibility
 */
export const BorderSidesSchema = z
  .tuple([
    z.boolean().describe('Whether to show the top border'),
    z.boolean().describe('Whether to show the right border'),
    z.boolean().describe('Whether to show the bottom border'),
    z.boolean().describe('Whether to show the left border'),
  ])
  .readonly()
  .describe('Array indicating which border sides should be visible [top, right, bottom, left]');

/**
 * Schema for validating complete border configurations
 */
export const BorderConfigSchema = z
  .object({
    type: z
      .enum(['normal', 'rounded', 'thick', 'double', 'custom'])
      .describe('Border style type - determines the character set and appearance'),
    chars: BorderCharsSchema.describe('Unicode characters used to draw the border'),
    sides: BorderSidesSchema.describe('Visibility settings for each border side'),
  })
  .describe('Complete border configuration including style, characters, and visibility settings');

/**
 * Schema for validating custom border configurations
 */
export const CustomBorderConfigSchema = z
  .object({
    chars: BorderCharsSchema.partial().describe(
      'Partial character set - missing characters will use defaults from normal border'
    ),
    sides: BorderSidesSchema.optional().describe(
      'Optional visibility settings - defaults to all sides visible if not specified'
    ),
  })
  .describe('Custom border configuration allowing partial character overrides');

// Type inference from Zod schemas
export type BorderCharsType = z.infer<typeof BorderCharsSchema>;
export type BorderSidesType = z.infer<typeof BorderSidesSchema>;
export type BorderConfigType = z.infer<typeof BorderConfigSchema>;
export type CustomBorderConfigType = z.infer<typeof CustomBorderConfigSchema>;
