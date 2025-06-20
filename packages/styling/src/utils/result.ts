/**
 * Functional Error Handling with Result Types
 * 
 * Provides Result<T, E> type for functional error handling without exceptions.
 * Follows functional programming principles by making errors explicit in the type system.
 */

/**
 * Result type for functional error handling
 * Either contains a successful value (Ok) or an error (Err)
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Successful result containing a value
 */
export interface Ok<T> {
  readonly success: true;
  readonly value: T;
}

/**
 * Error result containing an error
 */
export interface Err<E> {
  readonly success: false;
  readonly error: E;
}

/**
 * Result utility functions following functional programming principles
 */
export namespace Result {
  /**
   * Creates a successful Result
   * @param value - The success value
   * @returns Ok result containing the value
   */
  export const ok = <T>(value: T): Ok<T> => ({
    success: true,
    value,
  });

  /**
   * Creates an error Result
   * @param error - The error value
   * @returns Err result containing the error
   */
  export const err = <E>(error: E): Err<E> => ({
    success: false,
    error,
  });

  /**
   * Checks if a Result is successful
   * @param result - Result to check
   * @returns True if Result is Ok
   */
  export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => {
    return result.success;
  };

  /**
   * Checks if a Result is an error
   * @param result - Result to check
   * @returns True if Result is Err
   */
  export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => {
    return !result.success;
  };

  /**
   * Maps a function over the value of an Ok result
   * @param result - Result to map over
   * @param fn - Function to apply to the value
   * @returns New Result with mapped value, or original Err
   */
  export const map = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> => {
    return isOk(result) ? ok(fn(result.value)) : result;
  };

  /**
   * Maps a function over the error of an Err result
   * @param result - Result to map over
   * @param fn - Function to apply to the error
   * @returns New Result with mapped error, or original Ok
   */
  export const mapErr = <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> => {
    return isErr(result) ? err(fn(result.error)) : result;
  };

  /**
   * Chains Result operations together (flatMap/bind)
   * @param result - Result to chain from
   * @param fn - Function that returns a new Result
   * @returns Chained Result
   */
  export const chain = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> => {
    return isOk(result) ? fn(result.value) : result;
  };

  /**
   * Gets the value from an Ok result or returns a default
   * @param result - Result to unwrap
   * @param defaultValue - Default value if Result is Err
   * @returns The value or default
   */
  export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
    return isOk(result) ? result.value : defaultValue;
  };

  /**
   * Gets the value from an Ok result or computes a default
   * @param result - Result to unwrap
   * @param fn - Function to compute default from error
   * @returns The value or computed default
   */
  export const unwrapOrElse = <T, E>(
    result: Result<T, E>,
    fn: (error: E) => T
  ): T => {
    return isOk(result) ? result.value : fn(result.error);
  };

  /**
   * Combines multiple Results into a single Result containing an array
   * All Results must be Ok for the combined Result to be Ok
   * @param results - Array of Results to combine
   * @returns Result containing array of values or first error
   */
  export const all = <T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> => {
    const values: T[] = [];
    
    for (const result of results) {
      if (isErr(result)) {
        return result;
      }
      values.push(result.value);
    }
    
    return ok(values);
  };

  /**
   * Converts a function that might throw into a Result-returning function
   * @param fn - Function that might throw
   * @returns Function that returns Result instead of throwing
   */
  export const fromThrowable = <T, Args extends readonly unknown[]>(
    fn: (...args: Args) => T
  ) => {
    return (...args: Args): Result<T, Error> => {
      try {
        return ok(fn(...args));
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    };
  };

  /**
   * Converts an async function that might throw into a Result-returning function
   * @param fn - Async function that might throw
   * @returns Async function that returns Result instead of throwing
   */
  export const fromThrowableAsync = <T, Args extends readonly unknown[]>(
    fn: (...args: Args) => Promise<T>
  ) => {
    return async (...args: Args): Promise<Result<T, Error>> => {
      try {
        const value = await fn(...args);
        return ok(value);
      } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
      }
    };
  };

  /**
   * Executes a function on the Ok value without changing the Result
   * Useful for side effects like logging
   * @param result - Result to inspect
   * @param fn - Function to execute on Ok value
   * @returns Original result unchanged
   */
  export const tap = <T, E>(
    result: Result<T, E>,
    fn: (value: T) => void
  ): Result<T, E> => {
    if (isOk(result)) {
      fn(result.value);
    }
    return result;
  };

  /**
   * Executes a function on the Err value without changing the Result
   * Useful for side effects like error logging
   * @param result - Result to inspect
   * @param fn - Function to execute on Err value
   * @returns Original result unchanged
   */
  export const tapErr = <T, E>(
    result: Result<T, E>,
    fn: (error: E) => void
  ): Result<T, E> => {
    if (isErr(result)) {
      fn(result.error);
    }
    return result;
  };
}

