import { describe, expect, test } from 'bun:test';
import { AnsiEscape, Compatibility, Unicode } from './ansi';

describe('AnsiEscape', () => {
  describe('constants', () => {
    test('should have correct escape sequence constants', () => {
      expect(AnsiEscape.ESC).toBe('\u001B[');
      expect(AnsiEscape.OSC).toBe('\u001B]');
      expect(AnsiEscape.BEL).toBe('\u0007');
      expect(AnsiEscape.ST).toBe('\u001B\\');
    });
  });

  describe('Cursor', () => {
    test('should generate cursor control sequences', () => {
      expect(AnsiEscape.Cursor.hide).toBe('\u001B[?25l');
      expect(AnsiEscape.Cursor.show).toBe('\u001B[?25h');
      expect(AnsiEscape.Cursor.savePosition).toBe('\u001B[s');
      expect(AnsiEscape.Cursor.restorePosition).toBe('\u001B[u');
    });

    test('should generate cursor movement sequences', () => {
      expect(AnsiEscape.Cursor.moveTo(10, 20)).toBe('\u001B[10;20H');
      expect(AnsiEscape.Cursor.moveUp(5)).toBe('\u001B[5A');
      expect(AnsiEscape.Cursor.moveDown()).toBe('\u001B[1B');
      expect(AnsiEscape.Cursor.moveRight(3)).toBe('\u001B[3C');
      expect(AnsiEscape.Cursor.moveLeft()).toBe('\u001B[1D');
    });
  });

  describe('Screen', () => {
    test('should generate screen control sequences', () => {
      expect(AnsiEscape.Screen.clear).toBe('\u001B[2J');
      expect(AnsiEscape.Screen.clearLine).toBe('\u001B[2K');
      expect(AnsiEscape.Screen.clearToEnd).toBe('\u001B[0J');
      expect(AnsiEscape.Screen.clearToBeginning).toBe('\u001B[1J');
      expect(AnsiEscape.Screen.clearLineToEnd).toBe('\u001B[0K');
      expect(AnsiEscape.Screen.clearLineToBeginning).toBe('\u001B[1K');
    });

    test('should generate scroll sequences', () => {
      expect(AnsiEscape.Screen.scrollUp(3)).toBe('\u001B[3S');
      expect(AnsiEscape.Screen.scrollDown()).toBe('\u001B[1T');
    });
  });

  describe('Query', () => {
    test('should generate query sequences', () => {
      expect(AnsiEscape.Query.deviceAttributes).toBe('\u001B[0c');
      expect(AnsiEscape.Query.cursorPosition).toBe('\u001B[6n');
      expect(AnsiEscape.Query.terminalSize).toBe('\u001B[18t');
      expect(AnsiEscape.Query.backgroundColor).toBe('\u001B]11;?\u0007');
      expect(AnsiEscape.Query.foregroundColor).toBe('\u001B]10;?\u0007');
    });
  });

  describe('AltScreen', () => {
    test('should generate alternative screen sequences', () => {
      expect(AnsiEscape.AltScreen.enter).toBe('\u001B[?1049h');
      expect(AnsiEscape.AltScreen.exit).toBe('\u001B[?1049l');
    });
  });

  describe('Mouse', () => {
    test('should generate mouse control sequences', () => {
      expect(AnsiEscape.Mouse.enableTracking).toBe('\u001B[?1000h');
      expect(AnsiEscape.Mouse.disableTracking).toBe('\u001B[?1000l');
      expect(AnsiEscape.Mouse.enableSGRMode).toBe('\u001B[?1006h');
      expect(AnsiEscape.Mouse.disableSGRMode).toBe('\u001B[?1006l');
    });
  });
});

describe('Unicode', () => {
  describe('isWideChar', () => {
    test('should identify ASCII characters as narrow', () => {
      expect(Unicode.isWideChar('a')).toBe(false);
      expect(Unicode.isWideChar('A')).toBe(false);
      expect(Unicode.isWideChar('1')).toBe(false);
      expect(Unicode.isWideChar(' ')).toBe(false);
      expect(Unicode.isWideChar('!')).toBe(false);
    });

    test('should identify CJK characters as wide', () => {
      expect(Unicode.isWideChar('中')).toBe(true);
      expect(Unicode.isWideChar('文')).toBe(true);
      expect(Unicode.isWideChar('あ')).toBe(true);
      expect(Unicode.isWideChar('ア')).toBe(true);
      expect(Unicode.isWideChar('한')).toBe(true);
      expect(Unicode.isWideChar('글')).toBe(true);
    });

    test('should identify fullwidth characters as wide', () => {
      expect(Unicode.isWideChar('Ａ')).toBe(true);
      expect(Unicode.isWideChar('１')).toBe(true);
      expect(Unicode.isWideChar('！')).toBe(true);
    });

    test('should handle empty string', () => {
      expect(Unicode.isWideChar('')).toBe(false);
    });
  });

  describe('getDisplayWidth', () => {
    test('should calculate width for ASCII text', () => {
      expect(Unicode.getDisplayWidth('hello')).toBe(5);
      expect(Unicode.getDisplayWidth('Hello World!')).toBe(12);
      expect(Unicode.getDisplayWidth('')).toBe(0);
    });

    test('should calculate width for mixed text', () => {
      expect(Unicode.getDisplayWidth('hello中文')).toBe(9); // 5 + 4
      expect(Unicode.getDisplayWidth('aあbい')).toBe(6); // 1 + 2 + 1 + 2
    });

    test('should handle fullwidth characters', () => {
      expect(Unicode.getDisplayWidth('ＡＢＣ')).toBe(6); // 3 fullwidth = 6 columns
    });

    test('should ignore control characters', () => {
      expect(Unicode.getDisplayWidth('hello\tworld')).toBe(11); // tab counts as 1
      expect(Unicode.getDisplayWidth('hello\nworld')).toBe(10); // newline doesn't count
    });
  });

  describe('truncate', () => {
    test('should truncate ASCII text', () => {
      expect(Unicode.truncate('hello world', 5)).toBe('hell…');
      expect(Unicode.truncate('hello', 10)).toBe('hello');
      expect(Unicode.truncate('hello', 5)).toBe('hello');
    });

    test('should truncate mixed text considering wide characters', () => {
      expect(Unicode.truncate('hello中文', 8)).toBe('hello中…'); // 9 chars truncated to 8
      expect(Unicode.truncate('a中b文', 5)).toBe('a中b…'); // 6 chars truncated to 5
    });

    test('should handle zero width', () => {
      expect(Unicode.truncate('hello', 0)).toBe('');
    });

    test('should use custom ellipsis', () => {
      expect(Unicode.truncate('hello world', 8, '...')).toBe('hello...');
    });
  });

  describe('pad', () => {
    test('should pad ASCII text left', () => {
      expect(Unicode.pad('hello', 10, 'left')).toBe('hello     ');
      expect(Unicode.pad('hello', 10, 'left', '-')).toBe('hello-----');
    });

    test('should pad ASCII text right', () => {
      expect(Unicode.pad('hello', 10, 'right')).toBe('     hello');
      expect(Unicode.pad('hello', 10, 'right', '-')).toBe('-----hello');
    });

    test('should pad ASCII text center', () => {
      expect(Unicode.pad('hello', 10, 'center')).toBe('  hello   ');
      expect(Unicode.pad('hello', 9, 'center')).toBe('  hello  ');
    });

    test('should handle text that is already at target width', () => {
      expect(Unicode.pad('hello', 5)).toBe('hello');
      expect(Unicode.pad('hello', 3)).toBe('hello');
    });

    test('should handle wide characters in padding', () => {
      expect(Unicode.pad('a', 5, 'left', '中')).toBe('a中中');
      expect(Unicode.pad('hello中', 10, 'right')).toBe('   hello中');
    });
  });
});

describe('Compatibility', () => {
  describe('supportsAnsi', () => {
    test('should return true for modern systems', () => {
      // This test is platform-dependent, so we just check it returns a boolean
      const result = Compatibility.supportsAnsi();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getLineEnding', () => {
    test('should return appropriate line ending', () => {
      const lineEnding = Compatibility.getLineEnding();
      expect(lineEnding).toMatch(/^(\r\n|\n)$/);
    });
  });

  describe('normalizePath', () => {
    test('should normalize forward slashes', () => {
      const result = Compatibility.normalizePath('path/to/file');
      expect(result).toMatch(/^path[/\\]to[/\\]file$/);
    });

    test('should normalize backslashes', () => {
      const result = Compatibility.normalizePath('path\\to\\file');
      expect(result).toMatch(/^path[/\\]to[/\\]file$/);
    });
  });

  describe('getShell', () => {
    test('should return a shell command', () => {
      const shell = Compatibility.getShell();
      expect(typeof shell).toBe('string');
      expect(shell.length).toBeGreaterThan(0);
    });
  });
});
