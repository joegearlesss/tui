import { z } from 'zod';

/**
 * Performance caching utilities for optimizing repeated operations
 * Provides various caching strategies and cache management functions
 */

// Validation schemas
const _CacheOptionsSchema = z
  .object({
    maxSize: z
      .number()
      .int('Max size must be an integer')
      .min(1, 'Max size must be at least 1')
      .optional()
      .describe('Maximum number of entries in cache'),
    ttl: z
      .number()
      .int('TTL must be an integer')
      .min(0, 'TTL must be non-negative')
      .optional()
      .describe('Time to live in milliseconds'),
    keyGenerator: z.function().optional().describe('Function to generate cache keys'),
  })
  .describe('Cache configuration options');

const CacheStatsSchema = z
  .object({
    hits: z
      .number()
      .int('Hits must be an integer')
      .min(0, 'Hits must be non-negative')
      .describe('Number of cache hits'),
    misses: z
      .number()
      .int('Misses must be an integer')
      .min(0, 'Misses must be non-negative')
      .describe('Number of cache misses'),
    size: z
      .number()
      .int('Size must be an integer')
      .min(0, 'Size must be non-negative')
      .describe('Current cache size'),
    hitRate: z
      .number()
      .min(0, 'Hit rate must be non-negative')
      .max(1, 'Hit rate must not exceed 1')
      .describe('Cache hit rate (0-1)'),
  })
  .describe('Cache performance statistics');

// Types
type CacheOptions<T extends readonly any[]> = {
  readonly maxSize?: number;
  readonly ttl?: number;
  readonly keyGenerator?: (...args: T) => string;
};

type CacheStats = z.infer<typeof CacheStatsSchema>;

interface CacheEntry<T> {
  readonly value: T;
  readonly timestamp: number;
  readonly accessCount: number;
}

/**
 * Performance caching utilities namespace
 * Provides various caching strategies for optimizing function calls
 */
namespace CachingUtils {
  /**
   * Creates a simple LRU (Least Recently Used) cache
   * @param maxSize - Maximum number of entries
   * @returns LRU cache instance
   */
  export const createLRUCache = <K, V>(maxSize = 100) => {
    const cache = new Map<K, V>();

    return {
      get: (key: K): V | undefined => {
        const value = cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          cache.delete(key);
          cache.set(key, value);
        }
        return value;
      },

      set: (key: K, value: V): void => {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          // Remove least recently used (first entry)
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },

      has: (key: K): boolean => cache.has(key),

      delete: (key: K): boolean => cache.delete(key),

      clear: (): void => cache.clear(),

      get size(): number {
        return cache.size;
      },

      keys: (): IterableIterator<K> => cache.keys(),

      values: (): IterableIterator<V> => cache.values(),

      entries: (): IterableIterator<[K, V]> => cache.entries(),
    };
  };

  /**
   * Creates a TTL (Time To Live) cache with automatic expiration
   * @param ttl - Time to live in milliseconds
   * @param maxSize - Maximum number of entries
   * @returns TTL cache instance
   */
  export const createTTLCache = <K, V>(ttl = 60000, maxSize = 100) => {
    const cache = new Map<K, CacheEntry<V>>();

    const isExpired = (entry: CacheEntry<V>): boolean => {
      return Date.now() - entry.timestamp > ttl;
    };

    const cleanup = (): void => {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > ttl) {
          cache.delete(key);
        }
      }
    };

    return {
      get: (key: K): V | undefined => {
        const entry = cache.get(key);
        if (entry === undefined) {
          return undefined;
        }

        if (isExpired(entry)) {
          cache.delete(key);
          return undefined;
        }

        // Update access count
        cache.set(key, {
          ...entry,
          accessCount: entry.accessCount + 1,
        });

        return entry.value;
      },

      set: (key: K, value: V): void => {
        cleanup();

        if (cache.size >= maxSize && !cache.has(key)) {
          // Remove oldest entry
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }

        cache.set(key, {
          value,
          timestamp: Date.now(),
          accessCount: 0,
        });
      },

      has: (key: K): boolean => {
        const entry = cache.get(key);
        if (entry === undefined) {
          return false;
        }

        if (isExpired(entry)) {
          cache.delete(key);
          return false;
        }

        return true;
      },

      delete: (key: K): boolean => cache.delete(key),

      clear: (): void => cache.clear(),

      cleanup,

      get size(): number {
        cleanup();
        return cache.size;
      },

      getStats: (): { size: number; expired: number } => {
        let expired = 0;
        const now = Date.now();

        for (const entry of cache.values()) {
          if (now - entry.timestamp > ttl) {
            expired++;
          }
        }

        return { size: cache.size, expired };
      },
    };
  };

  /**
   * Creates a function cache with configurable options
   * @param fn - Function to cache
   * @param options - Cache configuration options
   * @returns Cached function with cache management methods
   */
  export const createFunctionCache = <T extends readonly any[], R>(
    fn: (...args: T) => R,
    options: CacheOptions<T> = {}
  ) => {
    const { maxSize = 100, ttl, keyGenerator } = options;

    let _cache: Map<string, CacheEntry<R>>;
    let stats = { hits: 0, misses: 0 };

    if (ttl !== undefined) {
      const ttlCache = createTTLCache<string, R>(ttl, maxSize);
      _cache = new Map(); // We'll use TTL cache methods instead

      const cachedFn = (...args: T): R => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

        const cached = ttlCache.get(key);
        if (cached !== undefined) {
          stats.hits++;
          return cached;
        }

        stats.misses++;
        const result = fn(...args);
        ttlCache.set(key, result);
        return result;
      };

      return {
        fn: cachedFn,
        clear: () => {
          ttlCache.clear();
          stats = { hits: 0, misses: 0 };
        },
        delete: (key: string) => ttlCache.delete(key),
        has: (key: string) => ttlCache.has(key),
        get size() {
          return ttlCache.size;
        },
        getStats: (): CacheStats => ({
          hits: stats.hits,
          misses: stats.misses,
          size: ttlCache.size,
          hitRate: stats.hits + stats.misses > 0 ? stats.hits / (stats.hits + stats.misses) : 0,
        }),
        cleanup: ttlCache.cleanup,
      };
    }
    const lruCache = createLRUCache<string, R>(maxSize);

    const cachedFn = (...args: T): R => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      const cached = lruCache.get(key);
      if (cached !== undefined) {
        stats.hits++;
        return cached;
      }

      stats.misses++;
      const result = fn(...args);
      lruCache.set(key, result);
      return result;
    };

    return {
      fn: cachedFn,
      clear: () => {
        lruCache.clear();
        stats = { hits: 0, misses: 0 };
      },
      delete: (key: string) => lruCache.delete(key),
      has: (key: string) => lruCache.has(key),
      get size() {
        return lruCache.size;
      },
      getStats: (): CacheStats => ({
        hits: stats.hits,
        misses: stats.misses,
        size: lruCache.size,
        hitRate: stats.hits + stats.misses > 0 ? stats.hits / (stats.hits + stats.misses) : 0,
      }),
    };
  };

  /**
   * Creates a weak reference cache for objects
   * @param maxSize - Maximum number of entries
   * @returns Weak cache instance
   */
  export const createWeakCache = <K extends object, V>(maxSize = 100) => {
    const cache = new WeakMap<K, V>();
    const keys = new Set<WeakRef<K>>();

    const cleanup = (): void => {
      const toDelete: WeakRef<K>[] = [];
      for (const ref of keys) {
        if (ref.deref() === undefined) {
          toDelete.push(ref);
        }
      }
      for (const ref of toDelete) {
        keys.delete(ref);
      }
    };

    return {
      get: (key: K): V | undefined => {
        return cache.get(key);
      },

      set: (key: K, value: V): void => {
        if (keys.size >= maxSize) {
          cleanup();
          if (keys.size >= maxSize) {
            // Remove oldest reference
            const oldestRef = keys.values().next().value;
            keys.delete(oldestRef);
          }
        }

        cache.set(key, value);
        keys.add(new WeakRef(key));
      },

      has: (key: K): boolean => cache.has(key),

      delete: (key: K): boolean => {
        const deleted = cache.delete(key);
        // Note: We can't efficiently remove from WeakRef set
        return deleted;
      },

      cleanup,

      get size(): number {
        cleanup();
        return keys.size;
      },
    };
  };

  /**
   * Creates a multi-level cache with different strategies
   * @param levels - Array of cache configurations
   * @returns Multi-level cache instance
   */
  export const createMultiLevelCache = <K, V>(
    levels: readonly {
      readonly cache:
        | ReturnType<typeof createLRUCache<K, V>>
        | ReturnType<typeof createTTLCache<K, V>>;
      readonly name: string;
    }[]
  ) => {
    let stats = levels.map((level) => ({ name: level.name, hits: 0, misses: 0 }));

    return {
      get: (key: K): V | undefined => {
        for (let i = 0; i < levels.length; i++) {
          const level = levels[i];
          const value = level.cache.get(key);

          if (value !== undefined) {
            stats[i].hits++;

            // Promote to higher levels
            for (let j = 0; j < i; j++) {
              levels[j].cache.set(key, value);
            }

            return value;
          }
          stats[i].misses++;
        }

        return undefined;
      },

      set: (key: K, value: V): void => {
        // Set in all levels
        for (const level of levels) {
          level.cache.set(key, value);
        }
      },

      has: (key: K): boolean => {
        return levels.some((level) => level.cache.has(key));
      },

      delete: (key: K): boolean => {
        let deleted = false;
        for (const level of levels) {
          if (level.cache.delete(key)) {
            deleted = true;
          }
        }
        return deleted;
      },

      clear: (): void => {
        for (const level of levels) {
          level.cache.clear();
        }
        stats = levels.map((level) => ({ name: level.name, hits: 0, misses: 0 }));
      },

      getStats: () => ({
        levels: stats.map((stat) => ({
          name: stat.name,
          hits: stat.hits,
          misses: stat.misses,
          hitRate: stat.hits + stat.misses > 0 ? stat.hits / (stat.hits + stat.misses) : 0,
        })),
        total: {
          hits: stats.reduce((sum, stat) => sum + stat.hits, 0),
          misses: stats.reduce((sum, stat) => sum + stat.misses, 0),
        },
      }),
    };
  };

  /**
   * Creates a cache that automatically warms up with precomputed values
   * @param fn - Function to cache
   * @param warmupData - Array of arguments to precompute
   * @param options - Cache options
   * @returns Warmed cache instance
   */
  export const createWarmCache = <T extends readonly any[], R>(
    fn: (...args: T) => R,
    warmupData: readonly T[],
    options: CacheOptions<T> = {}
  ) => {
    const cache = createFunctionCache(fn, options);

    // Warm up the cache
    for (const args of warmupData) {
      cache.fn(...args);
    }

    return cache;
  };

  /**
   * Creates a cache with automatic refresh for stale entries
   * @param fn - Function to cache
   * @param refreshInterval - Interval to refresh entries in milliseconds
   * @param options - Cache options
   * @returns Auto-refresh cache instance
   */
  export const createAutoRefreshCache = <T extends readonly any[], R>(
    fn: (...args: T) => R,
    refreshInterval: number,
    options: CacheOptions<T> = {}
  ) => {
    const cache = createFunctionCache(fn, options);
    const refreshTimers = new Map<string, Timer>();

    const originalFn = cache.fn;

    const cachedFn = (...args: T): R => {
      const key = options.keyGenerator ? options.keyGenerator(...args) : JSON.stringify(args);
      const result = originalFn(...args);

      // Set up auto-refresh if not already set
      if (!refreshTimers.has(key)) {
        const timer = setInterval(() => {
          if (cache.has(key)) {
            // Refresh the cache entry
            cache.delete(key);
            originalFn(...args); // This will cache the new result
          } else {
            // Key no longer in cache, stop refreshing
            clearInterval(timer);
            refreshTimers.delete(key);
          }
        }, refreshInterval);

        refreshTimers.set(key, timer);
      }

      return result;
    };

    return {
      ...cache,
      fn: cachedFn,
      clear: () => {
        cache.clear();
        for (const timer of refreshTimers.values()) {
          clearInterval(timer);
        }
        refreshTimers.clear();
      },
      stopRefresh: (key: string) => {
        const timer = refreshTimers.get(key);
        if (timer) {
          clearInterval(timer);
          refreshTimers.delete(key);
        }
      },
    };
  };
}

export { CachingUtils, type CacheOptions, type CacheStats, type CacheEntry };
