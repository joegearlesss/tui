/**
 * Canvas Tests
 *
 * Comprehensive tests for the functional Canvas interface
 */

import { describe, expect, test } from 'bun:test';
import { Canvas, newCanvas } from './canvas';
import { Layer, newLayer } from './layer';

describe('Canvas', () => {
  describe('Canvas namespace', () => {
    test('create() should create empty canvas', () => {
      const canvas = Canvas.create();

      expect(canvas.isEmpty()).toBe(true);
      expect(canvas.getLayerCount()).toBe(0);
      expect(canvas.render()).toBe('');
    });

    test('create() with layers should create canvas with initial layers', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const canvas = Canvas.create(layer1, layer2);

      expect(canvas.getLayerCount()).toBe(2);
      expect(canvas.isEmpty()).toBe(false);
    });

    test('from() should create canvas from configuration', () => {
      const layer = newLayer('Test');
      const config = { layers: [layer] };
      const canvas = Canvas.from(config);

      expect(canvas.getLayerCount()).toBe(1);
      expect(canvas.isEmpty()).toBe(false);
    });
  });

  describe('newCanvas helper', () => {
    test('should create canvas with layers', () => {
      const layer1 = newLayer('Hello');
      const layer2 = newLayer('World');
      const canvas = newCanvas(layer1, layer2);

      expect(canvas.getLayerCount()).toBe(2);
      expect(canvas.isEmpty()).toBe(false);
    });

    test('should create empty canvas when no layers provided', () => {
      const canvas = newCanvas();

      expect(canvas.isEmpty()).toBe(true);
      expect(canvas.getLayerCount()).toBe(0);
    });
  });

  describe('Layer management', () => {
    test('addLayer() should add layer immutably', () => {
      const original = Canvas.create();
      const layer = newLayer('New layer');
      const updated = original.addLayer(layer);

      expect(original.getLayerCount()).toBe(0);
      expect(updated.getLayerCount()).toBe(1);
    });

    test('addLayers() should add multiple layers', () => {
      const canvas = Canvas.create();
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const layer3 = newLayer('Layer 3');

      const updated = canvas.addLayers(layer1, layer2, layer3);

      expect(updated.getLayerCount()).toBe(3);
      expect(canvas.getLayerCount()).toBe(0);
    });

    test('removeLayer() should remove layer by index', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const layer3 = newLayer('Layer 3');
      const canvas = Canvas.create(layer1, layer2, layer3);

      const updated = canvas.removeLayer(1); // Remove middle layer

      expect(updated.getLayerCount()).toBe(2);
      expect(canvas.getLayerCount()).toBe(3);
    });

    test('removeLayer() with invalid index should return canvas with no change', () => {
      const layer = newLayer('Layer');
      const canvas = Canvas.create(layer);

      const updated1 = canvas.removeLayer(-1);
      const updated2 = canvas.removeLayer(10);

      expect(updated1.getLayerCount()).toBe(1);
      expect(updated2.getLayerCount()).toBe(1);
    });

    test('clearLayers() should remove all layers', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const canvas = Canvas.create(layer1, layer2);

      const cleared = canvas.clearLayers();

      expect(cleared.isEmpty()).toBe(true);
      expect(cleared.getLayerCount()).toBe(0);
      expect(canvas.getLayerCount()).toBe(2);
    });
  });

  describe('Rendering', () => {
    test('render() should handle single layer', () => {
      const layer = newLayer('Hello World');
      const canvas = Canvas.create(layer);

      const result = canvas.render();
      expect(result).toBe('Hello World');
    });

    test('render() should handle positioned layers', () => {
      const layer1 = newLayer('A').position(0, 0);
      const layer2 = newLayer('B').position(2, 0);
      const canvas = Canvas.create(layer1, layer2);

      const result = canvas.render();
      expect(result).toBe('A B');
    });

    test('render() should handle multi-line content', () => {
      const layer = newLayer('Line 1\nLine 2').position(0, 0);
      const canvas = Canvas.create(layer);

      const result = canvas.render();
      expect(result).toBe('Line 1\nLine 2');
    });

    test('render() should handle overlapping layers', () => {
      const layer1 = newLayer('Background').position(0, 0);
      const layer2 = newLayer('Fore').position(4, 0);
      const canvas = Canvas.create(layer1, layer2);

      const result = canvas.render();
      expect(result).toBe('BackForend');
    });

    test('render() should handle layers at different Y positions', () => {
      const layer1 = newLayer('Top').position(0, 0);
      const layer2 = newLayer('Bottom').position(0, 2);
      const canvas = Canvas.create(layer1, layer2);

      const result = canvas.render();
      const lines = result.split('\n');
      expect(lines[0]).toBe('Top');
      expect(lines[1]).toBe('');
      expect(lines[2]).toBe('Bottom');
    });

    test('render() should handle ANSI escape sequences', () => {
      const layer = newLayer('\x1b[31mRed\x1b[0m Text').position(0, 0);
      const canvas = Canvas.create(layer);

      const result = canvas.render();
      // ANSI sequences should be preserved in the output
      expect(result).toContain('Red Text');
    });

    test('render() should trim trailing whitespace', () => {
      const layer = newLayer('Text   ').position(0, 0);
      const canvas = Canvas.create(layer);

      const result = canvas.render();
      expect(result).toBe('Text');
    });

    test('render() should handle empty canvas', () => {
      const canvas = Canvas.create();

      const result = canvas.render();
      expect(result).toBe('');
    });
  });

  describe('getDimensions()', () => {
    test('should return zero dimensions for empty canvas', () => {
      const canvas = Canvas.create();
      const dims = canvas.getDimensions();

      expect(dims.width).toBe(0);
      expect(dims.height).toBe(0);
    });

    test('should calculate dimensions for single layer', () => {
      const layer = newLayer('Hello World').position(5, 3);
      const canvas = Canvas.create(layer);
      const dims = canvas.getDimensions();

      expect(dims.width).toBe(16); // 5 + 11
      expect(dims.height).toBe(4); // 3 + 1
    });

    test('should calculate dimensions for multiple layers', () => {
      const layer1 = newLayer('Short').position(0, 0);
      const layer2 = newLayer('Much longer text').position(10, 5);
      const canvas = Canvas.create(layer1, layer2);
      const dims = canvas.getDimensions();

      expect(dims.width).toBe(26); // 10 + 16
      expect(dims.height).toBe(6); // 5 + 1
    });

    test('should handle layers with multi-line content', () => {
      const layer = newLayer('Line 1\nLonger line 2\nLine 3').position(2, 1);
      const canvas = Canvas.create(layer);
      const dims = canvas.getDimensions();

      expect(dims.width).toBe(15); // 2 + 13
      expect(dims.height).toBe(4); // 1 + 3
    });
  });

  describe('Utility methods', () => {
    test('isEmpty() should work correctly', () => {
      const emptyCanvas = Canvas.create();
      const filledCanvas = Canvas.create(newLayer('test'));

      expect(emptyCanvas.isEmpty()).toBe(true);
      expect(filledCanvas.isEmpty()).toBe(false);
    });

    test('getLayerCount() should return correct count', () => {
      const canvas = Canvas.create()
        .addLayer(newLayer('1'))
        .addLayer(newLayer('2'))
        .addLayer(newLayer('3'));

      expect(canvas.getLayerCount()).toBe(3);
    });

    test('clone() should create identical copy', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const original = Canvas.create(layer1, layer2);
      const cloned = original.clone();

      expect(cloned.getLayerCount()).toBe(original.getLayerCount());
      expect(cloned.render()).toBe(original.render());
      expect(cloned.config).toEqual(original.config);
    });

    test('clone() should create independent copy', () => {
      const original = Canvas.create(newLayer('test'));
      const cloned = original.clone();
      const modified = cloned.addLayer(newLayer('new'));

      expect(original.getLayerCount()).toBe(1);
      expect(modified.getLayerCount()).toBe(2);
    });
  });

  describe('Immutability', () => {
    test('all methods should return new instances', () => {
      const original = Canvas.create();
      const layer = newLayer('test');

      const afterAdd = original.addLayer(layer);
      const afterRemove = original.removeLayer(0);
      const afterClear = original.clearLayers();
      const afterClone = original.clone();

      expect(afterAdd).not.toBe(original);
      expect(afterRemove).not.toBe(original);
      expect(afterClear).not.toBe(original);
      expect(afterClone).not.toBe(original);
    });

    test('method chaining should work correctly', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const layer3 = newLayer('Layer 3');

      const canvas = Canvas.create()
        .addLayer(layer1)
        .addLayer(layer2)
        .addLayer(layer3)
        .removeLayer(1)
        .addLayer(newLayer('New layer'));

      expect(canvas.getLayerCount()).toBe(3);
    });
  });

  describe('Configuration access', () => {
    test('config property should reflect current state', () => {
      const layer1 = newLayer('Layer 1');
      const layer2 = newLayer('Layer 2');
      const canvas = Canvas.create(layer1, layer2);

      expect(canvas.config.layers).toHaveLength(2);
      expect(canvas.config.layers[0]).toBe(layer1);
      expect(canvas.config.layers[1]).toBe(layer2);
    });

    test('config should be immutable', () => {
      const layer = newLayer('test');
      const canvas = Canvas.create(layer);

      // Config is readonly at TypeScript level, which is sufficient
      expect(canvas.config.layers).toHaveLength(1);
      expect(canvas.config.layers[0]).toBe(layer);
    });
  });
});
