/**
 * Border Builder
 *
 * Provides a fluent API for building border configurations using function chaining.
 * Follows the development guidelines' function chaining pattern while maintaining functional principles.
 */

import { BorderOperations } from './operations';
import { Border } from './presets';
import type { BorderChars, BorderConfig, CustomBorderConfig } from './types';

/**
 * BorderBuilder namespace providing fluent API creation
 * Follows the function chaining pattern from development guidelines
 */
export namespace BorderBuilder {
  /**
   * Creates a new BorderChain starting with a normal border
   * @returns BorderChain instance for fluent API usage
   */
  export const create = (): BorderChain => new BorderChain(Border.normal());

  /**
   * Creates a new BorderChain starting with a specific border configuration
   * @param border - Initial border configuration
   * @returns BorderChain instance for fluent API usage
   */
  export const from = (border: BorderConfig): BorderChain => new BorderChain(border);

  /**
   * Creates a new BorderChain starting with a normal border
   * @returns BorderChain instance for fluent API usage
   */
  export const normal = (): BorderChain => new BorderChain(Border.normal());

  /**
   * Creates a new BorderChain starting with a rounded border
   * @returns BorderChain instance for fluent API usage
   */
  export const rounded = (): BorderChain => new BorderChain(Border.rounded());

  /**
   * Creates a new BorderChain starting with a thick border
   * @returns BorderChain instance for fluent API usage
   */
  export const thick = (): BorderChain => new BorderChain(Border.thick());

  /**
   * Creates a new BorderChain starting with a double border
   * @returns BorderChain instance for fluent API usage
   */
  export const double = (): BorderChain => new BorderChain(Border.double());

  /**
   * Creates a new BorderChain starting with a custom border
   * @param config - Custom border configuration
   * @returns BorderChain instance for fluent API usage
   */
  export const custom = (config: CustomBorderConfig): BorderChain =>
    new BorderChain(Border.custom(config));
}

/**
 * BorderChain class providing fluent API for border configuration
 * Uses immutable operations - each method returns a new BorderChain instance
 */
export class BorderChain {
  constructor(private readonly config: BorderConfig) {}

  /**
   * Sets specific border characters
   * @param chars - Partial character set to update
   * @returns New BorderChain with updated characters
   */
  chars(chars: Partial<BorderChars>): BorderChain {
    return new BorderChain(BorderOperations.updateChars(this.config, chars));
  }

  /**
   * Sets the top border character
   * @param char - Character for top border
   * @returns New BorderChain with updated top character
   */
  topChar(char: string): BorderChain {
    return this.chars({ top: char });
  }

  /**
   * Sets the top border character (alias for topChar)
   * @param char - Character for top border
   * @returns New BorderChain with updated top character
   */
  top(char: string): BorderChain {
    return this.topChar(char);
  }

  /**
   * Sets the right border character
   * @param char - Character for right border
   * @returns New BorderChain with updated right character
   */
  rightChar(char: string): BorderChain {
    return this.chars({ right: char });
  }

  /**
   * Sets the right border character (alias for rightChar)
   * @param char - Character for right border
   * @returns New BorderChain with updated right character
   */
  right(char: string): BorderChain {
    return this.rightChar(char);
  }

  /**
   * Sets the bottom border character
   * @param char - Character for bottom border
   * @returns New BorderChain with updated bottom character
   */
  bottomChar(char: string): BorderChain {
    return this.chars({ bottom: char });
  }

  /**
   * Sets the bottom border character (alias for bottomChar)
   * @param char - Character for bottom border
   * @returns New BorderChain with updated bottom character
   */
  bottom(char: string): BorderChain {
    return this.bottomChar(char);
  }

  /**
   * Sets the left border character
   * @param char - Character for left border
   * @returns New BorderChain with updated left character
   */
  leftChar(char: string): BorderChain {
    return this.chars({ left: char });
  }

  /**
   * Sets the left border character (alias for leftChar)
   * @param char - Character for left border
   * @returns New BorderChain with updated left character
   */
  left(char: string): BorderChain {
    return this.leftChar(char);
  }

  /**
   * Sets all corner characters at once
   * @param topLeft - Top-left corner character
   * @param topRight - Top-right corner character
   * @param bottomLeft - Bottom-left corner character
   * @param bottomRight - Bottom-right corner character
   * @returns New BorderChain with updated corner characters
   */
  corners(topLeft: string, topRight: string, bottomLeft: string, bottomRight: string): BorderChain {
    return this.chars({
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    });
  }

  /**
   * Sets which border sides are visible
   * @param top - Show top border
   * @param right - Show right border
   * @param bottom - Show bottom border
   * @param left - Show left border
   * @returns New BorderChain with updated side visibility
   */
  sides(top: boolean, right: boolean, bottom: boolean, left: boolean): BorderChain {
    return new BorderChain(BorderOperations.updateSides(this.config, [top, right, bottom, left]));
  }

  /**
   * Shows only the top border
   * @returns New BorderChain with only top border visible
   */
  topOnly(): BorderChain {
    return this.sides(true, false, false, false);
  }

  /**
   * Shows only the right border
   * @returns New BorderChain with only right border visible
   */
  rightOnly(): BorderChain {
    return this.sides(false, true, false, false);
  }

  /**
   * Shows only the bottom border
   * @returns New BorderChain with only bottom border visible
   */
  bottomOnly(): BorderChain {
    return this.sides(false, false, true, false);
  }

  /**
   * Shows only the left border
   * @returns New BorderChain with only left border visible
   */
  leftOnly(): BorderChain {
    return this.sides(false, false, false, true);
  }

  /**
   * Shows only horizontal borders (top and bottom)
   * @returns New BorderChain with only horizontal borders visible
   */
  horizontalOnly(): BorderChain {
    return this.sides(true, false, true, false);
  }

  /**
   * Shows only vertical borders (left and right)
   * @returns New BorderChain with only vertical borders visible
   */
  verticalOnly(): BorderChain {
    return this.sides(false, true, false, true);
  }

  /**
   * Shows all border sides
   * @returns New BorderChain with all borders visible
   */
  allSides(): BorderChain {
    return this.sides(true, true, true, true);
  }

  /**
   * Hides all border sides
   * @returns New BorderChain with no borders visible
   */
  noSides(): BorderChain {
    return this.sides(false, false, false, false);
  }

  /**
   * Enables specific border sides
   * @param enabledSides - Array of sides to enable
   * @returns New BorderChain with specified sides enabled
   */
  enableSides(enabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]): BorderChain {
    return new BorderChain(BorderOperations.enableSides(this.config, enabledSides));
  }

  /**
   * Disables specific border sides
   * @param disabledSides - Array of sides to disable
   * @returns New BorderChain with specified sides disabled
   */
  disableSides(disabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]): BorderChain {
    return new BorderChain(BorderOperations.disableSides(this.config, disabledSides));
  }

  /**
   * Toggles the visibility of a specific border side
   * @param side - Side to toggle
   * @returns New BorderChain with toggled side visibility
   */
  toggleSide(side: 'top' | 'right' | 'bottom' | 'left'): BorderChain {
    return new BorderChain(BorderOperations.toggleSide(this.config, side));
  }

  /**
   * Converts the border to a different style while preserving side visibility
   * @param style - Target border style
   * @returns New BorderChain with new style
   */
  style(style: 'normal' | 'rounded' | 'thick' | 'double'): BorderChain {
    return new BorderChain(BorderOperations.convertStyle(this.config, style));
  }

  /**
   * Merges with another border configuration
   * @param other - Border configuration to merge
   * @returns New BorderChain with merged configuration
   */
  merge(other: Partial<BorderConfig>): BorderChain {
    return new BorderChain(BorderOperations.merge(this.config, other));
  }

  /**
   * Inherits from another border with custom overrides
   * @param base - Base border to inherit from
   * @param customConfig - Custom configuration to apply
   * @returns New BorderChain with inherited configuration
   */
  inherit(base: BorderConfig, customConfig: CustomBorderConfig): BorderChain {
    return new BorderChain(BorderOperations.inherit(base, customConfig));
  }

  /**
   * Returns the final border configuration
   * @returns Immutable BorderConfig object
   */
  build(): BorderConfig {
    return {
      ...this.config,
      chars: { ...this.config.chars },
      sides: [...this.config.sides] as readonly [boolean, boolean, boolean, boolean],
    };
  }

  /**
   * Gets the current border configuration (alias for build)
   * @returns Immutable BorderConfig object
   */
  get(): BorderConfig {
    return this.build();
  }

  /**
   * Applies a transformation function to this BorderChain
   * @param fn - Function that takes a BorderChain and returns a BorderChain
   * @returns Result of applying the transformation function
   */
  pipe(fn: (chain: BorderChain) => BorderChain): BorderChain {
    return fn(this);
  }

  /**
   * Checks if the current border has any visible sides
   * @returns True if at least one side is visible
   */
  hasVisibleSides(): boolean {
    return BorderOperations.hasVisibleSides(this.config);
  }

  /**
   * Gets an array of visible side names
   * @returns Array of visible side names
   */
  getVisibleSides(): readonly ('top' | 'right' | 'bottom' | 'left')[] {
    return BorderOperations.getVisibleSides(this.config);
  }

  /**
   * Checks if this border is equal to another border configuration
   * @param other - Border configuration to compare
   * @returns True if borders are equivalent
   */
  isEqual(other: BorderConfig): boolean {
    return BorderOperations.isEqual(this.config, other);
  }

  /**
   * Sets the top border color (placeholder for future color support)
   * @param color - Color for top border
   * @returns New BorderChain (currently returns same chain)
   */
  topColor(_color: string): BorderChain {
    // TODO: Implement color support when color system is integrated
    return this;
  }

  /**
   * Sets the right border color (placeholder for future color support)
   * @param color - Color for right border
   * @returns New BorderChain (currently returns same chain)
   */
  rightColor(_color: string): BorderChain {
    // TODO: Implement color support when color system is integrated
    return this;
  }

  /**
   * Sets the bottom border color (placeholder for future color support)
   * @param color - Color for bottom border
   * @returns New BorderChain (currently returns same chain)
   */
  bottomColor(_color: string): BorderChain {
    // TODO: Implement color support when color system is integrated
    return this;
  }

  /**
   * Sets the left border color (placeholder for future color support)
   * @param color - Color for left border
   * @returns New BorderChain (currently returns same chain)
   */
  leftColor(_color: string): BorderChain {
    // TODO: Implement color support when color system is integrated
    return this;
  }
}
