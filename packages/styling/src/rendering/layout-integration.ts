import { Layout as ExistingLayout, Measurement } from '../layout/joining';
import { EnhancedLayout, type LayoutBlock, type EnhancedJoinOptions } from './enhanced-layout';
import { LayoutRenderer } from './layout-renderer';
import type { StyleProperties } from '@tui/styling/style/style';
import type { HorizontalPosition, VerticalPosition, TextAlignment } from '@tui/styling/types';
import { Result } from '@tui/styling/utils/result';

/**
 * Layout Integration System
 * Provides a unified interface that combines the existing layout system
 * with the new enhanced rendering capabilities
 */

export interface UnifiedJoinOptions {
  readonly separator?: string;
  readonly spacing?: number;
  readonly style?: StyleProperties;
  readonly respectTerminalCapabilities?: boolean;
  readonly useEnhanced?: boolean; // Whether to use enhanced layout features
}

/**
 * Unified Layout namespace providing both legacy and enhanced layout operations
 */
export namespace UnifiedLayout {

  /**
   * Joins content horizontally with backward compatibility
   * @param align - Vertical alignment position
   * @param blocks - Content blocks to join
   * @param options - Optional join options for enhanced features
   * @returns Joined content
   */
  export const joinHorizontal = (
    align: VerticalAlignment | number,
    blocks: readonly string[],
    options?: UnifiedJoinOptions
  ): string => {
    // If no enhanced options are provided, use the original implementation
    if (!options || !options.useEnhanced) {
      return ExistingLayout.joinHorizontal(align, ...blocks);
    }

    // Convert strings to LayoutBlocks for enhanced processing
    const layoutBlocks: LayoutBlock[] = blocks.map(content => ({ content }));
    
    const enhancedOptions: EnhancedJoinOptions = {
      separator: options.separator,
      spacing: options.spacing,
      alignment: convertVerticalAlignment(align),
      style: options.style,
      respectTerminalCapabilities: options.respectTerminalCapabilities
    };

    const result = EnhancedLayout.joinHorizontal(layoutBlocks, enhancedOptions);
    
    if (Result.isOk(result)) {
      return result.value.content;
    } else {
      // Fallback to original implementation on error
      return ExistingLayout.joinHorizontal(align, ...blocks);
    }
  };

  /**
   * Joins content vertically with backward compatibility
   * @param align - Horizontal alignment position
   * @param blocks - Content blocks to join
   * @param options - Optional join options for enhanced features
   * @returns Joined content
   */
  export const joinVertical = (
    align: HorizontalPosition | number,
    blocks: readonly string[],
    options?: UnifiedJoinOptions
  ): string => {
    // If no enhanced options are provided, use the original implementation
    if (!options || !options.useEnhanced) {
      return ExistingLayout.joinVertical(align, ...blocks);
    }

    // Convert strings to LayoutBlocks for enhanced processing
    const layoutBlocks: LayoutBlock[] = blocks.map(content => ({ content }));
    
    const enhancedOptions: EnhancedJoinOptions = {
      separator: options.separator,
      spacing: options.spacing,
      alignment: convertHorizontalAlignment(align),
      style: options.style,
      respectTerminalCapabilities: options.respectTerminalCapabilities
    };

    const result = EnhancedLayout.joinVertical(layoutBlocks, enhancedOptions);
    
    if (Result.isOk(result)) {
      return result.value.content;
    } else {
      // Fallback to original implementation on error
      return ExistingLayout.joinVertical(align, ...blocks);
    }
  };

  /**
   * Places content with enhanced styling options
   * @param width - Container width
   * @param height - Container height
   * @param hAlign - Horizontal alignment
   * @param vAlign - Vertical alignment
   * @param content - Content to place
   * @param style - Optional style to apply
   * @returns Placed content
   */
  export const place = (
    width: number,
    height: number,
    hAlign: HorizontalPosition | number,
    vAlign: VerticalPosition | number,
    content: string,
    style?: StyleProperties
  ): string => {
    if (!style) {
      // Use original implementation if no styling needed
      return ExistingLayout.place(width, height, hAlign, vAlign, content);
    }

    // Use enhanced layout renderer for styled placement
    const placeResult = LayoutRenderer.placeAt(
      content,
      { x: 0, y: 0 },
      { width, height }
    );

    if (Result.isOk(placeResult)) {
      return placeResult.value;
    } else {
      // Fallback to original implementation
      return ExistingLayout.place(width, height, hAlign, vAlign, content);
    }
  };

  /**
   * Enhanced horizontal joining with full layout block support
   * @param blocks - Array of layout blocks
   * @param options - Enhanced join options
   * @returns Result containing layout result
   */
  export const joinHorizontalEnhanced = (
    blocks: readonly LayoutBlock[],
    options: EnhancedJoinOptions = {}
  ) => {
    return EnhancedLayout.joinHorizontal(blocks, options);
  };

  /**
   * Enhanced vertical joining with full layout block support
   * @param blocks - Array of layout blocks
   * @param options - Enhanced join options
   * @returns Result containing layout result
   */
  export const joinVerticalEnhanced = (
    blocks: readonly LayoutBlock[],
    options: EnhancedJoinOptions = {}
  ) => {
    return EnhancedLayout.joinVertical(blocks, options);
  };

  /**
   * Creates a grid layout
   * @param blocks - Array of layout blocks
   * @param columns - Number of columns
   * @param options - Layout options
   * @returns Result containing grid layout
   */
  export const grid = (
    blocks: readonly LayoutBlock[],
    columns: number,
    options: EnhancedJoinOptions = {}
  ) => {
    return EnhancedLayout.grid(blocks, columns, options);
  };

  /**
   * Creates a flexible layout with weighted distribution
   * @param blocks - Array of layout blocks with weights
   * @param direction - Layout direction
   * @param totalSize - Total size to distribute
   * @param options - Layout options
   * @returns Result containing flexible layout
   */
  export const flexible = (
    blocks: readonly LayoutBlock[],
    direction: 'horizontal' | 'vertical',
    totalSize: number,
    options: EnhancedJoinOptions = {}
  ) => {
    return EnhancedLayout.flexible(blocks, direction, totalSize, options);
  };

  /**
   * Creates a table layout
   * @param rows - Array of table rows
   * @param columnWidths - Column width specifications
   * @param options - Layout options
   * @returns Result containing table layout
   */
  export const table = (
    rows: readonly (readonly LayoutBlock[])[],
    columnWidths: readonly (number | 'auto')[],
    options: EnhancedJoinOptions = {}
  ) => {
    return EnhancedLayout.table(rows, columnWidths, options);
  };

  /**
   * Creates a layout block from content and style
   * @param content - Block content
   * @param style - Optional style properties
   * @param options - Optional block options
   * @returns Layout block
   */
  export const block = (
    content: string,
    style?: StyleProperties,
    options?: {
      width?: number;
      height?: number;
      weight?: number;
    }
  ): LayoutBlock => {
    return {
      content,
      style,
      width: options?.width,
      height: options?.height,
      weight: options?.weight
    };
  };

  /**
   * Measures content dimensions (re-export from existing system)
   */
  export const measure = {
    width: Measurement.width,
    height: Measurement.height,
    size: Measurement.size
  };

  // Helper functions

  /**
   * Converts vertical alignment to text alignment
   */
  const convertVerticalAlignment = (align: VerticalAlignment | number): TextAlignment => {
    if (typeof align === 'number') {
      if (align <= 0.33) return 'left';
      if (align >= 0.67) return 'right';
      return 'center';
    }
    
    switch (align) {
      case 'top': return 'left';
      case 'middle': return 'center';
      case 'bottom': return 'right';
      default: return 'left';
    }
  };

  /**
   * Converts horizontal alignment to text alignment
   */
  const convertHorizontalAlignment = (align: HorizontalPosition | number): TextAlignment => {
    if (typeof align === 'number') {
      if (align <= 0.33) return 'left';
      if (align >= 0.67) return 'right';
      return 'center';
    }
    
    switch (align) {
      case 'left': return 'left';
      case 'center': return 'center';
      case 'right': return 'right';
      default: return 'left';
    }
  };
}

/**
 * Factory functions for common layout patterns
 */
export namespace LayoutFactory {

  /**
   * Creates a header-content-footer layout
   * @param header - Header content block
   * @param content - Main content block
   * @param footer - Footer content block
   * @param options - Layout options
   * @returns Result containing layout
   */
  export const headerContentFooter = (
    header: LayoutBlock,
    content: LayoutBlock,
    footer: LayoutBlock,
    options: EnhancedJoinOptions = {}
  ) => {
    return UnifiedLayout.joinVerticalEnhanced([header, content, footer], {
      ...options,
      spacing: options.spacing || 1
    });
  };

  /**
   * Creates a sidebar-main layout
   * @param sidebar - Sidebar content block
   * @param main - Main content block
   * @param options - Layout options
   * @returns Result containing layout
   */
  export const sidebarMain = (
    sidebar: LayoutBlock,
    main: LayoutBlock,
    options: EnhancedJoinOptions = {}
  ) => {
    return UnifiedLayout.joinHorizontalEnhanced([sidebar, main], {
      ...options,
      spacing: options.spacing || 2
    });
  };

  /**
   * Creates a dashboard layout with multiple sections
   * @param sections - Array of dashboard sections
   * @param columns - Number of columns
   * @param options - Layout options
   * @returns Result containing dashboard layout
   */
  export const dashboard = (
    sections: readonly LayoutBlock[],
    columns: number = 2,
    options: EnhancedJoinOptions = {}
  ) => {
    return UnifiedLayout.grid(sections, columns, {
      ...options,
      spacing: options.spacing || 1
    });
  };

  /**
   * Creates a dialog/modal layout
   * @param title - Dialog title
   * @param content - Dialog content
   * @param actions - Dialog actions
   * @param options - Layout options
   * @returns Result containing dialog layout
   */
  export const dialog = (
    title: LayoutBlock,
    content: LayoutBlock,
    actions: LayoutBlock,
    options: EnhancedJoinOptions = {}
  ) => {
    const dialogBody = UnifiedLayout.joinVerticalEnhanced([
      title,
      content,
      actions
    ], {
      ...options,
      spacing: 1
    });

    // Add border or styling if specified
    return dialogBody;
  };

  /**
   * Creates a responsive column layout
   * @param blocks - Array of content blocks
   * @param minColumnWidth - Minimum column width
   * @param maxColumns - Maximum number of columns
   * @param totalWidth - Total available width
   * @param options - Layout options
   * @returns Result containing responsive layout
   */
  export const responsive = (
    blocks: readonly LayoutBlock[],
    minColumnWidth: number,
    maxColumns: number,
    totalWidth: number,
    options: EnhancedJoinOptions = {}
  ) => {
    // Calculate optimal number of columns
    const possibleColumns = Math.floor(totalWidth / minColumnWidth);
    const columns = Math.min(possibleColumns, maxColumns, blocks.length);
    
    if (columns <= 1) {
      // Use vertical layout for narrow screens
      return UnifiedLayout.joinVerticalEnhanced(blocks, options);
    } else {
      // Use grid layout for wider screens
      return UnifiedLayout.grid(blocks, columns, options);
    }
  };
}