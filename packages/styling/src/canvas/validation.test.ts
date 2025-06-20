/**
 * Canvas Validation Tests
 *
 * Tests for Canvas and Layer Zod schema validation
 */

import { describe, expect, test } from 'bun:test';
import {
  CanvasValidation,
  LayerConfigSchema,
  CanvasConfigSchema,
  LayerPositionSchema,
  CanvasDimensionsSchema,
  LayerDimensionsSchema
} from './validation';
import { newLayer } from './layer';

describe('Canvas Validation', () => {
  describe('LayerConfigSchema', () => {
    test('should validate valid layer configuration', () => {
      const validConfig = {
        content: 'Hello World',
        x: 10,
        y: 5
      };

      const result = LayerConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfig);
      }
    });

    test('should provide defaults for missing position values', () => {
      const configWithoutPosition = {
        content: 'Test content'
      };

      const result = LayerConfigSchema.safeParse(configWithoutPosition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('Test content');
        expect(result.data.x).toBe(0);
        expect(result.data.y).toBe(0);
      }
    });

    test('should reject negative position values', () => {
      const invalidConfig = {
        content: 'Test',
        x: -5,
        y: 10
      };

      const result = LayerConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('should reject non-integer position values', () => {
      const invalidConfig = {
        content: 'Test',
        x: 5.5,
        y: 10
      };

      const result = LayerConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('should reject missing content', () => {
      const invalidConfig = {
        x: 5,
        y: 10
      };

      const result = LayerConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('should accept empty string content', () => {
      const validConfig = {
        content: '',
        x: 0,
        y: 0
      };

      const result = LayerConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    test('should accept content with ANSI codes', () => {
      const validConfig = {
        content: '\x1b[31mRed text\x1b[0m',
        x: 0,
        y: 0
      };

      const result = LayerConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    test('should accept multiline content', () => {
      const validConfig = {
        content: 'Line 1\nLine 2\nLine 3',
        x: 5,
        y: 10
      };

      const result = LayerConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('CanvasConfigSchema', () => {
    test('should validate valid canvas configuration', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const validConfig = {
        layers: [layer1, layer2]
      };

      const result = CanvasConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.layers).toHaveLength(2);
      }
    });

    test('should validate empty layers array', () => {
      const validConfig = {
        layers: []
      };

      const result = CanvasConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    test('should reject missing layers property', () => {
      const invalidConfig = {};

      const result = CanvasConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    test('should reject non-array layers', () => {
      const invalidConfig = {
        layers: 'not an array'
      };

      const result = CanvasConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('LayerPositionSchema', () => {
    test('should validate valid position coordinates', () => {
      const validPosition = { x: 15, y: 25 };

      const result = LayerPositionSchema.safeParse(validPosition);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPosition);
      }
    });

    test('should accept zero coordinates', () => {
      const validPosition = { x: 0, y: 0 };

      const result = LayerPositionSchema.safeParse(validPosition);
      expect(result.success).toBe(true);
    });

    test('should reject negative coordinates', () => {
      const invalidPosition1 = { x: -1, y: 5 };
      const invalidPosition2 = { x: 5, y: -1 };

      const result1 = LayerPositionSchema.safeParse(invalidPosition1);
      const result2 = LayerPositionSchema.safeParse(invalidPosition2);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    test('should reject non-integer coordinates', () => {
      const invalidPosition = { x: 5.5, y: 10.7 };

      const result = LayerPositionSchema.safeParse(invalidPosition);
      expect(result.success).toBe(false);
    });

    test('should reject missing coordinates', () => {
      const invalidPosition1 = { x: 5 };
      const invalidPosition2 = { y: 5 };

      const result1 = LayerPositionSchema.safeParse(invalidPosition1);
      const result2 = LayerPositionSchema.safeParse(invalidPosition2);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe('DimensionsSchemas', () => {
    test('should validate canvas dimensions', () => {
      const validDimensions = { width: 100, height: 50 };

      const result = CanvasDimensionsSchema.safeParse(validDimensions);
      expect(result.success).toBe(true);
    });

    test('should validate layer dimensions', () => {
      const validDimensions = { width: 20, height: 3 };

      const result = LayerDimensionsSchema.safeParse(validDimensions);
      expect(result.success).toBe(true);
    });

    test('should reject zero height for layers', () => {
      const invalidDimensions = { width: 20, height: 0 };

      const result = LayerDimensionsSchema.safeParse(invalidDimensions);
      expect(result.success).toBe(false);
    });

    test('should accept zero width for both canvas and layers', () => {
      const canvasDims = { width: 0, height: 10 };
      const layerDims = { width: 0, height: 1 };

      const canvasResult = CanvasDimensionsSchema.safeParse(canvasDims);
      const layerResult = LayerDimensionsSchema.safeParse(layerDims);

      expect(canvasResult.success).toBe(true);
      expect(layerResult.success).toBe(true);
    });
  });

  describe('CanvasValidation namespace', () => {
    test('validateLayerConfig should work correctly', () => {
      const validConfig = { content: 'Test', x: 5, y: 10 };
      const invalidConfig = { content: 'Test', x: -5, y: 10 };

      const validResult = CanvasValidation.validateLayerConfig(validConfig);
      const invalidResult = CanvasValidation.validateLayerConfig(invalidConfig);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validateCanvasConfig should work correctly', () => {
      const validConfig = { layers: [newLayer('test')] };
      const invalidConfig = { layers: 'not an array' };

      const validResult = CanvasValidation.validateCanvasConfig(validConfig);
      const invalidResult = CanvasValidation.validateCanvasConfig(invalidConfig);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validateLayerPosition should work correctly', () => {
      const validPosition = { x: 5, y: 10 };
      const invalidPosition = { x: -5, y: 10 };

      const validResult = CanvasValidation.validateLayerPosition(validPosition);
      const invalidResult = CanvasValidation.validateLayerPosition(invalidPosition);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validateLayerContent should work correctly', () => {
      const validContent = 'Hello World';
      const invalidContent = 123;

      const validResult = CanvasValidation.validateLayerContent(validContent);
      const invalidResult = CanvasValidation.validateLayerContent(invalidContent);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validateLayerIndex should work correctly', () => {
      const validIndex = 2;
      const negativeIndex = -1;
      const tooLargeIndex = 10;
      const nonIntegerIndex = 2.5;

      const validResult = CanvasValidation.validateLayerIndex(validIndex, 5);
      const negativeResult = CanvasValidation.validateLayerIndex(negativeIndex, 5);
      const tooLargeResult = CanvasValidation.validateLayerIndex(tooLargeIndex, 5);
      const nonIntegerResult = CanvasValidation.validateLayerIndex(nonIntegerIndex, 5);

      expect(validResult.success).toBe(true);
      expect(negativeResult.success).toBe(false);
      expect(tooLargeResult.success).toBe(false);
      expect(nonIntegerResult.success).toBe(false);
    });

    test('validateCanvasDimensions should work correctly', () => {
      const validDimensions = { width: 100, height: 50 };
      const invalidDimensions = { width: -10, height: 50 };

      const validResult = CanvasValidation.validateCanvasDimensions(validDimensions);
      const invalidResult = CanvasValidation.validateCanvasDimensions(invalidDimensions);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validateLayerDimensions should work correctly', () => {
      const validDimensions = { width: 20, height: 3 };
      const invalidDimensions = { width: 20, height: 0 };

      const validResult = CanvasValidation.validateLayerDimensions(validDimensions);
      const invalidResult = CanvasValidation.validateLayerDimensions(invalidDimensions);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Schema descriptions', () => {
    test('schemas should have meaningful descriptions', () => {
      expect(LayerConfigSchema.description).toContain('layer');
      expect(CanvasConfigSchema.description).toContain('canvas');
      expect(LayerPositionSchema.description).toContain('Position');
      expect(CanvasDimensionsSchema.description).toContain('canvas');
      expect(LayerDimensionsSchema.description).toContain('layer');
    });

    test('schema properties should have descriptions', () => {
      const layerConfigShape = LayerConfigSchema._def.shape();
      expect(layerConfigShape.content.description).toContain('content');
      expect(layerConfigShape.x.description).toContain('position');
      expect(layerConfigShape.y.description).toContain('position');
    });
  });
});