import { describe, test, expect } from 'bun:test';
import { Result, type Ok, type Err } from './result';

describe('Result Type System', () => {
  describe('Construction', () => {
    test('ok creates successful Result', () => {
      const result = Result.ok(42);
      
      expect(result.success).toBe(true);
      expect(Result.isOk(result)).toBe(true);
      expect(Result.isErr(result)).toBe(false);
      
      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    test('err creates error Result', () => {
      const error = new Error('test error');
      const result = Result.err(error);
      
      expect(result.success).toBe(false);
      expect(Result.isOk(result)).toBe(false);
      expect(Result.isErr(result)).toBe(true);
      
      if (Result.isErr(result)) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('Type Guards', () => {
    test('isOk correctly identifies Ok results', () => {
      const okResult = Result.ok('success');
      const errResult = Result.err('error');
      
      expect(Result.isOk(okResult)).toBe(true);
      expect(Result.isOk(errResult)).toBe(false);
    });

    test('isErr correctly identifies Err results', () => {
      const okResult = Result.ok('success');
      const errResult = Result.err('error');
      
      expect(Result.isErr(okResult)).toBe(false);
      expect(Result.isErr(errResult)).toBe(true);
    });
  });

  describe('Transformation', () => {
    test('map transforms Ok values', () => {
      const result = Result.ok(5);
      const mapped = Result.map(result, x => x * 2);
      
      expect(Result.isOk(mapped)).toBe(true);
      if (Result.isOk(mapped)) {
        expect(mapped.value).toBe(10);
      }
    });

    test('map leaves Err unchanged', () => {
      const error = new Error('test');
      const result = Result.err(error);
      const mapped = Result.map(result, (x: number) => x * 2);
      
      expect(Result.isErr(mapped)).toBe(true);
      if (Result.isErr(mapped)) {
        expect(mapped.error).toBe(error);
      }
    });

    test('mapErr transforms Err values', () => {
      const result = Result.err('original error');
      const mapped = Result.mapErr(result, err => `transformed: ${err}`);
      
      expect(Result.isErr(mapped)).toBe(true);
      if (Result.isErr(mapped)) {
        expect(mapped.error).toBe('transformed: original error');
      }
    });

    test('mapErr leaves Ok unchanged', () => {
      const result = Result.ok(42);
      const mapped = Result.mapErr(result, err => `transformed: ${err}`);
      
      expect(Result.isOk(mapped)).toBe(true);
      if (Result.isOk(mapped)) {
        expect(mapped.value).toBe(42);
      }
    });
  });

  describe('Chaining', () => {
    test('chain applies function to Ok values', () => {
      const result = Result.ok(5);
      const chained = Result.chain(result, x => 
        x > 0 ? Result.ok(x * 2) : Result.err('negative number')
      );
      
      expect(Result.isOk(chained)).toBe(true);
      if (Result.isOk(chained)) {
        expect(chained.value).toBe(10);
      }
    });

    test('chain can convert Ok to Err', () => {
      const result = Result.ok(-5);
      const chained = Result.chain(result, x => 
        x > 0 ? Result.ok(x * 2) : Result.err('negative number')
      );
      
      expect(Result.isErr(chained)).toBe(true);
      if (Result.isErr(chained)) {
        expect(chained.error).toBe('negative number');
      }
    });

    test('chain skips Err values', () => {
      const error = new Error('original');
      const result = Result.err(error);
      const chained = Result.chain(result, (x: number) => Result.ok(x * 2));
      
      expect(Result.isErr(chained)).toBe(true);
      if (Result.isErr(chained)) {
        expect(chained.error).toBe(error);
      }
    });
  });

  describe('Unwrapping', () => {
    test('unwrapOr returns value for Ok', () => {
      const result = Result.ok(42);
      const value = Result.unwrapOr(result, 0);
      
      expect(value).toBe(42);
    });

    test('unwrapOr returns default for Err', () => {
      const result = Result.err('error');
      const value = Result.unwrapOr(result, 0);
      
      expect(value).toBe(0);
    });

    test('unwrapOrElse returns value for Ok', () => {
      const result = Result.ok(42);
      const value = Result.unwrapOrElse(result, err => 0);
      
      expect(value).toBe(42);
    });

    test('unwrapOrElse computes default for Err', () => {
      const result = Result.err('error');
      const value = Result.unwrapOrElse(result, err => err.length);
      
      expect(value).toBe(5); // 'error'.length
    });
  });

  describe('Combination', () => {
    test('all returns Ok with array for all Ok results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.all(results);
      
      expect(Result.isOk(combined)).toBe(true);
      if (Result.isOk(combined)) {
        expect(combined.value).toEqual([1, 2, 3]);
      }
    });

    test('all returns first Err if any result is Err', () => {
      const error = new Error('test error');
      const results = [Result.ok(1), Result.err(error), Result.ok(3)];
      const combined = Result.all(results);
      
      expect(Result.isErr(combined)).toBe(true);
      if (Result.isErr(combined)) {
        expect(combined.error).toBe(error);
      }
    });

    test('all returns Ok for empty array', () => {
      const results: Result<number, string>[] = [];
      const combined = Result.all(results);
      
      expect(Result.isOk(combined)).toBe(true);
      if (Result.isOk(combined)) {
        expect(combined.value).toEqual([]);
      }
    });
  });

  describe('Exception Handling', () => {
    test('fromThrowable converts throwing function to Result', () => {
      const throwingFn = (x: number): number => {
        if (x < 0) throw new Error('negative');
        return x * 2;
      };
      
      const safeFn = Result.fromThrowable(throwingFn);
      
      const okResult = safeFn(5);
      expect(Result.isOk(okResult)).toBe(true);
      if (Result.isOk(okResult)) {
        expect(okResult.value).toBe(10);
      }
      
      const errResult = safeFn(-1);
      expect(Result.isErr(errResult)).toBe(true);
      if (Result.isErr(errResult)) {
        expect(errResult.error.message).toBe('negative');
      }
    });

    test('fromThrowableAsync converts async throwing function to Result', async () => {
      const throwingFn = async (x: number): Promise<number> => {
        if (x < 0) throw new Error('negative');
        return x * 2;
      };
      
      const safeFn = Result.fromThrowableAsync(throwingFn);
      
      const okResult = await safeFn(5);
      expect(Result.isOk(okResult)).toBe(true);
      if (Result.isOk(okResult)) {
        expect(okResult.value).toBe(10);
      }
      
      const errResult = await safeFn(-1);
      expect(Result.isErr(errResult)).toBe(true);
      if (Result.isErr(errResult)) {
        expect(errResult.error.message).toBe('negative');
      }
    });
  });

  describe('Side Effects', () => {
    test('tap executes function on Ok value without changing Result', () => {
      const result = Result.ok(42);
      let sideEffect = 0;
      
      const tapped = Result.tap(result, value => {
        sideEffect = value;
      });
      
      expect(tapped).toBe(result); // Same reference
      expect(sideEffect).toBe(42);
    });

    test('tap does not execute function on Err', () => {
      const result = Result.err('error');
      let sideEffect = 0;
      
      const tapped = Result.tap(result, value => {
        sideEffect = 42;
      });
      
      expect(tapped).toBe(result); // Same reference
      expect(sideEffect).toBe(0); // Not executed
    });

    test('tapErr executes function on Err value without changing Result', () => {
      const result = Result.err('error');
      let sideEffect = '';
      
      const tapped = Result.tapErr(result, error => {
        sideEffect = error;
      });
      
      expect(tapped).toBe(result); // Same reference
      expect(sideEffect).toBe('error');
    });

    test('tapErr does not execute function on Ok', () => {
      const result = Result.ok(42);
      let sideEffect = '';
      
      const tapped = Result.tapErr(result, error => {
        sideEffect = 'executed';
      });
      
      expect(tapped).toBe(result); // Same reference
      expect(sideEffect).toBe(''); // Not executed
    });
  });

  describe('Complex Workflows', () => {
    test('chains multiple operations together', () => {
      const parseNumber = (str: string): Result<number, string> => {
        const num = Number.parseFloat(str);
        return Number.isNaN(num) ? Result.err('Invalid number') : Result.ok(num);
      };
      
      const validatePositive = (num: number): Result<number, string> => {
        return num > 0 ? Result.ok(num) : Result.err('Number must be positive');
      };
      
      const workflow = (input: string): Result<number, string> => {
        return Result.chain(
          parseNumber(input),
          num => validatePositive(num)
        );
      };
      
      expect(Result.isOk(workflow('42'))).toBe(true);
      expect(Result.isErr(workflow('-5'))).toBe(true);
      expect(Result.isErr(workflow('not-a-number'))).toBe(true);
    });

    test('processes array of inputs with proper error handling', () => {
      const processItem = (x: number): Result<number, string> => {
        return x > 0 ? Result.ok(x * 2) : Result.err(`Invalid item: ${x}`);
      };
      
      const processAll = (items: number[]): Result<number[], string> => {
        const results = items.map(processItem);
        return Result.all(results);
      };
      
      const validItems = [1, 2, 3];
      const validResult = processAll(validItems);
      expect(Result.isOk(validResult)).toBe(true);
      if (Result.isOk(validResult)) {
        expect(validResult.value).toEqual([2, 4, 6]);
      }
      
      const invalidItems = [1, -2, 3];
      const invalidResult = processAll(invalidItems);
      expect(Result.isErr(invalidResult)).toBe(true);
    });
  });
});