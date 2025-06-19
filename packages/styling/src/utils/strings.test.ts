import { describe, expect, test } from 'bun:test';
import { StringUtils } from './strings';

describe('StringUtils', () => {
  describe('displayWidth', () => {
    test('should calculate width of ASCII text', () => {
      expect(StringUtils.displayWidth('hello')).toBe(5);
      expect(StringUtils.displayWidth('test 123')).toBe(8);
      expect(StringUtils.displayWidth('')).toBe(0);
    });

    test('should handle ANSI escape sequences', () => {
      expect(StringUtils.displayWidth('\u001b[31mred\u001b[0m')).toBe(3);
      expect(StringUtils.displayWidth('\u001b[1;32mbold green\u001b[0m')).toBe(10);
    });

    test('should handle wide characters', () => {
      expect(StringUtils.displayWidth('你好')).toBe(4); // 2 wide chars = 4 columns
      expect(StringUtils.displayWidth('🎨')).toBe(2); // Emoji = 2 columns
      expect(StringUtils.displayWidth('hello 世界')).toBe(10); // 5 + 1 + 4 = 10
    });

    test('should handle control characters', () => {
      expect(StringUtils.displayWidth('hello\tworld')).toBe(10); // Tab doesn't add width
      expect(StringUtils.displayWidth('line1\nline2')).toBe(10); // Newline doesn't add width
    });
  });

  describe('truncate', () => {
    test('should truncate from end by default', () => {
      expect(StringUtils.truncate('hello world', 8)).toBe('hello...');
      expect(StringUtils.truncate('short', 10)).toBe('short');
      expect(StringUtils.truncate('test', 3)).toBe('...');
    });

    test('should truncate from start', () => {
      expect(StringUtils.truncate('hello world', 8, { position: 'start' })).toBe('...world');
    });

    test('should truncate from middle', () => {
      expect(StringUtils.truncate('hello world', 8, { position: 'middle' })).toBe('he...rld');
    });

    test('should use custom ellipsis', () => {
      expect(StringUtils.truncate('hello world', 8, { ellipsis: '…' })).toBe('hello w…');
    });

    test('should handle edge cases', () => {
      expect(StringUtils.truncate('', 5)).toBe('');
      expect(StringUtils.truncate('test', 0)).toBe('');
      expect(StringUtils.truncate('test', 1, { ellipsis: '…' })).toBe('…');
    });
  });

  describe('pad', () => {
    test('should pad left by default', () => {
      expect(StringUtils.pad('test', 8)).toBe('test    ');
      expect(StringUtils.pad('hello', 3)).toBe('hello');
    });

    test('should pad right', () => {
      expect(StringUtils.pad('test', 8, ' ', 'right')).toBe('    test');
    });

    test('should pad center', () => {
      expect(StringUtils.pad('test', 8, ' ', 'center')).toBe('  test  ');
      expect(StringUtils.pad('test', 9, ' ', 'center')).toBe('  test   ');
    });

    test('should use custom padding character', () => {
      expect(StringUtils.pad('test', 8, '-')).toBe('test----');
      expect(StringUtils.pad('test', 8, '=', 'center')).toBe('==test==');
    });

    test('should handle wide characters', () => {
      expect(StringUtils.pad('你好', 6)).toBe('你好  '); // 4 + 2 spaces = 6
    });
  });

  describe('wrap', () => {
    test('should wrap text at word boundaries', () => {
      const result = StringUtils.wrap('hello world test', 10);
      expect(result).toEqual(['hello', 'world test']);
    });

    test('should handle multiple paragraphs', () => {
      const result = StringUtils.wrap('line1\nline2 long text', 8);
      expect(result).toEqual(['line1', 'line2', 'long', 'text']);
    });

    test('should break words when enabled', () => {
      const result = StringUtils.wrap('verylongword', 5, { breakWords: true });
      expect(result).toEqual(['veryl', 'ongwo', 'rd']);
    });

    test('should add indentation', () => {
      const result = StringUtils.wrap('hello world', 8, { indent: '  ' });
      expect(result).toEqual(['  hello', '  world']);
    });

    test('should handle empty lines', () => {
      const result = StringUtils.wrap('line1\n\nline3', 10);
      expect(result).toEqual(['line1', '', 'line3']);
    });

    test('should handle zero width', () => {
      const result = StringUtils.wrap('test', 0);
      expect(result).toEqual(['test']);
    });
  });

  describe('repeat', () => {
    test('should repeat pattern to fill width', () => {
      expect(StringUtils.repeat('-', 5)).toBe('-----');
      expect(StringUtils.repeat('ab', 5)).toBe('ababa');
      expect(StringUtils.repeat('test', 10)).toBe('testtestte');
    });

    test('should handle edge cases', () => {
      expect(StringUtils.repeat('', 5)).toBe('');
      expect(StringUtils.repeat('test', 0)).toBe('');
      expect(StringUtils.repeat('test', -1)).toBe('');
    });

    test('should handle wide characters', () => {
      expect(StringUtils.repeat('你', 4)).toBe('你你'); // Each 你 is 2 columns wide
    });
  });

  describe('stripAnsi', () => {
    test('should remove ANSI escape sequences', () => {
      expect(StringUtils.stripAnsi('\u001b[31mred\u001b[0m')).toBe('red');
      expect(StringUtils.stripAnsi('\u001b[1;32mbold green\u001b[0m')).toBe('bold green');
      expect(StringUtils.stripAnsi('no ansi')).toBe('no ansi');
    });

    test('should handle multiple sequences', () => {
      expect(StringUtils.stripAnsi('\u001b[31mred\u001b[0m and \u001b[32mgreen\u001b[0m')).toBe(
        'red and green'
      );
    });
  });

  describe('lineCount', () => {
    test('should count lines correctly', () => {
      expect(StringUtils.lineCount('single line')).toBe(1);
      expect(StringUtils.lineCount('line1\nline2')).toBe(2);
      expect(StringUtils.lineCount('line1\nline2\nline3')).toBe(3);
      expect(StringUtils.lineCount('')).toBe(1);
    });
  });

  describe('lines', () => {
    test('should split text into lines', () => {
      expect(StringUtils.lines('line1\nline2')).toEqual(['line1', 'line2']);
      expect(StringUtils.lines('single')).toEqual(['single']);
      expect(StringUtils.lines('')).toEqual(['']);
    });
  });

  describe('joinLines', () => {
    test('should join lines with newlines', () => {
      expect(StringUtils.joinLines(['line1', 'line2'])).toBe('line1\nline2');
      expect(StringUtils.joinLines(['single'])).toBe('single');
      expect(StringUtils.joinLines([])).toBe('');
    });
  });

  describe('normalizeWhitespace', () => {
    test('should collapse multiple spaces', () => {
      expect(StringUtils.normalizeWhitespace('hello    world')).toBe('hello world');
      expect(StringUtils.normalizeWhitespace('  spaced  text  ')).toBe('spaced text');
    });

    test('should handle tabs and newlines', () => {
      expect(StringUtils.normalizeWhitespace('hello\t\nworld')).toBe('hello world');
    });
  });

  describe('indent', () => {
    test('should indent with string', () => {
      expect(StringUtils.indent('line1\nline2', '  ')).toBe('  line1\n  line2');
    });

    test('should indent with number of spaces', () => {
      expect(StringUtils.indent('line1\nline2', 4)).toBe('    line1\n    line2');
    });

    test('should handle single line', () => {
      expect(StringUtils.indent('single', 2)).toBe('  single');
    });
  });

  describe('dedent', () => {
    test('should remove common indentation', () => {
      const input = '    line1\n    line2\n      indented';
      const expected = 'line1\nline2\n  indented';
      expect(StringUtils.dedent(input)).toBe(expected);
    });

    test('should ignore empty lines', () => {
      const input = '    line1\n\n    line2';
      const expected = 'line1\n\nline2';
      expect(StringUtils.dedent(input)).toBe(expected);
    });

    test('should handle no common indentation', () => {
      const input = 'line1\\n  line2';
      expect(StringUtils.dedent(input)).toBe(input);
    });

    test('should handle all empty lines', () => {
      const input = '\\n\\n';
      expect(StringUtils.dedent(input)).toBe(input);
    });
  });
});
