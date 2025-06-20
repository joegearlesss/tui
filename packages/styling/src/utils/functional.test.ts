import { describe, expect, test } from 'bun:test';
import { FunctionalUtils } from './functional';

describe('FunctionalUtils', () => {
  describe('pipe', () => {
    test('should pipe value through functions', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const toStringFn = (x: number) => x.toString();

      const result = FunctionalUtils.pipe(5, add1, multiply2, toStringFn);
      expect(result).toBe('12'); // (5 + 1) * 2 = 12
    });

    test('should handle single function', () => {
      const double = (x: number) => x * 2;
      expect(FunctionalUtils.pipe(5, double)).toBe(10);
    });

    test('should handle no functions', () => {
      expect(FunctionalUtils.pipe(5)).toBe(5);
    });
  });

  describe('compose', () => {
    test('should compose functions right to left', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;

      const composed = FunctionalUtils.compose(add1, multiply2);
      expect(composed(5)).toBe(11); // 5 * 2 + 1 = 11
    });

    test('should handle single function', () => {
      const double = (x: number) => x * 2;
      const composed = FunctionalUtils.compose(double);
      expect(composed(5)).toBe(10);
    });
  });

  describe('curry', () => {
    test('should curry a function', () => {
      const add = (a: number, b: number, c: number) => a + b + c;
      const curried = FunctionalUtils.curry(add);

      expect((curried as any)(1)(2)(3)).toBe(6);
      expect((curried as any)(1, 2)(3)).toBe(6);
      expect((curried as any)(1)(2, 3)).toBe(6);
      expect((curried as any)(1, 2, 3)).toBe(6);
    });

    test('should handle single argument function', () => {
      const double = (x: number) => x * 2;
      const curried = FunctionalUtils.curry(double);
      expect(curried(5)).toBe(10);
    });
  });

  describe('partial', () => {
    test('should partially apply function', () => {
      const add = (a: number, b: number, c: number) => a + b + c;
      const add5 = FunctionalUtils.partial(add, 5);

      expect(add5(2, 3)).toBe(10);
    });

    test('should handle multiple partial applications', () => {
      const add = (a: number, b: number, c: number) => a + b + c;
      const add5 = FunctionalUtils.partial(add, 5);
      const add5and2 = FunctionalUtils.partial(add5, 2);

      expect(add5and2(3)).toBe(10);
    });
  });

  describe('memoize', () => {
    test('should memoize function results', () => {
      let callCount = 0;
      const expensive = (x: number) => {
        callCount++;
        return x * x;
      };

      const memoized = FunctionalUtils.memoize(expensive);

      expect(memoized(5)).toBe(25);
      expect(memoized(5)).toBe(25);
      expect(callCount).toBe(1);

      expect(memoized(3)).toBe(9);
      expect(callCount).toBe(2);
    });

    test('should use custom key function', () => {
      let callCount = 0;
      const fn = (obj: { id: number; name: string }) => {
        callCount++;
        return obj.name.toUpperCase();
      };

      const memoized = FunctionalUtils.memoize(fn, (obj) => obj.id.toString());

      expect(memoized({ id: 1, name: 'test' })).toBe('TEST');
      expect(memoized({ id: 1, name: 'different' })).toBe('TEST'); // Same ID, cached
      expect(callCount).toBe(1);
    });

    test('should clear cache', () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoized = FunctionalUtils.memoize(fn);

      memoized(5);
      expect(callCount).toBe(1);

      memoized.clear();
      memoized(5);
      expect(callCount).toBe(2);
    });
  });

  describe('debounce', () => {
    test('should debounce function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;

      const debounced = FunctionalUtils.debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(callCount).toBe(1);
    });

    test('should cancel debounced calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;

      const debounced = FunctionalUtils.debounce(fn, 50);

      debounced();
      debounced.cancel();

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(callCount).toBe(0);
    });
  });

  describe('throttle', () => {
    test('should throttle function calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;

      const throttled = FunctionalUtils.throttle(fn, 50);

      throttled(); // Called immediately
      throttled(); // Ignored
      throttled(); // Ignored

      expect(callCount).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(callCount).toBe(2); // One more call after delay
    });

    test('should cancel throttled calls', async () => {
      let callCount = 0;
      const fn = () => callCount++;

      const throttled = FunctionalUtils.throttle(fn, 50);

      throttled();
      throttled();
      throttled.cancel();

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(callCount).toBe(1); // Only the immediate call
    });
  });

  describe('once', () => {
    test('should call function only once', () => {
      let callCount = 0;
      const fn = () => ++callCount;

      const onceFn = FunctionalUtils.once(fn);

      expect(onceFn()).toBe(1);
      expect(onceFn()).toBe(1);
      expect(onceFn()).toBe(1);
      expect(callCount).toBe(1);
    });

    test('should return undefined after first call for void functions', () => {
      let called = false;
      const fn = () => {
        called = true;
      };

      const onceFn = FunctionalUtils.once(fn);

      onceFn();
      expect(called).toBe(true);

      const result = onceFn();
      expect(result).toBeUndefined();
    });
  });

  describe('identity', () => {
    test('should return the same value', () => {
      expect(FunctionalUtils.identity(5)).toBe(5);
      expect(FunctionalUtils.identity('test')).toBe('test');
      expect(FunctionalUtils.identity(null)).toBe(null);
      expect(FunctionalUtils.identity(undefined)).toBe(undefined);
    });
  });

  describe('constant', () => {
    test('should return a function that always returns the same value', () => {
      const constantFn = FunctionalUtils.constant(42);
      expect(constantFn()).toBe(42);
      expect(constantFn()).toBe(42);
    });
  });

  describe('not', () => {
    test('should negate a predicate', () => {
      const isEven = (x: number) => x % 2 === 0;
      const isOdd = FunctionalUtils.not(isEven);

      expect(isOdd(3)).toBe(true);
      expect(isOdd(4)).toBe(false);
    });
  });

  describe('and', () => {
    test('should combine predicates with AND logic', () => {
      const isPositive = (x: number) => x > 0;
      const isEven = (x: number) => x % 2 === 0;
      const isPositiveEven = FunctionalUtils.and(isPositive, isEven);

      expect(isPositiveEven(4)).toBe(true);
      expect(isPositiveEven(3)).toBe(false);
      expect(isPositiveEven(-4)).toBe(false);
    });
  });

  describe('or', () => {
    test('should combine predicates with OR logic', () => {
      const isZero = (x: number) => x === 0;
      const isPositive = (x: number) => x > 0;
      const isNonNegative = FunctionalUtils.or(isZero, isPositive);

      expect(isNonNegative(0)).toBe(true);
      expect(isNonNegative(5)).toBe(true);
      expect(isNonNegative(-1)).toBe(false);
    });
  });

  describe('equals', () => {
    test('should create equality predicate', () => {
      const isHello = FunctionalUtils.equals('hello');

      expect(isHello('hello')).toBe(true);
      expect(isHello('world')).toBe(false);
    });
  });

  describe('greaterThan', () => {
    test('should create greater than predicate', () => {
      const isGreaterThan5 = FunctionalUtils.greaterThan(5);

      expect(isGreaterThan5(6)).toBe(true);
      expect(isGreaterThan5(5)).toBe(false);
      expect(isGreaterThan5(4)).toBe(false);
    });
  });

  describe('lessThan', () => {
    test('should create less than predicate', () => {
      const isLessThan5 = FunctionalUtils.lessThan(5);

      expect(isLessThan5(4)).toBe(true);
      expect(isLessThan5(5)).toBe(false);
      expect(isLessThan5(6)).toBe(false);
    });
  });

  describe('inRange', () => {
    test('should create range predicate', () => {
      const isInRange = FunctionalUtils.inRange(1, 10);

      expect(isInRange(5)).toBe(true);
      expect(isInRange(1)).toBe(true);
      expect(isInRange(10)).toBe(true);
      expect(isInRange(0)).toBe(false);
      expect(isInRange(11)).toBe(false);
    });
  });

  describe('prop', () => {
    test('should extract property from object', () => {
      const getName = FunctionalUtils.prop('name');
      const obj = { name: 'John', age: 30 };

      expect(getName(obj)).toBe('John');
    });
  });

  describe('path', () => {
    test('should extract nested property from object', () => {
      const getStreetName = FunctionalUtils.path(['address', 'street', 'name']);
      const obj = {
        address: {
          street: {
            name: 'Main St',
            number: 123,
          },
        },
      };

      expect(getStreetName(obj)).toBe('Main St');
    });

    test('should handle missing properties', () => {
      const getStreetName = FunctionalUtils.path(['address', 'street', 'name']);
      const obj = { address: {} };

      expect(getStreetName(obj)).toBeUndefined();
    });
  });

  describe('flip', () => {
    test('should flip function arguments', () => {
      const subtract = (a: number, b: number) => a - b;
      const flippedSubtract = FunctionalUtils.flip(subtract);

      expect(subtract(10, 3)).toBe(7);
      expect(flippedSubtract(3, 10)).toBe(7);
    });
  });

  describe('juxt', () => {
    test('should apply multiple functions to same value', () => {
      const double = (x: number) => x * 2;
      const square = (x: number) => x * x;
      const toStringFn = (x: number) => x.toString();

      const combined = FunctionalUtils.juxt(double, square, toStringFn);
      const result = combined(5);

      expect(result).toEqual([10, 25, '5']);
    });
  });

  describe('cond', () => {
    test('should apply function based on predicate', () => {
      const isPositive = (x: number) => x > 0;
      const isZero = (x: number) => x === 0;
      const abs = (x: number) => Math.abs(x);
      const zero = () => 0;
      const identity = (x: number) => x;

      const conditional = FunctionalUtils.cond(
        [
          [isPositive, identity],
          [isZero, zero],
        ],
        abs
      );

      expect(conditional(5)).toBe(5);
      expect(conditional(0)).toBe(0);
      expect(conditional(-3)).toBe(3);
    });

    test('should return undefined if no predicate matches and no default', () => {
      const isPositive = (x: number) => x > 0;
      const identity = (x: number) => x;

      const conditional = FunctionalUtils.cond([[isPositive, identity]]);

      expect(conditional(-1)).toBeUndefined();
    });
  });

  describe('compareBy', () => {
    test('should create comparator function', () => {
      const byLength = FunctionalUtils.compareBy((s: string) => s.length);

      expect(byLength('abc', 'ab')).toBeGreaterThan(0);
      expect(byLength('ab', 'abc')).toBeLessThan(0);
      expect(byLength('abc', 'def')).toBe(0);
    });

    test('should handle reverse order', () => {
      const byLengthDesc = FunctionalUtils.compareBy((s: string) => s.length, true);

      expect(byLengthDesc('abc', 'ab')).toBeLessThan(0);
      expect(byLengthDesc('ab', 'abc')).toBeGreaterThan(0);
    });
  });

  describe('combineComparators', () => {
    test('should combine multiple comparators', () => {
      const byLength = FunctionalUtils.compareBy((s: string) => s.length);
      const alphabetical = FunctionalUtils.compareBy((s: string) => s);

      const combined = FunctionalUtils.combineComparators(byLength, alphabetical);

      // Same length, so falls back to alphabetical
      expect(combined('abc', 'def')).toBeLessThan(0);

      // Different length, length takes precedence
      expect(combined('ab', 'xyz')).toBeLessThan(0);
    });
  });
});
