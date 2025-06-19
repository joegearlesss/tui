import { z } from 'zod';

/**
 * Core position constants for alignment and positioning
 */
export namespace Position {
  // Horizontal positions
  export const LEFT = 0.0 as const;
  export const CENTER = 0.5 as const;
  export const RIGHT = 1.0 as const;

  // Vertical positions
  export const TOP = 0.0 as const;
  export const MIDDLE = 0.5 as const;
  export const BOTTOM = 1.0 as const;
}

/**
 * Position value schema for validation
 */
export const PositionSchema = z
  .number()
  .min(0, 'Position must be between 0.0 and 1.0')
  .max(1, 'Position must be between 0.0 and 1.0')
  .describe('Position value from 0.0 (left/top) to 1.0 (right/bottom)');

/**
 * Horizontal position type
 */
export type HorizontalPosition =
  | typeof Position.LEFT
  | typeof Position.CENTER
  | typeof Position.RIGHT
  | number;

/**
 * Vertical position type
 */
export type VerticalPosition =
  | typeof Position.TOP
  | typeof Position.MIDDLE
  | typeof Position.BOTTOM
  | number;

/**
 * Box model dimensions schema
 */
export const BoxDimensionsSchema = z
  .object({
    top: z
      .number()
      .min(0, 'Top dimension must be non-negative')
      .describe('Top spacing in character units'),
    right: z
      .number()
      .min(0, 'Right dimension must be non-negative')
      .describe('Right spacing in character units'),
    bottom: z
      .number()
      .min(0, 'Bottom dimension must be non-negative')
      .describe('Bottom spacing in character units'),
    left: z
      .number()
      .min(0, 'Left dimension must be non-negative')
      .describe('Left spacing in character units'),
  })
  .describe('Box model dimensions for padding, margin, or border spacing');

export type BoxDimensions = z.infer<typeof BoxDimensionsSchema>;

/**
 * Size constraints schema
 */
export const SizeConstraintsSchema = z
  .object({
    width: z
      .number()
      .min(0, 'Width must be non-negative')
      .optional()
      .describe('Fixed width in character units - undefined for auto-sizing'),
    height: z
      .number()
      .min(0, 'Height must be non-negative')
      .optional()
      .describe('Fixed height in character units - undefined for auto-sizing'),
    maxWidth: z
      .number()
      .min(0, 'Max width must be non-negative')
      .optional()
      .describe('Maximum width constraint - undefined for no limit'),
    maxHeight: z
      .number()
      .min(0, 'Max height must be non-negative')
      .optional()
      .describe('Maximum height constraint - undefined for no limit'),
  })
  .describe('Size constraints for content layout and wrapping');

export type SizeConstraints = z.infer<typeof SizeConstraintsSchema>;

/**
 * Text alignment options
 */
export const TextAlignmentSchema = z
  .enum(['left', 'center', 'right'])
  .describe('Text alignment within its container - left, center, or right');

export type TextAlignment = z.infer<typeof TextAlignmentSchema>;

/**
 * Vertical alignment options
 */
export const VerticalAlignmentSchema = z
  .enum(['top', 'middle', 'bottom'])
  .describe('Vertical alignment within container - top, middle, or bottom');

export type VerticalAlignment = z.infer<typeof VerticalAlignmentSchema>;
