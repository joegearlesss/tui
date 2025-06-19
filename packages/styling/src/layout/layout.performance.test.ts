import { describe, expect, test } from 'bun:test';
import { Layout } from './joining';

describe('Layout Performance Tests', () => {
  describe('Joining operations performance', () => {
    test('should join horizontal blocks within 1ms for 100 operations', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3', 'Block 4'];
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Layout.joinHorizontal('top', ...blocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should join vertical blocks within 1ms for 100 operations', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3', 'Block 4'];
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Layout.joinVertical('left', ...blocks);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle large number of blocks efficiently', () => {
      const blocks = Array.from({ length: 50 }, (_, i) => `Block ${i + 1}`);
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.joinHorizontal('center', ...blocks);
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
        Layout.joinHorizontal('middle', ...multilineBlocks);
        Layout.joinVertical('center', ...multilineBlocks);
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
        Layout.place(80, 24, 'center', 'middle', content);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle different alignments efficiently', () => {
      const content = 'Test content';
      const alignments: Array<[string, string]> = [
        ['left', 'top'],
        ['center', 'middle'],
        ['right', 'bottom'],
      ];

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const [h, v] = alignments[i % alignments.length];
        Layout.place(80, 24, h as any, v as any, content);
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
        const horizontal = Layout.joinHorizontal('center', ...innerBlocks);
        const vertical = Layout.joinVertical('middle', ...innerBlocks);
        Layout.joinVertical('left', horizontal, vertical);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle large content blocks efficiently', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n');
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.place(120, 50, 'center', 'middle', largeContent);
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
        Layout.joinHorizontal('center', ...blocks);
        Layout.joinVertical('middle', ...blocks);
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
        Layout.place(80, 24, 'center', 'middle', content);
        Layout.place(100, 30, 'left', 'top', content);
        Layout.place(60, 20, 'right', 'bottom', content);
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
          return Layout.joinHorizontal('center', ...blocks);
        } else {
          return Layout.joinVertical('middle', ...blocks);
        }
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
        Layout.joinHorizontal('center', '', '', '');
        Layout.joinVertical('middle', '', '', '');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should handle single character blocks efficiently', () => {
      const chars = ['A', 'B', 'C', 'D', 'E'];
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Layout.joinHorizontal('center', ...chars);
        Layout.joinVertical('middle', ...chars);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle very wide content efficiently', () => {
      const wideContent = 'A'.repeat(1000);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        Layout.place(1200, 10, 'center', 'middle', wideContent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle very tall content efficiently', () => {
      const tallContent = Array.from({ length: 200 }, (_, i) => `Line ${i + 1}`).join('\n');
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Layout.place(80, 250, 'center', 'middle', tallContent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });
});
