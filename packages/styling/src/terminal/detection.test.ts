import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Terminal } from './detection';
import type { ColorProfile, TerminalEnvironment } from './types';

describe('Terminal Detection', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getColorProfile', () => {
    test('should return noColor when NO_COLOR is set', () => {
      process.env.NO_COLOR = '1';
      expect(Terminal.getColorProfile()).toBe('noColor');
    });

    test('should return trueColor when FORCE_COLOR is 3', () => {
      process.env.FORCE_COLOR = '3';
      expect(Terminal.getColorProfile()).toBe('trueColor');
    });

    test('should return ansi256 when FORCE_COLOR is 2', () => {
      process.env.FORCE_COLOR = '2';
      expect(Terminal.getColorProfile()).toBe('ansi256');
    });

    test('should return ansi when FORCE_COLOR is 1', () => {
      process.env.FORCE_COLOR = '1';
      expect(Terminal.getColorProfile()).toBe('ansi');
    });

    test('should return trueColor for COLORTERM=truecolor', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = 'truecolor';
      expect(Terminal.getColorProfile()).toBe('trueColor');
    });

    test('should return trueColor for COLORTERM=24bit', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = '24bit';
      expect(Terminal.getColorProfile()).toBe('trueColor');
    });

    test('should return trueColor for iTerm', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(Terminal.getColorProfile()).toBe('trueColor');
    });

    test('should return trueColor for VS Code', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = 'vscode';
      expect(Terminal.getColorProfile()).toBe('trueColor');
    });

    test('should return ansi256 for xterm-256color', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.TERM = 'xterm-256color';
      expect(Terminal.getColorProfile()).toBe('ansi256');
    });

    test('should return ansi for basic color terms', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.TERM = 'xterm-color';
      expect(Terminal.getColorProfile()).toBe('ansi');
    });

    test('should return ansi for CI environments', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.TERM = undefined;
      process.env.CI = 'true';
      expect(Terminal.getColorProfile()).toBe('ansi');
    });

    test('should return ansi as default fallback', () => {
      process.env.NO_COLOR = undefined;
      process.env.FORCE_COLOR = undefined;
      process.env.COLORTERM = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.TERM = undefined;
      process.env.CI = undefined;
      expect(Terminal.getColorProfile()).toBe('ansi');
    });
  });

  describe('hasColorSupport', () => {
    test('should return false when NO_COLOR is set', () => {
      process.env.NO_COLOR = '1';
      expect(Terminal.hasColorSupport()).toBe(false);
    });

    test('should return true for color terminals', () => {
      process.env.NO_COLOR = undefined;
      process.env.COLORTERM = 'truecolor';
      expect(Terminal.hasColorSupport()).toBe(true);
    });
  });

  describe('hasTrueColorSupport', () => {
    test('should return true for true color terminals', () => {
      process.env.COLORTERM = 'truecolor';
      expect(Terminal.hasTrueColorSupport()).toBe(true);
    });

    test('should return false for 256 color terminals', () => {
      process.env.COLORTERM = undefined;
      process.env.TERM = 'xterm-256color';
      expect(Terminal.hasTrueColorSupport()).toBe(false);
    });
  });

  describe('hasUnicodeSupport', () => {
    test('should return true for UTF-8 locales', () => {
      process.env.LANG = 'en_US.UTF-8';
      expect(Terminal.hasUnicodeSupport()).toBe(true);
    });

    test('should return true for modern terminals', () => {
      process.env.LANG = undefined;
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(Terminal.hasUnicodeSupport()).toBe(true);
    });

    test('should return true by default', () => {
      process.env.LANG = undefined;
      process.env.TERM_PROGRAM = undefined;
      expect(Terminal.hasUnicodeSupport()).toBe(true);
    });
  });

  describe('getDimensions', () => {
    test('should return dimensions from process.stdout', () => {
      // Mock process.stdout
      const originalStdout = process.stdout;
      (process as any).stdout = {
        columns: 80,
        rows: 24,
      };

      const dimensions = Terminal.getDimensions();
      expect(dimensions.width).toBe(80);
      expect(dimensions.height).toBe(24);

      // Restore
      (process as any).stdout = originalStdout;
    });

    test('should return dimensions from environment variables', () => {
      // Mock process.stdout to not have dimensions
      const originalStdout = process.stdout;
      (process as any).stdout = {};

      process.env.COLUMNS = '120';
      process.env.LINES = '30';

      const dimensions = Terminal.getDimensions();
      expect(dimensions.width).toBe(120);
      expect(dimensions.height).toBe(30);

      // Restore
      (process as any).stdout = originalStdout;
    });

    test('should return undefined for invalid dimensions', () => {
      const originalStdout = process.stdout;
      (process as any).stdout = {};

      process.env.COLUMNS = 'invalid';
      process.env.LINES = '-1';

      const dimensions = Terminal.getDimensions();
      expect(dimensions.width).toBeUndefined();
      expect(dimensions.height).toBeUndefined();

      // Restore
      (process as any).stdout = originalStdout;
    });
  });

  describe('getPlatform', () => {
    test('should return windows for win32', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      expect(Terminal.getPlatform()).toBe('windows');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    test('should return unix for darwin', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      expect(Terminal.getPlatform()).toBe('unix');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    test('should return unix for linux', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      expect(Terminal.getPlatform()).toBe('unix');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('getCapabilities', () => {
    test('should return complete capabilities object', () => {
      process.env.COLORTERM = 'truecolor';
      process.env.LANG = 'en_US.UTF-8';

      const capabilities = Terminal.getCapabilities();

      expect(capabilities.colorProfile).toBe('trueColor');
      expect(capabilities.hasColorSupport).toBe(true);
      expect(capabilities.hasTrueColorSupport).toBe(true);
      expect(capabilities.hasUnicodeSupport).toBe(true);
      expect(capabilities.platform).toMatch(/windows|unix|unknown/);
    });
  });

  describe('getEnvironment', () => {
    test('should return environment variables', () => {
      process.env.TERM = 'xterm-256color';
      process.env.COLORTERM = 'truecolor';
      process.env.TERM_PROGRAM = 'iTerm.app';
      process.env.CI = 'true';

      const env = Terminal.getEnvironment();

      expect(env.term).toBe('xterm-256color');
      expect(env.colorTerm).toBe('truecolor');
      expect(env.termProgram).toBe('iTerm.app');
      expect(env.ciEnvironment).toBe('true');
    });
  });

  describe('detectBackgroundSync', () => {
    test('should detect dark theme from environment', () => {
      process.env.THEME = 'dark';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('environment');
    });

    test('should detect light theme from environment', () => {
      process.env.TERMINAL_THEME = 'light';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(false);
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('environment');
    });

    test('should detect dark theme for VS Code', () => {
      process.env.THEME = undefined;
      process.env.TERMINAL_THEME = undefined;
      process.env.TERM_PROGRAM = 'vscode';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.method).toBe('environment');
    });

    test('should detect light theme for Apple Terminal', () => {
      process.env.THEME = undefined;
      process.env.TERMINAL_THEME = undefined;
      process.env.TERM_PROGRAM = 'Apple_Terminal';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(false);
      expect(result.confidence).toBe('medium');
      expect(result.method).toBe('environment');
    });

    test('should detect dark theme for CI environments', () => {
      process.env.THEME = undefined;
      process.env.TERMINAL_THEME = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.CI = 'true';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.method).toBe('heuristic');
    });

    test('should detect dark theme for SSH sessions', () => {
      process.env.THEME = undefined;
      process.env.TERMINAL_THEME = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.CI = undefined;
      process.env.SSH_CLIENT = '192.168.1.100 12345 22';

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.method).toBe('heuristic');
    });

    test('should fallback to dark theme', () => {
      process.env.THEME = undefined;
      process.env.TERMINAL_THEME = undefined;
      process.env.TERM_PROGRAM = undefined;
      process.env.CI = undefined;
      process.env.SSH_CLIENT = undefined;
      process.env.SSH_TTY = undefined;

      const result = Terminal.detectBackgroundSync();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('low');
      expect(result.method).toBe('fallback');
    });
  });

  describe('detectBackground', () => {
    test('should return async background detection', async () => {
      process.env.THEME = 'dark';

      const result = await Terminal.detectBackground();
      expect(result.isDark).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('environment');
    });
  });
});
