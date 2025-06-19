import type { BoxDimensions, HorizontalPosition, VerticalPosition } from '@tui/styling/types';
import { z } from 'zod';

/**
 * Position utilities for layout and alignment operations
 */
export namespace Position {
  // Position constants
  export const LEFT = 0.0 as const;
  export const CENTER = 0.5 as const;
  export const RIGHT = 1.0 as const;
  export const TOP = 0.0 as const;
  export const MIDDLE = 0.5 as const;
  export const BOTTOM = 1.0 as const;

  /**
   * Validates a position value is within valid range
   * @param position - Position value to validate (0.0 to 1.0)
   * @returns True if position is valid, false otherwise
   */
  export const isValidPosition = (position: number): boolean => {
    return position >= 0.0 && position <= 1.0;
  };

  /**
   * Clamps a position value to valid range
   * @param position - Position value to clamp
   * @returns Clamped position between 0.0 and 1.0
   */
  export const clampPosition = (position: number): number => {
    return Math.max(0.0, Math.min(1.0, position));
  };

  /**
   * Converts position constant to numeric value
   * @param position - Position constant or numeric value
   * @returns Numeric position value
   */
  export const toNumeric = (position: HorizontalPosition | VerticalPosition): number => {
    return typeof position === 'number' ? position : position;
  };

  /**
   * Calculates offset from position and container size
   * @param position - Position value (0.0 to 1.0)
   * @param containerSize - Size of container
   * @param contentSize - Size of content to position
   * @returns Calculated offset
   */
  export const calculateOffset = (
    position: number,
    containerSize: number,
    contentSize: number
  ): number => {
    const validPosition = clampPosition(position);
    const availableSpace = Math.max(0, containerSize - contentSize);
    return Math.floor(availableSpace * validPosition);
  };

  /**
   * Gets horizontal alignment string for CSS-like usage
   * @param position - Horizontal position
   * @returns Alignment string ('left', 'center', 'right')
   */
  export const getHorizontalAlignment = (
    position: HorizontalPosition
  ): 'left' | 'center' | 'right' => {
    const numeric = toNumeric(position);
    if (numeric <= 0.0) return 'left';
    if (numeric >= 1.0) return 'right';
    return 'center';
  };

  /**
   * Gets vertical alignment string for CSS-like usage
   * @param position - Vertical position
   * @returns Alignment string ('top', 'middle', 'bottom')
   */
  export const getVerticalAlignment = (position: VerticalPosition): 'top' | 'middle' | 'bottom' => {
    const numeric = toNumeric(position);
    if (numeric <= 0.0) return 'top';
    if (numeric >= 1.0) return 'bottom';
    return 'middle';
  };
}

/**
 * Box model utilities for padding, margin, and border calculations
 */
export namespace BoxModel {
  /**
   * Creates box dimensions from CSS-style values
   * @param top - Top value, or all sides if others undefined
   * @param right - Right value, defaults to top
   * @param bottom - Bottom value, defaults to top
   * @param left - Left value, defaults to right
   * @returns BoxDimensions object
   */
  export const createDimensions = (
    top: number,
    right?: number,
    bottom?: number,
    left?: number
  ): BoxDimensions => {
    return {
      top,
      right: right ?? top,
      bottom: bottom ?? top,
      left: left ?? right ?? top,
    };
  };

  /**
   * Gets total horizontal space from box dimensions
   * @param dimensions - Box dimensions
   * @returns Sum of left and right values
   */
  export const getHorizontalSpace = (dimensions: BoxDimensions): number => {
    return dimensions.left + dimensions.right;
  };

  /**
   * Gets total vertical space from box dimensions
   * @param dimensions - Box dimensions
   * @returns Sum of top and bottom values
   */
  export const getVerticalSpace = (dimensions: BoxDimensions): number => {
    return dimensions.top + dimensions.bottom;
  };

  /**
   * Gets total space from box dimensions
   * @param dimensions - Box dimensions
   * @returns Object with horizontal and vertical totals
   */
  export const getTotalSpace = (
    dimensions: BoxDimensions
  ): { horizontal: number; vertical: number } => {
    return {
      horizontal: getHorizontalSpace(dimensions),
      vertical: getVerticalSpace(dimensions),
    };
  };

  /**
   * Adds two box dimensions together
   * @param a - First box dimensions
   * @param b - Second box dimensions
   * @returns Combined box dimensions
   */
  export const addDimensions = (a: BoxDimensions, b: BoxDimensions): BoxDimensions => {
    return {
      top: a.top + b.top,
      right: a.right + b.right,
      bottom: a.bottom + b.bottom,
      left: a.left + b.left,
    };
  };

  /**
   * Scales box dimensions by a factor
   * @param dimensions - Box dimensions to scale
   * @param factor - Scale factor
   * @returns Scaled box dimensions
   */
  export const scaleDimensions = (dimensions: BoxDimensions, factor: number): BoxDimensions => {
    return {
      top: Math.round(dimensions.top * factor),
      right: Math.round(dimensions.right * factor),
      bottom: Math.round(dimensions.bottom * factor),
      left: Math.round(dimensions.left * factor),
    };
  };

  /**
   * Creates zero box dimensions
   * @returns Box dimensions with all values set to 0
   */
  export const zero = (): BoxDimensions => {
    return createDimensions(0);
  };

  /**
   * Creates uniform box dimensions
   * @param value - Value for all sides
   * @returns Box dimensions with all sides set to value
   */
  export const uniform = (value: number): BoxDimensions => {
    return createDimensions(value);
  };
}
