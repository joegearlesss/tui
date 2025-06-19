/**
 * ANSI escape sequence utilities for terminal text formatting
 * Provides functions to generate ANSI codes for colors, text formatting, and cursor control
 */

import { Color } from '@tui/styling/color/color';
import type { CompleteColor } from '@tui/styling/types/color';

/**
 * ANSI escape sequence constants and utilities
 */
export namespace ANSI {
  // Control sequences
  export const ESC = '\x1b';
  export const CSI = `${ESC}[`;
  export const OSC = `${ESC}]`;
  export const BEL = '\x07';
  export const ST = `${ESC}\\`;

  // Reset sequences
  export const RESET = `${CSI}0m`;
  export const RESET_FOREGROUND = `${CSI}39m`;
  export const RESET_BACKGROUND = `${CSI}49m`;

  // Text formatting codes
  export const BOLD = `${CSI}1m`;
  export const FAINT = `${CSI}2m`;
  export const ITALIC = `${CSI}3m`;
  export const UNDERLINE = `${CSI}4m`;
  export const BLINK = `${CSI}5m`;
  export const REVERSE = `${CSI}7m`;
  export const STRIKETHROUGH = `${CSI}9m`;

  // Text formatting reset codes
  export const RESET_BOLD = `${CSI}22m`;
  export const RESET_FAINT = `${CSI}22m`;
  export const RESET_ITALIC = `${CSI}23m`;
  export const RESET_UNDERLINE = `${CSI}24m`;
  export const RESET_BLINK = `${CSI}25m`;
  export const RESET_REVERSE = `${CSI}27m`;
  export const RESET_STRIKETHROUGH = `${CSI}29m`;

  /**
   * Generates ANSI foreground color code
   * @param color - Color to apply
   * @returns ANSI escape sequence for foreground color
   */
  export const foreground = (color: CompleteColor): string => {
    if (color.ansi !== undefined) {
      if (color.ansi < 8) {
        return `${CSI}3${color.ansi}m`;
      }
      if (color.ansi < 16) {
        return `${CSI}9${color.ansi - 8}m`;
      }
      return `${CSI}38;5;${color.ansi}m`;
    }

    if (color.hex) {
      const rgb = Color.hexToRgb(color.hex);
      if (rgb) {
        return `${CSI}38;2;${rgb.r};${rgb.g};${rgb.b}m`;
      }
    }

    return '';
  };

  /**
   * Generates ANSI background color code
   * @param color - Color to apply
   * @returns ANSI escape sequence for background color
   */
  export const background = (color: CompleteColor): string => {
    if (color.ansi !== undefined) {
      if (color.ansi < 8) {
        return `${CSI}4${color.ansi}m`;
      }
      if (color.ansi < 16) {
        return `${CSI}10${color.ansi - 8}m`;
      }
      return `${CSI}48;5;${color.ansi}m`;
    }

    if (color.hex) {
      const rgb = Color.hexToRgb(color.hex);
      if (rgb) {
        return `${CSI}48;2;${rgb.r};${rgb.g};${rgb.b}m`;
      }
    }

    return '';
  };

  /**
   * Wraps text with ANSI codes and ensures proper reset
   * @param text - Text to wrap
   * @param codes - ANSI codes to apply
   * @returns Text wrapped with ANSI codes
   */
  export const wrap = (text: string, ...codes: string[]): string => {
    if (codes.length === 0 || text === '') {
      return text;
    }
    return `${codes.join('')}${text}${RESET}`;
  };

  /**
   * Strips all ANSI escape sequences from text
   * @param text - Text with ANSI codes
   * @returns Plain text without ANSI codes
   */
  export const strip = (text: string): string => {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  };

  /**
   * Gets the display width of text (excluding ANSI codes)
   * @param text - Text to measure
   * @returns Display width in characters
   */
  export const width = (text: string): number => {
    return strip(text).length;
  };

  /**
   * Checks if text contains ANSI escape sequences
   * @param text - Text to check
   * @returns True if text contains ANSI codes
   */
  export const hasAnsi = (text: string): boolean => {
    // eslint-disable-next-line no-control-regex
    return /\x1b\[[0-9;]*m/.test(text);
  };

  /**
   * Builds a sequence of ANSI codes
   * @param codes - Array of ANSI codes to combine
   * @returns Combined ANSI sequence
   */
  export const sequence = (...codes: string[]): string => {
    return codes.filter((code) => code !== '').join('');
  };

  /**
   * Creates a hyperlink using ANSI OSC 8 sequence
   * @param url - URL to link to
   * @param text - Display text
   * @returns ANSI hyperlink sequence
   */
  export const hyperlink = (url: string, text: string): string => {
    return `${OSC}8;;${url}${ST}${text}${OSC}8;;${ST}`;
  };

  /**
   * Generates cursor movement sequences
   */
  export namespace Cursor {
    export const up = (n = 1): string => `${CSI}${n}A`;
    export const down = (n = 1): string => `${CSI}${n}B`;
    export const right = (n = 1): string => `${CSI}${n}C`;
    export const left = (n = 1): string => `${CSI}${n}D`;
    export const nextLine = (n = 1): string => `${CSI}${n}E`;
    export const prevLine = (n = 1): string => `${CSI}${n}F`;
    export const column = (n: number): string => `${CSI}${n}G`;
    export const position = (row: number, col: number): string => `${CSI}${row};${col}H`;
    export const save = (): string => `${CSI}s`;
    export const restore = (): string => `${CSI}u`;
    export const hide = (): string => `${CSI}?25l`;
    export const show = (): string => `${CSI}?25h`;
  }

  /**
   * Screen manipulation sequences
   */
  export namespace Screen {
    export const clear = (): string => `${CSI}2J`;
    export const clearLine = (): string => `${CSI}2K`;
    export const clearToEnd = (): string => `${CSI}0K`;
    export const clearToStart = (): string => `${CSI}1K`;
    export const scrollUp = (n = 1): string => `${CSI}${n}S`;
    export const scrollDown = (n = 1): string => `${CSI}${n}T`;
  }
}
