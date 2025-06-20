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
  export const create = (): BorderChain => BorderChain.from(Border.normal());

  /**
   * Creates a new BorderChain starting with a specific border configuration
   * @param border - Initial border configuration
   * @returns BorderChain instance for fluent API usage
   */
  export const from = (border: BorderConfig): BorderChain => BorderChain.from(border);

  /**
   * Creates a new BorderChain starting with a normal border
   * @returns BorderChain instance for fluent API usage
   */
  export const normal = (): BorderChain => BorderChain.from(Border.normal());

  /**
   * Creates a new BorderChain starting with a rounded border
   * @returns BorderChain instance for fluent API usage
   */
  export const rounded = (): BorderChain => BorderChain.from(Border.rounded());

  /**
   * Creates a new BorderChain starting with a thick border
   * @returns BorderChain instance for fluent API usage
   */
  export const thick = (): BorderChain => BorderChain.from(Border.thick());

  /**
   * Creates a new BorderChain starting with a double border
   * @returns BorderChain instance for fluent API usage
   */
  export const double = (): BorderChain => BorderChain.from(Border.double());

  /**
   * Creates a new BorderChain starting with a custom border
   * @param config - Custom border configuration
   * @returns BorderChain instance for fluent API usage
   */
  export const custom = (config: CustomBorderConfig): BorderChain =>
    BorderChain.from(Border.custom(config));
}

/**
 * Functional border chain interface for method chaining
 */
export interface BorderChain {
  readonly config: BorderConfig;

  // Character manipulation methods
  chars(chars: Partial<BorderChars>): BorderChain;
  topChar(char: string): BorderChain;
  top(char: string): BorderChain;
  rightChar(char: string): BorderChain;
  right(char: string): BorderChain;
  bottomChar(char: string): BorderChain;
  bottom(char: string): BorderChain;
  leftChar(char: string): BorderChain;
  left(char: string): BorderChain;
  corners(topLeft: string, topRight: string, bottomLeft: string, bottomRight: string): BorderChain;

  // Side visibility methods
  sides(top: boolean, right: boolean, bottom: boolean, left: boolean): BorderChain;
  topOnly(): BorderChain;
  rightOnly(): BorderChain;
  bottomOnly(): BorderChain;
  leftOnly(): BorderChain;
  horizontalOnly(): BorderChain;
  verticalOnly(): BorderChain;
  allSides(): BorderChain;
  noSides(): BorderChain;
  enableSides(enabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]): BorderChain;
  disableSides(disabledSides: readonly ('top' | 'right' | 'bottom' | 'left')[]): BorderChain;
  toggleSide(side: 'top' | 'right' | 'bottom' | 'left'): BorderChain;

  // Style and configuration methods
  style(style: 'normal' | 'rounded' | 'thick' | 'double'): BorderChain;
  merge(other: Partial<BorderConfig>): BorderChain;
  inherit(base: BorderConfig, customConfig: CustomBorderConfig): BorderChain;

  // Color methods (placeholder for future implementation)
  topColor(color: string): BorderChain;
  rightColor(color: string): BorderChain;
  bottomColor(color: string): BorderChain;
  leftColor(color: string): BorderChain;

  // Terminal methods
  build(): BorderConfig;
  get(): BorderConfig;
  pipe(fn: (chain: BorderChain) => BorderChain): BorderChain;
  hasVisibleSides(): boolean;
  getVisibleSides(): readonly ('top' | 'right' | 'bottom' | 'left')[];
  isEqual(other: BorderConfig): boolean;
}

/**
 * Functional border chain namespace providing method chaining without classes
 */
namespace BorderChain {
  /**
   * Creates a border chain from configuration
   * @param config - Border configuration to wrap
   * @returns BorderChain interface with method chaining
   */
  export const from = (config: BorderConfig): BorderChain => {
    return {
      config,

      // Character manipulation methods
      chars: (chars) => from(BorderOperations.updateChars(config, chars)),
      topChar: (char) => from(BorderOperations.updateChars(config, { top: char })),
      top: (char) => from(BorderOperations.updateChars(config, { top: char })),
      rightChar: (char) => from(BorderOperations.updateChars(config, { right: char })),
      right: (char) => from(BorderOperations.updateChars(config, { right: char })),
      bottomChar: (char) => from(BorderOperations.updateChars(config, { bottom: char })),
      bottom: (char) => from(BorderOperations.updateChars(config, { bottom: char })),
      leftChar: (char) => from(BorderOperations.updateChars(config, { left: char })),
      left: (char) => from(BorderOperations.updateChars(config, { left: char })),
      corners: (topLeft, topRight, bottomLeft, bottomRight) =>
        from(BorderOperations.updateChars(config, { topLeft, topRight, bottomLeft, bottomRight })),

      // Side visibility methods
      sides: (top, right, bottom, left) =>
        from(BorderOperations.updateSides(config, [top, right, bottom, left])),
      topOnly: () => from(BorderOperations.updateSides(config, [true, false, false, false])),
      rightOnly: () => from(BorderOperations.updateSides(config, [false, true, false, false])),
      bottomOnly: () => from(BorderOperations.updateSides(config, [false, false, true, false])),
      leftOnly: () => from(BorderOperations.updateSides(config, [false, false, false, true])),
      horizontalOnly: () => from(BorderOperations.updateSides(config, [true, false, true, false])),
      verticalOnly: () => from(BorderOperations.updateSides(config, [false, true, false, true])),
      allSides: () => from(BorderOperations.updateSides(config, [true, true, true, true])),
      noSides: () => from(BorderOperations.updateSides(config, [false, false, false, false])),
      enableSides: (enabledSides) => from(BorderOperations.enableSides(config, enabledSides)),
      disableSides: (disabledSides) => from(BorderOperations.disableSides(config, disabledSides)),
      toggleSide: (side) => from(BorderOperations.toggleSide(config, side)),

      // Style and configuration methods
      style: (style) => from(BorderOperations.convertStyle(config, style)),
      merge: (other) => from(BorderOperations.merge(config, other)),
      inherit: (base, customConfig) => from(BorderOperations.inherit(base, customConfig)),

      // Color methods (placeholder for future implementation)
      topColor: (_color) => from(config), // TODO: Implement when color system is integrated
      rightColor: (_color) => from(config), // TODO: Implement when color system is integrated
      bottomColor: (_color) => from(config), // TODO: Implement when color system is integrated
      leftColor: (_color) => from(config), // TODO: Implement when color system is integrated

      // Terminal methods
      build: () => ({
        ...config,
        chars: { ...config.chars },
        sides: [...config.sides] as readonly [boolean, boolean, boolean, boolean],
      }),
      get: () => ({
        ...config,
        chars: { ...config.chars },
        sides: [...config.sides] as readonly [boolean, boolean, boolean, boolean],
      }),
      pipe: (fn) => fn(from(config)),
      hasVisibleSides: () => BorderOperations.hasVisibleSides(config),
      getVisibleSides: () => BorderOperations.getVisibleSides(config),
      isEqual: (other) => BorderOperations.isEqual(config, other),
    };
  };
}
