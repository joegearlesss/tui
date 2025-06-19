/**
 * Border System Index
 *
 * Main exports for the border system following functional programming principles.
 * Provides a complete API for creating, manipulating, and rendering borders.
 */

// Fluent API builder
export { BorderBuilder, BorderChain } from './builder';
// Border manipulation operations
export { BorderOperations } from './operations';

// Functional border creation and presets
export { Border, BorderPresets } from './presets';
// Rendering functionality
export type { BorderDimensions, BorderRenderOptions } from './rendering';
export { BorderRender } from './rendering';
// Core types and interfaces
export type {
  BorderChars,
  BorderCharsType,
  BorderConfig,
  BorderConfigType,
  BorderSidesType,
  BorderType,
  CustomBorderConfig,
  CustomBorderConfigType,
} from './types';
// Validation schemas
export {
  BorderCharsSchema,
  BorderConfigSchema,
  BorderSidesSchema,
  CustomBorderConfigSchema,
} from './types';

// Validation utilities
export { BorderValidation } from './validation';

// Import for re-exports
import { Border, BorderPresets } from './presets';

// Re-export commonly used functions for convenience
export const normalBorder = Border.normal;
export const roundedBorder = Border.rounded;
export const thickBorder = Border.thick;
export const doubleBorder = Border.double;
export const customBorder = Border.custom;

export const boxBorder = BorderPresets.box;
export const roundedBoxBorder = BorderPresets.roundedBox;
export const thickBoxBorder = BorderPresets.thickBox;
export const doubleBoxBorder = BorderPresets.doubleBox;
export const horizontalLineBorder = BorderPresets.horizontalLine;
export const verticalLineBorder = BorderPresets.verticalLine;
export const topLineBorder = BorderPresets.topLine;
export const bottomLineBorder = BorderPresets.bottomLine;
export const leftLineBorder = BorderPresets.leftLine;
export const rightLineBorder = BorderPresets.rightLine;
