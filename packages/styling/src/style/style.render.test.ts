import { describe, expect, test } from 'bun:test';
import { Style } from './style';

describe('Style rendering with ANSI', () => {
  describe('basic text formatting', () => {
    test('should render bold text', () => {
      const style = Style.bold(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[1mhello\x1b[0m');
    });

    test('should render italic text', () => {
      const style = Style.italic(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[3mhello\x1b[0m');
    });

    test('should render underlined text', () => {
      const style = Style.underline(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[4mhello\x1b[0m');
    });

    test('should render strikethrough text', () => {
      const style = Style.strikethrough(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[9mhello\x1b[0m');
    });

    test('should render faint text', () => {
      const style = Style.faint(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[2mhello\x1b[0m');
    });

    test('should render blinking text', () => {
      const style = Style.blink(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[5mhello\x1b[0m');
    });

    test('should render reversed text', () => {
      const style = Style.reverse(Style.create(), true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[7mhello\x1b[0m');
    });
  });

  describe('combined formatting', () => {
    test('should render bold and italic text', () => {
      let style = Style.create();
      style = Style.bold(style, true);
      style = Style.italic(style, true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[1m\x1b[3mhello\x1b[0m');
    });

    test('should render bold, italic, and underlined text', () => {
      let style = Style.create();
      style = Style.bold(style, true);
      style = Style.italic(style, true);
      style = Style.underline(style, true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[1m\x1b[3m\x1b[4mhello\x1b[0m');
    });
  });

  describe('color rendering', () => {
    test('should render foreground color', () => {
      const style = Style.foreground(Style.create(), 'red');
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[31mhello\x1b[0m');
    });

    test('should render background color', () => {
      const style = Style.background(Style.create(), 'blue');
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[44mhello\x1b[0m');
    });

    test('should render foreground and background colors', () => {
      let style = Style.create();
      style = Style.foreground(style, 'red');
      style = Style.background(style, 'blue');
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[31m\x1b[44mhello\x1b[0m');
    });

    test('should render hex colors', () => {
      const style = Style.foreground(Style.create(), '#FF0000');
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[38;2;255;0;0mhello\x1b[0m');
    });

    test('should render ANSI colors', () => {
      const style = Style.foreground(Style.create(), { ansi: 196 });
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[38;5;196mhello\x1b[0m');
    });
  });

  describe('text content handling', () => {
    test('should render with pre-set content', () => {
      let style = Style.create();
      style = Style.setString(style, 'hello world');
      style = Style.bold(style, true);
      const result = Style.render(style);
      expect(result).toBe('\x1b[1mhello world\x1b[0m');
    });

    test('should prioritize parameter content over pre-set content', () => {
      let style = Style.create();
      style = Style.setString(style, 'preset');
      style = Style.bold(style, true);
      const result = Style.render(style, 'parameter');
      expect(result).toBe('\x1b[1mparameter\x1b[0m');
    });

    test('should handle empty content', () => {
      const style = Style.bold(Style.create(), true);
      const result = Style.render(style, '');
      expect(result).toBe('');
    });

    test('should handle undefined content', () => {
      const style = Style.bold(Style.create(), true);
      const result = Style.render(style);
      expect(result).toBe('');
    });
  });

  describe('text transformations', () => {
    test('should apply text transform before rendering', () => {
      let style = Style.create();
      style = Style.transform(style, (text) => text.toUpperCase());
      style = Style.bold(style, true);
      const result = Style.render(style, 'hello');
      expect(result).toBe('\x1b[1mHELLO\x1b[0m');
    });

    test('should handle transform with pre-set content', () => {
      let style = Style.create();
      style = Style.setString(style, 'hello world');
      style = Style.transform(style, (text) => text.replace(' ', '_'));
      style = Style.italic(style, true);
      const result = Style.render(style);
      expect(result).toBe('\x1b[3mhello_world\x1b[0m');
    });
  });

  describe('renderString method', () => {
    test('should render using renderString', () => {
      let style = Style.create();
      style = Style.setString(style, 'hello');
      style = Style.bold(style, true);
      const result = Style.renderString(style);
      expect(result).toBe('\x1b[1mhello\x1b[0m');
    });

    test('should handle empty content in renderString', () => {
      const style = Style.bold(Style.create(), true);
      const result = Style.renderString(style);
      expect(result).toBe('');
    });
  });

  describe('no formatting', () => {
    test('should return plain text when no formatting applied', () => {
      const style = Style.create();
      const result = Style.render(style, 'hello');
      expect(result).toBe('hello');
    });

    test('should handle plain text with transform', () => {
      let style = Style.create();
      style = Style.transform(style, (text) => text.toUpperCase());
      const result = Style.render(style, 'hello');
      expect(result).toBe('HELLO');
    });
  });
});
