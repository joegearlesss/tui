import { describe, expect, test } from 'bun:test';
import { BorderBuilder } from './builder';
import { Border } from './presets';

describe('Border Performance Tests', () => {
  describe('Border creation performance', () => {
    test('should create normal borders within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Border.normal();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create rounded borders within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Border.rounded();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create thick borders within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Border.thick();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create double borders within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Border.double();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create hidden borders within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Border.hidden();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('BorderBuilder performance', () => {
    test('should build complex borders within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        BorderBuilder.create()
          .top('─')
          .right('│')
          .bottom('─')
          .left('│')
          .corners('┌', '┐', '└', '┘')
          .topColor('#FF0000')
          .rightColor('#00FF00')
          .bottomColor('#0000FF')
          .leftColor('#FFFF00')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should chain many operations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        BorderBuilder.create()
          .top('═')
          .right('║')
          .bottom('═')
          .left('║')
          .corners('╔', '╗', '╚', '╝')
          .topColor('#FF0000')
          .rightColor('#00FF00')
          .bottomColor('#0000FF')
          .leftColor('#FFFF00')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Border operations performance', () => {
    test('should apply border styles efficiently', () => {
      const border = Border.normal();
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        BorderBuilder.from(border).topColor('#FF0000').rightColor('#00FF00').build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should copy borders efficiently', () => {
      const border = BorderBuilder.create()
        .top('─')
        .right('│')
        .bottom('─')
        .left('│')
        .topColor('#FF0000')
        .build();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        BorderBuilder.from(border).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Border preset performance', () => {
    test('should access all presets efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Border.normal();
        Border.rounded();
        Border.thick();
        Border.double();
        Border.hidden();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many borders', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 5000; i++) {
        const borderType = i % 5;
        switch (borderType) {
          case 0:
            Border.normal();
            break;
          case 1:
            Border.rounded();
            break;
          case 2:
            Border.thick();
            break;
          case 3:
            Border.double();
            break;
          case 4:
            Border.hidden();
            break;
        }
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should handle rapid border building without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 2000; i++) {
        BorderBuilder.create()
          .top(i % 2 === 0 ? '─' : '═')
          .right(i % 2 === 0 ? '│' : '║')
          .bottom(i % 2 === 0 ? '─' : '═')
          .left(i % 2 === 0 ? '│' : '║')
          .topColor(`#${(i % 256).toString(16).padStart(2, '0')}0000`)
          .rightColor(`#00${(i % 256).toString(16).padStart(2, '0')}00`)
          .build();
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(3 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent border creation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        const borderType = i % 5;
        switch (borderType) {
          case 0:
            return Border.normal();
          case 1:
            return Border.rounded();
          case 2:
            return Border.thick();
          case 3:
            return Border.double();
          case 4:
            return Border.hidden();
          default:
            return Border.normal();
        }
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should handle concurrent border building efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 50 }, async (_, i) => {
        return BorderBuilder.create()
          .top(i % 2 === 0 ? '─' : '═')
          .right(i % 2 === 0 ? '│' : '║')
          .topColor(`#${(i % 256).toString(16).padStart(2, '0')}0000`)
          .build();
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });

  describe('Border character validation performance', () => {
    test('should validate border characters efficiently', () => {
      const chars = ['─', '│', '┌', '┐', '└', '┘', '═', '║', '╔', '╗', '╚', '╝'];
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const char = chars[i % chars.length];
        BorderBuilder.create().top(char).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });
});
