import { describe, expect, test } from 'bun:test';
import { CachingUtils } from './caching';
import { FunctionalUtils } from './functional';
import { StringUtils } from './strings';
import { ValidationUtils } from './validation';

describe('Utils Performance Tests', () => {
  describe('String utilities performance', () => {
    test('should measure text width efficiently', () => {
      const texts = [
        'Hello, world!',
        'Multi\nline\ntext',
        'Text with emojis 🎉🚀✨',
        'Very long text that spans multiple lines and contains various characters including unicode symbols ñáéíóú',
      ];

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const text = texts[i % texts.length];
        StringUtils.displayWidth(text);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should measure text height efficiently', () => {
      const texts = [
        'Single line',
        'Two\nlines',
        'Three\nlines\nhere',
        'Many\nlines\nof\ntext\nfor\ntesting\nperformance',
      ];

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const text = texts[i % texts.length];
        StringUtils.lineCount(text);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should truncate text efficiently', () => {
      const longText = 'A'.repeat(1000);
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        StringUtils.truncate(longText, 50);
        StringUtils.truncate(longText, 100);
        StringUtils.truncate(longText, 200);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should pad text efficiently', () => {
      const text = 'Hello';
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        StringUtils.pad(text, 20, ' ', 'left');
        StringUtils.pad(text, 20, ' ', 'right');
        StringUtils.pad(text, 20, ' ', 'center');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should wrap text efficiently', () => {
      const longText =
        'This is a very long text that needs to be wrapped at specific column widths to test the performance of the text wrapping functionality.';
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        StringUtils.wrap(longText, 40);
        StringUtils.wrap(longText, 60);
        StringUtils.wrap(longText, 80);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Functional utilities performance', () => {
    test('should compose functions efficiently', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const subtract3 = (x: number) => x - 3;

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const composed = FunctionalUtils.compose(add1, multiply2, subtract3);
        composed(i);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should pipe functions efficiently', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const subtract3 = (x: number) => x - 3;

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        FunctionalUtils.pipe(i, add1, multiply2, subtract3);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should curry functions efficiently', () => {
      const add = (a: number, b: number, c: number) => a + b + c;

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const curried = FunctionalUtils.curry(add);
        curried(1)(2)(3);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should memoize functions efficiently', () => {
      const expensiveFunction = (n: number): number => {
        let result = 0;
        for (let i = 0; i < n; i++) {
          result += i;
        }
        return result;
      };

      const memoized = FunctionalUtils.memoize(expensiveFunction);

      const start = performance.now();

      // First calls will be slower, subsequent calls should be fast
      for (let i = 0; i < 100; i++) {
        memoized(100);
        memoized(200);
        memoized(300);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });

  describe('Caching utilities performance', () => {
    test('should handle LRU cache operations efficiently', () => {
      const cache = CachingUtils.createLRUCache<string, number>(100);

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
        cache.get(`key${i % 50}`); // Access recent items
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle cache eviction efficiently', () => {
      const cache = CachingUtils.createLRUCache<string, number>(10); // Small cache

      const start = performance.now();

      // Force many evictions
      for (let i = 0; i < 500; i++) {
        cache.set(`key${i}`, i);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle TTL cache operations efficiently', () => {
      const cache = CachingUtils.createTTLCache<string, number>(1000); // 1 second TTL

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        cache.set(`key${i}`, i);
        cache.get(`key${i % 100}`);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Validation utilities performance', () => {
    test('should validate types efficiently', () => {
      const values = ['string', 123, true, { key: 'value' }, [1, 2, 3], null, undefined];

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const value = values[i % values.length];
        ValidationUtils.isString(value);
        ValidationUtils.isNumber(value);
        ValidationUtils.isBoolean(value);
        ValidationUtils.isObject(value);
        ValidationUtils.isArray(value);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should validate ranges efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        ValidationUtils.validatePositiveInteger(i);
        ValidationUtils.validateNonNegativeInteger(i);
        ValidationUtils.validatePercentage(i / 10);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should validate strings efficiently', () => {
      const strings = [
        'valid@email.com',
        'invalid-email',
        '#FF0000',
        '#invalid',
        'http://example.com',
        'not-a-url',
      ];

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const str = strings[i % strings.length];
        ValidationUtils.validateEmail(str);
        ValidationUtils.validateHexColor(str);
        ValidationUtils.validateUrl(str);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when processing strings', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 2000; i++) {
        const text = `Text ${i} with some content that varies in length`;
        StringUtils.displayWidth(text);
        StringUtils.lineCount(text);
        StringUtils.truncate(text, 20);
        StringUtils.pad(text, 50);
        StringUtils.wrap(text, 30);
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should handle cache operations without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        const cache = CachingUtils.createLRUCache<string, string>(50);

        for (let j = 0; j < 100; j++) {
          cache.set(`key${j}`, `value${j}`);
          cache.get(`key${j % 25}`);
        }
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(3 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent string operations efficiently', async () => {
      const texts = Array.from({ length: 100 }, (_, i) => `Text ${i} for concurrent processing`);

      const start = performance.now();

      const promises = texts.map(async (text) => {
        return {
          width: StringUtils.displayWidth(text),
          height: StringUtils.lineCount(text),
          truncated: StringUtils.truncate(text, 20),
          wrapped: StringUtils.wrap(text, 30),
        };
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });

    test('should handle concurrent functional operations efficiently', async () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;

      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        const composed = FunctionalUtils.compose(add1, multiply2);
        return composed(i);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });

  describe('Edge case performance', () => {
    test('should handle empty strings efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        StringUtils.displayWidth('');
        StringUtils.lineCount('');
        StringUtils.truncate('', 10);
        StringUtils.pad('', 20);
        StringUtils.wrap('', 30);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should handle very long strings efficiently', () => {
      const veryLongString = 'A'.repeat(10000);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        StringUtils.displayWidth(veryLongString);
        StringUtils.truncate(veryLongString, 100);
        StringUtils.wrap(veryLongString, 80);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should handle unicode strings efficiently', () => {
      const unicodeStrings = ['🎉🚀✨🌟💫', 'Héllö Wörld', '中文测试', 'العربية', 'Русский текст'];

      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        const str = unicodeStrings[i % unicodeStrings.length];
        StringUtils.displayWidth(str);
        StringUtils.truncate(str, 10);
        StringUtils.pad(str, 20);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });
});
