/**
 * Border System Index
 *
 * Main exports for the border system following functional programming principles.
 * Provides a complete API for creating, manipulating, and rendering borders.
 */

// Core types and interfaces
export type {
  BorderType,
  BorderChars,
  BorderConfig,
  CustomBorderConfig,
  BorderCharsType,
  BorderSidesType,
  BorderConfigType,
  CustomBorderConfigType,
} from './types';

// Validation schemas
export {
  BorderCharsSchema,
  BorderSidesSchema,
  BorderConfigSchema,
  CustomBorderConfigSchema,
} from './types';

// Functional border creation and presets
export { Border, BorderPresets } from './presets';

// Border manipulation operations
export { BorderOperations } from './operations';

// Fluent API builder
export { BorderBuilder, BorderChain } from './builder';

// Rendering functionality
export type { BorderRenderOptions, BorderDimensions } from './rendering';
export { BorderRender } from './rendering';

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
