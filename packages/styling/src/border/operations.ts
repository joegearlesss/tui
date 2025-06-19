/**
 * Border Operations
 *
 * Functional operations for manipulating border configurations.
 * All operations are pure functions that return new border configurations.
 */

import { Border } from './presets';
import type { BorderChars, BorderConfig, CustomBorderConfig } from './types';

/**
 * Border manipulation operations following functional programming principles
 * All functions are pure and return new BorderConfig objects
 */
export namespace BorderOperations {
  /**
   * Merges two border configurations, with the second taking precedence
   * @param base - Base border configuration
   * @param override - Border configuration to merge (takes precedence)
   * @returns New BorderConfig with merged properties
   */
  export const merge = (base: BorderConfig, override: Partial<BorderConfig>): BorderConfig => ({
    type: override.type ?? base.type,
    chars: Object.freeze({
      ...base.chars,
      ...override.chars,
    }),
    sides: Object.freeze(override.sides ?? base.sides) as readonly [
      boolean,
      boolean,
      boolean,
      boolean,
    ],
  });

  /**
   * Updates the border characters while preserving other properties
   * @param border - Base border configuration
   * @param chars - New character set (partial updates allowed)
   * @returns New BorderConfig with updated characters
   */
  export const updateChars = (border: BorderConfig, chars: Partial<BorderChars>): BorderConfig => ({
    ...border,
    chars: Object.freeze({
      ...border.chars,
      ...chars,
    }),
  });

  /**
   * Updates which sides of the border are visible
   * @param border - Base border configuration
   * @param sides - New side visibility configuration
   * @returns New BorderConfig with updated side visibility
   */
  export const updateSides = (
    border: BorderConfig,
    sides: readonly [boolean, boolean, boolean, boolean]
  ): BorderConfig => ({
    ...border,
    sides: Object.freeze([...sides]) as readonly [boolean, boolean, boolean, boolean],
  });

  /**
   * Toggles the visibility of a specific border side
   * @param border - Base border configuration
   * @param side - Which side to toggle ('top' | 'right' | 'bottom' | 'left')
   * @returns New BorderConfig with toggled side visibility
   */
  export const toggleSide = (
    border: BorderConfig,
    side: 'top' | 'right' | 'bottom' | 'left'
  ): BorderConfig => {
    const [_top, _right, _bottom, _left] = border.sides;
    const sideIndex = { top: 0, right: 1, bottom: 2, left: 3 }[side];
    const newSides = [...border.sides] as [boolean, boolean, boolean, boolean];
    newSides[sideIndex] = !newSides[sideIndex];

    return updateSides(border, newSides);
  };

  /**
   * Enables specific border sides while disabling others
   * @param border - Base border configuration
   * @param enabledSides - Array of sides to enable
   * @returns New BorderConfig with only specified sides enabled
   */
  export const enableSides = (
    border: BorderConfig,
    enabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]
  ): BorderConfig => {
    const sides: [boolean, boolean, boolean, boolean] = [false, false, false, false];

    for (const side of enabledSides) {
      const index = { top: 0, right: 1, bottom: 2, left: 3 }[side];
      sides[index] = true;
    }

    return updateSides(border, sides);
  };

  /**
   * Disables specific border sides while keeping others unchanged
   * @param border - Base border configuration
   * @param disabledSides - Array of sides to disable
   * @returns New BorderConfig with specified sides disabled
   */
  export const disableSides = (
    border: BorderConfig,
    disabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]
  ): BorderConfig => {
    const [top, right, bottom, left] = border.sides;
    const sides: [boolean, boolean, boolean, boolean] = [top, right, bottom, left];

    for (const side of disabledSides) {
      const index = { top: 0, right: 1, bottom: 2, left: 3 }[side];
      sides[index] = false;
    }

    return updateSides(border, sides);
  };

  /**
   * Converts a border to a different style while preserving side visibility
   * @param border - Base border configuration
   * @param newStyle - Target border style
   * @returns New BorderConfig with new style but same side visibility
   */
  export const convertStyle = (
    border: BorderConfig,
    newStyle: 'normal' | 'rounded' | 'thick' | 'double'
  ): BorderConfig => {
    const styleMap = {
      normal: Border.normal,
      rounded: Border.rounded,
      thick: Border.thick,
      double: Border.double,
    };

    const newBorder = styleMap[newStyle]();
    return updateSides(newBorder, border.sides);
  };

  /**
   * Creates a border configuration that inherits from a base with custom overrides
   * @param base - Base border configuration to inherit from
   * @param customConfig - Custom configuration to apply
   * @returns New BorderConfig with inherited and custom properties
   */
  export const inherit = (base: BorderConfig, customConfig: CustomBorderConfig): BorderConfig => ({
    type: 'custom',
    chars: Object.freeze({
      ...base.chars,
      ...customConfig.chars,
    }),
    sides: Object.freeze(customConfig.sides ?? base.sides) as readonly [
      boolean,
      boolean,
      boolean,
      boolean,
    ],
  });

  /**
   * Checks if two border configurations are equivalent
   * @param border1 - First border configuration
   * @param border2 - Second border configuration
   * @returns True if borders are equivalent, false otherwise
   */
  export const isEqual = (border1: BorderConfig, border2: BorderConfig): boolean => {
    if (border1.type !== border2.type) return false;

    // Check sides equality
    if (border1.sides.length !== border2.sides.length) return false;
    for (let i = 0; i < border1.sides.length; i++) {
      if (border1.sides[i] !== border2.sides[i]) return false;
    }

    // Check chars equality
    const charKeys: (keyof BorderChars)[] = [
      'top',
      'right',
      'bottom',
      'left',
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
    ];

    for (const key of charKeys) {
      if (border1.chars[key] !== border2.chars[key]) return false;
    }

    return true;
  };

  /**
   * Checks if a border has any visible sides
   * @param border - Border configuration to check
   * @returns True if at least one side is visible, false if all sides are hidden
   */
  export const hasVisibleSides = (border: BorderConfig): boolean => {
    return border.sides.some((side) => side);
  };

  /**
   * Gets an array of visible side names
   * @param border - Border configuration to analyze
   * @returns Array of visible side names
   */
  export const getVisibleSides = (
    border: BorderConfig
  ): readonly ('top' | 'right' | 'bottom' | 'left')[] => {
    const sideNames = ['top', 'right', 'bottom', 'left'] as const;
    return sideNames.filter((_, index) => border.sides[index]);
  };

  /**
   * Creates a minimal border configuration with only essential properties
   * @param border - Source border configuration
   * @returns Simplified BorderConfig with minimal properties
   */
  export const minimize = (border: BorderConfig): BorderConfig => {
    // If no sides are visible, return a minimal invisible border
    if (!hasVisibleSides(border)) {
      return Border.none(Border.normal());
    }

    return border;
  };
}
