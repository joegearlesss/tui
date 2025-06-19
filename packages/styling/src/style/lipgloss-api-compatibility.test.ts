/**
 * Lipgloss API Compatibility Tests
 * 
 * These tests verify that our TUI styling framework provides 100% API compatibility
 * with the original Lipgloss library. Each test corresponds to specific Lipgloss
 * features and usage patterns.
 */

import { describe, expect, test } from 'bun:test';
import { Border, Color, StyleBuilder, Style } from '@tui/styling';

describe('Lipgloss API Compatibility - Style System', () => {
  describe('Style Creation', () => {
    test('NewStyle() equivalent', () => {
      const lipglossEquivalent = StyleBuilder.create();
      expect(lipglossEquivalent).toBeDefined();
      expect(lipglossEquivalent.build()).toEqual({});
    });
    
    test('Copy() method', () => {
      const original = StyleBuilder.create().bold(true).build();
      const copied = Style.copy(original);
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });
    
    test('Inherit() method', () => {
      const parent = StyleBuilder.create().foreground('#FF0000').padding(1).build();
      const child = StyleBuilder.create().bold(true).build();
      const inherited = Style.inherit(child, parent);
      
      expect(inherited.bold).toBe(true);
      expect(inherited.foreground).toBe('#FF0000');
      expect(inherited.padding).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
    });
  });
  
  describe('Text Formatting', () => {
    test.each([
      ['bold', true],
      ['italic', true],
      ['underline', true],
      ['strikethrough', true],
      ['reverse', true],
      ['blink', true],
      ['faint', true]
    ])('%s formatting', (method, value) => {
      const styleChain = StyleBuilder.create()[method as keyof typeof StyleBuilder.create](value);
      const style = styleChain.build();
      expect(style[method as keyof typeof style]).toBe(value);
    });
  });
  
  describe('Color Properties', () => {
    test('foreground color setting', () => {
      const tests = [
        '#FF0000',
        'red',
        '#FFFFFF'
      ];
      
      tests.forEach(color => {
        const style = StyleBuilder.create().foreground(color).build();
        expect(style.foreground).toBeDefined();
      });
    });
    
    test('background color setting', () => {
      const style = StyleBuilder.create().background('#FF0000').build();
      expect(style.background).toBeDefined();
    });

    test('adaptive color usage patterns', async () => {
      // Test the lipgloss lightDark pattern
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);
      
      const adaptiveColor = lightDark('#000000', '#FFFFFF');
      const style = StyleBuilder.create().foreground(adaptiveColor).build();
      expect(style.foreground).toBeDefined();
      expect(typeof adaptiveColor).toBe('string');
    });
  });
  
  describe('Spacing - CSS Style', () => {
    test('padding shorthand syntax', () => {
      const tests = [
        { args: [1], expected: { top: 1, right: 1, bottom: 1, left: 1 } },
        { args: [1, 2], expected: { top: 1, right: 2, bottom: 1, left: 2 } },
        { args: [1, 2, 3], expected: { top: 1, right: 2, bottom: 3, left: 2 } },
        { args: [1, 2, 3, 4], expected: { top: 1, right: 2, bottom: 3, left: 4 } }
      ];
      
      tests.forEach(({ args, expected }) => {
        const style = StyleBuilder.create().padding(...args).build();
        expect(style.padding).toEqual(expected);
      });
    });
    
    test('margin shorthand syntax', () => {
      const style = StyleBuilder.create().margin(1, 2, 3, 4).build();
      expect(style.margin).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    });
    
    test('individual spacing properties', () => {
      const style = StyleBuilder.create()
        .paddingTop(1)
        .paddingRight(2)
        .paddingBottom(3)
        .paddingLeft(4)
        .build();
      expect(style.padding).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    });
  });
  
  describe('Dimensions', () => {
    test('width and height', () => {
      const style = StyleBuilder.create().width(80).height(24).build();
      expect(style.width).toBe(80);
      expect(style.height).toBe(24);
    });
    
    test('max width and height', () => {
      const style = StyleBuilder.create().maxWidth(100).maxHeight(50).build();
      expect(style.maxWidth).toBe(100);
      expect(style.maxHeight).toBe(50);
    });

    test('inline mode', () => {
      const style = StyleBuilder.create().inline(true).build();
      expect(style.inline).toBe(true);
    });

    test('tab width control', () => {
      const style = StyleBuilder.create().tabWidth(8).build();
      expect(style.tabWidth).toBe(8);
    });
  });
  
  describe('Alignment', () => {
    test('horizontal alignment', () => {
      const tests = ['left', 'center', 'right', 0.0, 0.5, 1.0];
      tests.forEach(align => {
        const style = StyleBuilder.create().alignHorizontal(align as any).build();
        expect(style.horizontalAlignment).toBeDefined();
      });
    });
    
    test('vertical alignment', () => {
      const tests = ['top', 'middle', 'bottom', 0.0, 0.5, 1.0];
      tests.forEach(align => {
        const style = StyleBuilder.create().alignVertical(align as any).build();
        expect(style.verticalAlignment).toBeDefined();
      });
    });
  });

  describe('Border System - Lipgloss Compatibility', () => {
    test('all predefined border types match lipgloss', () => {
      const lipglossCompatibleBorders = {
        Normal: { top: '─', right: '│', bottom: '─', left: '│', topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
        Rounded: { top: '─', right: '│', bottom: '─', left: '│', topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯' },
        Thick: { top: '━', right: '┃', bottom: '━', left: '┃', topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛' },
        Double: { top: '═', right: '║', bottom: '═', left: '║', topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝' }
      };
      
      const borderFactories = {
        Normal: Border.normal,
        Rounded: Border.rounded,
        Thick: Border.thick,
        Double: Border.double
      };

      Object.entries(lipglossCompatibleBorders).forEach(([name, expectedChars]) => {
        const borderFactory = borderFactories[name as keyof typeof borderFactories];
        const border = borderFactory();
        expect(border.chars).toEqual(expectedChars);
      });
    });

    test('border integration with StyleBuilder', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground('#FF0000')
        .padding(1, 2)
        .build();
      
      expect(style.border).toBeDefined();
      expect(style.borderForeground).toBe('#FF0000');
      expect(style.padding).toEqual({ top: 1, right: 2, bottom: 1, left: 2 });
    });

    test('per-side border colors (full lipgloss compatibility)', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .borderTopForeground('#FF0000')
        .borderRightForeground('#00FF00')
        .borderBottomForeground('#0000FF')
        .borderLeftForeground('#FFFF00')
        .borderTopBackground('#FF0080')
        .borderRightBackground('#80FF00')
        .borderBottomBackground('#0080FF')
        .borderLeftBackground('#FF8000')
        .build();
      
      expect(style.borderTopForeground).toBe('#FF0000');
      expect(style.borderRightForeground).toBe('#00FF00');
      expect(style.borderBottomForeground).toBe('#0000FF');
      expect(style.borderLeftForeground).toBe('#FFFF00');
      expect(style.borderTopBackground).toBe('#FF0080');
      expect(style.borderRightBackground).toBe('#80FF00');
      expect(style.borderBottomBackground).toBe('#0080FF');
      expect(style.borderLeftBackground).toBe('#FF8000');
    });
  });

  describe('Content and Transformation', () => {
    test('SetString equivalent (setString)', () => {
      const style = StyleBuilder.create().setString('test content').build();
      expect(style.content).toBe('test content');
    });

    test('text transformation functions', () => {
      const transforms = [
        (text: string) => text.toUpperCase(),
        (text: string) => text.toLowerCase(),
        (text: string) => text.replace(/\s+/g, '_'),
        (text: string) => `[${text}]`,
        (text: string) => text.split('').reverse().join('')
      ];
      
      transforms.forEach(transform => {
        const style = StyleBuilder.create().transform(transform).build();
        expect(style.transform).toBeDefined();
        expect(typeof style.transform).toBe('function');
        
        // Test the transformation works
        const result = Style.render(style, 'test');
        expect(result).toBe(transform('test'));
      });
    });

    test('Value() and String() method equivalents', () => {
      const style = StyleBuilder.create()
        .setString('content')
        .bold(true)
        .build();
      
      // Test content retrieval
      expect(style.content).toBe('content');
      
      // Test rendering with pre-set content
      const rendered = Style.renderString(style);
      expect(rendered).toBeTruthy();
      expect(rendered).toContain('content');
    });
  });

  describe('Method Chaining and Fluent API', () => {
    test('complex method chaining like lipgloss', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .italic(true)
        .foreground('#FF0000')
        .background('#000000')
        .border(Border.rounded())
        .borderForeground('#FFFFFF')
        .padding(1, 2)
        .margin(2, 1)
        .width(80)
        .height(24)
        .alignHorizontal('center')
        .alignVertical('middle')
        .build();
      
      expect(style.bold).toBe(true);
      expect(style.italic).toBe(true);
      expect(style.foreground).toBe('#FF0000');
      expect(style.background).toBe('#000000');
      expect(style.border?.type).toBe('rounded');
      expect(style.borderForeground).toBe('#FFFFFF');
      expect(style.padding).toEqual({ top: 1, right: 2, bottom: 1, left: 2 });
      expect(style.margin).toEqual({ top: 2, right: 1, bottom: 2, left: 1 });
      expect(style.width).toBe(80);
      expect(style.height).toBe(24);
      expect(style.horizontalAlignment).toBe('center');
      expect(style.verticalAlignment).toBe('middle');
    });

    test('style composition patterns', () => {
      const baseStyle = StyleBuilder.create()
        .foreground('#000000')
        .padding(1)
        .build();
      
      const extendedStyle = StyleBuilder.from(baseStyle)
        .bold(true)
        .border(Border.normal())
        .build();
      
      expect(extendedStyle.foreground).toBe('#000000');
      expect(extendedStyle.padding).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
      expect(extendedStyle.bold).toBe(true);
      expect(extendedStyle.border?.type).toBe('normal');
    });
  });

  describe('Unset Methods (Lipgloss compatibility)', () => {
    test('should support all unset methods', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .italic(true)
        .foreground('#FF0000')
        .background('#000000')
        .width(80)
        .height(24)
        .padding(1, 2)
        .margin(2, 1)
        .border(Border.rounded())
        .borderForeground('#FFFFFF')
        .unsetBold()
        .unsetItalic()
        .unsetForeground()
        .unsetBackground()
        .unsetWidth()
        .unsetHeight()
        .unsetPadding()
        .unsetMargin()
        .unsetBorder()
        .build();
      
      expect(style.bold).toBeUndefined();
      expect(style.italic).toBeUndefined();
      expect(style.foreground).toBeUndefined();
      expect(style.background).toBeUndefined();
      expect(style.width).toBeUndefined();
      expect(style.height).toBeUndefined();
      expect(style.padding).toBeUndefined();
      expect(style.margin).toBeUndefined();
      expect(style.border).toBeUndefined();
      expect(style.borderForeground).toBeUndefined();
    });
  });

  describe('Rendering and Output', () => {
    test('Render() method equivalent', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .foreground('#FF0000')
        .build();
      
      const result1 = Style.render(style, 'test content');
      const result2 = StyleBuilder.from(style).render('test content');
      
      expect(result1).toBe(result2);
      expect(result1).toContain('test content');
      // Should contain ANSI codes
      expect(result1).toMatch(/\x1b\[[0-9;]*m/);
    });

    test('rendering with pre-set string content', () => {
      const style = StyleBuilder.create()
        .setString('preset content')
        .bold(true)
        .build();
      
      const result = Style.renderString(style);
      expect(result).toContain('preset content');
      expect(result).toMatch(/\x1b\[[0-9;]*m/);
    });

    test('rendering with transform functions', () => {
      const style = StyleBuilder.create()
        .transform(text => text.toUpperCase())
        .foreground('#FF0000')
        .build();
      
      const result = Style.render(style, 'hello world');
      expect(result).toContain('HELLO WORLD');
      expect(result).toMatch(/\x1b\[[0-9;]*m/);
    });
  });
});