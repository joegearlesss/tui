import { describe, expect, test } from 'bun:test';
import { Color } from '@tui/styling/color';
import { Style, StyleBuilder, type StyleProperties } from './style';

describe('StyleBuilder', () => {
  describe('create', () => {
    test('should create empty style builder', () => {
      const builder = StyleBuilder.create();
      const style = builder.build();

      expect(style).toEqual({});
    });
  });

  describe('from', () => {
    test('should create builder from existing properties', () => {
      const properties: StyleProperties = {
        bold: true,
        foreground: Color.rgb(255, 0, 0),
      };

      const builder = StyleBuilder.from(properties);
      const style = builder.build();

      expect(style).toEqual(properties);
    });
  });

  describe('method chaining', () => {
    test('should chain text formatting methods', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .italic(true)
        .underline(true)
        .strikethrough(true)
        .reverse(true)
        .blink(true)
        .faint(true)
        .build();

      expect(style.bold).toBe(true);
      expect(style.italic).toBe(true);
      expect(style.underline).toBe(true);
      expect(style.strikethrough).toBe(true);
      expect(style.reverse).toBe(true);
      expect(style.blink).toBe(true);
      expect(style.faint).toBe(true);
    });

    test('should chain color methods', () => {
      const foregroundColor = Color.rgb(255, 0, 0);
      const backgroundColor = Color.rgb(0, 255, 0);

      const style = StyleBuilder.create()
        .foreground(foregroundColor)
        .background(backgroundColor)
        .build();

      expect(style.foreground).toEqual(foregroundColor);
      expect(style.background).toEqual(backgroundColor);
    });

    test('should chain size and layout methods', () => {
      const style = StyleBuilder.create()
        .width(80)
        .height(24)
        .maxWidth(100)
        .maxHeight(30)
        .inline(true)
        .tabWidth(4)
        .build();

      expect(style.width).toBe(80);
      expect(style.height).toBe(24);
      expect(style.maxWidth).toBe(100);
      expect(style.maxHeight).toBe(30);
      expect(style.inline).toBe(true);
      expect(style.tabWidth).toBe(4);
    });

    test('should chain padding methods', () => {
      const style = StyleBuilder.create().padding(1, 2, 3, 4).build();

      expect(style.padding).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should chain individual padding methods', () => {
      const style = StyleBuilder.create()
        .paddingTop(1)
        .paddingRight(2)
        .paddingBottom(3)
        .paddingLeft(4)
        .build();

      expect(style.padding).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should chain margin methods', () => {
      const style = StyleBuilder.create().margin(1, 2, 3, 4).build();

      expect(style.margin).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should chain individual margin methods', () => {
      const style = StyleBuilder.create()
        .marginTop(1)
        .marginRight(2)
        .marginBottom(3)
        .marginLeft(4)
        .build();

      expect(style.margin).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should chain alignment methods', () => {
      const style = StyleBuilder.create().alignHorizontal('center').alignVertical('middle').build();

      expect(style.horizontalAlignment).toBe('center');
      expect(style.verticalAlignment).toBe('middle');
    });

    test('should chain content methods', () => {
      const transform = (text: string) => text.toUpperCase();

      const style = StyleBuilder.create().setString('Hello World').transform(transform).build();

      expect(style.content).toBe('Hello World');
      expect(style.transform).toBe(transform);
    });
  });

  describe('unset methods', () => {
    test('should unset text formatting', () => {
      const style = StyleBuilder.create().bold(true).italic(true).unsetBold().unsetItalic().build();

      expect(style.bold).toBeUndefined();
      expect(style.italic).toBeUndefined();
    });

    test('should unset colors', () => {
      const style = StyleBuilder.create()
        .foreground(Color.rgb(255, 0, 0))
        .background(Color.rgb(0, 255, 0))
        .unsetForeground()
        .unsetBackground()
        .build();

      expect(style.foreground).toBeUndefined();
      expect(style.background).toBeUndefined();
    });

    test('should unset dimensions', () => {
      const style = StyleBuilder.create().width(80).height(24).unsetWidth().unsetHeight().build();

      expect(style.width).toBeUndefined();
      expect(style.height).toBeUndefined();
    });

    test('should unset padding and margin', () => {
      const style = StyleBuilder.create()
        .padding(1, 2, 3, 4)
        .margin(1, 2, 3, 4)
        .unsetPadding()
        .unsetMargin()
        .build();

      expect(style.padding).toBeUndefined();
      expect(style.margin).toBeUndefined();
    });
  });

  describe('inheritance', () => {
    test('should inherit from parent style', () => {
      const parent: StyleProperties = {
        bold: true,
        foreground: Color.rgb(255, 0, 0),
        padding: { top: 1, right: 1, bottom: 1, left: 1 },
      };

      const style = StyleBuilder.create().italic(true).inherit(parent).build();

      expect(style.bold).toBe(true);
      expect(style.italic).toBe(true);
      expect(style.foreground).toEqual(Color.rgb(255, 0, 0));
      expect(style.padding).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
    });

    test('should override parent properties', () => {
      const parent: StyleProperties = {
        bold: true,
        foreground: Color.rgb(255, 0, 0),
      };

      const style = StyleBuilder.create()
        .inherit(parent)
        .bold(false)
        .foreground(Color.rgb(0, 255, 0))
        .build();

      expect(style.bold).toBe(false);
      expect(style.foreground).toEqual(Color.rgb(0, 255, 0));
    });
  });

  describe('rendering', () => {
    test('should render with chained styles', () => {
      const result = StyleBuilder.create()
        .bold(true)
        .foreground(Color.rgb(255, 0, 0))
        .render('Hello World');

      expect(result).toContain('Hello World');
      expect(result).toContain('\x1b[1m'); // Bold
      expect(result).toContain('\x1b[38;2;255;0;0m'); // Red foreground
    });

    test('should render with pre-set string', () => {
      const result = StyleBuilder.create().bold(true).setString('Hello World').toString();

      expect(result).toContain('Hello World');
      expect(result).toContain('\x1b[1m'); // Bold
    });
  });

  describe('copy', () => {
    test('should create independent copy', () => {
      const original = StyleBuilder.create()
        .bold(true)
        .foreground(Color.rgb(255, 0, 0));

      const copy = original.copy().italic(true);

      const originalStyle = original.build();
      const copyStyle = copy.build();

      expect(originalStyle.bold).toBe(true);
      expect(originalStyle.italic).toBeUndefined();
      expect(copyStyle.bold).toBe(true);
      expect(copyStyle.italic).toBe(true);
    });
  });

  describe('complex chaining example', () => {
    test('should handle complex style composition', () => {
      const headerStyle = StyleBuilder.create()
        .bold(true)
        .foreground(Color.adaptive(Color.parse('#0066CC'), Color.parse('#4A9EFF')))
        .padding(1, 2)
        .alignHorizontal('center')
        .build();

      expect(headerStyle.bold).toBe(true);
      expect(headerStyle.foreground).toEqual({
        light: Color.parse('#0066CC'),
        dark: Color.parse('#4A9EFF'),
      });
      expect(headerStyle.padding).toEqual({ top: 1, right: 2, bottom: 1, left: 2 });
      expect(headerStyle.horizontalAlignment).toBe('center');
    });

    test('should demonstrate functional composition pattern', () => {
      // Base theme styles
      const baseText = StyleBuilder.create().foreground(Color.parse('#333333'));

      const emphasized = baseText.copy().bold(true).foreground(Color.parse('#000000'));

      const header = emphasized.copy().padding(1, 0).alignHorizontal('center');

      const baseStyle = baseText.build();
      const emphasizedStyle = emphasized.build();
      const headerStyle = header.build();

      expect(baseStyle.foreground).toEqual(Color.parse('#333333'));
      expect(emphasizedStyle.bold).toBe(true);
      expect(emphasizedStyle.foreground).toEqual(Color.parse('#000000'));
      expect(headerStyle.bold).toBe(true);
      expect(headerStyle.padding).toEqual({ top: 1, right: 0, bottom: 1, left: 0 });
      expect(headerStyle.horizontalAlignment).toBe('center');
    });
  });

  describe('immutability', () => {
    test('should not mutate original builder', () => {
      const original = StyleBuilder.create();
      const modified = original.bold(true);

      expect(original.build()).toEqual({});
      expect(modified.build().bold).toBe(true);
    });

    test('should create new instances for each operation', () => {
      const builder1 = StyleBuilder.create();
      const builder2 = builder1.bold(true);
      const builder3 = builder2.italic(true);

      expect(builder1).not.toBe(builder2);
      expect(builder2).not.toBe(builder3);
      expect(builder1.build()).toEqual({});
      expect(builder2.build()).toEqual({ bold: true });
      expect(builder3.build()).toEqual({ bold: true, italic: true });
    });
  });
});
