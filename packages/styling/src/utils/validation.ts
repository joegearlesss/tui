import { z } from 'zod';

/**
 * Common validation utilities for data validation and type checking
 * Provides reusable validation functions and schemas
 */

// Common validation schemas
const EmailSchema = z
  .string()
  .email('Must be a valid email address')
  .describe('Email address validation');

const UrlSchema = z.string().url('Must be a valid URL').describe('URL validation');

const UuidSchema = z.string().uuid('Must be a valid UUID').describe('UUID validation');

const ColorHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #FF0000)')
  .describe('Hexadecimal color validation');

const PortSchema = z
  .number()
  .int('Port must be an integer')
  .min(1, 'Port must be at least 1')
  .max(65535, 'Port must not exceed 65535')
  .describe('Network port validation');

const PositiveIntegerSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be positive')
  .describe('Positive integer validation');

const NonNegativeIntegerSchema = z
  .number()
  .int('Must be an integer')
  .min(0, 'Must be non-negative')
  .describe('Non-negative integer validation');

const PercentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage must not exceed 100')
  .describe('Percentage validation (0-100)');

const NormalizedPercentageSchema = z
  .number()
  .min(0, 'Normalized percentage must be at least 0')
  .max(1, 'Normalized percentage must not exceed 1')
  .describe('Normalized percentage validation (0-1)');

// Types
type ValidationResult<T> = {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: readonly string[];
};

type ValidatorFunction<T> = (value: unknown) => ValidationResult<T>;

/**
 * Common validation utilities namespace
 * Provides reusable validation functions and type guards
 */
namespace ValidationUtils {
  /**
   * Creates a validation result for success
   * @param data - Validated data
   * @returns Success validation result
   */
  export const success = <T>(data: T): ValidationResult<T> => ({
    success: true,
    data,
  });

  /**
   * Creates a validation result for failure
   * @param errors - Array of error messages
   * @returns Failure validation result
   */
  export const failure = (errors: readonly string[]): ValidationResult<never> => ({
    success: false,
    errors,
  });

  /**
   * Validates an email address
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateEmail: ValidatorFunction<string> = (value: unknown) => {
    try {
      const email = EmailSchema.parse(value);
      return success(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid email format']);
    }
  };

  /**
   * Validates a URL
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateUrl: ValidatorFunction<string> = (value: unknown) => {
    try {
      const url = UrlSchema.parse(value);
      return success(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid URL format']);
    }
  };

  /**
   * Validates a UUID
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateUuid: ValidatorFunction<string> = (value: unknown) => {
    try {
      const uuid = UuidSchema.parse(value);
      return success(uuid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid UUID format']);
    }
  };

  /**
   * Validates a hex color
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateHexColor: ValidatorFunction<string> = (value: unknown) => {
    try {
      const color = ColorHexSchema.parse(value);
      return success(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid hex color format']);
    }
  };

  /**
   * Validates a network port
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validatePort: ValidatorFunction<number> = (value: unknown) => {
    try {
      const port = PortSchema.parse(value);
      return success(port);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid port number']);
    }
  };

  /**
   * Validates a positive integer
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validatePositiveInteger: ValidatorFunction<number> = (value: unknown) => {
    try {
      const num = PositiveIntegerSchema.parse(value);
      return success(num);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid positive integer']);
    }
  };

  /**
   * Validates a non-negative integer
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateNonNegativeInteger: ValidatorFunction<number> = (value: unknown) => {
    try {
      const num = NonNegativeIntegerSchema.parse(value);
      return success(num);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid non-negative integer']);
    }
  };

  /**
   * Validates a percentage (0-100)
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validatePercentage: ValidatorFunction<number> = (value: unknown) => {
    try {
      const percentage = PercentageSchema.parse(value);
      return success(percentage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid percentage']);
    }
  };

  /**
   * Validates a normalized percentage (0-1)
   * @param value - Value to validate
   * @returns Validation result
   */
  export const validateNormalizedPercentage: ValidatorFunction<number> = (value: unknown) => {
    try {
      const percentage = NormalizedPercentageSchema.parse(value);
      return success(percentage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return failure(error.errors.map((e) => e.message));
      }
      return failure(['Invalid normalized percentage']);
    }
  };

  /**
   * Type guard to check if a value is a string
   * @param value - Value to check
   * @returns True if value is a string
   */
  export const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };

  /**
   * Type guard to check if a value is a number
   * @param value - Value to check
   * @returns True if value is a number
   */
  export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !Number.isNaN(value);
  };

  /**
   * Type guard to check if a value is a boolean
   * @param value - Value to check
   * @returns True if value is a boolean
   */
  export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  };

  /**
   * Type guard to check if a value is an object
   * @param value - Value to check
   * @returns True if value is an object
   */
  export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  };

  /**
   * Type guard to check if a value is an array
   * @param value - Value to check
   * @returns True if value is an array
   */
  export const isArray = (value: unknown): value is readonly unknown[] => {
    return Array.isArray(value);
  };

  /**
   * Type guard to check if a value is null
   * @param value - Value to check
   * @returns True if value is null
   */
  export const isNull = (value: unknown): value is null => {
    return value === null;
  };

  /**
   * Type guard to check if a value is undefined
   * @param value - Value to check
   * @returns True if value is undefined
   */
  export const isUndefined = (value: unknown): value is undefined => {
    return value === undefined;
  };

  /**
   * Type guard to check if a value is null or undefined
   * @param value - Value to check
   * @returns True if value is null or undefined
   */
  export const isNullish = (value: unknown): value is null | undefined => {
    return value === null || value === undefined;
  };

  /**
   * Type guard to check if a value is a function
   * @param value - Value to check
   * @returns True if value is a function
   */
  export const isFunction = (value: unknown): value is (...args: readonly unknown[]) => unknown => {
    return typeof value === 'function';
  };

  /**
   * Type guard to check if a value is a Date
   * @param value - Value to check
   * @returns True if value is a Date
   */
  export const isDate = (value: unknown): value is Date => {
    return value instanceof Date && !Number.isNaN(value.getTime());
  };

  /**
   * Type guard to check if a value is a RegExp
   * @param value - Value to check
   * @returns True if value is a RegExp
   */
  export const isRegExp = (value: unknown): value is RegExp => {
    return value instanceof RegExp;
  };

  /**
   * Type guard to check if a value is a Promise
   * @param value - Value to check
   * @returns True if value is a Promise
   */
  export const isPromise = (value: unknown): value is Promise<unknown> => {
    return (
      value instanceof Promise ||
      (isObject(value) &&
        isFunction((value as Record<string, unknown>).then) &&
        isFunction((value as Record<string, unknown>).catch))
    );
  };

  /**
   * Validates that a value is one of the allowed values
   * @param allowedValues - Array of allowed values
   * @returns Validator function
   */
  export const validateEnum =
    <T>(allowedValues: readonly T[]) =>
    (value: unknown): ValidationResult<T> => {
      if (allowedValues.includes(value as T)) {
        return success(value as T);
      }
      return failure([`Value must be one of: ${allowedValues.join(', ')}`]);
    };

  /**
   * Validates that a string matches a pattern
   * @param pattern - Regular expression pattern
   * @param message - Error message
   * @returns Validator function
   */
  export const validatePattern =
    (pattern: RegExp, message = 'Invalid format') =>
    (value: unknown): ValidationResult<string> => {
      if (!isString(value)) {
        return failure(['Value must be a string']);
      }

      if (pattern.test(value)) {
        return success(value);
      }

      return failure([message]);
    };

  /**
   * Validates that a number is within a range
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Validator function
   */
  export const validateRange =
    (min: number, max: number) =>
    (value: unknown): ValidationResult<number> => {
      if (!isNumber(value)) {
        return failure(['Value must be a number']);
      }

      if (value >= min && value <= max) {
        return success(value);
      }

      return failure([`Value must be between ${min} and ${max}`]);
    };

  /**
   * Validates that a string has a specific length range
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @returns Validator function
   */
  export const validateStringLength =
    (minLength: number, maxLength?: number) =>
    (value: unknown): ValidationResult<string> => {
      if (!isString(value)) {
        return failure(['Value must be a string']);
      }

      if (value.length < minLength) {
        return failure([`String must be at least ${minLength} characters long`]);
      }

      if (maxLength !== undefined && value.length > maxLength) {
        return failure([`String must not exceed ${maxLength} characters`]);
      }

      return success(value);
    };

  /**
   * Validates that an array has a specific length range
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @returns Validator function
   */
  export const validateArrayLength =
    (minLength: number, maxLength?: number) =>
    (value: unknown): ValidationResult<readonly unknown[]> => {
      if (!isArray(value)) {
        return failure(['Value must be an array']);
      }

      if (value.length < minLength) {
        return failure([`Array must have at least ${minLength} items`]);
      }

      if (maxLength !== undefined && value.length > maxLength) {
        return failure([`Array must not exceed ${maxLength} items`]);
      }

      return success(value);
    };

  /**
   * Combines multiple validators with AND logic
   * @param validators - Array of validator functions
   * @returns Combined validator function
   */
  export const combineValidators =
    <T>(...validators: readonly ValidatorFunction<T>[]) =>
    (value: unknown): ValidationResult<T> => {
      const errors: string[] = [];
      let lastSuccessData: T | undefined;

      for (const validator of validators) {
        const result = validator(value);
        if (!result.success) {
          errors.push(...(result.errors || []));
        } else {
          lastSuccessData = result.data;
        }
      }

      if (errors.length > 0) {
        return failure(errors);
      }

      return success(lastSuccessData!);
    };

  /**
   * Creates a validator that allows undefined values
   * @param validator - Base validator function
   * @returns Optional validator function
   */
  export const optional =
    <T>(validator: ValidatorFunction<T>) =>
    (value: unknown): ValidationResult<T | undefined> => {
      if (isUndefined(value)) {
        return success(undefined);
      }

      const result = validator(value);
      if (result.success) {
        return success(result.data);
      }

      return failure(result.errors || []);
    };

  /**
   * Creates a validator for arrays of a specific type
   * @param itemValidator - Validator for array items
   * @returns Array validator function
   */
  export const validateArray =
    <T>(itemValidator: ValidatorFunction<T>) =>
    (value: unknown): ValidationResult<readonly T[]> => {
      if (!isArray(value)) {
        return failure(['Value must be an array']);
      }

      const errors: string[] = [];
      const validatedItems: T[] = [];

      for (let i = 0; i < value.length; i++) {
        const itemResult = itemValidator(value[i]);
        if (itemResult.success) {
          validatedItems.push(itemResult.data!);
        } else {
          errors.push(`Item ${i}: ${itemResult.errors?.join(', ') || 'Invalid'}`);
        }
      }

      if (errors.length > 0) {
        return failure(errors);
      }

      return success(validatedItems);
    };

  /**
   * Creates a validator for objects with specific properties
   * @param schema - Object with property validators
   * @returns Object validator function
   */
  export const validateObject =
    <T extends Record<string, unknown>>(
      schema: { readonly [K in keyof T]: ValidatorFunction<T[K]> }
    ) =>
    (value: unknown): ValidationResult<T> => {
      if (!isObject(value)) {
        return failure(['Value must be an object']);
      }

      const errors: string[] = [];
      const validatedObject = {} as T;

      for (const [key, validator] of Object.entries(schema)) {
        const propertyResult = validator((value as Record<string, unknown>)[key]);
        if (propertyResult.success) {
          (validatedObject as Record<string, unknown>)[key] = propertyResult.data;
        } else {
          errors.push(`Property '${key}': ${propertyResult.errors?.join(', ') || 'Invalid'}`);
        }
      }

      if (errors.length > 0) {
        return failure(errors);
      }

      return success(validatedObject);
    };
}

export {
  ValidationUtils,
  type ValidationResult,
  type ValidatorFunction,
  EmailSchema,
  UrlSchema,
  UuidSchema,
  ColorHexSchema,
  PortSchema,
  PositiveIntegerSchema,
  NonNegativeIntegerSchema,
  PercentageSchema,
  NormalizedPercentageSchema,
};
