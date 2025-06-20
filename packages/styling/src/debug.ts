/**
 * Debug utilities for development output
 * Provides proper debug logging with styling support per TUI development guidelines
 */

import { output } from './output';
import { Style, StyleBuilder } from './style/style';
import type { StyleProperties } from './style/style';

/**
 * Debug utilities namespace for development output
 * Use these instead of console.log for debugging styled components
 */
export namespace debug {
  /**
   * Check if debug mode is enabled
   * @returns true if NODE_ENV is development or DEBUG env var is set
   */
  export const isEnabled = (): boolean => {
    return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  };

  /**
   * Debug-level styled output
   * @param message - Debug message
   * @param data - Optional data to display
   */
  export const log = (message: string, data?: unknown): void => {
    if (!isEnabled()) return;

    const debugStyle = createDebugStyle('#888888');
    const prefix = Style.render(debugStyle, '[DEBUG] ');
    output.stderr(prefix + message + (data ? ` ${formatData(data)}` : ''));
  };

  /**
   * Error-level styled output
   * @param message - Error message
   * @param error - Optional error object
   */
  export const error = (message: string, error?: unknown): void => {
    const errorStyle = createDebugStyle('#FF4444', true);
    const prefix = Style.render(errorStyle, '[ERROR] ');
    output.stderr(prefix + message + (error ? ` ${formatData(error)}` : ''));
  };

  /**
   * Warning-level styled output
   * @param message - Warning message
   * @param data - Optional data to display
   */
  export const warn = (message: string, data?: unknown): void => {
    const warnStyle = createDebugStyle('#FFAA00', true);
    const prefix = Style.render(warnStyle, '[WARN]  ');
    output.stderr(prefix + message + (data ? ` ${formatData(data)}` : ''));
  };

  /**
   * Info-level styled output
   * @param message - Info message
   * @param data - Optional data to display
   */
  export const info = (message: string, data?: unknown): void => {
    if (!isEnabled()) return;

    const infoStyle = createDebugStyle('#4488FF');
    const prefix = Style.render(infoStyle, '[INFO]  ');
    output.stderr(prefix + message + (data ? ` ${formatData(data)}` : ''));
  };

  /**
   * Success-level styled output
   * @param message - Success message
   * @param data - Optional data to display
   */
  export const success = (message: string, data?: unknown): void => {
    if (!isEnabled()) return;

    const successStyle = createDebugStyle('#44AA44', true);
    const prefix = Style.render(successStyle, '[SUCCESS] ');
    output.stderr(prefix + message + (data ? ` ${formatData(data)}` : ''));
  };

  /**
   * Trace-level detailed output for deep debugging
   * @param message - Trace message
   * @param data - Optional data to display
   */
  export const trace = (message: string, data?: unknown): void => {
    if (!isEnabled() || process.env.DEBUG_TRACE !== 'true') return;

    const traceStyle = createDebugStyle('#666666');
    const prefix = Style.render(traceStyle, '[TRACE] ');
    output.stderr(prefix + message + (data ? ` ${formatData(data)}` : ''));
  };

  /**
   * Performance timing debug output
   * @param label - Timer label
   * @param startTime - Start time from performance.now()
   */
  export const time = (label: string, startTime: number): void => {
    if (!isEnabled()) return;

    const duration = performance.now() - startTime;
    const timeStyle = createDebugStyle('#AA44AA');
    const prefix = Style.render(timeStyle, '[TIME]  ');
    output.stderr(`${prefix}${label}: ${duration.toFixed(2)}ms`);
  };

  /**
   * Start a performance timer
   * @param label - Timer label
   * @returns Start time to pass to time()
   */
  export const timeStart = (label: string): number => {
    if (!isEnabled()) return 0;

    const start = performance.now();
    trace(`Timer started: ${label}`);
    return start;
  };

  /**
   * Visual diff debug output for comparison
   * @param label - Comparison label
   * @param expected - Expected value
   * @param actual - Actual value
   */
  export const diff = (label: string, expected: string, actual: string): void => {
    if (!isEnabled()) return;

    error(`${label} - Visual difference detected`);
    info('Expected:', expected.slice(0, 100) + (expected.length > 100 ? '...' : ''));
    info('Actual:  ', actual.slice(0, 100) + (actual.length > 100 ? '...' : ''));
  };

  // Private helper functions

  /**
   * Create a styled debug prefix
   * @param color - Color for the debug level
   * @param bold - Whether to make it bold
   * @returns Style properties for debug output
   */
  const createDebugStyle = (color: string, bold = false): StyleProperties => {
    return StyleBuilder.create().foreground(color).bold(bold).build();
  };

  /**
   * Format data for debug output
   * @param data - Data to format
   * @returns Formatted string representation
   */
  const formatData = (data: unknown): string => {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (typeof data === 'string') return `"${data}"`;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };
}
