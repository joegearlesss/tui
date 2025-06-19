import { describe, expect, test } from 'bun:test';
import { ValidationUtils } from './validation';

describe('ValidationUtils', () => {
  describe('success and failure helpers', () => {
    test('should create success result', () => {
      const result = ValidationUtils.success('test');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test');
      expect(result.errors).toBeUndefined();
    });

    test('should create failure result', () => {
      const result = ValidationUtils.failure(['Error 1', 'Error 2']);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      const result = ValidationUtils.validateEmail('test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    test('should reject invalid email addresses', () => {
      const result = ValidationUtils.validateEmail('invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    test('should reject non-string values', () => {
      const result = ValidationUtils.validateEmail(123);
      expect(result.success).toBe(false);
    });
  });

  describe('validateUrl', () => {
    test('should validate correct URLs', () => {
      const result = ValidationUtils.validateUrl('https://example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('https://example.com');
    });

    test('should reject invalid URLs', () => {
      const result = ValidationUtils.validateUrl('not-a-url');
      expect(result.success).toBe(false);
    });
  });

  describe('validateUuid', () => {
    test('should validate correct UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = ValidationUtils.validateUuid(uuid);
      expect(result.success).toBe(true);
      expect(result.data).toBe(uuid);
    });

    test('should reject invalid UUIDs', () => {
      const result = ValidationUtils.validateUuid('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('validateHexColor', () => {
    test('should validate correct hex colors', () => {
      const result = ValidationUtils.validateHexColor('#FF0000');
      expect(result.success).toBe(true);
      expect(result.data).toBe('#FF0000');
    });

    test('should reject invalid hex colors', () => {
      expect(ValidationUtils.validateHexColor('#GG0000').success).toBe(false);
      expect(ValidationUtils.validateHexColor('FF0000').success).toBe(false);
      expect(ValidationUtils.validateHexColor('#FF00').success).toBe(false);
    });
  });

  describe('validatePort', () => {
    test('should validate correct port numbers', () => {
      const result = ValidationUtils.validatePort(8080);
      expect(result.success).toBe(true);
      expect(result.data).toBe(8080);
    });

    test('should reject invalid port numbers', () => {
      expect(ValidationUtils.validatePort(0).success).toBe(false);
      expect(ValidationUtils.validatePort(65536).success).toBe(false);
      expect(ValidationUtils.validatePort(3.14).success).toBe(false);
    });
  });

  describe('validatePositiveInteger', () => {
    test('should validate positive integers', () => {
      const result = ValidationUtils.validatePositiveInteger(5);
      expect(result.success).toBe(true);
      expect(result.data).toBe(5);
    });

    test('should reject non-positive numbers', () => {
      expect(ValidationUtils.validatePositiveInteger(0).success).toBe(false);
      expect(ValidationUtils.validatePositiveInteger(-1).success).toBe(false);
      expect(ValidationUtils.validatePositiveInteger(3.14).success).toBe(false);
    });
  });

  describe('validateNonNegativeInteger', () => {
    test('should validate non-negative integers', () => {
      expect(ValidationUtils.validateNonNegativeInteger(0).success).toBe(true);
      expect(ValidationUtils.validateNonNegativeInteger(5).success).toBe(true);
    });

    test('should reject negative numbers', () => {
      expect(ValidationUtils.validateNonNegativeInteger(-1).success).toBe(false);
      expect(ValidationUtils.validateNonNegativeInteger(3.14).success).toBe(false);
    });
  });

  describe('validatePercentage', () => {
    test('should validate percentages 0-100', () => {
      expect(ValidationUtils.validatePercentage(0).success).toBe(true);
      expect(ValidationUtils.validatePercentage(50).success).toBe(true);
      expect(ValidationUtils.validatePercentage(100).success).toBe(true);
    });

    test('should reject values outside 0-100', () => {
      expect(ValidationUtils.validatePercentage(-1).success).toBe(false);
      expect(ValidationUtils.validatePercentage(101).success).toBe(false);
    });
  });

  describe('validateNormalizedPercentage', () => {
    test('should validate normalized percentages 0-1', () => {
      expect(ValidationUtils.validateNormalizedPercentage(0).success).toBe(true);
      expect(ValidationUtils.validateNormalizedPercentage(0.5).success).toBe(true);
      expect(ValidationUtils.validateNormalizedPercentage(1).success).toBe(true);
    });

    test('should reject values outside 0-1', () => {
      expect(ValidationUtils.validateNormalizedPercentage(-0.1).success).toBe(false);
      expect(ValidationUtils.validateNormalizedPercentage(1.1).success).toBe(false);
    });
  });

  describe('type guards', () => {
    test('isString should identify strings', () => {
      expect(ValidationUtils.isString('hello')).toBe(true);
      expect(ValidationUtils.isString(123)).toBe(false);
      expect(ValidationUtils.isString(null)).toBe(false);
    });

    test('isNumber should identify numbers', () => {
      expect(ValidationUtils.isNumber(123)).toBe(true);
      expect(ValidationUtils.isNumber(3.14)).toBe(true);
      expect(ValidationUtils.isNumber(Number.NaN)).toBe(false);
      expect(ValidationUtils.isNumber('123')).toBe(false);
    });

    test('isBoolean should identify booleans', () => {
      expect(ValidationUtils.isBoolean(true)).toBe(true);
      expect(ValidationUtils.isBoolean(false)).toBe(true);
      expect(ValidationUtils.isBoolean(1)).toBe(false);
      expect(ValidationUtils.isBoolean('true')).toBe(false);
    });

    test('isObject should identify objects', () => {
      expect(ValidationUtils.isObject({})).toBe(true);
      expect(ValidationUtils.isObject({ a: 1 })).toBe(true);
      expect(ValidationUtils.isObject([])).toBe(false);
      expect(ValidationUtils.isObject(null)).toBe(false);
      expect(ValidationUtils.isObject('object')).toBe(false);
    });

    test('isArray should identify arrays', () => {
      expect(ValidationUtils.isArray([])).toBe(true);
      expect(ValidationUtils.isArray([1, 2, 3])).toBe(true);
      expect(ValidationUtils.isArray({})).toBe(false);
      expect(ValidationUtils.isArray('array')).toBe(false);
    });

    test('isNull should identify null', () => {
      expect(ValidationUtils.isNull(null)).toBe(true);
      expect(ValidationUtils.isNull(undefined)).toBe(false);
      expect(ValidationUtils.isNull(0)).toBe(false);
    });

    test('isUndefined should identify undefined', () => {
      expect(ValidationUtils.isUndefined(undefined)).toBe(true);
      expect(ValidationUtils.isUndefined(null)).toBe(false);
      expect(ValidationUtils.isUndefined(0)).toBe(false);
    });

    test('isNullish should identify null or undefined', () => {
      expect(ValidationUtils.isNullish(null)).toBe(true);
      expect(ValidationUtils.isNullish(undefined)).toBe(true);
      expect(ValidationUtils.isNullish(0)).toBe(false);
      expect(ValidationUtils.isNullish('')).toBe(false);
    });

    test('isFunction should identify functions', () => {
      expect(ValidationUtils.isFunction(() => {})).toBe(true);
      expect(ValidationUtils.isFunction(() => {})).toBe(true);
      expect(ValidationUtils.isFunction(Math.max)).toBe(true);
      expect(ValidationUtils.isFunction('function')).toBe(false);
    });

    test('isDate should identify valid dates', () => {
      expect(ValidationUtils.isDate(new Date())).toBe(true);
      expect(ValidationUtils.isDate(new Date('2023-01-01'))).toBe(true);
      expect(ValidationUtils.isDate(new Date('invalid'))).toBe(false);
      expect(ValidationUtils.isDate('2023-01-01')).toBe(false);
    });

    test('isRegExp should identify regular expressions', () => {
      expect(ValidationUtils.isRegExp(/test/)).toBe(true);
      expect(ValidationUtils.isRegExp(/test/)).toBe(true);
      expect(ValidationUtils.isRegExp('/test/')).toBe(false);
    });

    test('isPromise should identify promises', () => {
      expect(ValidationUtils.isPromise(Promise.resolve())).toBe(true);
      // Create thenable objects without using 'then' property directly
      const thenable = {
        then: () => {},
        catch: () => {},
      };
      const partialThenable = {
        then: () => {},
      };
      expect(ValidationUtils.isPromise(thenable)).toBe(true);
      expect(ValidationUtils.isPromise(partialThenable)).toBe(false);
      expect(ValidationUtils.isPromise('promise')).toBe(false);
    });
  });

  describe('validateEnum', () => {
    test('should validate enum values', () => {
      const validateColor = ValidationUtils.validateEnum(['red', 'green', 'blue']);

      expect(validateColor('red').success).toBe(true);
      expect(validateColor('yellow').success).toBe(false);
    });
  });

  describe('validatePattern', () => {
    test('should validate string patterns', () => {
      const validatePhone = ValidationUtils.validatePattern(
        /^\d{3}-\d{3}-\d{4}$/,
        'Invalid phone format'
      );

      expect(validatePhone('123-456-7890').success).toBe(true);
      expect(validatePhone('invalid').success).toBe(false);
      expect(validatePhone(123).success).toBe(false);
    });
  });

  describe('validateRange', () => {
    test('should validate number ranges', () => {
      const validateAge = ValidationUtils.validateRange(0, 120);

      expect(validateAge(25).success).toBe(true);
      expect(validateAge(0).success).toBe(true);
      expect(validateAge(120).success).toBe(true);
      expect(validateAge(-1).success).toBe(false);
      expect(validateAge(121).success).toBe(false);
      expect(validateAge('25').success).toBe(false);
    });
  });

  describe('validateStringLength', () => {
    test('should validate string length', () => {
      const validateName = ValidationUtils.validateStringLength(2, 10);

      expect(validateName('John').success).toBe(true);
      expect(validateName('J').success).toBe(false);
      expect(validateName('VeryLongName').success).toBe(false);
      expect(validateName(123).success).toBe(false);
    });

    test('should validate minimum length only', () => {
      const validatePassword = ValidationUtils.validateStringLength(8);

      expect(validatePassword('password123').success).toBe(true);
      expect(validatePassword('short').success).toBe(false);
    });
  });

  describe('validateArrayLength', () => {
    test('should validate array length', () => {
      const validateTags = ValidationUtils.validateArrayLength(1, 5);

      expect(validateTags(['tag1']).success).toBe(true);
      expect(validateTags(['tag1', 'tag2', 'tag3']).success).toBe(true);
      expect(validateTags([]).success).toBe(false);
      expect(validateTags(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']).success).toBe(false);
      expect(validateTags('not-array').success).toBe(false);
    });
  });

  describe('combineValidators', () => {
    test('should combine multiple validators', () => {
      const validatePositiveEven = ValidationUtils.combineValidators(
        ValidationUtils.validatePositiveInteger,
        ValidationUtils.validateRange(0, 100),
        (value: unknown) => {
          if (typeof value === 'number' && value % 2 === 0) {
            return ValidationUtils.success(value);
          }
          return ValidationUtils.failure(['Must be even']);
        }
      );

      expect(validatePositiveEven(4).success).toBe(true);
      expect(validatePositiveEven(3).success).toBe(false); // Not even
      expect(validatePositiveEven(-2).success).toBe(false); // Not positive
      expect(validatePositiveEven(102).success).toBe(false); // Out of range
    });
  });

  describe('optional', () => {
    test('should allow undefined values', () => {
      const validateOptionalEmail = ValidationUtils.optional(ValidationUtils.validateEmail);

      expect(validateOptionalEmail(undefined).success).toBe(true);
      expect(validateOptionalEmail(undefined).data).toBeUndefined();
      expect(validateOptionalEmail('test@example.com').success).toBe(true);
      expect(validateOptionalEmail('invalid').success).toBe(false);
    });
  });

  describe('validateArray', () => {
    test('should validate arrays of specific types', () => {
      const validateEmailArray = ValidationUtils.validateArray(ValidationUtils.validateEmail);

      const validEmails = ['test1@example.com', 'test2@example.com'];
      const invalidEmails = ['test1@example.com', 'invalid-email'];

      expect(validateEmailArray(validEmails).success).toBe(true);
      expect(validateEmailArray(invalidEmails).success).toBe(false);
      expect(validateEmailArray('not-array').success).toBe(false);
    });
  });

  describe('validateObject', () => {
    test('should validate objects with specific properties', () => {
      const validateUser = ValidationUtils.validateObject({
        name: ValidationUtils.validateStringLength(1, 50),
        email: ValidationUtils.validateEmail,
        age: ValidationUtils.validateRange(0, 120),
      });

      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const invalidUser = {
        name: '',
        email: 'invalid-email',
        age: -1,
      };

      expect(validateUser(validUser).success).toBe(true);
      expect(validateUser(invalidUser).success).toBe(false);
      expect(validateUser('not-object').success).toBe(false);
    });
  });
});
