import { describe, test, expect } from 'bun:test';
import { Result } from '../utils/result';
import { CanvasValidation } from './validation';
import type { LayerPosition, CanvasDimensions, LayerDimensions } from './validation';

describe('Canvas Validation - Result Types', () => {
  describe('validateLayerConfigSafe', () => {
    test('returns Ok for valid layer configuration', () => {
      const validLayer = {
        content: 'Hello World\nLine 2',
        x: 10,
        y: 5,
      };

      const result = CanvasValidation.validateLayerConfigSafe(validLayer);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('Hello World\nLine 2');
        expect(result.value.x).toBe(10);
        expect(result.value.y).toBe(5);
      }
    });

    test('returns Ok with default values for minimal configuration', () => {
      const minimalLayer = {
        content: 'Hello',
      };

      const result = CanvasValidation.validateLayerConfigSafe(minimalLayer);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('Hello');
        expect(result.value.x).toBe(0);
        expect(result.value.y).toBe(0);
      }
    });

    test('returns Err for invalid layer configuration', () => {
      const invalidLayer = {
        content: 123, // Invalid: not a string
        x: -1, // Invalid: negative
        y: 'not a number', // Invalid: not a number
      };

      const result = CanvasValidation.validateLayerConfigSafe(invalidLayer);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateCanvasConfigSafe', () => {
    test('returns Ok for valid canvas configuration', () => {
      const validCanvas = {
        layers: ['layer1', 'layer2', 'layer3'],
      };

      const result = CanvasValidation.validateCanvasConfigSafe(validCanvas);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.layers).toEqual(['layer1', 'layer2', 'layer3']);
      }
    });

    test('returns Ok for empty canvas', () => {
      const emptyCanvas = {
        layers: [],
      };

      const result = CanvasValidation.validateCanvasConfigSafe(emptyCanvas);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.layers).toEqual([]);
      }
    });

    test('returns Err for invalid canvas configuration', () => {
      const invalidCanvas = {
        layers: 'not an array', // Invalid: not an array
      };

      const result = CanvasValidation.validateCanvasConfigSafe(invalidCanvas);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateLayerPositionSafe', () => {
    test('returns Ok for valid position coordinates', () => {
      const validPosition: LayerPosition = {
        x: 25,
        y: 10,
      };

      const result = CanvasValidation.validateLayerPositionSafe(validPosition);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.x).toBe(25);
        expect(result.value.y).toBe(10);
      }
    });

    test('returns Ok for zero coordinates', () => {
      const zeroPosition: LayerPosition = {
        x: 0,
        y: 0,
      };

      const result = CanvasValidation.validateLayerPositionSafe(zeroPosition);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.x).toBe(0);
        expect(result.value.y).toBe(0);
      }
    });

    test('returns Err for invalid position coordinates', () => {
      const invalidPosition = {
        x: -5, // Invalid: negative
        y: 10.5, // Invalid: not an integer
      };

      const result = CanvasValidation.validateLayerPositionSafe(invalidPosition);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateCanvasDimensionsSafe', () => {
    test('returns Ok for valid canvas dimensions', () => {
      const validDimensions: CanvasDimensions = {
        width: 100,
        height: 50,
      };

      const result = CanvasValidation.validateCanvasDimensionsSafe(validDimensions);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.width).toBe(100);
        expect(result.value.height).toBe(50);
      }
    });

    test('returns Err for invalid canvas dimensions', () => {
      const invalidDimensions = {
        width: -10, // Invalid: negative
        height: 'not a number', // Invalid: not a number
      };

      const result = CanvasValidation.validateCanvasDimensionsSafe(invalidDimensions);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateLayerDimensionsSafe', () => {
    test('returns Ok for valid layer dimensions', () => {
      const validDimensions: LayerDimensions = {
        width: 80,
        height: 5,
      };

      const result = CanvasValidation.validateLayerDimensionsSafe(validDimensions);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.width).toBe(80);
        expect(result.value.height).toBe(5);
      }
    });

    test('returns Err for invalid layer dimensions', () => {
      const invalidDimensions = {
        width: 0, // Invalid: should be positive
        height: 0, // Invalid: should be at least 1
      };

      const result = CanvasValidation.validateLayerDimensionsSafe(invalidDimensions);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateLayerContentSafe', () => {
    test('returns Ok for valid layer content', () => {
      const validContent = 'Hello World\n\x1b[31mRed text\x1b[0m';

      const result = CanvasValidation.validateLayerContentSafe(validContent);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('Hello World\n\x1b[31mRed text\x1b[0m');
      }
    });

    test('returns Ok for empty string content', () => {
      const emptyContent = '';

      const result = CanvasValidation.validateLayerContentSafe(emptyContent);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('');
      }
    });

    test('returns Err for non-string content', () => {
      const invalidContent = 123;

      const result = CanvasValidation.validateLayerContentSafe(invalidContent);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateLayerIndexSafe', () => {
    test('returns Ok for valid layer index', () => {
      const validIndex = 2;
      const maxIndex = 5;

      const result = CanvasValidation.validateLayerIndexSafe(validIndex, maxIndex);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(2);
      }
    });

    test('returns Ok for boundary values', () => {
      const zeroIndex = 0;
      const maxIndex = 3;

      const result1 = CanvasValidation.validateLayerIndexSafe(zeroIndex, maxIndex);
      const result2 = CanvasValidation.validateLayerIndexSafe(maxIndex, maxIndex);
      
      expect(Result.isOk(result1)).toBe(true);
      expect(Result.isOk(result2)).toBe(true);
    });

    test('returns Err for invalid layer index', () => {
      const invalidIndex = 10; // Exceeds maxIndex
      const maxIndex = 5;

      const result = CanvasValidation.validateLayerIndexSafe(invalidIndex, maxIndex);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    test('returns Err for negative index', () => {
      const negativeIndex = -1;
      const maxIndex = 5;

      const result = CanvasValidation.validateLayerIndexSafe(negativeIndex, maxIndex);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Functional composition with Result types', () => {
    test('can chain canvas validation operations', () => {
      const layerData = {
        content: 'Test Layer',
        x: 10,
        y: 5,
      };

      const result = Result.chain(
        CanvasValidation.validateLayerConfigSafe(layerData),
        (layer) => {
          // Additional validation logic
          const hasContent = layer.content.length > 0;
          return hasContent 
            ? Result.ok(layer)
            : Result.err(new Error('Layer must have content'));
        }
      );

      expect(Result.isOk(result)).toBe(true);
    });

    test('can map canvas validation results', () => {
      const layerData = {
        content: 'Test Layer',
        x: 5,
        y: 3,
      };

      const result = Result.map(
        CanvasValidation.validateLayerConfigSafe(layerData),
        (layer) => ({
          ...layer,
          validated: true,
        })
      );

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.validated).toBe(true);
      }
    });

    test('can handle multiple layer validations with Result.all', () => {
      const layers = [
        { content: 'Layer 1', x: 0, y: 0 },
        { content: 'Layer 2', x: 10, y: 5 },
        { content: 'Layer 3', x: 20, y: 10 },
      ];
      
      const validations = layers.map(layer => CanvasValidation.validateLayerConfigSafe(layer));
      const allResults = Result.all(validations);
      
      expect(Result.isOk(allResults)).toBe(true);
      if (Result.isOk(allResults)) {
        expect(allResults.value.length).toBe(3);
        expect(allResults.value[0]).toBeDefined();
        expect(allResults.value[1]).toBeDefined();
        expect(allResults.value[2]).toBeDefined();
        expect(allResults.value[0]!.content).toBe('Layer 1');
        expect(allResults.value[1]!.x).toBe(10);
        expect(allResults.value[2]!.y).toBe(10);
      }
    });

    test('can provide fallback values on validation failure', () => {
      const invalidData = { invalid: 'data' };
      
      const defaultLayer = {
        content: 'Default Layer',
        x: 0,
        y: 0,
      };

      const result = CanvasValidation.validateLayerConfigSafe(invalidData);
      const finalLayer = Result.unwrapOr(result, defaultLayer);
      
      expect(finalLayer).toBe(defaultLayer);
      expect(finalLayer.content).toBe('Default Layer');
    });

    test('can handle complex validation workflows', () => {
      const layerData = {
        content: 'Multi-line\nLayer Content',
        x: 15,
        y: 8,
      };

      const positionData = { x: 15, y: 8 };

      // Validate both layer config and position separately, then combine
      const layerResult = CanvasValidation.validateLayerConfigSafe(layerData);
      const positionResult = CanvasValidation.validateLayerPositionSafe(positionData);

      const combinedResult = Result.chain(
        Result.all([layerResult, positionResult]),
        ([layer, position]) => {
          if (!layer || !position) {
            return Result.err(new Error('Layer or position validation failed'));
          }
          const isConsistent = layer.x === position.x && layer.y === position.y;
          return isConsistent
            ? Result.ok({ layer, position })
            : Result.err(new Error('Layer and position coordinates must match'));
        }
      );

      expect(Result.isOk(combinedResult)).toBe(true);
      if (Result.isOk(combinedResult)) {
        expect(combinedResult.value.layer).toBeDefined();
        expect(combinedResult.value.position).toBeDefined();
        expect(combinedResult.value.layer!.content).toBe('Multi-line\nLayer Content');
        expect(combinedResult.value.position!.x).toBe(15);
      }
    });
  });
});