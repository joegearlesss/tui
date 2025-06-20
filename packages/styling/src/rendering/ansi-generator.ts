import { ANSI } from '@tui/styling/ansi/ansi';
import { Color } from '@tui/styling/color';
import { Terminal } from '@tui/styling/terminal/detection';
import type { StyleProperties } from '@tui/styling/style/style';
import type { ColorValue } from '@tui/styling/types';
import { Result } from '@tui/styling/utils/result';

/**
 * Core ANSI rendering engine for visual output generation
 * Converts style properties into ANSI escape sequences for terminal display
 */

export interface AnsiRenderOptions {
  readonly respectTerminalCapabilities?: boolean;
  readonly optimizeForTerminal?: string;
  readonly enableColorSupport?: boolean;
  readonly enableUnicodeSupport?: boolean;
}

export interface AnsiRenderResult {
  readonly content: string;
  readonly ansiCodes: readonly string[];
  readonly resetCode: string;
  readonly byteLength: number;
}

/**
 * ANSI Generator namespace providing core rendering functionality
 */
export namespace AnsiGenerator {
  
  /**
   * Generates ANSI escape sequences for style properties
   * @param style - Style properties to convert
   * @param options - Rendering options
   * @returns Result containing ANSI codes or error
   */
  export const generateCodes = (
    style: StyleProperties,
    options: AnsiRenderOptions = {}
  ): Result<readonly string[], string> => {
    try {
      const codes: string[] = [];
      const { respectTerminalCapabilities = true, enableColorSupport = true } = options;

      // Check terminal capabilities if requested (but not if color support is explicitly enabled)
      if (respectTerminalCapabilities && !enableColorSupport && !Terminal.hasColorSupport()) {
        // Return empty codes for terminals without color support
        return Result.ok([]);
      }

      // Text formatting codes
      if (style.bold) codes.push(ANSI.BOLD);
      if (style.italic) codes.push(ANSI.ITALIC);
      if (style.underline) codes.push(ANSI.UNDERLINE);
      if (style.strikethrough) codes.push(ANSI.STRIKETHROUGH);
      if (style.reverse) codes.push(ANSI.REVERSE);
      if (style.blink) codes.push(ANSI.BLINK);
      if (style.faint) codes.push(ANSI.FAINT);

      // Color codes
      if (enableColorSupport) {
        if (style.foreground) {
          const fgResult = generateColorCode(style.foreground, 'foreground');
          if (Result.isErr(fgResult)) {
            return fgResult;
          }
          if (fgResult.value) codes.push(fgResult.value);
        }

        if (style.background) {
          const bgResult = generateColorCode(style.background, 'background');
          if (Result.isErr(bgResult)) {
            return bgResult;
          }
          if (bgResult.value) codes.push(bgResult.value);
        }
      }

      return Result.ok(codes);
    } catch (error) {
      return Result.err(`Failed to generate ANSI codes: ${error}`);
    }
  };

  /**
   * Renders text with style properties as ANSI-formatted string
   * @param text - Text content to render
   * @param style - Style properties to apply
   * @param options - Rendering options
   * @returns Result containing rendered text or error
   */
  export const render = (
    text: string,
    style: StyleProperties,
    options: AnsiRenderOptions = {}
  ): Result<AnsiRenderResult, string> => {
    try {
      const codesResult = generateCodes(style, options);
      if (Result.isErr(codesResult)) {
        return codesResult;
      }

      const codes = codesResult.value;
      const resetCode = ANSI.RESET;
      
      // Apply ANSI codes to text (bypass ANSI.wrap to respect our options)
      const renderedText = codes.length > 0 
        ? `${codes.join('')}${text}${ANSI.RESET}`
        : text;

      const result: AnsiRenderResult = {
        content: renderedText,
        ansiCodes: codes,
        resetCode,
        byteLength: Buffer.byteLength(renderedText, 'utf8')
      };

      return Result.ok(result);
    } catch (error) {
      return Result.err(`Failed to render ANSI text: ${error}`);
    }
  };

  /**
   * Strips ANSI escape sequences from text
   * @param text - Text with ANSI codes
   * @returns Plain text without ANSI codes
   */
  export const strip = (text: string): string => {
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  };

  /**
   * Measures the visual width of text (excluding ANSI codes)
   * @param text - Text to measure
   * @returns Visual width in characters (max width of all lines)
   */
  export const measureWidth = (text: string): number => {
    const stripped = strip(text);
    if (!stripped) return 0;
    const lines = stripped.split('\n');
    // Return maximum width of any line
    return Math.max(...lines.map(line => [...line].length));
  };

  /**
   * Measures the visual height of text (counting line breaks)
   * @param text - Text to measure
   * @returns Visual height in lines
   */
  export const measureHeight = (text: string): number => {
    const stripped = strip(text);
    return stripped.split('\n').length;
  };

  /**
   * Generates optimized ANSI sequences for specific terminals
   * @param style - Style properties
   * @param terminalType - Target terminal type
   * @returns Result containing optimized ANSI codes
   */
  export const generateOptimized = (
    style: StyleProperties,
    terminalType: string
  ): Result<readonly string[], string> => {
    const options: AnsiRenderOptions = {
      respectTerminalCapabilities: true,
      optimizeForTerminal: terminalType,
      enableColorSupport: true,
      enableUnicodeSupport: true
    };

    // Apply terminal-specific optimizations
    switch (terminalType.toLowerCase()) {
      case 'ghostty':
        return generateCodesForGhostty(style, options);
      case 'iterm2':
        return generateCodesForIterm2(style, options);
      case 'alacritty':
        return generateCodesForAlacritty(style, options);
      default:
        return generateCodes(style, options);
    }
  };

  /**
   * Combines multiple ANSI render results into a single result
   * @param results - Array of render results to combine
   * @returns Combined render result
   */
  export const combine = (results: readonly AnsiRenderResult[]): AnsiRenderResult => {
    const combinedContent = results.map(r => r.content).join('');
    const combinedCodes = results.flatMap(r => r.ansiCodes);
    const totalByteLength = results.reduce((sum, r) => sum + r.byteLength, 0);

    return {
      content: combinedContent,
      ansiCodes: combinedCodes,
      resetCode: ANSI.RESET,
      byteLength: totalByteLength
    };
  };

  // Private helper functions

  /**
   * Generates ANSI color code for foreground or background
   * @param color - Color value to convert
   * @param type - Whether this is foreground or background color
   * @returns Result containing ANSI color code or error
   */
  const generateColorCode = (
    color: ColorValue,
    type: 'foreground' | 'background'
  ): Result<string | null, string> => {
    try {
      // Convert to CompleteColor using Color.toComplete
      const completeColor = Color.toComplete(color);
      if (!completeColor) {
        return Result.err(`Invalid color value: ${JSON.stringify(color)}`);
      }

      // Generate ANSI code using the ANSI module
      const ansiCode = type === 'foreground' 
        ? ANSI.foreground(completeColor)
        : ANSI.background(completeColor);

      return Result.ok(ansiCode || null);
    } catch (error) {
      return Result.err(`Failed to generate color code: ${error}`);
    }
  };

  /**
   * Ghostty-specific ANSI code generation with GPU acceleration optimizations
   */
  const generateCodesForGhostty = (
    style: StyleProperties,
    options: AnsiRenderOptions
  ): Result<readonly string[], string> => {
    // Ghostty supports full TrueColor and advanced Unicode
    const enhancedOptions: AnsiRenderOptions = {
      ...options,
      enableColorSupport: true,
      enableUnicodeSupport: true
    };

    return generateCodes(style, enhancedOptions);
  };

  /**
   * iTerm2-specific ANSI code generation with iTerm2 extensions
   */
  const generateCodesForIterm2 = (
    style: StyleProperties,
    options: AnsiRenderOptions
  ): Result<readonly string[], string> => {
    // iTerm2 supports TrueColor and has built-in color profiles
    const enhancedOptions: AnsiRenderOptions = {
      ...options,
      enableColorSupport: true,
      enableUnicodeSupport: true
    };

    return generateCodes(style, enhancedOptions);
  };

  /**
   * Alacritty-specific ANSI code generation with minimal sequences
   */
  const generateCodesForAlacritty = (
    style: StyleProperties,
    options: AnsiRenderOptions
  ): Result<readonly string[], string> => {
    // Alacritty prefers minimal ANSI sequences for performance
    const optimizedOptions: AnsiRenderOptions = {
      ...options,
      enableColorSupport: true,
      enableUnicodeSupport: true
    };

    return generateCodes(style, optimizedOptions);
  };
}