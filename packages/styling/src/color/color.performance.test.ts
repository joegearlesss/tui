import { describe, expect, test } from 'bun:test';
import { Color } from './color';

describe('Color Performance Tests', () => {
  describe('Color parsing performance', () => {
    test('should parse hex colors within 1ms', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.parse('#FF0000');
        Color.parse('#00FF00');
        Color.parse('#0000FF');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should parse named colors within 1ms', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.parse('red');
        Color.parse('green');
        Color.parse('blue');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should parse ANSI colors within 1ms', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.parse(196);
        Color.parse(46);
        Color.parse(21);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Color conversion performance', () => {
    test('should convert RGB to hex within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.rgbToHex({ r: 255, g: 128, b: 64 });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should convert hex to RGB within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.hexToRgb('#FF8040');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Color creation performance', () => {
    test('should create RGB colors within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.rgb(255, 128, 64);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create adaptive colors within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.adaptive('#000000', '#FFFFFF');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create complete colors within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.complete({
          trueColor: '#FF0000',
          ansi256: 196,
          ansi: 1,
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Color profile operations performance', () => {
    test('should get color for profile within 1ms for 1000 operations', () => {
      const complete = Color.complete({
        trueColor: '#FF0000',
        ansi256: 196,
        ansi: 1,
      });

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Color.getColorForProfile(complete, 'truecolor');
        Color.getColorForProfile(complete, 'ansi256');
        Color.getColorForProfile(complete, 'ansi');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many colors', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 10000; i++) {
        Color.parse(`#${i.toString(16).padStart(6, '0')}`);
        Color.rgb(i % 256, (i * 2) % 256, (i * 3) % 256);
        Color.adaptive('#000000', '#FFFFFF');
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should handle rapid color parsing without memory issues', () => {
      const colors = ['red', 'green', 'blue', '#FF0000', '#00FF00', '#0000FF', 196, 46, 21];
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 5000; i++) {
        const color = colors[i % colors.length];
        if (color) {
          Color.parse(color);
        }
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024);
    });
  });

  describe('Background detection performance', () => {
    test('should detect background quickly', async () => {
      const start = performance.now();

      // Run multiple detections
      const promises = Array.from({ length: 10 }, () => Color.hasDarkBackground());
      await Promise.all(promises);

      const end = performance.now();

      // Should complete within reasonable time
      expect(end - start).toBeLessThan(100);
    });

    test('should handle sync background detection efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Color.hasDarkBackgroundSync();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Utility function performance', () => {
    test('should validate color names efficiently', () => {
      const names = ['red', 'green', 'blue', 'invalid', 'yellow', 'purple', 'notacolor'];
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const name = names[i % names.length];
        if (name) {
          Color.isValidColorName(name);
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should get named colors efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Color.getNamedColors();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should convert to complete colors efficiently', () => {
      const colors = ['red', 'green', 'blue', '#FF0000', '#00FF00', '#0000FF'];
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const color = colors[i % colors.length];
        if (color) {
          Color.toComplete(color);
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });
});
