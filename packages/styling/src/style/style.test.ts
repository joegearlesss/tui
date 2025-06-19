import { describe, expect, test } from 'bun:test';
import { BoxModel } from '@tui/styling/layout';
import { Style, StyleBuilder, type StyleProperties } from './style';

describe('Style namespace', () => {
  describe('Style creation', () => {
    test('should create empty style', () => {
      const style = Style.create();
      expect(style).toEqual({});
    });

    test('should create style from properties', () => {
      const properties: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
        width: 80,
      };
      const style = Style.from(properties);
      expect(style).toEqual(properties);
      expect(style).not.toBe(properties); // Should be a copy
    });
  });

  describe('Text formatting', () => {
    test('should set bold formatting', () => {
      const boldStyle = StyleBuilder.create().bold(true).build();
      expect(boldStyle.bold).toBe(true);

      const notBoldStyle = StyleBuilder.create().bold(false).build();
      expect(notBoldStyle.bold).toBe(false);

      const defaultBoldStyle = StyleBuilder.create().bold().build();
      expect(defaultBoldStyle.bold).toBe(true);
    });

    test('should unset bold formatting', () => {
      const style = StyleBuilder.create().bold(true).build();
      const unsetStyle = Style.unsetBold(style);
      expect(unsetStyle.bold).toBeUndefined();
      expect('bold' in unsetStyle).toBe(false);
    });

    test('should set italic formatting', () => {
      const italicStyle = StyleBuilder.create().italic(true).build();
      expect(italicStyle.italic).toBe(true);
    });

    test('should unset italic formatting', () => {
      const style = StyleBuilder.create().italic(true).build();
      const unsetStyle = Style.unsetItalic(style);
      expect(unsetStyle.italic).toBeUndefined();
    });

    test('should set underline formatting', () => {
      const underlineStyle = StyleBuilder.create().underline(true).build();
      expect(underlineStyle.underline).toBe(true);
    });

    test('should unset underline formatting', () => {
      const style = StyleBuilder.create().underline(true).build();
      const unsetStyle = Style.unsetUnderline(style);
      expect(unsetStyle.underline).toBeUndefined();
    });

    test('should set strikethrough formatting', () => {
      const strikethroughStyle = StyleBuilder.create().strikethrough(true).build();
      expect(strikethroughStyle.strikethrough).toBe(true);
    });

    test('should unset strikethrough formatting', () => {
      const style = StyleBuilder.create().strikethrough(true).build();
      const unsetStyle = Style.unsetStrikethrough(style);
      expect(unsetStyle.strikethrough).toBeUndefined();
    });

    test('should set reverse formatting', () => {
      const reverseStyle = StyleBuilder.create().reverse(true).build();
      expect(reverseStyle.reverse).toBe(true);
    });

    test('should unset reverse formatting', () => {
      const style = StyleBuilder.create().reverse(true).build();
      const unsetStyle = Style.unsetReverse(style);
      expect(unsetStyle.reverse).toBeUndefined();
    });

    test('should set blink formatting', () => {
      const blinkStyle = StyleBuilder.create().blink(true).build();
      expect(blinkStyle.blink).toBe(true);
    });

    test('should unset blink formatting', () => {
      const style = StyleBuilder.create().blink(true).build();
      const unsetStyle = Style.unsetBlink(style);
      expect(unsetStyle.blink).toBeUndefined();
    });

    test('should set faint formatting', () => {
      const faintStyle = StyleBuilder.create().faint(true).build();
      expect(faintStyle.faint).toBe(true);
    });

    test('should unset faint formatting', () => {
      const style = StyleBuilder.create().faint(true).build();
      const unsetStyle = Style.unsetFaint(style);
      expect(unsetStyle.faint).toBeUndefined();
    });

    test('should set underline spaces', () => {
      const underlineSpacesStyle = StyleBuilder.create().underlineSpaces(true).build();
      expect(underlineSpacesStyle.underlineSpaces).toBe(true);
    });

    test('should set strikethrough spaces', () => {
      const strikethroughSpacesStyle = StyleBuilder.create().strikethroughSpaces(true).build();
      expect(strikethroughSpacesStyle.strikethroughSpaces).toBe(true);
    });

    test('should set color whitespace', () => {
      const colorWhitespaceStyle = StyleBuilder.create().colorWhitespace(true).build();
      expect(colorWhitespaceStyle.colorWhitespace).toBe(true);
    });
  });

  describe('Color functions', () => {
    test('should set foreground color', () => {
      const colorStyle = StyleBuilder.create().foreground('#FF0000').build();
      expect(colorStyle.foreground).toBe('#FF0000');

      const namedColorStyle = StyleBuilder.create().foreground('red').build();
      expect(namedColorStyle.foreground).toBe('red');

      const ansiColorStyle = StyleBuilder.create().foreground(196).build();
      expect(ansiColorStyle.foreground).toBe(196);
    });

    test('should unset foreground color', () => {
      const style = StyleBuilder.create().foreground('#FF0000').build();
      const unsetStyle = Style.unsetForeground(style);
      expect(unsetStyle.foreground).toBeUndefined();
    });

    test('should set background color', () => {
      const colorStyle = StyleBuilder.create().background('#00FF00').build();
      expect(colorStyle.background).toBe('#00FF00');
    });

    test('should unset background color', () => {
      const style = StyleBuilder.create().background('#00FF00').build();
      const unsetStyle = Style.unsetBackground(style);
      expect(unsetStyle.background).toBeUndefined();
    });
  });

  describe('Size and layout functions', () => {
    test('should set width', () => {
      const widthStyle = StyleBuilder.create().width(80).build();
      expect(widthStyle.width).toBe(80);

      // Should clamp negative values
      const negativeWidthStyle = StyleBuilder.create().width(-10).build();
      expect(negativeWidthStyle.width).toBe(0);
    });

    test('should unset width', () => {
      const style = StyleBuilder.create().width(80).build();
      const unsetStyle = Style.unsetWidth(style);
      expect(unsetStyle.width).toBeUndefined();
    });

    test('should set height', () => {
      const heightStyle = StyleBuilder.create().height(24).build();
      expect(heightStyle.height).toBe(24);

      // Should clamp negative values
      const negativeHeightStyle = StyleBuilder.create().height(-5).build();
      expect(negativeHeightStyle.height).toBe(0);
    });

    test('should unset height', () => {
      const style = StyleBuilder.create().height(24).build();
      const unsetStyle = Style.unsetHeight(style);
      expect(unsetStyle.height).toBeUndefined();
    });

    test('should set max width', () => {
      const maxWidthStyle = StyleBuilder.create().maxWidth(120).build();
      expect(maxWidthStyle.maxWidth).toBe(120);
    });

    test('should unset max width', () => {
      const style = StyleBuilder.create().maxWidth(120).build();
      const unsetStyle = Style.unsetMaxWidth(style);
      expect(unsetStyle.maxWidth).toBeUndefined();
    });

    test('should set max height', () => {
      const maxHeightStyle = StyleBuilder.create().maxHeight(40).build();
      expect(maxHeightStyle.maxHeight).toBe(40);
    });

    test('should unset max height', () => {
      const style = StyleBuilder.create().maxHeight(40).build();
      const unsetStyle = Style.unsetMaxHeight(style);
      expect(unsetStyle.maxHeight).toBeUndefined();
    });

    test('should set inline mode', () => {
      const inlineStyle = StyleBuilder.create().inline(true).build();
      expect(inlineStyle.inline).toBe(true);

      const defaultInlineStyle = StyleBuilder.create().inline().build();
      expect(defaultInlineStyle.inline).toBe(true);
    });

    test('should set tab width', () => {
      const tabWidthStyle = StyleBuilder.create().tabWidth(8).build();
      expect(tabWidthStyle.tabWidth).toBe(8);

      // Should clamp to minimum 1
      const minTabWidthStyle = StyleBuilder.create().tabWidth(0).build();
      expect(minTabWidthStyle.tabWidth).toBe(1);
    });
  });

  describe('Padding functions', () => {
    test('should set padding with CSS-style values', () => {
      // All sides
      const allSidesStyle = StyleBuilder.create().padding(2).build();
      expect(allSidesStyle.padding).toEqual({
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
      });

      // Vertical, horizontal
      const verticalHorizontalStyle = StyleBuilder.create().padding(2, 4).build();
      expect(verticalHorizontalStyle.padding).toEqual({
        top: 2,
        right: 4,
        bottom: 2,
        left: 4,
      });

      // Top, horizontal, bottom
      const threeValuesStyle = StyleBuilder.create().padding(1, 4, 2).build();
      expect(threeValuesStyle.padding).toEqual({
        top: 1,
        right: 4,
        bottom: 2,
        left: 4,
      });

      // All four sides
      const fourValuesStyle = StyleBuilder.create().padding(1, 2, 3, 4).build();
      expect(fourValuesStyle.padding).toEqual({
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      });
    });

    test('should set individual padding sides', () => {
      const topStyle = StyleBuilder.create().paddingTop(1).build();
      expect(topStyle.padding?.top).toBe(1);

      const rightStyle = StyleBuilder.create().paddingRight(2).build();
      expect(rightStyle.padding?.right).toBe(2);

      const bottomStyle = StyleBuilder.create().paddingBottom(3).build();
      expect(bottomStyle.padding?.bottom).toBe(3);

      const leftStyle = StyleBuilder.create().paddingLeft(4).build();
      expect(leftStyle.padding?.left).toBe(4);
    });

    test('should unset padding', () => {
      const style = StyleBuilder.create().padding(2).build();
      const unsetStyle = Style.unsetPadding(style);
      expect(unsetStyle.padding).toBeUndefined();
    });
  });

  describe('Margin functions', () => {
    test('should set margin with CSS-style values', () => {
      // All sides
      const allSidesStyle = StyleBuilder.create().margin(2).build();
      expect(allSidesStyle.margin).toEqual({
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
      });

      // Vertical, horizontal
      const verticalHorizontalStyle = StyleBuilder.create().margin(2, 4).build();
      expect(verticalHorizontalStyle.margin).toEqual({
        top: 2,
        right: 4,
        bottom: 2,
        left: 4,
      });
    });

    test('should set individual margin sides', () => {
      const topStyle = StyleBuilder.create().marginTop(1).build();
      expect(topStyle.margin?.top).toBe(1);

      const rightStyle = StyleBuilder.create().marginRight(2).build();
      expect(rightStyle.margin?.right).toBe(2);

      const bottomStyle = StyleBuilder.create().marginBottom(3).build();
      expect(bottomStyle.margin?.bottom).toBe(3);

      const leftStyle = StyleBuilder.create().marginLeft(4).build();
      expect(leftStyle.margin?.left).toBe(4);
    });

    test('should set margin background color', () => {
      const marginBgStyle = StyleBuilder.create().marginBackground('#333333').build();
      expect(marginBgStyle.marginBackground).toBe('#333333');
    });

    test('should unset margin', () => {
      const style = StyleBuilder.create().margin(2).build();
      const unsetStyle = Style.unsetMargin(style);
      expect(unsetStyle.margin).toBeUndefined();
      expect(unsetStyle.marginBackground).toBeUndefined();
    });
  });

  describe('Alignment functions', () => {
    test('should set both horizontal and vertical alignment', () => {
      const alignedStyle = StyleBuilder.create().align('center', 'middle').build();
      expect(alignedStyle.horizontalAlignment).toBe('center');
      expect(alignedStyle.verticalAlignment).toBe('middle');

      // With position constants
      const positionAlignedStyle = StyleBuilder.create().align(0.5, 0.5).build();
      expect(positionAlignedStyle.horizontalAlignment).toBe('center');
      expect(positionAlignedStyle.verticalAlignment).toBe('middle');
    });

    test('should set horizontal alignment only', () => {
      const alignedStyle = StyleBuilder.create().alignHorizontal('right').build();
      expect(alignedStyle.horizontalAlignment).toBe('right');
      expect(alignedStyle.verticalAlignment).toBeUndefined();
    });

    test('should set vertical alignment only', () => {
      const alignedStyle = StyleBuilder.create().alignVertical('bottom').build();
      expect(alignedStyle.verticalAlignment).toBe('bottom');
      expect(alignedStyle.horizontalAlignment).toBeUndefined();
    });
  });

  describe('Content and transformation functions', () => {
    test('should set content string', () => {
      const contentStyle = StyleBuilder.create().setString('Hello, world!').build();
      expect(contentStyle.content).toBe('Hello, world!');
    });

    test('should set text transformation', () => {
      const upperCaseTransform = (text: string) => text.toUpperCase();
      const transformStyle = StyleBuilder.create().transform(upperCaseTransform).build();
      expect(transformStyle.transform).toBe(upperCaseTransform);
    });
  });

  describe('Style inheritance and composition', () => {
    test('should inherit properties from parent style', () => {
      const parent: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
        width: 80,
      };

      const child: StyleProperties = {
        italic: true,
        background: '#00FF00',
      };

      const inherited = Style.inherit(child, parent);
      expect(inherited).toEqual({
        bold: true,
        foreground: '#FF0000',
        width: 80,
        italic: true,
        background: '#00FF00',
      });
    });

    test('should override parent properties with child properties', () => {
      const parent: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
      };

      const child: StyleProperties = {
        bold: false,
        foreground: '#00FF00',
      };

      const inherited = Style.inherit(child, parent);
      expect(inherited.bold).toBe(false);
      expect(inherited.foreground).toBe('#00FF00');
    });

    test('should copy style properties', () => {
      const original: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
      };

      const copied = Style.copy(original);
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });
  });

  describe('Rendering functions', () => {
    test('should render content with style', () => {
      const style = Style.create();
      const result = Style.render(style, 'Hello, world!');
      expect(result).toBe('Hello, world!');
    });

    test('should render with pre-set content', () => {
      const style = StyleBuilder.create().setString('Hello, world!').build();
      const result = Style.renderString(style);
      expect(result).toBe('Hello, world!');
    });

    test('should apply text transformation', () => {
      const upperCaseTransform = (text: string) => text.toUpperCase();
      const style = StyleBuilder.create().transform(upperCaseTransform).build();
      const result = Style.render(style, 'hello, world!');
      expect(result).toBe('HELLO, WORLD!');
    });

    test('should use pre-set content when no content provided', () => {
      const style = StyleBuilder.create().setString('Pre-set content').build();
      const result = Style.render(style);
      expect(result).toBe('Pre-set content');
    });

    test('should return empty string when no content', () => {
      const style = Style.create();
      const result = Style.render(style);
      expect(result).toBe('');
    });
  });

  describe('Property getters', () => {
    test('should get width', () => {
      const style = StyleBuilder.create().width(80).build();
      expect(Style.getWidth(style)).toBe(80);

      const emptyStyle = Style.create();
      expect(Style.getWidth(emptyStyle)).toBeUndefined();
    });

    test('should get height', () => {
      const style = StyleBuilder.create().height(24).build();
      expect(Style.getHeight(style)).toBe(24);

      const emptyStyle = Style.create();
      expect(Style.getHeight(emptyStyle)).toBeUndefined();
    });

    test('should get padding', () => {
      const style = StyleBuilder.create().padding(2).build();
      const padding = Style.getPadding(style);
      expect(padding).toEqual({
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
      });

      const emptyStyle = Style.create();
      const emptyPadding = Style.getPadding(emptyStyle);
      expect(emptyPadding).toEqual(BoxModel.zero());
    });

    test('should get margin', () => {
      const style = StyleBuilder.create().margin(1).build();
      const margin = Style.getMargin(style);
      expect(margin).toEqual({
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      });

      const emptyStyle = Style.create();
      const emptyMargin = Style.getMargin(emptyStyle);
      expect(emptyMargin).toEqual(BoxModel.zero());
    });

    test('should get horizontal padding', () => {
      const style = StyleBuilder.create().padding(1, 2, 3, 4).build();
      const horizontalPadding = Style.getHorizontalPadding(style);
      expect(horizontalPadding).toBe(6); // left (4) + right (2)
    });

    test('should get vertical padding', () => {
      const style = StyleBuilder.create().padding(1, 2, 3, 4).build();
      const verticalPadding = Style.getVerticalPadding(style);
      expect(verticalPadding).toBe(4); // top (1) + bottom (3)
    });

    test('should get horizontal margins', () => {
      const style = StyleBuilder.create().margin(1, 2, 3, 4).build();
      const horizontalMargins = Style.getHorizontalMargins(style);
      expect(horizontalMargins).toBe(6); // left (4) + right (2)
    });

    test('should get vertical margins', () => {
      const style = StyleBuilder.create().margin(1, 2, 3, 4).build();
      const verticalMargins = Style.getVerticalMargins(style);
      expect(verticalMargins).toBe(4); // top (1) + bottom (3)
    });
  });

  describe('Immutability', () => {
    test('should not mutate original style', () => {
      const original = Style.create();
      const modified = StyleBuilder.from(original).bold(true).build();

      expect(original.bold).toBeUndefined();
      expect(modified.bold).toBe(true);
      expect(modified).not.toBe(original);
    });

    test('should preserve other properties when setting new ones', () => {
      const style = StyleBuilder.create().bold(true).foreground('#FF0000').build();

      expect(style.bold).toBe(true);
      expect(style.foreground).toBe('#FF0000');
    });
  });
});
