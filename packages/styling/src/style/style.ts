import { ANSI } from '@tui/styling/ansi/ansi';
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

    if (transformedText === '') {
      return '';
    }

    return applyAnsiFormatting(style, transformedText);
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
 * Function chaining builder for fluent style API
 * Provides method chaining while maintaining functional principles
 */
export class StyleChain {
  constructor(private readonly config: StyleProperties) {}

  // Text formatting methods
  bold(value = true): StyleChain {
    return new StyleChain(Style.bold(this.config, value));
  }

  italic(value = true): StyleChain {
    return new StyleChain(Style.italic(this.config, value));
  }

  underline(value = true): StyleChain {
    return new StyleChain(Style.underline(this.config, value));
  }

  strikethrough(value = true): StyleChain {
    return new StyleChain(Style.strikethrough(this.config, value));
  }

  reverse(value = true): StyleChain {
    return new StyleChain(Style.reverse(this.config, value));
  }

  blink(value = true): StyleChain {
    return new StyleChain(Style.blink(this.config, value));
  }

  faint(value = true): StyleChain {
    return new StyleChain(Style.faint(this.config, value));
  }

  underlineSpaces(value = true): StyleChain {
    return new StyleChain(Style.underlineSpaces(this.config, value));
  }

  strikethroughSpaces(value = true): StyleChain {
    return new StyleChain(Style.strikethroughSpaces(this.config, value));
  }

  colorWhitespace(value = true): StyleChain {
    return new StyleChain(Style.colorWhitespace(this.config, value));
  }

  // Color methods
  foreground(color: ColorValue | string | number): StyleChain {
    return new StyleChain(Style.foreground(this.config, color));
  }

  background(color: ColorValue | string | number): StyleChain {
    return new StyleChain(Style.background(this.config, color));
  }

  // Size and layout methods
  width(width: number): StyleChain {
    return new StyleChain(Style.width(this.config, width));
  }

  height(height: number): StyleChain {
    return new StyleChain(Style.height(this.config, height));
  }

  maxWidth(maxWidth: number): StyleChain {
    return new StyleChain(Style.maxWidth(this.config, maxWidth));
  }

  maxHeight(maxHeight: number): StyleChain {
    return new StyleChain(Style.maxHeight(this.config, maxHeight));
  }

  inline(value = true): StyleChain {
    return new StyleChain(Style.inline(this.config, value));
  }

  tabWidth(width: number): StyleChain {
    return new StyleChain(Style.tabWidth(this.config, width));
  }

  // Padding methods
  padding(top: number, right?: number, bottom?: number, left?: number): StyleChain {
    return new StyleChain(Style.padding(this.config, top, right, bottom, left));
  }

  paddingTop(value: number): StyleChain {
    return new StyleChain(Style.paddingTop(this.config, value));
  }

  paddingRight(value: number): StyleChain {
    return new StyleChain(Style.paddingRight(this.config, value));
  }

  paddingBottom(value: number): StyleChain {
    return new StyleChain(Style.paddingBottom(this.config, value));
  }

  paddingLeft(value: number): StyleChain {
    return new StyleChain(Style.paddingLeft(this.config, value));
  }

  // Margin methods
  margin(top: number, right?: number, bottom?: number, left?: number): StyleChain {
    return new StyleChain(Style.margin(this.config, top, right, bottom, left));
  }

  marginTop(value: number): StyleChain {
    return new StyleChain(Style.marginTop(this.config, value));
  }

  marginRight(value: number): StyleChain {
    return new StyleChain(Style.marginRight(this.config, value));
  }

  marginBottom(value: number): StyleChain {
    return new StyleChain(Style.marginBottom(this.config, value));
  }

  marginLeft(value: number): StyleChain {
    return new StyleChain(Style.marginLeft(this.config, value));
  }

  marginBackground(color: ColorValue | string | number): StyleChain {
    return new StyleChain(Style.marginBackground(this.config, color));
  }

  // Alignment methods
  align(
    horizontal: HorizontalPosition | TextAlignment,
    vertical?: VerticalPosition | VerticalAlignment
  ): StyleChain {
    return new StyleChain(Style.align(this.config, horizontal, vertical));
  }

  alignHorizontal(alignment: HorizontalPosition | TextAlignment): StyleChain {
    return new StyleChain(Style.alignHorizontal(this.config, alignment));
  }

  alignVertical(alignment: VerticalPosition | VerticalAlignment): StyleChain {
    return new StyleChain(Style.alignVertical(this.config, alignment));
  }

  // Content methods
  setString(content: string): StyleChain {
    return new StyleChain(Style.setString(this.config, content));
  }

  transform(transform: TextTransform): StyleChain {
    return new StyleChain(Style.transform(this.config, transform));
  }

  // Inheritance methods
  inherit(parent: StyleProperties): StyleChain {
    return new StyleChain(Style.inherit(this.config, parent));
  }

  // Unset methods
  unsetBold(): StyleChain {
    return new StyleChain(Style.unsetBold(this.config));
  }

  unsetItalic(): StyleChain {
    return new StyleChain(Style.unsetItalic(this.config));
  }

  unsetUnderline(): StyleChain {
    return new StyleChain(Style.unsetUnderline(this.config));
  }

  unsetStrikethrough(): StyleChain {
    return new StyleChain(Style.unsetStrikethrough(this.config));
  }

  unsetReverse(): StyleChain {
    return new StyleChain(Style.unsetReverse(this.config));
  }

  unsetBlink(): StyleChain {
    return new StyleChain(Style.unsetBlink(this.config));
  }

  unsetFaint(): StyleChain {
    return new StyleChain(Style.unsetFaint(this.config));
  }

  unsetForeground(): StyleChain {
    return new StyleChain(Style.unsetForeground(this.config));
  }

  unsetBackground(): StyleChain {
    return new StyleChain(Style.unsetBackground(this.config));
  }

  unsetWidth(): StyleChain {
    return new StyleChain(Style.unsetWidth(this.config));
  }

  unsetHeight(): StyleChain {
    return new StyleChain(Style.unsetHeight(this.config));
  }

  unsetMaxWidth(): StyleChain {
    return new StyleChain(Style.unsetMaxWidth(this.config));
  }

  unsetMaxHeight(): StyleChain {
    return new StyleChain(Style.unsetMaxHeight(this.config));
  }

  unsetPadding(): StyleChain {
    return new StyleChain(Style.unsetPadding(this.config));
  }

  unsetMargin(): StyleChain {
    return new StyleChain(Style.unsetMargin(this.config));
  }

  // Terminal methods
  build(): StyleProperties {
    return this.config;
  }

  render(text?: string): string {
    return Style.render(this.config, text);
  }

  toString(): string {
    return Style.renderString(this.config);
  }

  copy(): StyleChain {
    return new StyleChain(Style.copy(this.config));
  }
}

/**
 * StyleBuilder namespace providing factory functions for fluent API
 */
export namespace StyleBuilder {
  /**
   * Creates a new style builder with empty configuration
   * @returns New StyleChain for method chaining
   */
  export const create = (): StyleChain => new StyleChain(Style.create());

  /**
   * Creates a style builder from existing properties
   * @param properties - Style properties to start with
   * @returns New StyleChain for method chaining
   */
  export const from = (properties: StyleProperties): StyleChain =>
    new StyleChain(Style.from(properties));
}
