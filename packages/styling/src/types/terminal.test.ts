import { describe, expect, test } from 'bun:test';
import {
  ANSISequence,
  type TerminalCapabilities,
  TerminalCapabilitiesSchema,
  type UnicodeCharacter,
  UnicodeCharacterSchema,
} from './terminal';

describe('TerminalCapabilitiesSchema', () => {
  test('validates complete terminal capabilities', () => {
    const capabilities: TerminalCapabilities = {
      colorProfile: 'truecolor',
      width: 80,
      height: 24,
      hasDarkBackground: true,
      supportsUnicode: true,
      supportsEmoji: true,
    };

    expect(() => TerminalCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  test('validates all color profile options', () => {
    const profiles = ['ascii', 'ansi', 'ansi256', 'truecolor'] as const;

    for (const profile of profiles) {
      const capabilities: TerminalCapabilities = {
        colorProfile: profile,
        width: 80,
        height: 24,
        hasDarkBackground: false,
        supportsUnicode: false,
        supportsEmoji: false,
      };

      expect(() => TerminalCapabilitiesSchema.parse(capabilities)).not.toThrow();
    }
  });

  test('rejects invalid color profile', () => {
    const capabilities = {
      colorProfile: 'invalid',
      width: 80,
      height: 24,
      hasDarkBackground: true,
      supportsUnicode: true,
      supportsEmoji: true,
    };

    expect(() => TerminalCapabilitiesSchema.parse(capabilities)).toThrow();
  });

  test('rejects zero or negative dimensions', () => {
    expect(() =>
      TerminalCapabilitiesSchema.parse({
        colorProfile: 'ansi',
        width: 0,
        height: 24,
        hasDarkBackground: true,
        supportsUnicode: true,
        supportsEmoji: true,
      })
    ).toThrow();

    expect(() =>
      TerminalCapabilitiesSchema.parse({
        colorProfile: 'ansi',
        width: 80,
        height: -1,
        hasDarkBackground: true,
        supportsUnicode: true,
        supportsEmoji: true,
      })
    ).toThrow();
  });

  test('rejects non-boolean capability flags', () => {
    expect(() =>
      TerminalCapabilitiesSchema.parse({
        colorProfile: 'ansi',
        width: 80,
        height: 24,
        hasDarkBackground: 'true',
        supportsUnicode: true,
        supportsEmoji: true,
      })
    ).toThrow();
  });

  test('rejects missing required fields', () => {
    expect(() =>
      TerminalCapabilitiesSchema.parse({
        colorProfile: 'ansi',
        width: 80,
      })
    ).toThrow();
  });
});

describe('UnicodeCharacterSchema', () => {
  test('validates normal width character', () => {
    const char: UnicodeCharacter = {
      codePoint: 65, // 'A'
      width: 1,
      category: 'normal',
    };

    expect(() => UnicodeCharacterSchema.parse(char)).not.toThrow();
  });

  test('validates wide character', () => {
    const char: UnicodeCharacter = {
      codePoint: 0x4e00, // CJK character
      width: 2,
      category: 'wide',
    };

    expect(() => UnicodeCharacterSchema.parse(char)).not.toThrow();
  });

  test('validates combining character', () => {
    const char: UnicodeCharacter = {
      codePoint: 0x0300, // Combining grave accent
      width: 0,
      category: 'combining',
    };

    expect(() => UnicodeCharacterSchema.parse(char)).not.toThrow();
  });

  test('validates all character categories', () => {
    const categories = ['control', 'combining', 'normal', 'wide', 'emoji'] as const;

    for (const category of categories) {
      const char: UnicodeCharacter = {
        codePoint: 65,
        width: category === 'wide' ? 2 : category === 'combining' ? 0 : 1,
        category,
      };

      expect(() => UnicodeCharacterSchema.parse(char)).not.toThrow();
    }
  });

  test('rejects negative code point', () => {
    expect(() =>
      UnicodeCharacterSchema.parse({
        codePoint: -1,
        width: 1,
        category: 'normal',
      })
    ).toThrow();
  });

  test('rejects invalid width', () => {
    expect(() =>
      UnicodeCharacterSchema.parse({
        codePoint: 65,
        width: -1,
        category: 'normal',
      })
    ).toThrow();

    expect(() =>
      UnicodeCharacterSchema.parse({
        codePoint: 65,
        width: 3,
        category: 'normal',
      })
    ).toThrow();
  });

  test('rejects invalid category', () => {
    expect(() =>
      UnicodeCharacterSchema.parse({
        codePoint: 65,
        width: 1,
        category: 'invalid',
      })
    ).toThrow();
  });
});

describe('ANSISequence', () => {
  test('contains expected ANSI escape sequences', () => {
    expect(ANSISequence.RESET).toBe('\x1b[0m');
    expect(ANSISequence.BOLD).toBe('\x1b[1m');
    expect(ANSISequence.DIM).toBe('\x1b[2m');
    expect(ANSISequence.ITALIC).toBe('\x1b[3m');
    expect(ANSISequence.UNDERLINE).toBe('\x1b[4m');
    expect(ANSISequence.BLINK).toBe('\x1b[5m');
    expect(ANSISequence.REVERSE).toBe('\x1b[7m');
    expect(ANSISequence.STRIKETHROUGH).toBe('\x1b[9m');
  });

  test('sequences are readonly constants', () => {
    // TypeScript should prevent modification, but we can test the values exist
    expect(typeof ANSISequence.RESET).toBe('string');
    expect(typeof ANSISequence.BOLD).toBe('string');
    expect(typeof ANSISequence.ITALIC).toBe('string');
  });
});
