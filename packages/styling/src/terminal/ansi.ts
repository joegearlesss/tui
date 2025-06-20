/**
 * ANSI escape sequence utilities for terminal control
 */
namespace AnsiEscape {
  /**
   * ANSI escape sequence constants
   */
  export const ESC = '\u001B[';
  export const OSC = '\u001B]';
  export const BEL = '\u0007';
  export const ST = '\u001B\\';

  /**
   * Cursor control sequences
   */
  export namespace Cursor {
    export const hide = `${ESC}?25l`;
    export const show = `${ESC}?25h`;
    export const savePosition = `${ESC}s`;
    export const restorePosition = `${ESC}u`;

    export const moveTo = (row: number, col: number): string => `${ESC}${row};${col}H`;

    export const moveUp = (lines = 1): string => `${ESC}${lines}A`;

    export const moveDown = (lines = 1): string => `${ESC}${lines}B`;

    export const moveRight = (cols = 1): string => `${ESC}${cols}C`;

    export const moveLeft = (cols = 1): string => `${ESC}${cols}D`;
  }

  /**
   * Screen control sequences
   */
  export namespace Screen {
    export const clear = `${ESC}2J`;
    export const clearLine = `${ESC}2K`;
    export const clearToEnd = `${ESC}0J`;
    export const clearToBeginning = `${ESC}1J`;
    export const clearLineToEnd = `${ESC}0K`;
    export const clearLineToBeginning = `${ESC}1K`;

    export const scrollUp = (lines = 1): string => `${ESC}${lines}S`;

    export const scrollDown = (lines = 1): string => `${ESC}${lines}T`;
  }

  /**
   * Terminal query sequences
   */
  export namespace Query {
    export const deviceAttributes = `${ESC}0c`;
    export const cursorPosition = `${ESC}6n`;
    export const terminalSize = `${ESC}18t`;

    // Background color query (may not work in all terminals)
    export const backgroundColor = `${OSC}11;?${BEL}`;

    // Foreground color query
    export const foregroundColor = `${OSC}10;?${BEL}`;
  }

  /**
   * Alternative screen buffer
   */
  export namespace AltScreen {
    export const enter = `${ESC}?1049h`;
    export const exit = `${ESC}?1049l`;
  }

  /**
   * Mouse support
   */
  export namespace Mouse {
    export const enableTracking = `${ESC}?1000h`;
    export const disableTracking = `${ESC}?1000l`;
    export const enableSGRMode = `${ESC}?1006h`;
    export const disableSGRMode = `${ESC}?1006l`;
  }
}

/**
 * Unicode and wide character utilities
 */
namespace Unicode {
  /**
   * Checks if a character is a wide character (takes 2 columns)
   * @param char Character to check
   * @returns True if character is wide
   */
  export const isWideChar = (char: string): boolean => {
    if (char.length === 0) return false;

    const code = char.codePointAt(0);
    if (code === undefined) return false;

    // East Asian Wide and Fullwidth characters
    return (
      (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo
      (code >= 0x2329 && code <= 0x232a) || // Left/Right-Pointing Angle Bracket
      (code >= 0x2e80 && code <= 0x2e99) || // CJK Radicals Supplement
      (code >= 0x2e9b && code <= 0x2ef3) || // CJK Radicals Supplement
      (code >= 0x2f00 && code <= 0x2fd5) || // Kangxi Radicals
      (code >= 0x2ff0 && code <= 0x2ffb) || // Ideographic Description Characters
      (code >= 0x3000 && code <= 0x303e) || // CJK Symbols and Punctuation
      (code >= 0x3041 && code <= 0x3096) || // Hiragana
      (code >= 0x3099 && code <= 0x30ff) || // Katakana
      (code >= 0x3105 && code <= 0x312d) || // Bopomofo
      (code >= 0x3131 && code <= 0x318e) || // Hangul Compatibility Jamo
      (code >= 0x3190 && code <= 0x31ba) || // Kanbun
      (code >= 0x31c0 && code <= 0x31e3) || // CJK Strokes
      (code >= 0x31f0 && code <= 0x321e) || // Katakana Phonetic Extensions
      (code >= 0x3220 && code <= 0x3247) || // Enclosed CJK Letters and Months
      (code >= 0x3250 && code <= 0x32fe) || // Enclosed CJK Letters and Months
      (code >= 0x3300 && code <= 0x4dbf) || // CJK Compatibility
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0xa000 && code <= 0xa48c) || // Yi Syllables
      (code >= 0xa490 && code <= 0xa4c6) || // Yi Radicals
      (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
      (code >= 0xfe10 && code <= 0xfe19) || // Vertical Forms
      (code >= 0xfe30 && code <= 0xfe6f) || // CJK Compatibility Forms
      (code >= 0xff00 && code <= 0xff60) || // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) || // Fullwidth Forms
      (code >= 0x20000 && code <= 0x2fffd) || // CJK Extension B
      (code >= 0x30000 && code <= 0x3fffd) // CJK Extension C
    );
  };

  /**
   * Calculates the display width of a string considering wide characters
   * @param text Text to measure
   * @returns Display width in terminal columns
   */
  export const getDisplayWidth = (text: string): number => {
    let width = 0;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      // Skip ANSI escape sequences
      if (char === '\u001B' && i + 1 < text.length && text[i + 1] === '[') {
        // Find the end of the escape sequence
        i += 2;
        while (i < text.length && text[i] && !/[a-zA-Z]/.test(text[i]!)) {
          i++;
        }
        i++; // Skip the final letter
        continue;
      }

      // Control characters don't take space (except tab which we treat as 1)
      if (char) {
        const code = char.codePointAt(0);
        if (code !== undefined && code < 32 && code !== 9) {
          // 9 is tab
          i++;
          continue;
        }

        // Wide characters take 2 columns
        if (isWideChar(char)) {
          width += 2;
        } else {
          width += 1;
        }
      }

      i++;
    }

    return width;
  };

  /**
   * Truncates text to fit within a specific width, considering wide characters
   * @param text Text to truncate
   * @param maxWidth Maximum width in columns
   * @param ellipsis Ellipsis string to append if truncated
   * @returns Truncated text
   */
  export const truncate = (text: string, maxWidth: number, ellipsis = '…'): string => {
    if (maxWidth <= 0) return '';

    const textWidth = getDisplayWidth(text);
    if (textWidth <= maxWidth) {
      return text; // No truncation needed
    }

    const ellipsisWidth = getDisplayWidth(ellipsis);
    let width = 0;
    let result = '';
    let i = 0;

    // First, try to fit as much as possible without ellipsis
    while (i < text.length) {
      const char = text[i];
      const charWidth = char && isWideChar(char) ? 2 : 1;

      if (width + charWidth > maxWidth) {
        break;
      }

      result += char;
      width += charWidth;
      i++;
    }

    // If we consumed all characters, return as is (shouldn't happen due to earlier check)
    if (i >= text.length) {
      return result;
    }

    // If we have room for ellipsis, add it
    if (width + ellipsisWidth <= maxWidth) {
      return result + ellipsis;
    }

    // Otherwise, we need to remove characters to make room for ellipsis
    while (result.length > 0 && width + ellipsisWidth > maxWidth) {
      const lastChar = result[result.length - 1];
      const lastCharWidth = lastChar && isWideChar(lastChar) ? 2 : 1;
      result = result.slice(0, -1);
      width -= lastCharWidth;
    }

    return result + ellipsis;
  };

  /**
   * Pads text to a specific width, considering wide characters
   * @param text Text to pad
   * @param width Target width
   * @param align Alignment ('left', 'center', 'right')
   * @param fillChar Character to use for padding
   * @returns Padded text
   */
  export const pad = (
    text: string,
    width: number,
    align: 'left' | 'center' | 'right' = 'left',
    fillChar = ' '
  ): string => {
    const textWidth = getDisplayWidth(text);

    if (textWidth >= width) {
      return text;
    }

    const paddingNeeded = width - textWidth;
    const fillCharWidth = getDisplayWidth(fillChar);

    if (fillCharWidth === 0) {
      return text; // Can't pad with zero-width character
    }

    const fillCount = Math.floor(paddingNeeded / fillCharWidth);
    const padding = fillChar.repeat(fillCount);

    switch (align) {
      case 'left':
        return text + padding;
      case 'right':
        return padding + text;
      case 'center': {
        const leftPadding = Math.floor(fillCount / 2);
        const rightPadding = fillCount - leftPadding;
        return fillChar.repeat(leftPadding) + text + fillChar.repeat(rightPadding);
      }
      default:
        return text + padding;
    }
  };
}

/**
 * Cross-platform compatibility utilities
 */
namespace Compatibility {
  /**
   * Checks if the current platform supports ANSI escape sequences
   * @returns True if ANSI is supported
   */
  export const supportsAnsi = (): boolean => {
    // Windows Command Prompt traditionally doesn't support ANSI
    // But Windows Terminal and PowerShell do
    if (process.platform === 'win32') {
      const termProgram = process.env.TERM_PROGRAM;
      const wtSession = process.env.WT_SESSION;

      // Windows Terminal
      if (wtSession) return true;

      // VS Code terminal
      if (termProgram?.includes('vscode')) return true;

      // PowerShell with PSReadLine
      if (process.env.PSModulePath) return true;

      // Check for ANSICON or ConEmu
      if (process.env.ANSICON || process.env.ConEmuANSI) return true;

      // Modern Windows 10+ Command Prompt supports ANSI
      return true; // Assume modern Windows
    }

    // Unix-like systems generally support ANSI
    return true;
  };

  /**
   * Gets the appropriate line ending for the current platform
   * @returns Line ending string
   */
  export const getLineEnding = (): string => {
    return process.platform === 'win32' ? '\r\n' : '\n';
  };

  /**
   * Normalizes path separators for the current platform
   * @param path Path to normalize
   * @returns Normalized path
   */
  export const normalizePath = (path: string): string => {
    if (process.platform === 'win32') {
      return path.replace(/\//g, '\\');
    }
    return path.replace(/\\/g, '/');
  };

  /**
   * Gets the appropriate shell for the current platform
   * @returns Shell command
   */
  export const getShell = (): string => {
    if (process.platform === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/sh';
  };
}

export { AnsiEscape, Unicode, Compatibility };
