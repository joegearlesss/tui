import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { AnsiGenerator } from './ansi-generator';
import { ANSI } from '@tui/styling/ansi/ansi';
import { Result } from '@tui/styling/utils/result';
import type { StyleProperties } from '@tui/styling/style/style';

describe('AnsiGenerator', () => {
  
  describe('generateCodes', () => {
    test('generates correct ANSI codes for text formatting', () => {
      const style: StyleProperties = {
        bold: true,
        italic: true,
        underline: true
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toContain(ANSI.BOLD);
        expect(result.value).toContain(ANSI.ITALIC);
        expect(result.value).toContain(ANSI.UNDERLINE);
      }
    });

    test('generates color codes for foreground and background', () => {
      const style: StyleProperties = {
        foreground: '#FF0000',
        background: '#00FF00'
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
        // Should contain color codes
        expect(result.value.some(code => code.includes('38;2'))).toBe(true); // Foreground
        expect(result.value.some(code => code.includes('48;2'))).toBe(true); // Background
      }
    });

    test('returns empty array when terminal has no color support', () => {
      const originalEnv = process.env.TERM;
      process.env.TERM = 'dumb';

      const style: StyleProperties = {
        bold: true,
        foreground: '#FF0000'
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: true,
        enableColorSupport: false
      });

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toEqual([]);
      }

      process.env.TERM = originalEnv;
    });

    test('handles invalid color values gracefully', () => {
      const style: StyleProperties = {
        foreground: 'invalid-color'
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isErr(result)).toBe(true);
    });

    test('handles all text formatting options', () => {
      const style: StyleProperties = {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        reverse: true,
        blink: true,
        faint: true
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toContain(ANSI.BOLD);
        expect(result.value).toContain(ANSI.ITALIC);
        expect(result.value).toContain(ANSI.UNDERLINE);
        expect(result.value).toContain(ANSI.STRIKETHROUGH);
        expect(result.value).toContain(ANSI.REVERSE);
        expect(result.value).toContain(ANSI.BLINK);
        expect(result.value).toContain(ANSI.FAINT);
      }
    });
  });

  describe('render', () => {
    test('renders text with ANSI formatting', () => {
      const text = 'Hello, World!';
      const style: StyleProperties = {
        bold: true,
        foreground: '#FF0000'
      };

      const result = AnsiGenerator.render(text, style, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toContain(text);
        expect(result.value.content).toContain(ANSI.BOLD);
        expect(result.value.resetCode).toBe(ANSI.RESET);
        expect(result.value.byteLength).toBeGreaterThan(text.length);
      }
    });

    test('returns plain text when no styling is applied', () => {
      const text = 'Plain text';
      const style: StyleProperties = {};

      const result = AnsiGenerator.render(text, style);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe(text);
        expect(result.value.ansiCodes).toEqual([]);
      }
    });

    test('calculates correct byte length for Unicode text', () => {
      const text = 'Hello 🌍 World!';
      const style: StyleProperties = { bold: true };

      const result = AnsiGenerator.render(text, style);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const expectedLength = Buffer.byteLength(result.value.content, 'utf8');
        expect(result.value.byteLength).toBe(expectedLength);
      }
    });
  });

  describe('strip', () => {
    test('removes ANSI escape sequences from text', () => {
      const styledText = `\u001b[1m\u001b[31mHello\u001b[0m World`;
      const stripped = AnsiGenerator.strip(styledText);
      
      expect(stripped).toBe('Hello World');
    });

    test('leaves plain text unchanged', () => {
      const plainText = 'Hello World';
      const stripped = AnsiGenerator.strip(plainText);
      
      expect(stripped).toBe(plainText);
    });

    test('handles multiple ANSI sequences', () => {
      const complexText = `\u001b[1m\u001b[31m\u001b[4mHello\u001b[0m \u001b[32mWorld\u001b[0m`;
      const stripped = AnsiGenerator.strip(complexText);
      
      expect(stripped).toBe('Hello World');
    });
  });

  describe('measureWidth', () => {
    test('measures plain text correctly', () => {
      const text = 'Hello World';
      const width = AnsiGenerator.measureWidth(text);
      
      expect(width).toBe(11);
    });

    test('ignores ANSI codes when measuring', () => {
      const styledText = `\u001b[1m\u001b[31mHello\u001b[0m World`;
      const width = AnsiGenerator.measureWidth(styledText);
      
      expect(width).toBe(11);
    });

    test('handles Unicode characters correctly', () => {
      const text = 'Hello 🌍';
      const width = AnsiGenerator.measureWidth(text);
      
      expect(width).toBe(7); // 6 ASCII chars + 1 emoji
    });

    test('handles empty string', () => {
      const width = AnsiGenerator.measureWidth('');
      
      expect(width).toBe(0);
    });
  });

  describe('measureHeight', () => {
    test('measures single line text', () => {
      const text = 'Single line';
      const height = AnsiGenerator.measureHeight(text);
      
      expect(height).toBe(1);
    });

    test('measures multi-line text', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const height = AnsiGenerator.measureHeight(text);
      
      expect(height).toBe(3);
    });

    test('ignores ANSI codes when measuring height', () => {
      const styledText = `\u001b[1mLine 1\u001b[0m\n\u001b[31mLine 2\u001b[0m`;
      const height = AnsiGenerator.measureHeight(styledText);
      
      expect(height).toBe(2);
    });

    test('handles empty string', () => {
      const height = AnsiGenerator.measureHeight('');
      
      expect(height).toBe(1);
    });
  });

  describe('generateOptimized', () => {
    test('generates Ghostty-optimized codes', () => {
      const style: StyleProperties = {
        bold: true,
        foreground: '#FF0000'
      };

      const result = AnsiGenerator.generateOptimized(style, 'ghostty');
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test('generates iTerm2-optimized codes', () => {
      const style: StyleProperties = {
        italic: true,
        background: '#00FF00'
      };

      const result = AnsiGenerator.generateOptimized(style, 'iterm2');
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test('generates Alacritty-optimized codes', () => {
      const style: StyleProperties = {
        underline: true,
        foreground: '#0000FF'
      };

      const result = AnsiGenerator.generateOptimized(style, 'alacritty');
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test('falls back to standard generation for unknown terminals', () => {
      const style: StyleProperties = {
        bold: true
      };

      const standardResult = AnsiGenerator.generateCodes(style);
      const optimizedResult = AnsiGenerator.generateOptimized(style, 'unknown-terminal');
      
      expect(Result.isOk(standardResult)).toBe(true);
      expect(Result.isOk(optimizedResult)).toBe(true);
      
      if (Result.isOk(standardResult) && Result.isOk(optimizedResult)) {
        expect(optimizedResult.value).toEqual(standardResult.value);
      }
    });
  });

  describe('combine', () => {
    test('combines multiple render results', () => {
      const result1 = AnsiGenerator.render('Hello', { bold: true });
      const result2 = AnsiGenerator.render(' World', { italic: true });
      
      expect(Result.isOk(result1)).toBe(true);
      expect(Result.isOk(result2)).toBe(true);
      
      if (Result.isOk(result1) && Result.isOk(result2)) {
        const combined = AnsiGenerator.combine([result1.value, result2.value]);
        
        expect(combined.content).toContain('Hello');
        expect(combined.content).toContain(' World');
        expect(combined.ansiCodes.length).toBeGreaterThan(0);
        expect(combined.byteLength).toBe(
          result1.value.byteLength + result2.value.byteLength
        );
      }
    });

    test('handles empty results array', () => {
      const combined = AnsiGenerator.combine([]);
      
      expect(combined.content).toBe('');
      expect(combined.ansiCodes).toEqual([]);
      expect(combined.byteLength).toBe(0);
    });
  });

  describe('RGB color support', () => {
    test('handles RGB color objects', () => {
      const style: StyleProperties = {
        foreground: { r: 255, g: 0, b: 0 },
        background: { r: 0, g: 255, b: 0 }
      };

      const result = AnsiGenerator.generateCodes(style);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test('clamps RGB values to valid range', () => {
      const style: StyleProperties = {
        foreground: { r: 300, g: -10, b: 500 } // Values outside 0-255 range
      };

      const result = AnsiGenerator.generateCodes(style, {
        respectTerminalCapabilities: false
      });
      
      // Should succeed because RGB values are clamped to valid range
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Named color support', () => {
    test('handles standard color names', () => {
      const style: StyleProperties = {
        foreground: 'red',
        background: 'blue'
      };

      const result = AnsiGenerator.generateCodes(style);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    test('rejects invalid color names', () => {
      const style: StyleProperties = {
        foreground: 'not-a-color'
      };

      const result = AnsiGenerator.generateCodes(style);
      
      expect(Result.isErr(result)).toBe(true);
    });
  });
});