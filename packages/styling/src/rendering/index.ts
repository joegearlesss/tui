/**
 * Core Rendering Engine
 * 
 * Provides comprehensive visual rendering capabilities for terminal user interfaces.
 * This module implements the core rendering pipeline that converts style properties
 * into actual terminal output with ANSI escape sequences.
 */

export { AnsiGenerator } from './ansi-generator';
export { TextRenderer } from './text-renderer';
export { LayoutRenderer } from './layout-renderer';
export { CanvasRenderer } from './canvas-renderer';
export { EnhancedLayout } from './enhanced-layout';
export { UnifiedLayout, LayoutFactory } from './layout-integration';

export type {
  AnsiRenderOptions,
  AnsiRenderResult
} from './ansi-generator';

export type {
  TextRenderOptions,
  TextRenderResult
} from './text-renderer';

export type {
  LayoutDimensions,
  LayoutPosition,
  LayoutBox,
  JoinOptions
} from './layout-renderer';

export type {
  CanvasDimensions,
  CanvasLayer,
  CanvasRenderOptions,
  CanvasRenderResult
} from './canvas-renderer';

export type {
  LayoutBlock,
  EnhancedJoinOptions,
  LayoutResult
} from './enhanced-layout';

export type {
  UnifiedJoinOptions
} from './layout-integration';

/**
 * Main Rendering Engine namespace
 * Provides high-level API for terminal rendering operations
 */
export namespace RenderingEngine {
  
  /**
   * Renders text with full styling support
   * @param text - Text to render
   * @param style - Style properties
   * @returns Rendered text with ANSI codes
   */
  export const renderText = TextRenderer.render;

  /**
   * Joins content horizontally with alignment options
   * @param blocks - Content blocks to join
   * @param options - Join options
   * @returns Horizontally joined content
   */
  export const joinHorizontal = LayoutRenderer.joinHorizontal;

  /**
   * Joins content vertically with alignment options
   * @param blocks - Content blocks to join
   * @param options - Join options
   * @returns Vertically joined content
   */
  export const joinVertical = LayoutRenderer.joinVertical;

  /**
   * Renders multi-layer canvas composition
   * @param layers - Canvas layers to render
   * @param dimensions - Canvas dimensions
   * @param options - Rendering options
   * @returns Rendered canvas
   */
  export const renderCanvas = CanvasRenderer.render;

  /**
   * Generates optimized ANSI codes for terminal output
   * @param style - Style properties
   * @param options - Generation options
   * @returns ANSI escape sequences
   */
  export const generateAnsi = AnsiGenerator.generateCodes;

  /**
   * Measures visual dimensions of text content
   * @param text - Text to measure
   * @returns Object with width and height properties
   */
  export const measureText = (text: string) => ({
    width: AnsiGenerator.measureWidth(text),
    height: AnsiGenerator.measureHeight(text)
  });

  /**
   * Strips ANSI codes from text
   * @param text - Text with ANSI codes
   * @returns Plain text
   */
  export const stripAnsi = AnsiGenerator.strip;
}