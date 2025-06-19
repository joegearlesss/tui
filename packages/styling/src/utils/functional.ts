import { z } from 'zod';

/**
 * Functional programming utilities for composing and transforming data
 * Provides pure functions for common functional programming patterns
 */

// Validation schemas
const _PipeSchema = z
  .object({
    value: z.unknown().describe('Initial value to transform'),
    functions: z.array(z.function()).describe('Array of transformation functions'),
  })
  .describe('Pipe operation parameters');

const _ComposeSchema = z
  .object({
    functions: z.array(z.function()).describe('Array of functions to compose'),
  })
  .describe('Function composition parameters');

// Types
type Predicate<T> = (value: T) => boolean;
type Mapper<T, U> = (value: T) => U;
type Reducer<T, U> = (accumulator: U, current: T) => U;
type Comparator<T> = (a: T, b: T) => number;

/**
 * Functional programming utilities namespace
 * Provides pure functions for data transformation and composition
 */
namespace FunctionalUtils {
  /**
   * Pipes a value through a series of transformation functions
   * @param value - Initial value
   * @param functions - Functions to apply in sequence
   * @returns Final transformed value
   */
  export const pipe = <T>(value: T, ...functions: readonly ((arg: any) => any)[]): any => {
    return functions.reduce((acc, fn) => fn(acc), value);
  };

  /**
   * Composes functions from right to left
   * @param functions - Functions to compose
   * @returns Composed function
   */
  export const compose = <T>(...functions: readonly ((arg: any) => any)[]): ((arg: T) => any) => {
    return (value: T) => functions.reduceRight((acc, fn) => fn(acc), value);
  };

  /**
   * Creates a curried version of a function
   * @param fn - Function to curry
   * @returns Curried function
   */
  export const curry = <T extends readonly any[], R>(
    fn: (...args: T) => R
  ): T extends readonly [infer A, ...infer Rest]
    ? (arg: A) => Rest extends readonly [] ? R : (...args: Rest) => R
    : () => R => {
    return ((...args: any[]) => {
      if (args.length >= fn.length) {
        return fn(...(args as T));
      }
      return (...nextArgs: any[]) => curry(fn)(...args, ...nextArgs);
    }) as any;
  };

  /**
   * Creates a partial application of a function
   * @param fn - Function to partially apply
   * @param args - Arguments to pre-fill
   * @returns Partially applied function
   */
  export const partial = <T extends readonly any[], U extends readonly any[], R>(
    fn: (...args: [...T, ...U]) => R,
    ...args: T
  ): ((...remainingArgs: U) => R) => {
    return (...remainingArgs: U) => fn(...args, ...remainingArgs);
  };

  /**
   * Creates a memoized version of a function
   * @param fn - Function to memoize
   * @param keyFn - Function to generate cache keys (optional)
   * @returns Memoized function
   */
  export const memoize = <T extends readonly any[], R>(
    fn: (...args: T) => R,
    keyFn?: (...args: T) => string
  ): ((...args: T) => R) & { cache: Map<string, R>; clear: () => void } => {
    const cache = new Map<string, R>();

    const memoized = (...args: T): R => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    };

    memoized.cache = cache;
    memoized.clear = () => cache.clear();

    return memoized;
  };

  /**
   * Creates a debounced version of a function
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  export const debounce = <T extends readonly any[]>(
    fn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) & { cancel: () => void } => {
    let timeoutId: Timer | undefined;

    const debounced = (...args: T): void => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn(...args);
        timeoutId = undefined;
      }, delay);
    };

    debounced.cancel = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    return debounced;
  };

  /**
   * Creates a throttled version of a function
   * @param fn - Function to throttle
   * @param delay - Delay in milliseconds
   * @returns Throttled function
   */
  export const throttle = <T extends readonly any[]>(
    fn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) & { cancel: () => void } => {
    let lastCall = 0;
    let timeoutId: Timer | undefined;

    const throttled = (...args: T): void => {
      const now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      } else if (timeoutId === undefined) {
        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            fn(...args);
            timeoutId = undefined;
          },
          delay - (now - lastCall)
        );
      }
    };

    throttled.cancel = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    return throttled;
  };

  /**
   * Creates a function that calls the original function only once
   * @param fn - Function to call once
   * @returns Function that can only be called once
   */
  export const once = <T extends readonly any[], R>(
    fn: (...args: T) => R
  ): ((...args: T) => R | undefined) => {
    let called = false;
    let result: R;

    return (...args: T): R | undefined => {
      if (!called) {
        called = true;
        result = fn(...args);
        return result;
      }
      return result;
    };
  };

  /**
   * Identity function - returns its argument unchanged
   * @param value - Value to return
   * @returns The same value
   */
  export const identity = <T>(value: T): T => value;

  /**
   * Constant function - returns a function that always returns the same value
   * @param value - Value to always return
   * @returns Function that returns the constant value
   */
  export const constant =
    <T>(value: T): (() => T) =>
    () =>
      value;

  /**
   * Negates a predicate function
   * @param predicate - Predicate to negate
   * @returns Negated predicate
   */
  export const not =
    <T>(predicate: Predicate<T>): Predicate<T> =>
    (value: T) =>
      !predicate(value);

  /**
   * Combines predicates with logical AND
   * @param predicates - Predicates to combine
   * @returns Combined predicate
   */
  export const and =
    <T>(...predicates: readonly Predicate<T>[]): Predicate<T> =>
    (value: T) =>
      predicates.every((predicate) => predicate(value));

  /**
   * Combines predicates with logical OR
   * @param predicates - Predicates to combine
   * @returns Combined predicate
   */
  export const or =
    <T>(...predicates: readonly Predicate<T>[]): Predicate<T> =>
    (value: T) =>
      predicates.some((predicate) => predicate(value));

  /**
   * Creates a predicate that checks if a value is equal to the given value
   * @param target - Value to compare against
   * @returns Equality predicate
   */
  export const equals =
    <T>(target: T): Predicate<T> =>
    (value: T) =>
      value === target;

  /**
   * Creates a predicate that checks if a value is greater than the given value
   * @param target - Value to compare against
   * @returns Greater than predicate
   */
  export const greaterThan =
    (target: number): Predicate<number> =>
    (value: number) =>
      value > target;

  /**
   * Creates a predicate that checks if a value is less than the given value
   * @param target - Value to compare against
   * @returns Less than predicate
   */
  export const lessThan =
    (target: number): Predicate<number> =>
    (value: number) =>
      value < target;

  /**
   * Creates a predicate that checks if a value is within a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Range predicate
   */
  export const inRange =
    (min: number, max: number): Predicate<number> =>
    (value: number) =>
      value >= min && value <= max;

  /**
   * Creates a mapper that extracts a property from an object
   * @param key - Property key to extract
   * @returns Property extraction mapper
   */
  export const prop =
    <T, K extends keyof T>(key: K): Mapper<T, T[K]> =>
    (obj: T) =>
      obj[key];

  /**
   * Creates a mapper that extracts a nested property from an object
   * @param path - Property path to extract
   * @returns Nested property extraction mapper
   */
  export const path =
    <T>(path: readonly (string | number)[]): Mapper<T, any> =>
    (obj: T) =>
      path.reduce((current: any, key) => current?.[key], obj);

  /**
   * Flips the arguments of a binary function
   * @param fn - Binary function to flip
   * @returns Function with flipped arguments
   */
  export const flip =
    <A, B, R>(fn: (a: A, b: B) => R): ((b: B, a: A) => R) =>
    (b: B, a: A) =>
      fn(a, b);

  /**
   * Creates a function that applies a list of functions to a single value
   * @param functions - Functions to apply
   * @returns Function that applies all functions
   */
  export const juxt =
    <T, R extends readonly any[]>(
      ...functions: readonly [(...args: any[]) => R[0], ...((arg: T) => any)[]]
    ): ((value: T) => R) =>
    (value: T) =>
      functions.map((fn) => fn(value)) as R;

  /**
   * Creates a function that applies different functions based on predicates
   * @param conditions - Array of [predicate, function] pairs
   * @param defaultFn - Default function if no predicate matches
   * @returns Conditional function
   */
  export const cond =
    <T, R>(
      conditions: readonly (readonly [Predicate<T>, Mapper<T, R>])[],
      defaultFn?: Mapper<T, R>
    ): Mapper<T, R | undefined> =>
    (value: T) => {
      for (const [predicate, fn] of conditions) {
        if (predicate(value)) {
          return fn(value);
        }
      }
      return defaultFn ? defaultFn(value) : undefined;
    };

  /**
   * Creates a comparator function for sorting
   * @param mapper - Function to extract comparison value
   * @param reverse - Whether to reverse the order
   * @returns Comparator function
   */
  export const compareBy =
    <T, U>(mapper: Mapper<T, U>, reverse = false): Comparator<T> =>
    (a: T, b: T) => {
      const aVal = mapper(a);
      const bVal = mapper(b);
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return reverse ? -result : result;
    };

  /**
   * Combines multiple comparators
   * @param comparators - Comparators to combine
   * @returns Combined comparator
   */
  export const combineComparators =
    <T>(...comparators: readonly Comparator<T>[]): Comparator<T> =>
    (a: T, b: T) => {
      for (const comparator of comparators) {
        const result = comparator(a, b);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    };
}

export { FunctionalUtils, type Predicate, type Mapper, type Reducer, type Comparator };
