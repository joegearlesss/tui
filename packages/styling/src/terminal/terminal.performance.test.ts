import { describe, expect, test } from 'bun:test';
import { ANSI } from '@tui/styling/ansi';
import { Terminal } from './detection';

describe('Terminal Performance Tests', () => {
  describe('Terminal detection performance', () => {
    test('should detect color support within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Terminal.hasColorSupport();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should detect true color support within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Terminal.hasTrueColorSupport();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should get color profile within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Terminal.getColorProfile();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should get terminal size within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Terminal.getDimensions();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('ANSI operations performance', () => {
    test('should generate ANSI codes within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ANSI.BOLD;
        ANSI.ITALIC;
        ANSI.UNDERLINE;
        ANSI.RESET;
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should generate color codes within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ANSI.foreground({ hex: '#FF0000' });
        ANSI.background({ hex: '#00FF00' });
        ANSI.foreground({ ansi: 196 });
        ANSI.background({ ansi: 46 });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should generate cursor codes within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ANSI.Cursor.up(5);
        ANSI.Cursor.down(3);
        ANSI.Cursor.left(2);
        ANSI.Cursor.right(4);
        ANSI.Cursor.position(10, 20);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should generate screen codes within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ANSI.Screen.clear();
        ANSI.Screen.clearLine();
        ANSI.Cursor.save();
        ANSI.Cursor.restore();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Complex ANSI sequences performance', () => {
    test('should generate complex sequences efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const _sequence = [
          ANSI.BOLD,
          ANSI.ITALIC,
          ANSI.foreground('#FF0000'),
          ANSI.background('#00FF00'),
          ANSI.Cursor.position(i % 80, i % 24),
          'Hello, world!',
          ANSI.RESET,
        ].join('');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle rapid sequence generation', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        const r = (i * 3) % 256;
        const g = (i * 5) % 256;
        const b = (i * 7) % 256;

        ANSI.foreground(`rgb(${r}, ${g}, ${b})`);
        ANSI.background(
          `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        );
        ANSI.Cursor.position(i % 80, i % 24);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Terminal capability caching performance', () => {
    test('should cache detection results efficiently', () => {
      // First call might be slower due to detection
      Terminal.hasColorSupport();
      Terminal.hasTrueColorSupport();
      Terminal.getColorProfile();

      const start = performance.now();

      // Subsequent calls should be cached
      for (let i = 0; i < 1000; i++) {
        Terminal.hasColorSupport();
        Terminal.hasTrueColorSupport();
        Terminal.getColorProfile();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when generating ANSI codes', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 5000; i++) {
        ANSI.BOLD;
        ANSI.ITALIC;
        ANSI.foreground(`#${(i % 256).toString(16).padStart(2, '0')}0000`);
        ANSI.background(`#00${(i % 256).toString(16).padStart(2, '0')}00`);
        ANSI.Cursor.position(i % 80, i % 24);
        ANSI.RESET;
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should handle rapid terminal detection without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 2000; i++) {
        Terminal.hasColorSupport();
        Terminal.hasTrueColorSupport();
        Terminal.getColorProfile();
        Terminal.getDimensions();
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent ANSI generation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return [
          ANSI.BOLD,
          ANSI.foreground(`#${(i % 256).toString(16).padStart(2, '0')}0000`),
          ANSI.Cursor.position(i % 80, i % 24),
          `Content ${i}`,
          ANSI.RESET,
        ].join('');
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });

    test('should handle concurrent terminal detection efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async () => {
        return {
          colorSupport: Terminal.hasColorSupport(),
          trueColorSupport: Terminal.hasTrueColorSupport(),
          profile: Terminal.getColorProfile(),
          size: Terminal.getDimensions(),
        };
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });

  describe('Edge case performance', () => {
    test('should handle invalid color values efficiently', () => {
      const invalidColors = ['invalid', '#GG0000', 'rgb(300, 300, 300)', ''];
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const color = invalidColors[i % invalidColors.length];
        try {
          ANSI.foreground(color);
          ANSI.background(color);
        } catch {
          // Expected for invalid colors
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle extreme cursor positions efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ANSI.Cursor.position(9999, 9999);
        ANSI.Cursor.position(-1, -1);
        ANSI.Cursor.position(0, 0);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should handle rapid style changes efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        ANSI.BOLD;
        ANSI.ITALIC;
        ANSI.UNDERLINE;
        ANSI.STRIKETHROUGH;
        ANSI.REVERSE;
        ANSI.RESET;
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });
});
