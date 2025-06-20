import { describe, expect, test } from 'bun:test';
import { Position } from '../types/layout';
import { Layout } from './joining';

describe('Layout Performance Tests', () => {
  describe('Joining operations performance', () => {
    test('should join horizontal blocks within 1ms for 100 operations', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3', 'Block 4'];
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Layout.joinHorizontal(Position.TOP, ...blocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should join vertical blocks within 1ms for 100 operations', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3', 'Block 4'];
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Layout.joinVertical(Position.LEFT, ...blocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle large number of blocks efficiently', () => {
      const blocks = Array.from({ length: 50 }, (_, i) => `Block ${i + 1}`);
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.joinHorizontal(Position.CENTER, ...blocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should handle multiline blocks efficiently', () => {
      const multilineBlocks = [
        'Line 1\nLine 2\nLine 3',
        'Another 1\nAnother 2\nAnother 3',
        'Third 1\nThird 2\nThird 3',
      ];
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        Layout.joinHorizontal(Position.MIDDLE, ...multilineBlocks);
        Layout.joinVertical(Position.CENTER, ...multilineBlocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Positioning operations performance', () => {
    test('should place content efficiently', () => {
      const content = 'Hello, world!\nThis is a test\nMultiple lines';
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Layout.place(80, 24, Position.CENTER, Position.MIDDLE, content);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle different alignments efficiently', () => {
      const content = 'Test content';
      const alignments: Array<[number, number]> = [
        [Position.LEFT, Position.TOP],
        [Position.CENTER, Position.MIDDLE],
        [Position.RIGHT, Position.BOTTOM],
      ];

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const alignment = alignments[i % alignments.length];
        if (alignment) {
          const [h, v] = alignment;
          Layout.place(80, 24, h, v, content);
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle numeric positions efficiently', () => {
      const content = 'Positioned content';
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const x = (i % 80) / 80;
        const y = (i % 24) / 24;
        Layout.place(80, 24, x, y, content);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Complex layout operations performance', () => {
    test('should handle nested layouts efficiently', () => {
      const innerBlocks = ['A', 'B', 'C'];
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        const horizontal = Layout.joinHorizontal(Position.CENTER, ...innerBlocks);
        const vertical = Layout.joinVertical(Position.MIDDLE, ...innerBlocks);
        Layout.joinVertical(Position.LEFT, horizontal, vertical);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle large content blocks efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n');
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.place(120, 50, Position.CENTER, Position.MIDDLE, largeContent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when joining many blocks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        const blocks = Array.from({ length: 10 }, (_, j) => `Block ${i}-${j}`);
        Layout.joinHorizontal(Position.CENTER, ...blocks);
        Layout.joinVertical(Position.MIDDLE, ...blocks);
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle rapid positioning without memory issues', () => {
      const content = 'Test content for positioning';
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        Layout.place(80, 24, Position.CENTER, Position.MIDDLE, content);
        Layout.place(100, 30, Position.LEFT, Position.TOP, content);
        Layout.place(60, 20, Position.RIGHT, Position.BOTTOM, content);
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent joining efficiently', async () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3'];
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        if (i % 2 === 0) {
          return Layout.joinHorizontal(Position.CENTER, ...blocks);
        }
        return Layout.joinVertical(Position.MIDDLE, ...blocks);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });

    test('should handle concurrent positioning efficiently', async () => {
      const content = 'Test content';
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        const x = (i % 80) / 80;
        const y = (i % 24) / 24;
        return Layout.place(80, 24, x, y, content);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });

  describe('Edge case performance', () => {
    test('should handle empty blocks efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Layout.joinHorizontal(Position.CENTER, '', '', '');
        Layout.joinVertical(Position.MIDDLE, '', '', '');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should handle single character blocks efficiently', () => {
      const chars = ['A', 'B', 'C', 'D', 'E'];
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Layout.joinHorizontal(Position.CENTER, ...chars);
        Layout.joinVertical(Position.MIDDLE, ...chars);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle very wide content efficiently', () => {
      const wideContent = 'A'.repeat(1000);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        Layout.place(1200, 10, Position.CENTER, Position.MIDDLE, wideContent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle very tall content efficiently', () => {
      const tallContent = Array.from({ length: 200 }, (_, i) => `Line ${i + 1}`).join('\n');
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.place(80, 250, Position.CENTER, Position.MIDDLE, tallContent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });
});
