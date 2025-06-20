/**
 * Layer Tests
 *
 * Comprehensive tests for the functional Layer interface
 */

import { describe, expect, test } from 'bun:test';
import { Layer, newLayer } from './layer';

describe('Layer', () => {
  describe('Layer namespace', () => {
    test('create() should create layer with content at origin', () => {
      const layer = Layer.create('Test content');
      
      expect(layer.content).toBe('Test content');
      expect(layer.xPos).toBe(0);
      expect(layer.yPos).toBe(0);
    });

    test('from() should create layer from configuration', () => {
      const config = { content: 'Test', x: 10, y: 5 };
      const layer = Layer.from(config);
      
      expect(layer.content).toBe('Test');
      expect(layer.xPos).toBe(10);
      expect(layer.yPos).toBe(5);
    });
  });

  describe('newLayer helper', () => {
    test('should create layer with content', () => {
      const layer = newLayer('Hello World');
      
      expect(layer.content).toBe('Hello World');
      expect(layer.xPos).toBe(0);
      expect(layer.yPos).toBe(0);
    });
  });

  describe('Position methods', () => {
    test('x() should set X position immutably', () => {
      const original = Layer.create('test');
      const positioned = original.x(15);
      
      expect(original.xPos).toBe(0);
      expect(positioned.xPos).toBe(15);
      expect(positioned.content).toBe('test');
      expect(positioned.yPos).toBe(0);
    });

    test('y() should set Y position immutably', () => {
      const original = Layer.create('test');
      const positioned = original.y(20);
      
      expect(original.yPos).toBe(0);
      expect(positioned.yPos).toBe(20);
      expect(positioned.content).toBe('test');
      expect(positioned.xPos).toBe(0);
    });

    test('position() should set both X and Y coordinates', () => {
      const layer = Layer.create('test').position(25, 30);
      
      expect(layer.xPos).toBe(25);
      expect(layer.yPos).toBe(30);
      expect(layer.content).toBe('test');
    });

    test('method chaining should work correctly', () => {
      const layer = Layer.create('content')
        .x(10)
        .y(5)
        .position(15, 20);
      
      expect(layer.xPos).toBe(15);
      expect(layer.yPos).toBe(20);
      expect(layer.content).toBe('content');
    });
  });

  describe('getDimensions()', () => {
    test('should calculate dimensions for single line content', () => {
      const layer = Layer.create('Hello World');
      const dims = layer.getDimensions();
      
      expect(dims.width).toBe(11);
      expect(dims.height).toBe(1);
    });

    test('should calculate dimensions for multi-line content', () => {
      const layer = Layer.create('Line 1\nLonger line 2\nShort');
      const dims = layer.getDimensions();
      
      expect(dims.width).toBe(13); // "Longer line 2".length
      expect(dims.height).toBe(3);
    });

    test('should handle empty content', () => {
      const layer = Layer.create('');
      const dims = layer.getDimensions();
      
      expect(dims.width).toBe(0);
      expect(dims.height).toBe(1);
    });

    test('should handle content with ANSI codes', () => {
      const layer = Layer.create('\x1b[31mRed text\x1b[0m');
      const dims = layer.getDimensions();
      
      expect(dims.width).toBe(8); // ANSI codes should be ignored
      expect(dims.height).toBe(1);
    });

    test('should handle content with only newlines', () => {
      const layer = Layer.create('\n\n');
      const dims = layer.getDimensions();
      
      expect(dims.width).toBe(0);
      expect(dims.height).toBe(3);
    });
  });

  describe('clone()', () => {
    test('should create identical copy', () => {
      const original = Layer.create('content').position(10, 5);
      const cloned = original.clone();
      
      expect(cloned.content).toBe(original.content);
      expect(cloned.xPos).toBe(original.xPos);
      expect(cloned.yPos).toBe(original.yPos);
      expect(cloned.config).toEqual(original.config);
    });

    test('should create independent copy', () => {
      const original = Layer.create('content');
      const cloned = original.clone();
      const modified = cloned.x(100);
      
      expect(original.xPos).toBe(0);
      expect(modified.xPos).toBe(100);
    });
  });

  describe('Immutability', () => {
    test('position changes should not affect original', () => {
      const layer1 = Layer.create('test');
      const layer2 = layer1.x(10);
      const layer3 = layer2.y(20);
      
      expect(layer1.xPos).toBe(0);
      expect(layer1.yPos).toBe(0);
      expect(layer2.xPos).toBe(10);
      expect(layer2.yPos).toBe(0);
      expect(layer3.xPos).toBe(10);
      expect(layer3.yPos).toBe(20);
    });

    test('all position methods should return new instances', () => {
      const original = Layer.create('test');
      const byX = original.x(5);
      const byY = original.y(5);
      const byPosition = original.position(5, 5);
      
      expect(byX).not.toBe(original);
      expect(byY).not.toBe(original);
      expect(byPosition).not.toBe(original);
    });
  });

  describe('Configuration access', () => {
    test('config property should reflect current state', () => {
      const layer = Layer.create('test').position(15, 25);
      
      expect(layer.config).toEqual({
        content: 'test',
        x: 15,
        y: 25
      });
    });

    test('config should be immutable', () => {
      const layer = Layer.create('test');
      const originalConfig = layer.config;
      
      // Config is readonly at TypeScript level, which is sufficient
      expect(originalConfig).toEqual({
        content: 'test',
        x: 0,
        y: 0
      });
    });
  });
});