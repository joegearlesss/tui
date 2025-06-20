import { ANSI } from '@tui/styling/ansi/ansi';
import type { BorderConfig } from '@tui/styling/border';
import { BorderRender } from '@tui/styling/border';
import { Color } from '@tui/styling/color';
import { BoxModel, Position } from '@tui/styling/layout';
import type {
  BoxDimensions,
  ColorValue,
  HorizontalPosition,
  TextAlignment,
  TextTransform,
  VerticalAlignment,
  VerticalPosition,
} from '@tui/styling/types';
import { StringUtils } from '@tui/styling/utils';

/**
 * Style properties interface for internal state management
 */
export interface StyleProperties {
  // Text formatting
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
  readonly strikethrough?: boolean;
  readonly reverse?: boolean;
  readonly blink?: boolean;
  readonly faint?: boolean;
  readonly underlineSpaces?: boolean;
  readonly strikethroughSpaces?: boolean;
  readonly colorWhitespace?: boolean;

  // Colors
  readonly foreground?: ColorValue;
  readonly background?: ColorValue;

  // Layout and sizing
  readonly width?: number;
  readonly height?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly inline?: boolean;
  readonly tabWidth?: number;

  // Box model
  readonly padding?: BoxDimensions;
  readonly margin?: BoxDimensions;
  readonly marginBackground?: ColorValue;

  // Border properties
  readonly border?: BorderConfig;
  readonly borderForeground?: ColorValue;
  readonly borderBackground?: ColorValue;
  readonly borderTopForeground?: ColorValue;
  readonly borderRightForeground?: ColorValue;
  readonly borderBottomForeground?: ColorValue;
  readonly borderLeftForeground?: ColorValue;
  readonly borderTopBackground?: ColorValue;
  readonly borderRightBackground?: ColorValue;
  readonly borderBottomBackground?: ColorValue;
  readonly borderLeftBackground?: ColorValue;

  // Alignment
  readonly horizontalAlignment?: TextAlignment;
  readonly verticalAlignment?: VerticalAlignment;

  // Content
  readonly content?: string;
  readonly transform?: TextTransform;
}

/**
 * Core Style namespace providing functional API for terminal styling
 */
export namespace Style {
  /**
   * Creates a new style with default properties
   * @returns Empty style properties
   */
  export const create = (): StyleProperties => ({});

  /**
   * Creates a style from existing properties
   * @param properties - Style properties to copy
   * @returns New style properties
   */
  export const from = (properties: StyleProperties): StyleProperties => ({ ...properties });

  // Text formatting functions

  /**
   * Sets bold text formatting
   * @param style - Current style properties
   * @param value - Whether to apply bold formatting
   * @returns New style properties with bold formatting
   */
  export const bold = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    bold: value,
  });

  /**
   * Removes bold formatting
   * @param style - Current style properties
   * @returns New style properties without bold formatting
   */
  export const unsetBold = (style: StyleProperties): StyleProperties => {
    const { bold: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets italic text formatting
   * @param style - Current style properties
   * @param value - Whether to apply italic formatting
   * @returns New style properties with italic formatting
   */
  export const italic = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    italic: value,
  });

  /**
   * Removes italic formatting
   * @param style - Current style properties
   * @returns New style properties without italic formatting
   */
  export const unsetItalic = (style: StyleProperties): StyleProperties => {
    const { italic: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets underline text formatting
   * @param style - Current style properties
   * @param value - Whether to apply underline formatting
   * @returns New style properties with underline formatting
   */
  export const underline = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    underline: value,
  });

  /**
   * Removes underline formatting
   * @param style - Current style properties
   * @returns New style properties without underline formatting
   */
  export const unsetUnderline = (style: StyleProperties): StyleProperties => {
    const { underline: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets strikethrough text formatting
   * @param style - Current style properties
   * @param value - Whether to apply strikethrough formatting
   * @returns New style properties with strikethrough formatting
   */
  export const strikethrough = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    strikethrough: value,
  });

  /**
   * Removes strikethrough formatting
   * @param style - Current style properties
   * @returns New style properties without strikethrough formatting
   */
  export const unsetStrikethrough = (style: StyleProperties): StyleProperties => {
    const { strikethrough: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets reverse video formatting (swap foreground/background)
   * @param style - Current style properties
   * @param value - Whether to apply reverse formatting
   * @returns New style properties with reverse formatting
   */
  export const reverse = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    reverse: value,
  });

  /**
   * Removes reverse formatting
   * @param style - Current style properties
   * @returns New style properties without reverse formatting
   */
  export const unsetReverse = (style: StyleProperties): StyleProperties => {
    const { reverse: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets blinking text formatting
   * @param style - Current style properties
   * @param value - Whether to apply blink formatting
   * @returns New style properties with blink formatting
   */
  export const blink = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    blink: value,
  });

  /**
   * Removes blink formatting
   * @param style - Current style properties
   * @returns New style properties without blink formatting
   */
  export const unsetBlink = (style: StyleProperties): StyleProperties => {
    const { blink: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets faint/dim text formatting
   * @param style - Current style properties
   * @param value - Whether to apply faint formatting
   * @returns New style properties with faint formatting
   */
  export const faint = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    faint: value,
  });

  /**
   * Removes faint formatting
   * @param style - Current style properties
   * @returns New style properties without faint formatting
   */
  export const unsetFaint = (style: StyleProperties): StyleProperties => {
    const { faint: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets whether to underline spaces
   * @param style - Current style properties
   * @param value - Whether to underline spaces
   * @returns New style properties with underline spaces setting
   */
  export const underlineSpaces = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    underlineSpaces: value,
  });

  /**
   * Sets whether to strikethrough spaces
   * @param style - Current style properties
   * @param value - Whether to strikethrough spaces
   * @returns New style properties with strikethrough spaces setting
   */
  export const strikethroughSpaces = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    strikethroughSpaces: value,
  });

  /**
   * Sets whether to color whitespace and padding
   * @param style - Current style properties
   * @param value - Whether to color whitespace
   * @returns New style properties with color whitespace setting
   */
  export const colorWhitespace = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    colorWhitespace: value,
  });

  // Color functions

  /**
   * Sets foreground color
   * @param style - Current style properties
   * @param color - Color value or color string
   * @returns New style properties with foreground color
   */
  export const foreground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    // Store the original color value to preserve named colors for ANSI rendering
    return { ...style, foreground: color as ColorValue };
  };

  /**
   * Removes foreground color
   * @param style - Current style properties
   * @returns New style properties without foreground color
   */
  export const unsetForeground = (style: StyleProperties): StyleProperties => {
    const { foreground: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets background color
   * @param style - Current style properties
   * @param color - Color value or color string
   * @returns New style properties with background color
   */
  export const background = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    // Store the original color value to preserve named colors for ANSI rendering
    return { ...style, background: color as ColorValue };
  };

  /**
   * Removes background color
   * @param style - Current style properties
   * @returns New style properties without background color
   */
  export const unsetBackground = (style: StyleProperties): StyleProperties => {
    const { background: _, ...rest } = style;
    return rest;
  };

  // Size and layout functions

  /**
   * Sets fixed width
   * @param style - Current style properties
   * @param width - Width in character units
   * @returns New style properties with fixed width
   */
  export const width = (style: StyleProperties, width: number): StyleProperties => ({
    ...style,
    width: Math.max(0, width),
  });

  /**
   * Removes fixed width
   * @param style - Current style properties
   * @returns New style properties without fixed width
   */
  export const unsetWidth = (style: StyleProperties): StyleProperties => {
    const { width: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets fixed height
   * @param style - Current style properties
   * @param height - Height in character units
   * @returns New style properties with fixed height
   */
  export const height = (style: StyleProperties, height: number): StyleProperties => ({
    ...style,
    height: Math.max(0, height),
  });

  /**
   * Removes fixed height
   * @param style - Current style properties
   * @returns New style properties without fixed height
   */
  export const unsetHeight = (style: StyleProperties): StyleProperties => {
    const { height: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets maximum width constraint
   * @param style - Current style properties
   * @param maxWidth - Maximum width in character units
   * @returns New style properties with max width constraint
   */
  export const maxWidth = (style: StyleProperties, maxWidth: number): StyleProperties => ({
    ...style,
    maxWidth: Math.max(0, maxWidth),
  });

  /**
   * Removes maximum width constraint
   * @param style - Current style properties
   * @returns New style properties without max width constraint
   */
  export const unsetMaxWidth = (style: StyleProperties): StyleProperties => {
    const { maxWidth: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets maximum height constraint
   * @param style - Current style properties
   * @param maxHeight - Maximum height in character units
   * @returns New style properties with max height constraint
   */
  export const maxHeight = (style: StyleProperties, maxHeight: number): StyleProperties => ({
    ...style,
    maxHeight: Math.max(0, maxHeight),
  });

  /**
   * Removes maximum height constraint
   * @param style - Current style properties
   * @returns New style properties without max height constraint
   */
  export const unsetMaxHeight = (style: StyleProperties): StyleProperties => {
    const { maxHeight: _, ...rest } = style;
    return rest;
  };

  /**
   * Sets inline mode (single line)
   * @param style - Current style properties
   * @param value - Whether to force single line
   * @returns New style properties with inline setting
   */
  export const inline = (style: StyleProperties, value = true): StyleProperties => ({
    ...style,
    inline: value,
  });

  /**
   * Sets tab width
   * @param style - Current style properties
   * @param width - Tab width in spaces
   * @returns New style properties with tab width
   */
  export const tabWidth = (style: StyleProperties, width: number): StyleProperties => ({
    ...style,
    tabWidth: Math.max(1, width),
  });

  // Padding functions (CSS-style)

  /**
   * Sets padding using CSS-style values
   * @param style - Current style properties
   * @param top - Top padding, or all sides if others undefined
   * @param right - Right padding, defaults to top
   * @param bottom - Bottom padding, defaults to top
   * @param left - Left padding, defaults to right
   * @returns New style properties with padding
   */
  export const padding = (
    style: StyleProperties,
    top: number,
    right?: number,
    bottom?: number,
    left?: number
  ): StyleProperties => {
    const padding = BoxModel.createDimensions(top, right, bottom, left);
    return { ...style, padding };
  };

  /**
   * Sets top padding
   * @param style - Current style properties
   * @param value - Top padding value
   * @returns New style properties with top padding
   */
  export const paddingTop = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.padding ?? BoxModel.zero();
    const padding = { ...current, top: Math.max(0, value) };
    return { ...style, padding };
  };

  /**
   * Sets right padding
   * @param style - Current style properties
   * @param value - Right padding value
   * @returns New style properties with right padding
   */
  export const paddingRight = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.padding ?? BoxModel.zero();
    const padding = { ...current, right: Math.max(0, value) };
    return { ...style, padding };
  };

  /**
   * Sets bottom padding
   * @param style - Current style properties
   * @param value - Bottom padding value
   * @returns New style properties with bottom padding
   */
  export const paddingBottom = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.padding ?? BoxModel.zero();
    const padding = { ...current, bottom: Math.max(0, value) };
    return { ...style, padding };
  };

  /**
   * Sets left padding
   * @param style - Current style properties
   * @param value - Left padding value
   * @returns New style properties with left padding
   */
  export const paddingLeft = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.padding ?? BoxModel.zero();
    const padding = { ...current, left: Math.max(0, value) };
    return { ...style, padding };
  };

  /**
   * Removes all padding
   * @param style - Current style properties
   * @returns New style properties without padding
   */
  export const unsetPadding = (style: StyleProperties): StyleProperties => {
    const { padding: _, ...rest } = style;
    return rest;
  };

  // Margin functions (CSS-style)

  /**
   * Sets margin using CSS-style values
   * @param style - Current style properties
   * @param top - Top margin, or all sides if others undefined
   * @param right - Right margin, defaults to top
   * @param bottom - Bottom margin, defaults to top
   * @param left - Left margin, defaults to right
   * @returns New style properties with margin
   */
  export const margin = (
    style: StyleProperties,
    top: number,
    right?: number,
    bottom?: number,
    left?: number
  ): StyleProperties => {
    const margin = BoxModel.createDimensions(top, right, bottom, left);
    return { ...style, margin };
  };

  /**
   * Sets top margin
   * @param style - Current style properties
   * @param value - Top margin value
   * @returns New style properties with top margin
   */
  export const marginTop = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.margin ?? BoxModel.zero();
    const margin = { ...current, top: Math.max(0, value) };
    return { ...style, margin };
  };

  /**
   * Sets right margin
   * @param style - Current style properties
   * @param value - Right margin value
   * @returns New style properties with right margin
   */
  export const marginRight = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.margin ?? BoxModel.zero();
    const margin = { ...current, right: Math.max(0, value) };
    return { ...style, margin };
  };

  /**
   * Sets bottom margin
   * @param style - Current style properties
   * @param value - Bottom margin value
   * @returns New style properties with bottom margin
   */
  export const marginBottom = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.margin ?? BoxModel.zero();
    const margin = { ...current, bottom: Math.max(0, value) };
    return { ...style, margin };
  };

  /**
   * Sets left margin
   * @param style - Current style properties
   * @param value - Left margin value
   * @returns New style properties with left margin
   */
  export const marginLeft = (style: StyleProperties, value: number): StyleProperties => {
    const current = style.margin ?? BoxModel.zero();
    const margin = { ...current, left: Math.max(0, value) };
    return { ...style, margin };
  };

  /**
   * Sets margin background color
   * @param style - Current style properties
   * @param color - Color for margin background
   * @returns New style properties with margin background color
   */
  export const marginBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, marginBackground: parsedColor };
  };

  /**
   * Removes all margin
   * @param style - Current style properties
   * @returns New style properties without margin
   */
  export const unsetMargin = (style: StyleProperties): StyleProperties => {
    const { margin: _, marginBackground: __, ...rest } = style;
    return rest;
  };

  // Border functions

  /**
   * Sets border configuration
   * @param style - Current style properties
   * @param border - Border configuration
   * @returns New style properties with border
   */
  export const border = (style: StyleProperties, border: BorderConfig): StyleProperties => ({
    ...style,
    border,
  });

  /**
   * Sets general border foreground color
   * @param style - Current style properties
   * @param color - Color for border foreground
   * @returns New style properties with border foreground color
   */
  export const borderForeground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderForeground: parsedColor };
  };

  /**
   * Sets general border background color
   * @param style - Current style properties
   * @param color - Color for border background
   * @returns New style properties with border background color
   */
  export const borderBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderBackground: parsedColor };
  };

  /**
   * Sets top border foreground color
   * @param style - Current style properties
   * @param color - Color for top border foreground
   * @returns New style properties with top border foreground color
   */
  export const borderTopForeground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderTopForeground: parsedColor };
  };

  /**
   * Sets right border foreground color
   * @param style - Current style properties
   * @param color - Color for right border foreground
   * @returns New style properties with right border foreground color
   */
  export const borderRightForeground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderRightForeground: parsedColor };
  };

  /**
   * Sets bottom border foreground color
   * @param style - Current style properties
   * @param color - Color for bottom border foreground
   * @returns New style properties with bottom border foreground color
   */
  export const borderBottomForeground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderBottomForeground: parsedColor };
  };

  /**
   * Sets left border foreground color
   * @param style - Current style properties
   * @param color - Color for left border foreground
   * @returns New style properties with left border foreground color
   */
  export const borderLeftForeground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderLeftForeground: parsedColor };
  };

  /**
   * Sets top border background color
   * @param style - Current style properties
   * @param color - Color for top border background
   * @returns New style properties with top border background color
   */
  export const borderTopBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderTopBackground: parsedColor };
  };

  /**
   * Sets right border background color
   * @param style - Current style properties
   * @param color - Color for right border background
   * @returns New style properties with right border background color
   */
  export const borderRightBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderRightBackground: parsedColor };
  };

  /**
   * Sets bottom border background color
   * @param style - Current style properties
   * @param color - Color for bottom border background
   * @returns New style properties with bottom border background color
   */
  export const borderBottomBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderBottomBackground: parsedColor };
  };

  /**
   * Sets left border background color
   * @param style - Current style properties
   * @param color - Color for left border background
   * @returns New style properties with left border background color
   */
  export const borderLeftBackground = (
    style: StyleProperties,
    color: ColorValue | string | number
  ): StyleProperties => {
    const parsedColor =
      typeof color === 'string' || typeof color === 'number' ? Color.parse(color) : color;
    return { ...style, borderLeftBackground: parsedColor };
  };

  /**
   * Removes all border properties
   * @param style - Current style properties
   * @returns New style properties without border
   */
  export const unsetBorder = (style: StyleProperties): StyleProperties => {
    const {
      border: _,
      borderForeground: __,
      borderBackground: ___,
      borderTopForeground: ____,
      borderRightForeground: _____,
      borderBottomForeground: ______,
      borderLeftForeground: _______,
      borderTopBackground: ________,
      borderRightBackground: _________,
      borderBottomBackground: __________,
      borderLeftBackground: ___________,
      ...rest
    } = style;
    return rest;
  };

  // Alignment functions

  /**
   * Sets both horizontal and vertical alignment
   * @param style - Current style properties
   * @param horizontal - Horizontal alignment or position
   * @param vertical - Vertical alignment or position (optional)
   * @returns New style properties with alignment
   */
  export const align = (
    style: StyleProperties,
    horizontal: HorizontalPosition | TextAlignment,
    vertical?: VerticalPosition | VerticalAlignment
  ): StyleProperties => {
    const horizontalAlignment = normalizeHorizontalAlignment(horizontal);
    const verticalAlignment =
      vertical !== undefined ? normalizeVerticalAlignment(vertical) : style.verticalAlignment;

    return {
      ...style,
      horizontalAlignment,
      verticalAlignment,
    };
  };

  /**
   * Sets horizontal alignment
   * @param style - Current style properties
   * @param alignment - Horizontal alignment or position
   * @returns New style properties with horizontal alignment
   */
  export const alignHorizontal = (
    style: StyleProperties,
    alignment: HorizontalPosition | TextAlignment
  ): StyleProperties => {
    const horizontalAlignment = normalizeHorizontalAlignment(alignment);
    return { ...style, horizontalAlignment };
  };

  /**
   * Sets vertical alignment
   * @param style - Current style properties
   * @param alignment - Vertical alignment or position
   * @returns New style properties with vertical alignment
   */
  export const alignVertical = (
    style: StyleProperties,
    alignment: VerticalPosition | VerticalAlignment
  ): StyleProperties => {
    const verticalAlignment = normalizeVerticalAlignment(alignment);
    return { ...style, verticalAlignment };
  };

  // Content and transformation functions

  /**
   * Sets content string for this style
   * @param style - Current style properties
   * @param content - Content string
   * @returns New style properties with content
   */
  export const setString = (style: StyleProperties, content: string): StyleProperties => ({
    ...style,
    content,
  });

  /**
   * Sets text transformation function
   * @param style - Current style properties
   * @param transform - Function to transform text
   * @returns New style properties with transformation
   */
  export const transform = (style: StyleProperties, transform: TextTransform): StyleProperties => ({
    ...style,
    transform,
  });

  // Style inheritance and composition

  /**
   * Inherits properties from another style
   * @param child - Child style properties
   * @param parent - Parent style to inherit from
   * @returns New style properties with inherited properties
   */
  export const inherit = (child: StyleProperties, parent: StyleProperties): StyleProperties => ({
    ...parent,
    ...child,
  });

  /**
   * Copies style properties
   * @param style - Style properties to copy
   * @returns New style properties with same values
   */
  export const copy = (style: StyleProperties): StyleProperties => ({ ...style });

  // Rendering functions

  /**
   * Applies padding to content
   * @param content - Content to pad
   * @param padding - Padding dimensions
   * @returns Content with padding applied
   */
  const applyPadding = (content: string, padding: BoxDimensions): string => {
    if (!content) return '';

    const lines = content.split('\n');
    const contentWidth = Math.max(...lines.map((line) => StringUtils.displayWidth(line)));

    // Add horizontal padding to each line
    const paddedLines = lines.map((line) => {
      const lineWidth = StringUtils.displayWidth(line);
      const rightPadding = contentWidth - lineWidth + padding.right;
      return '\u00A0'.repeat(padding.left) + line + '\u00A0'.repeat(rightPadding);
    });

    // Add vertical padding
    const emptyLine = '\u00A0'.repeat(contentWidth + padding.left + padding.right);
    const topPadding = Array(padding.top).fill(emptyLine);
    const bottomPadding = Array(padding.bottom).fill(emptyLine);

    return [...topPadding, ...paddedLines, ...bottomPadding].join('\n');
  };

  /**
   * Applies margin to content
   * @param content - Content to add margin to
   * @param margin - Margin dimensions
   * @returns Content with margin applied
   */
  const applyMargin = (content: string, margin: BoxDimensions): string => {
    if (!content) return '';

    const lines = content.split('\n');
    const contentWidth = Math.max(...lines.map((line) => StringUtils.displayWidth(line)));

    // Add horizontal margin (indentation) to each line
    const marginedLines = lines.map((line) => {
      const lineWidth = StringUtils.displayWidth(line);
      const rightMargin = contentWidth - lineWidth + margin.right;
      return ' '.repeat(margin.left) + line + ' '.repeat(rightMargin);
    });

    // Add vertical margin
    const emptyLine = ' '.repeat(contentWidth + margin.left + margin.right);
    const topMargin = Array(margin.top).fill(emptyLine);
    const bottomMargin = Array(margin.bottom).fill(emptyLine);

    return [...topMargin, ...marginedLines, ...bottomMargin].join('\n');
  };

  /**
   * Applies size constraints and text alignment to content
   * @param content - Content to size and align
   * @param style - Style properties containing width and alignment settings
   * @returns Content with size and alignment applied
   */
  const applySizeAndAlignment = (content: string, style: StyleProperties): string => {
    if (!content) return '';

    let resultLines = content.split('\n');

    // Apply width constraint if specified
    if (style.width !== undefined) {
      const targetWidth = style.width;
      const alignment = style.horizontalAlignment || 'left';

      // Wrap long lines to fit target width, then align all lines
      const wrappedLines: string[] = [];

      for (const line of resultLines) {
        const lineWidth = StringUtils.displayWidth(line);

        if (lineWidth <= targetWidth) {
          // Line fits, just add it
          wrappedLines.push(line);
        } else {
          // Line is too wide, wrap it using StringUtils.wrap
          const wrapped = StringUtils.wrap(line, targetWidth);
          wrappedLines.push(...wrapped);
        }
      }

      // Now align all lines to the target width
      resultLines = wrappedLines.map((line) => {
        const lineWidth = StringUtils.displayWidth(line);
        const padding = Math.max(0, targetWidth - lineWidth);

        switch (alignment) {
          case 'center': {
            const leftPadding = Math.floor(padding / 2);
            const rightPadding = padding - leftPadding;
            return '\u00A0'.repeat(leftPadding) + line + '\u00A0'.repeat(rightPadding);
          }
          case 'right':
            return '\u00A0'.repeat(padding) + line;
          default: // 'left'
            return line + '\u00A0'.repeat(padding);
        }
      });
    }

    return resultLines.join('\n');
  };

  /**
   * Renders border with styling around content
   * @param style - Style properties containing border configuration
   * @param content - Pre-styled content to wrap with border
   * @returns Content with styled border
   */
  const renderStyledBorder = (style: StyleProperties, content: string): string => {
    if (!style.border) {
      return content;
    }

    // Render basic border without additional padding since padding should be handled by the style system
    let borderedContent = BorderRender.render(style.border, content);

    // Apply border colors if specified
    if (
      style.borderForeground ||
      style.borderBackground ||
      style.borderTopForeground ||
      style.borderRightForeground ||
      style.borderBottomForeground ||
      style.borderLeftForeground
    ) {
      borderedContent = applyBorderColors(style, borderedContent);
    }

    return borderedContent;
  };

  /**
   * Applies color formatting to border characters
   * @param style - Style properties with border colors
   * @param borderedContent - Content with border already applied
   * @returns Content with colored border
   */
  const applyBorderColors = (style: StyleProperties, borderedContent: string): string => {
    if (!style.borderForeground) {
      return borderedContent;
    }

    const color = Color.toComplete(style.borderForeground);
    if (!color) {
      return borderedContent;
    }

    const colorCode = ANSI.foreground(color);
    const lines = borderedContent.split('\n');
    
    return lines.map(line => {
      if (line.trim() === '') return line;
      
      // Apply color to border characters more efficiently
      // Match common border patterns: corners, horizontals, verticals
      const borderPattern = /^(\s*)([\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2800-\u28FF╭╮╯╰├┤┬┴┼│─┌┐└┘]+)/;
      const match = line.match(borderPattern);
      
      if (match) {
        const [, spaces, borderChars] = match;
        const rest = line.slice(match[0].length);
        
        // Apply color to border characters only, then reset
        return `${spaces}${colorCode}${borderChars}${ANSI.RESET}${rest}`;
      }
      
      return line;
    }).join('\n');
  };

  /**
   * Applies ANSI formatting to text based on style properties
   * @param style - Style properties to apply
   * @param text - Text to format
   * @returns Text with ANSI formatting applied
   */
  const applyAnsiFormatting = (style: StyleProperties, text: string): string => {
    const codes: string[] = [];

    // Text formatting
    if (style.bold) codes.push(ANSI.BOLD);
    if (style.faint) codes.push(ANSI.FAINT);
    if (style.italic) codes.push(ANSI.ITALIC);
    if (style.underline) codes.push(ANSI.UNDERLINE);
    if (style.blink) codes.push(ANSI.BLINK);
    if (style.reverse) codes.push(ANSI.REVERSE);
    if (style.strikethrough) codes.push(ANSI.STRIKETHROUGH);

    // Colors
    if (style.foreground) {
      const color = Color.toComplete(style.foreground);
      if (color) {
        codes.push(ANSI.foreground(color));
      }
    }

    if (style.background) {
      const color = Color.toComplete(style.background);
      if (color) {
        codes.push(ANSI.background(color));
      }
    }

    // Apply formatting to text, handling spaces if needed
    let formattedText = text;

    // Handle underline spaces
    if (style.underlineSpaces && style.underline) {
      // Keep underline for spaces
      formattedText = formattedText.replace(/ /g, ' ');
    }

    // Handle strikethrough spaces
    if (style.strikethroughSpaces && style.strikethrough) {
      // Keep strikethrough for spaces
      formattedText = formattedText.replace(/ /g, ' ');
    }

    // Wrap with ANSI codes if any formatting is applied
    if (codes.length > 0) {
      return ANSI.wrap(formattedText, ...codes);
    }

    return formattedText;
  };

  /**
   * Renders content with style
   * @param style - Style properties to apply
   * @param content - Content to render (optional if setString was used)
   * @returns Styled content string
   */
  export const render = (style: StyleProperties, content?: string): string => {
    const text = content ?? style.content ?? '';
    const transformedText = style.transform ? style.transform(text) : text;

    // Don't return early if we have a border, padding, margin, width, or height, even with empty content
    if (
      transformedText === '' &&
      !style.border &&
      !style.padding &&
      !style.margin &&
      !style.width &&
      !style.height
    ) {
      return '';
    }

    // Apply basic ANSI formatting first
    let result = applyAnsiFormatting(style, transformedText);

    // Apply width and alignment constraints
    if (style.width !== undefined || style.horizontalAlignment !== undefined) {
      result = applySizeAndAlignment(result, style);
    }

    // Apply padding before border
    if (style.padding) {
      result = applyPadding(result, style.padding);
    }

    // Apply border if specified
    if (style.border) {
      // Apply border with color support
      result = renderStyledBorder(style, result);
    }

    // Apply margin after everything else
    if (style.margin) {
      result = applyMargin(result, style.margin);
    }

    return result;
  };

  /**
   * Renders using pre-set string content
   * @param style - Style properties with content
   * @returns Styled content string
   */
  export const renderString = (style: StyleProperties): string => {
    return render(style);
  };

  // Property getters

  /**
   * Gets current width setting
   * @param style - Style properties
   * @returns Width value or undefined
   */
  export const getWidth = (style: StyleProperties): number | undefined => {
    return style.width;
  };

  /**
   * Gets current height setting
   * @param style - Style properties
   * @returns Height value or undefined
   */
  export const getHeight = (style: StyleProperties): number | undefined => {
    return style.height;
  };

  /**
   * Gets current padding
   * @param style - Style properties
   * @returns Padding dimensions or zero if not set
   */
  export const getPadding = (style: StyleProperties): BoxDimensions => {
    return style.padding ?? BoxModel.zero();
  };

  /**
   * Gets current margin
   * @param style - Style properties
   * @returns Margin dimensions or zero if not set
   */
  export const getMargin = (style: StyleProperties): BoxDimensions => {
    return style.margin ?? BoxModel.zero();
  };

  /**
   * Gets total horizontal padding
   * @param style - Style properties
   * @returns Sum of left and right padding
   */
  export const getHorizontalPadding = (style: StyleProperties): number => {
    return BoxModel.getHorizontalSpace(getPadding(style));
  };

  /**
   * Gets total vertical padding
   * @param style - Style properties
   * @returns Sum of top and bottom padding
   */
  export const getVerticalPadding = (style: StyleProperties): number => {
    return BoxModel.getVerticalSpace(getPadding(style));
  };

  /**
   * Gets total horizontal margin
   * @param style - Style properties
   * @returns Sum of left and right margin
   */
  export const getHorizontalMargins = (style: StyleProperties): number => {
    return BoxModel.getHorizontalSpace(getMargin(style));
  };

  /**
   * Gets total vertical margin
   * @param style - Style properties
   * @returns Sum of top and bottom margin
   */
  export const getVerticalMargins = (style: StyleProperties): number => {
    return BoxModel.getVerticalSpace(getMargin(style));
  };

  // Private helper functions

  /**
   * Normalizes horizontal alignment value
   * @param alignment - Alignment value to normalize
   * @returns Normalized text alignment
   */
  const normalizeHorizontalAlignment = (
    alignment: HorizontalPosition | TextAlignment
  ): TextAlignment => {
    if (typeof alignment === 'string') {
      return alignment;
    }
    return Position.getHorizontalAlignment(alignment);
  };

  /**
   * Normalizes vertical alignment value
   * @param alignment - Alignment value to normalize
   * @returns Normalized vertical alignment
   */
  const normalizeVerticalAlignment = (
    alignment: VerticalPosition | VerticalAlignment
  ): VerticalAlignment => {
    if (typeof alignment === 'string') {
      return alignment;
    }
    return Position.getVerticalAlignment(alignment);
  };
}

/**
 * Functional style chain interface for method chaining
 */
export interface StyleChain {
  readonly config: StyleProperties;

  // Text formatting methods
  bold(value?: boolean): StyleChain;
  italic(value?: boolean): StyleChain;
  underline(value?: boolean): StyleChain;
  strikethrough(value?: boolean): StyleChain;
  reverse(value?: boolean): StyleChain;
  blink(value?: boolean): StyleChain;
  faint(value?: boolean): StyleChain;
  underlineSpaces(value?: boolean): StyleChain;
  strikethroughSpaces(value?: boolean): StyleChain;
  colorWhitespace(value?: boolean): StyleChain;

  // Color methods
  foreground(color: ColorValue | string | number): StyleChain;
  background(color: ColorValue | string | number): StyleChain;

  // Size and layout methods
  width(width: number): StyleChain;
  height(height: number): StyleChain;
  maxWidth(maxWidth: number): StyleChain;
  maxHeight(maxHeight: number): StyleChain;
  inline(value?: boolean): StyleChain;
  tabWidth(width: number): StyleChain;

  // Padding methods
  padding(top: number, right?: number, bottom?: number, left?: number): StyleChain;
  paddingTop(value: number): StyleChain;
  paddingRight(value: number): StyleChain;
  paddingBottom(value: number): StyleChain;
  paddingLeft(value: number): StyleChain;

  // Margin methods
  margin(top: number, right?: number, bottom?: number, left?: number): StyleChain;
  marginTop(value: number): StyleChain;
  marginRight(value: number): StyleChain;
  marginBottom(value: number): StyleChain;
  marginLeft(value: number): StyleChain;
  marginBackground(color: ColorValue | string | number): StyleChain;

  // Border methods
  border(border: BorderConfig): StyleChain;
  borderForeground(color: ColorValue | string | number): StyleChain;
  borderBackground(color: ColorValue | string | number): StyleChain;
  borderTopForeground(color: ColorValue | string | number): StyleChain;
  borderRightForeground(color: ColorValue | string | number): StyleChain;
  borderBottomForeground(color: ColorValue | string | number): StyleChain;
  borderLeftForeground(color: ColorValue | string | number): StyleChain;
  borderTopBackground(color: ColorValue | string | number): StyleChain;
  borderRightBackground(color: ColorValue | string | number): StyleChain;
  borderBottomBackground(color: ColorValue | string | number): StyleChain;
  borderLeftBackground(color: ColorValue | string | number): StyleChain;

  // Alignment methods
  align(
    horizontal: HorizontalPosition | TextAlignment,
    vertical?: VerticalPosition | VerticalAlignment
  ): StyleChain;
  alignHorizontal(alignment: HorizontalPosition | TextAlignment): StyleChain;
  alignVertical(alignment: VerticalPosition | VerticalAlignment): StyleChain;

  // Content methods
  setString(content: string): StyleChain;
  transform(transform: TextTransform): StyleChain;

  // Inheritance methods
  inherit(parent: StyleProperties): StyleChain;

  // Unset methods
  unsetBold(): StyleChain;
  unsetItalic(): StyleChain;
  unsetUnderline(): StyleChain;
  unsetStrikethrough(): StyleChain;
  unsetReverse(): StyleChain;
  unsetBlink(): StyleChain;
  unsetFaint(): StyleChain;
  unsetForeground(): StyleChain;
  unsetBackground(): StyleChain;
  unsetWidth(): StyleChain;
  unsetHeight(): StyleChain;
  unsetMaxWidth(): StyleChain;
  unsetMaxHeight(): StyleChain;
  unsetPadding(): StyleChain;
  unsetMargin(): StyleChain;
  unsetBorder(): StyleChain;

  // Terminal methods
  build(): StyleProperties;
  render(text?: string): string;
  toString(): string;
  copy(): StyleChain;
}

/**
 * Functional style chain namespace providing method chaining without classes
 */
namespace StyleChain {
  /**
   * Creates a style chain from properties
   * @param config - Style properties to wrap
   * @returns StyleChain interface with method chaining
   */
  export const from = (config: StyleProperties): StyleChain => {
    return {
      config,

      // Text formatting methods
      bold: (value = true) => from(Style.bold(config, value)),
      italic: (value = true) => from(Style.italic(config, value)),
      underline: (value = true) => from(Style.underline(config, value)),
      strikethrough: (value = true) => from(Style.strikethrough(config, value)),
      reverse: (value = true) => from(Style.reverse(config, value)),
      blink: (value = true) => from(Style.blink(config, value)),
      faint: (value = true) => from(Style.faint(config, value)),
      underlineSpaces: (value = true) => from(Style.underlineSpaces(config, value)),
      strikethroughSpaces: (value = true) => from(Style.strikethroughSpaces(config, value)),
      colorWhitespace: (value = true) => from(Style.colorWhitespace(config, value)),

      // Color methods
      foreground: (color) => from(Style.foreground(config, color)),
      background: (color) => from(Style.background(config, color)),

      // Size and layout methods
      width: (width) => from(Style.width(config, width)),
      height: (height) => from(Style.height(config, height)),
      maxWidth: (maxWidth) => from(Style.maxWidth(config, maxWidth)),
      maxHeight: (maxHeight) => from(Style.maxHeight(config, maxHeight)),
      inline: (value = true) => from(Style.inline(config, value)),
      tabWidth: (width) => from(Style.tabWidth(config, width)),

      // Padding methods
      padding: (top, right, bottom, left) => from(Style.padding(config, top, right, bottom, left)),
      paddingTop: (value) => from(Style.paddingTop(config, value)),
      paddingRight: (value) => from(Style.paddingRight(config, value)),
      paddingBottom: (value) => from(Style.paddingBottom(config, value)),
      paddingLeft: (value) => from(Style.paddingLeft(config, value)),

      // Margin methods
      margin: (top, right, bottom, left) => from(Style.margin(config, top, right, bottom, left)),
      marginTop: (value) => from(Style.marginTop(config, value)),
      marginRight: (value) => from(Style.marginRight(config, value)),
      marginBottom: (value) => from(Style.marginBottom(config, value)),
      marginLeft: (value) => from(Style.marginLeft(config, value)),
      marginBackground: (color) => from(Style.marginBackground(config, color)),

      // Border methods
      border: (border) => from(Style.border(config, border)),
      borderForeground: (color) => from(Style.borderForeground(config, color)),
      borderBackground: (color) => from(Style.borderBackground(config, color)),
      borderTopForeground: (color) => from(Style.borderTopForeground(config, color)),
      borderRightForeground: (color) => from(Style.borderRightForeground(config, color)),
      borderBottomForeground: (color) => from(Style.borderBottomForeground(config, color)),
      borderLeftForeground: (color) => from(Style.borderLeftForeground(config, color)),
      borderTopBackground: (color) => from(Style.borderTopBackground(config, color)),
      borderRightBackground: (color) => from(Style.borderRightBackground(config, color)),
      borderBottomBackground: (color) => from(Style.borderBottomBackground(config, color)),
      borderLeftBackground: (color) => from(Style.borderLeftBackground(config, color)),

      // Alignment methods
      align: (horizontal, vertical) => from(Style.align(config, horizontal, vertical)),
      alignHorizontal: (alignment) => from(Style.alignHorizontal(config, alignment)),
      alignVertical: (alignment) => from(Style.alignVertical(config, alignment)),

      // Content methods
      setString: (content) => from(Style.setString(config, content)),
      transform: (transform) => from(Style.transform(config, transform)),

      // Inheritance methods
      inherit: (parent) => from(Style.inherit(config, parent)),

      // Unset methods
      unsetBold: () => from(Style.unsetBold(config)),
      unsetItalic: () => from(Style.unsetItalic(config)),
      unsetUnderline: () => from(Style.unsetUnderline(config)),
      unsetStrikethrough: () => from(Style.unsetStrikethrough(config)),
      unsetReverse: () => from(Style.unsetReverse(config)),
      unsetBlink: () => from(Style.unsetBlink(config)),
      unsetFaint: () => from(Style.unsetFaint(config)),
      unsetForeground: () => from(Style.unsetForeground(config)),
      unsetBackground: () => from(Style.unsetBackground(config)),
      unsetWidth: () => from(Style.unsetWidth(config)),
      unsetHeight: () => from(Style.unsetHeight(config)),
      unsetMaxWidth: () => from(Style.unsetMaxWidth(config)),
      unsetMaxHeight: () => from(Style.unsetMaxHeight(config)),
      unsetPadding: () => from(Style.unsetPadding(config)),
      unsetMargin: () => from(Style.unsetMargin(config)),
      unsetBorder: () => from(Style.unsetBorder(config)),

      // Terminal methods
      build: () => config,
      render: (text) => Style.render(config, text),
      toString: () => Style.renderString(config),
      copy: () => from(Style.copy(config)),
    };
  };
}

/**
 * StyleBuilder namespace providing factory functions for fluent API
 */
export namespace StyleBuilder {
  /**
   * Creates a new style builder with empty configuration
   * @returns New StyleChain for method chaining
   */
  export const create = (): StyleChain => StyleChain.from(Style.create());

  /**
   * Creates a style builder from existing properties
   * @param properties - Style properties to start with
   * @returns New StyleChain for method chaining
   */
  export const from = (properties: StyleProperties): StyleChain =>
    StyleChain.from(Style.from(properties));
}

// Export both interface and namespace
export { StyleChain };
