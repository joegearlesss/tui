import { describe, expect, test } from 'bun:test';
import { Color } from '@tui/styling/color';
import { ANSI } from '../ansi';

describe('ANSI', () => {
  describe('constants', () => {
    test('should have correct escape sequences', () => {
      expect(ANSI.ESC).toBe('\x1b');
      expect(ANSI.CSI).toBe('\x1b[');
      expect(ANSI.RESET).toBe('\x1b[0m');
      expect(ANSI.BOLD).toBe('\x1b[1m');
      expect(ANSI.ITALIC).toBe('\x1b[3m');
      expect(ANSI.UNDERLINE).toBe('\x1b[4m');
    });
  });

  describe('foreground colors', () => {
    test('should generate 3-bit color codes', () => {
      const red = Color.toComplete('red');
      expect(red).toBeDefined();
      if (red) {
        expect(ANSI.foreground(red)).toBe('\x1b[31m');
      }
    });

    test('should generate 4-bit bright color codes', () => {
      const brightRed = Color.toComplete({ ansi: 9 });
      expect(brightRed).toBeDefined();
      if (brightRed) {
        expect(ANSI.foreground(brightRed)).toBe('\x1b[91m');
      }
    });

    test('should generate 8-bit color codes', () => {
      const color = Color.toComplete({ ansi: 196 });
      expect(color).toBeDefined();
      if (color) {
        expect(ANSI.foreground(color)).toBe('\x1b[38;5;196m');
      }
    });

    test('should generate 24-bit RGB color codes', () => {
      const color = Color.toComplete('#FF0000');
      expect(color).toBeDefined();
      if (color) {
        expect(ANSI.foreground(color)).toBe('\x1b[38;2;255;0;0m');
      }
    });

    test('should return empty string for invalid color', () => {
      const color = { ansi: undefined, hex: undefined };
      expect(ANSI.foreground(color)).toBe('');
    });
  });

  describe('background colors', () => {
    test('should generate 3-bit background color codes', () => {
      const red = Color.toComplete('red');
      expect(red).toBeDefined();
      if (red) {
        expect(ANSI.background(red)).toBe('\x1b[41m');
      }
    });

    test('should generate 4-bit bright background color codes', () => {
      const brightRed = Color.toComplete({ ansi: 9 });
      expect(brightRed).toBeDefined();
      if (brightRed) {
        expect(ANSI.background(brightRed)).toBe('\x1b[101m');
      }
    });

    test('should generate 8-bit background color codes', () => {
      const color = Color.toComplete({ ansi: 196 });
      expect(color).toBeDefined();
      if (color) {
        expect(ANSI.background(color)).toBe('\x1b[48;5;196m');
      }
    });

    test('should generate 24-bit RGB background color codes', () => {
      const color = Color.toComplete('#FF0000');
      expect(color).toBeDefined();
      if (color) {
        expect(ANSI.background(color)).toBe('\x1b[48;2;255;0;0m');
      }
    });
  });

  describe('text wrapping', () => {
    test('should wrap text with single code', () => {
      const result = ANSI.wrap('hello', ANSI.BOLD);
      expect(result).toBe('\x1b[1mhello\x1b[0m');
    });

    test('should wrap text with multiple codes', () => {
      const result = ANSI.wrap('hello', ANSI.BOLD, ANSI.ITALIC);
      expect(result).toBe('\x1b[1m\x1b[3mhello\x1b[0m');
    });

    test('should return original text with no codes', () => {
      const result = ANSI.wrap('hello');
      expect(result).toBe('hello');
    });

    test('should return empty string for empty text', () => {
      const result = ANSI.wrap('', ANSI.BOLD);
      expect(result).toBe('');
    });
  });

  describe('ANSI stripping', () => {
    test('should strip ANSI codes from text', () => {
      const text = '\x1b[1m\x1b[31mhello\x1b[0m world';
      expect(ANSI.strip(text)).toBe('hello world');
    });

    test('should return original text if no ANSI codes', () => {
      const text = 'hello world';
      expect(ANSI.strip(text)).toBe('hello world');
    });

    test('should handle complex ANSI sequences', () => {
      const text = '\x1b[38;2;255;0;0mred\x1b[48;5;196mbackground\x1b[0m';
      expect(ANSI.strip(text)).toBe('redbackground');
    });
  });

  describe('width calculation', () => {
    test('should calculate width excluding ANSI codes', () => {
      const text = '\x1b[1mhello\x1b[0m';
      expect(ANSI.width(text)).toBe(5);
    });

    test('should calculate width of plain text', () => {
      const text = 'hello world';
      expect(ANSI.width(text)).toBe(11);
    });

    test('should handle empty string', () => {
      expect(ANSI.width('')).toBe(0);
    });
  });

  describe('ANSI detection', () => {
    test('should detect ANSI codes in text', () => {
      const text = '\x1b[1mhello\x1b[0m';
      expect(ANSI.hasAnsi(text)).toBe(true);
    });

    test('should return false for plain text', () => {
      const text = 'hello world';
      expect(ANSI.hasAnsi(text)).toBe(false);
    });

    test('should handle empty string', () => {
      expect(ANSI.hasAnsi('')).toBe(false);
    });
  });

  describe('sequence building', () => {
    test('should combine multiple codes', () => {
      const result = ANSI.sequence(ANSI.BOLD, ANSI.ITALIC, ANSI.UNDERLINE);
      expect(result).toBe('\x1b[1m\x1b[3m\x1b[4m');
    });

    test('should filter out empty codes', () => {
      const result = ANSI.sequence(ANSI.BOLD, '', ANSI.ITALIC);
      expect(result).toBe('\x1b[1m\x1b[3m');
    });

    test('should return empty string for no codes', () => {
      const result = ANSI.sequence();
      expect(result).toBe('');
    });
  });

  describe('hyperlinks', () => {
    test('should create hyperlink with OSC 8', () => {
      const result = ANSI.hyperlink('https://example.com', 'Example');
      expect(result).toBe('\x1b]8;;https://example.com\x1b\\Example\x1b]8;;\x1b\\');
    });

    test('should handle empty URL', () => {
      const result = ANSI.hyperlink('', 'Text');
      expect(result).toBe('\x1b]8;;\x1b\\Text\x1b]8;;\x1b\\');
    });
  });

  describe('cursor movement', () => {
    test('should generate cursor up sequence', () => {
      expect(ANSI.Cursor.up()).toBe('\x1b[1A');
      expect(ANSI.Cursor.up(5)).toBe('\x1b[5A');
    });

    test('should generate cursor down sequence', () => {
      expect(ANSI.Cursor.down()).toBe('\x1b[1B');
      expect(ANSI.Cursor.down(3)).toBe('\x1b[3B');
    });

    test('should generate cursor position sequence', () => {
      expect(ANSI.Cursor.position(10, 20)).toBe('\x1b[10;20H');
    });

    test('should generate cursor save/restore sequences', () => {
      expect(ANSI.Cursor.save()).toBe('\x1b[s');
      expect(ANSI.Cursor.restore()).toBe('\x1b[u');
    });

    test('should generate cursor hide/show sequences', () => {
      expect(ANSI.Cursor.hide()).toBe('\x1b[?25l');
      expect(ANSI.Cursor.show()).toBe('\x1b[?25h');
    });
  });

  describe('screen manipulation', () => {
    test('should generate screen clear sequences', () => {
      expect(ANSI.Screen.clear()).toBe('\x1b[2J');
      expect(ANSI.Screen.clearLine()).toBe('\x1b[2K');
      expect(ANSI.Screen.clearToEnd()).toBe('\x1b[0K');
      expect(ANSI.Screen.clearToStart()).toBe('\x1b[1K');
    });

    test('should generate scroll sequences', () => {
      expect(ANSI.Screen.scrollUp()).toBe('\x1b[1S');
      expect(ANSI.Screen.scrollUp(3)).toBe('\x1b[3S');
      expect(ANSI.Screen.scrollDown()).toBe('\x1b[1T');
      expect(ANSI.Screen.scrollDown(2)).toBe('\x1b[2T');
    });
  });
});
