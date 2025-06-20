/**
 * Output utilities for styled terminal output
 * Provides proper terminal detection and ANSI handling per TUI styling guidelines
 */

import { StringUtils } from './utils/strings';

/**
 * Enhanced ANSI regex that matches all ANSI escape sequences
 * Covers: colors, cursor movements, clearing, etc.
 */
const ANSI_REGEX = /\u001b\[[0-9;]*[A-Za-z]/g;

/**
 * Terminal capabilities detection namespace
 */
namespace Terminal {
  /**
   * Checks if output is going to a TTY (terminal)
   * @returns true if output is to a terminal, false if redirected
   */
  export const isTerminal = (): boolean => {
    if (process.stdout.isTTY === false) {
      return false;
    }
    return typeof process.stdout.write === 'function';
  };

  /**
   * Checks if stderr is going to a TTY
   * @returns true if stderr is to a terminal, false if redirected
   */
  export const isStderrTerminal = (): boolean => {
    if (process.stderr.isTTY === false) {
      return false;
    }
    return typeof process.stderr.write === 'function';
  };

  /**
   * Strip all ANSI escape sequences from text
   * @param text - Text containing ANSI sequences
   * @returns Clean text without any ANSI sequences
   */
  export const stripAnsi = (text: string): string => {
    return text.replace(ANSI_REGEX, '');
  };
}

/**
 * Output utilities namespace replacing console.log usage
 * NEVER use console.log for styled output - use these functions instead
 */
export namespace output {
  /**
   * Main print function for styled terminal output
   * Handles TTY detection and ANSI stripping automatically
   * @param content - Styled content to output
   */
  export const print = (content: string): void => {
    if (Terminal.isTerminal()) {
      process.stdout.write(content + '\n');
    } else {
      process.stdout.write(Terminal.stripAnsi(content) + '\n');
    }
  };

  /**
   * Direct stdout output with TTY detection
   * @param content - Styled content for stdout
   */
  export const stdout = (content: string): void => {
    if (Terminal.isTerminal()) {
      process.stdout.write(content);
    } else {
      process.stdout.write(Terminal.stripAnsi(content));
    }
  };

  /**
   * Direct stderr output with TTY detection
   * @param content - Styled content for stderr
   */
  export const stderr = (content: string): void => {
    if (Terminal.isStderrTerminal()) {
      process.stderr.write(content);
    } else {
      process.stderr.write(Terminal.stripAnsi(content));
    }
  };

  /**
   * Check if output is going to a terminal
   * @returns true if terminal, false if redirected
   */
  export const isTerminal = (): boolean => Terminal.isTerminal();

  /**
   * Println function for compatibility
   * @param content - Styled content to output
   */
  export const println = print;
}

export { StringUtils };
