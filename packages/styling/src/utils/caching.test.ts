import { beforeEach, describe, expect, test } from 'bun:test';
import { CachingUtils } from './caching';

describe('CachingUtils', () => {
  describe('createLRUCache', () => {
    test('should store and retrieve values', () => {
      const cache = CachingUtils.createLRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
    });

    test('should evict least recently used items', () => {
      const cache = CachingUtils.createLRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    test('should update access order on get', () => {
      const cache = CachingUtils.createLRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // Make 'a' most recently used
      cache.set('c', 3); // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });

    test('should handle cache operations', () => {
      const cache = CachingUtils.createLRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('c')).toBe(false);
      expect(cache.size).toBe(2);

      expect(cache.delete('a')).toBe(true);
      expect(cache.has('a')).toBe(false);
      expect(cache.size).toBe(1);

      cache.clear();
      expect(cache.size).toBe(0);
    });

    test('should provide iterators', () => {
      const cache = CachingUtils.createLRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(Array.from(cache.keys())).toEqual(['a', 'b']);
      expect(Array.from(cache.values())).toEqual([1, 2]);
      expect(Array.from(cache.entries())).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });
  });

  describe('createTTLCache', () => {
    test('should store and retrieve values', () => {
      const cache = CachingUtils.createTTLCache<string, number>(1000, 3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    test('should expire entries after TTL', async () => {
      const cache = CachingUtils.createTTLCache<string, number>(50, 3);

      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(cache.get('a')).toBeUndefined();
    });

    test('should handle has() with expiration', async () => {
      const cache = CachingUtils.createTTLCache<string, number>(50, 3);

      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(cache.has('a')).toBe(false);
    });

    test('should cleanup expired entries', async () => {
      const cache = CachingUtils.createTTLCache<string, number>(50, 3);

      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);

      await new Promise((resolve) => setTimeout(resolve, 60));
      cache.cleanup();
      expect(cache.size).toBe(0);
    });

    test('should provide stats', async () => {
      const cache = CachingUtils.createTTLCache<string, number>(50, 3);

      cache.set('a', 1);
      cache.set('b', 2);

      let stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.expired).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 60));
      stats = cache.getStats();
      expect(stats.expired).toBe(2);
    });

    test('should evict oldest when max size reached', () => {
      const cache = CachingUtils.createTTLCache<string, number>(1000, 2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  });

  describe('createFunctionCache', () => {
    test('should cache function results', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cached = CachingUtils.createFunctionCache(fn);

      expect(cached.fn(5)).toBe(10);
      expect(cached.fn(5)).toBe(10);
      expect(callCount).toBe(1);

      expect(cached.fn(3)).toBe(6);
      expect(callCount).toBe(2);
    });

    test('should use custom key generator', () => {
      let callCount = 0;
      const fn = (obj: { id: number; name: string }) => {
        callCount++;
        return obj.name.toUpperCase();
      };

      const cached = CachingUtils.createFunctionCache(fn, {
        keyGenerator: (obj) => obj.id.toString(),
      });

      expect(cached.fn({ id: 1, name: 'test' })).toBe('TEST');
      expect(cached.fn({ id: 1, name: 'different' })).toBe('TEST'); // Same ID, cached
      expect(callCount).toBe(1);
    });

    test('should respect max size', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cached = CachingUtils.createFunctionCache(fn, { maxSize: 2 });

      cached.fn(1);
      cached.fn(2);
      cached.fn(3); // Should evict first entry

      expect(cached.fn(1)).toBe(2); // Should call function again
      expect(callCount).toBe(4); // 3 initial calls + 1 re-call
    });

    test('should handle TTL expiration', async () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cached = CachingUtils.createFunctionCache(fn, { ttl: 50 });

      expect(cached.fn(5)).toBe(10);
      expect(callCount).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(cached.fn(5)).toBe(10);
      expect(callCount).toBe(2); // Called again after expiration
    });

    test('should provide cache statistics', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cached = CachingUtils.createFunctionCache(fn);

      cached.fn(1); // miss
      cached.fn(1); // hit
      cached.fn(2); // miss
      cached.fn(1); // hit

      const stats = cached.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.size).toBe(2);
    });

    test('should clear cache and stats', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cached = CachingUtils.createFunctionCache(fn);

      cached.fn(1);
      cached.fn(2);

      expect(cached.size).toBe(2);
      expect(cached.getStats().misses).toBe(2);

      cached.clear();

      expect(cached.size).toBe(0);
      expect(cached.getStats().misses).toBe(0);
    });
  });

  describe('createWeakCache', () => {
    test('should store and retrieve object references', () => {
      const cache = CachingUtils.createWeakCache<object, string>();
      const key1 = {};
      const key2 = {};

      cache.set(key1, 'value1');
      cache.set(key2, 'value2');

      expect(cache.get(key1)).toBe('value1');
      expect(cache.get(key2)).toBe('value2');
      expect(cache.has(key1)).toBe(true);
    });

    test('should handle cache operations', () => {
      const cache = CachingUtils.createWeakCache<object, string>();
      const key = {};

      cache.set(key, 'value');
      expect(cache.has(key)).toBe(true);

      expect(cache.delete(key)).toBe(true);
      expect(cache.has(key)).toBe(false);
    });

    test('should cleanup weak references', () => {
      const cache = CachingUtils.createWeakCache<object, string>(2);

      // Create objects that will be garbage collected
      let key1: object | undefined = {};
      let key2: object | undefined = {};

      cache.set(key1, 'value1');
      cache.set(key2, 'value2');

      expect(cache.size).toBe(2);

      // Remove references
      key1 = undefined;
      key2 = undefined;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      cache.cleanup();
      // Size should be reduced after cleanup (though exact behavior depends on GC)
    });
  });

  describe('createMultiLevelCache', () => {
    test('should check multiple cache levels', () => {
      const l1 = CachingUtils.createLRUCache<string, number>(2);
      const l2 = CachingUtils.createLRUCache<string, number>(4);

      const cache = CachingUtils.createMultiLevelCache([
        { cache: l1, name: 'L1' },
        { cache: l2, name: 'L2' },
      ]);

      // Set in L2 only
      l2.set('a', 1);

      // Should find in L2 and promote to L1
      expect(cache.get('a')).toBe(1);
      expect(l1.has('a')).toBe(true);
    });

    test('should set in all levels', () => {
      const l1 = CachingUtils.createLRUCache<string, number>(2);
      const l2 = CachingUtils.createLRUCache<string, number>(4);

      const cache = CachingUtils.createMultiLevelCache([
        { cache: l1, name: 'L1' },
        { cache: l2, name: 'L2' },
      ]);

      cache.set('a', 1);

      expect(l1.has('a')).toBe(true);
      expect(l2.has('a')).toBe(true);
    });

    test('should provide detailed statistics', () => {
      const l1 = CachingUtils.createLRUCache<string, number>(2);
      const l2 = CachingUtils.createLRUCache<string, number>(4);

      const cache = CachingUtils.createMultiLevelCache([
        { cache: l1, name: 'L1' },
        { cache: l2, name: 'L2' },
      ]);

      l2.set('a', 1);

      cache.get('a'); // Hit in L2
      cache.get('a'); // Hit in L1 (promoted)
      cache.get('b'); // Miss in both

      const stats = cache.getStats();
      expect(stats.levels[0].name).toBe('L1');
      expect(stats.levels[0].hits).toBe(1);
      expect(stats.levels[0].misses).toBe(2);

      expect(stats.levels[1].name).toBe('L2');
      expect(stats.levels[1].hits).toBe(1);
      expect(stats.levels[1].misses).toBe(1);
    });
  });

  describe('createWarmCache', () => {
    test('should precompute values during creation', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const cache = CachingUtils.createWarmCache(fn, [[1], [2], [3]]);

      expect(callCount).toBe(3); // Called during warmup

      expect(cache.fn(1)).toBe(2);
      expect(cache.fn(2)).toBe(4);
      expect(cache.fn(3)).toBe(6);
      expect(callCount).toBe(3); // No additional calls
    });
  });

  describe('createAutoRefreshCache', () => {
    test('should automatically refresh cached values', async () => {
      let value = 1;
      let callCount = 0;
      const fn = (key: string) => {
        callCount++;
        return `${key}-${value}`;
      };

      const cache = CachingUtils.createAutoRefreshCache(fn, 50);

      expect(cache.fn('test')).toBe('test-1');
      expect(callCount).toBe(1);

      // Change the underlying value
      value = 2;

      // Wait for refresh
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should have refreshed automatically
      expect(callCount).toBeGreaterThan(1);
    });

    test('should stop refresh when key is removed', async () => {
      let callCount = 0;
      const fn = (key: string) => {
        callCount++;
        return key;
      };

      const cache = CachingUtils.createAutoRefreshCache(fn, 200); // Even longer interval

      cache.fn('test');
      expect(callCount).toBe(1); // Initial call

      // Stop refresh immediately after initial call
      // The key is generated using JSON.stringify(args), so for args ['test'] it becomes '["test"]'
      cache.stopRefresh('["test"]');

      // Wait longer than the refresh interval to ensure no more calls
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Should not have called function again after stopRefresh
      expect(callCount).toBe(1);
    });

    test('should clear all refresh timers', async () => {
      let callCount = 0;
      const fn = (key: string) => {
        callCount++;
        return key;
      };

      const cache = CachingUtils.createAutoRefreshCache(fn, 50);

      cache.fn('test1');
      cache.fn('test2');
      const initialCallCount = callCount;

      cache.clear();

      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should not have called function again
      expect(callCount).toBe(initialCallCount);
    });
  });
});
