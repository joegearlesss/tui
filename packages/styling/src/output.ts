/**
 * Output utilities that mimic lipgloss.Println() behavior
 * Handles TTY detection and automatic ANSI stripping for file output
 */

import { StringUtils } from './utils/strings.js';

/**
 * Enhanced ANSI regex that matches all ANSI escape sequences
 * Covers: colors, cursor movements, clearing, etc.
 */
const ANSI_REGEX = /\u001b\[[0-9;]*[A-Za-z]/g;

/**
 * Strip all ANSI escape sequences from text (enhanced version)
 * @param text - Text containing ANSI sequences
 * @returns Clean text without any ANSI sequences
 */
export const stripAllAnsi = (text: string): string => {
  return text.replace(ANSI_REGEX, '');
};

/**
 * Checks if output is going to a TTY (terminal)
 * When output is redirected to a file, this returns false
 * @returns true if output is to a terminal, false if redirected
 */
export const isOutputTTY = (): boolean => {
  return process.stdout.isTTY ?? false;
};

/**
 * Print function that mimics lipgloss.Println() behavior
 * - When output is to a TTY: preserves ANSI codes
 * - When output is redirected: strips all ANSI codes for clean text
 * @param text - Styled text to output
 */
export const print = (text: string): void => {
  if (isOutputTTY()) {
    // Output to terminal - preserve ANSI codes
    console.log(text);
  } else {
    // Output redirected (to file, pipe, etc.) - strip ANSI codes
    console.log(stripAllAnsi(text));
  }
};

/**
 * Println function for compatibility with lipgloss naming
 * Alias for print function
 * @param text - Styled text to output
 */
export const println = print;

export { StringUtils };