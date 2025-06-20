/**
 * Canvas and Layer Validation
 *
 * Zod schemas for validating Canvas and Layer configurations with comprehensive descriptions
 */

import { z } from 'zod';

/**
 * Schema for layer position coordinates
 */
export const LayerPositionSchema = z.object({
  x: z.number()
    .int('X position must be an integer')
    .min(0, 'X position must be non-negative')
    .describe('Horizontal position of the layer in character units from the left edge'),
  y: z.number()
    .int('Y position must be an integer')
    .min(0, 'Y position must be non-negative')
    .describe('Vertical position of the layer in character units from the top edge')
}).describe('Position coordinates for placing a layer on the canvas');

/**
 * Schema for layer configuration with content and positioning
 */
export const LayerConfigSchema = z.object({
  content: z.string()
    .describe('Text content of the layer, can include ANSI escape sequences and newlines'),
  x: z.number()
    .int('X position must be an integer')
    .min(0, 'X position must be non-negative')
    .default(0)
    .describe('Horizontal position of the layer in character units from the left edge'),
  y: z.number()
    .int('Y position must be an integer')
    .min(0, 'Y position must be non-negative')
    .default(0)
    .describe('Vertical position of the layer in character units from the top edge')
}).describe('Complete configuration for a layer including content and position');

/**
 * Schema for canvas configuration containing multiple layers
 */
export const CanvasConfigSchema = z.object({
  layers: z.array(z.any())
    .describe('Array of Layer instances to be composited on the canvas')
}).describe('Configuration for a canvas containing multiple positioned layers');

/**
 * Schema for canvas dimensions calculated from layer positions and content
 */
export const CanvasDimensionsSchema = z.object({
  width: z.number()
    .int('Width must be an integer')
    .min(0, 'Width must be non-negative')
    .describe('Total width of the canvas in character units'),
  height: z.number()
    .int('Height must be an integer')
    .min(0, 'Height must be non-negative')
    .describe('Total height of the canvas in character units')
}).describe('Dimensions of a canvas calculated from its layers');

/**
 * Schema for layer dimensions calculated from content
 */
export const LayerDimensionsSchema = z.object({
  width: z.number()
    .int('Width must be an integer')
    .min(0, 'Width must be non-negative')
    .describe('Width of the layer content in character units (excluding ANSI codes)'),
  height: z.number()
    .int('Height must be an integer')
    .min(1, 'Height must be at least 1')
    .describe('Height of the layer content in lines')
}).describe('Dimensions of a layer calculated from its content');

/**
 * Validation utilities for canvas and layer operations
 */
export namespace CanvasValidation {
  /**
   * Validates layer configuration
   * @param config - Layer configuration to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateLayerConfig = (config: unknown) => {
    return LayerConfigSchema.safeParse(config);
  };

  /**
   * Validates canvas configuration
   * @param config - Canvas configuration to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateCanvasConfig = (config: unknown) => {
    return CanvasConfigSchema.safeParse(config);
  };

  /**
   * Validates layer position coordinates
   * @param position - Position coordinates to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateLayerPosition = (position: unknown) => {
    return LayerPositionSchema.safeParse(position);
  };

  /**
   * Validates canvas dimensions
   * @param dimensions - Dimensions object to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateCanvasDimensions = (dimensions: unknown) => {
    return CanvasDimensionsSchema.safeParse(dimensions);
  };

  /**
   * Validates layer dimensions
   * @param dimensions - Dimensions object to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateLayerDimensions = (dimensions: unknown) => {
    return LayerDimensionsSchema.safeParse(dimensions);
  };

  /**
   * Validates content string for layers
   * @param content - Content string to validate
   * @returns Validation result with parsed data or errors
   */
  export const validateLayerContent = (content: unknown) => {
    const ContentSchema = z.string()
      .describe('Layer content must be a string, can contain ANSI codes and newlines');
    return ContentSchema.safeParse(content);
  };

  /**
   * Validates layer index for canvas operations
   * @param index - Index to validate
   * @param maxIndex - Maximum allowed index
   * @returns Validation result with parsed data or errors
   */
  export const validateLayerIndex = (index: unknown, maxIndex: number) => {
    const IndexSchema = z.number()
      .int('Index must be an integer')
      .min(0, 'Index must be non-negative')
      .max(maxIndex, `Index must be less than or equal to ${maxIndex}`)
      .describe('Layer index for canvas operations');
    return IndexSchema.safeParse(index);
  };
}

// Type exports for the schemas
export type LayerPosition = z.infer<typeof LayerPositionSchema>;
export type LayerConfigValidated = z.infer<typeof LayerConfigSchema>;
export type CanvasConfigValidated = z.infer<typeof CanvasConfigSchema>;
export type CanvasDimensions = z.infer<typeof CanvasDimensionsSchema>;
export type LayerDimensions = z.infer<typeof LayerDimensionsSchema>;