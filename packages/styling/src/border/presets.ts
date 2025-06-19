/**
 * Border Preset Configurations
 *
 * Provides predefined border styles following functional programming principles.
 * Based on OVERVIEW-v2 Section 3 specification with Unicode box-drawing characters.
 */

import type { BorderChars, BorderConfig, CustomBorderConfig } from './types';

/**
 * Functional Border namespace providing preset border configurations
 * All functions are pure and return immutable border configurations
 */
export namespace Border {
  /**
   * Creates a normal border using standard box-drawing characters
   * @returns BorderConfig with standard Unicode box-drawing characters
   */
  export const normal = (): BorderConfig => ({
    type: 'normal',
    chars: Object.freeze({
      top: '─',
      right: '│',
      bottom: '─',
      left: '│',
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
    }),
    sides: Object.freeze([true, true, true, true]) as readonly [boolean, boolean, boolean, boolean],
  });

  /**
   * Creates a rounded border using curved box-drawing characters
   * @returns BorderConfig with rounded corner characters
   */
  export const rounded = (): BorderConfig => ({
    type: 'rounded',
    chars: Object.freeze({
      top: '─',
      right: '│',
      bottom: '─',
      left: '│',
      topLeft: '╭',
      topRight: '╮',
      bottomLeft: '╰',
      bottomRight: '╯',
    }),
    sides: Object.freeze([true, true, true, true]) as readonly [boolean, boolean, boolean, boolean],
  });

  /**
   * Creates a thick border using heavy box-drawing characters
   * @returns BorderConfig with thick/heavy Unicode characters
   */
  export const thick = (): BorderConfig => ({
    type: 'thick',
    chars: Object.freeze({
      top: '━',
      right: '┃',
      bottom: '━',
      left: '┃',
      topLeft: '┏',
      topRight: '┓',
      bottomLeft: '┗',
      bottomRight: '┛',
    }),
    sides: Object.freeze([true, true, true, true]) as readonly [boolean, boolean, boolean, boolean],
  });

  /**
   * Creates a double-line border using double box-drawing characters
   * @returns BorderConfig with double-line Unicode characters
   */
  export const double = (): BorderConfig => ({
    type: 'double',
    chars: Object.freeze({
      top: '═',
      right: '║',
      bottom: '═',
      left: '║',
      topLeft: '╔',
      topRight: '╗',
      bottomLeft: '╚',
      bottomRight: '╝',
    }),
    sides: Object.freeze([true, true, true, true]) as readonly [boolean, boolean, boolean, boolean],
  });

  /**
   * Creates a custom border by merging user-provided characters with normal border defaults
   * @param config - Partial border configuration with custom characters
   * @returns BorderConfig with custom characters merged with normal border defaults
   */
  export const custom = (config: CustomBorderConfig): BorderConfig => {
    const normalBorder = normal();

    return {
      type: 'custom',
      chars: Object.freeze({
        ...normalBorder.chars,
        ...config.chars,
      }),
      sides: Object.freeze(config.sides ?? normalBorder.sides) as readonly [
        boolean,
        boolean,
        boolean,
        boolean,
      ],
    };
  };

  /**
   * Creates a border configuration with specific sides enabled/disabled
   * @param border - Base border configuration
   * @param top - Whether to show top border
   * @param right - Whether to show right border
   * @param bottom - Whether to show bottom border
   * @param left - Whether to show left border
   * @returns BorderConfig with specified side visibility
   */
  export const withSides = (
    border: BorderConfig,
    top: boolean,
    right: boolean,
    bottom: boolean,
    left: boolean
  ): BorderConfig => ({
    ...border,
    sides: Object.freeze([top, right, bottom, left]) as readonly [
      boolean,
      boolean,
      boolean,
      boolean,
    ],
  });

  /**
   * Creates a border with only the top side visible
   * @param border - Base border configuration
   * @returns BorderConfig with only top border visible
   */
  export const topOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, true, false, false, false);

  /**
   * Creates a border with only the bottom side visible
   * @param border - Base border configuration
   * @returns BorderConfig with only bottom border visible
   */
  export const bottomOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, false, false, true, false);

  /**
   * Creates a border with only the left side visible
   * @param border - Base border configuration
   * @returns BorderConfig with only left border visible
   */
  export const leftOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, false, false, false, true);

  /**
   * Creates a border with only the right side visible
   * @param border - Base border configuration
   * @returns BorderConfig with only right border visible
   */
  export const rightOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, false, true, false, false);

  /**
   * Creates a border with only horizontal sides (top and bottom) visible
   * @param border - Base border configuration
   * @returns BorderConfig with only horizontal borders visible
   */
  export const horizontalOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, true, false, true, false);

  /**
   * Creates a border with only vertical sides (left and right) visible
   * @param border - Base border configuration
   * @returns BorderConfig with only vertical borders visible
   */
  export const verticalOnly = (border: BorderConfig): BorderConfig =>
    withSides(border, false, true, false, true);

  /**
   * Creates a border with no sides visible (effectively invisible)
   * @param border - Base border configuration
   * @returns BorderConfig with no borders visible
   */
  export const none = (border: BorderConfig): BorderConfig =>
    withSides(border, false, false, false, false);
}

/**
 * Predefined border configurations for common use cases
 * These are ready-to-use border configurations following common design patterns
 */
export namespace BorderPresets {
  /** Standard box border with all sides */
  export const box = Border.normal();

  /** Rounded corner box border */
  export const roundedBox = Border.rounded();

  /** Thick/heavy box border */
  export const thickBox = Border.thick();

  /** Double-line box border */
  export const doubleBox = Border.double();

  /** Horizontal line (top and bottom only) */
  export const horizontalLine = Border.horizontalOnly(Border.normal());

  /** Vertical line (left and right only) */
  export const verticalLine = Border.verticalOnly(Border.normal());

  /** Top border only */
  export const topLine = Border.topOnly(Border.normal());

  /** Bottom border only */
  export const bottomLine = Border.bottomOnly(Border.normal());

  /** Left border only */
  export const leftLine = Border.leftOnly(Border.normal());

  /** Right border only */
  export const rightLine = Border.rightOnly(Border.normal());
}
