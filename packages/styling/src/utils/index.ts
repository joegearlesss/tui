/**
 * Utils package exports
 * Provides string manipulation, functional programming, caching, and validation utilities
 */

export type { CacheEntry, CacheOptions, CacheStats } from './caching';
export { CachingUtils } from './caching';
export type { Comparator, Mapper, Predicate, Reducer } from './functional';
export { FunctionalUtils } from './functional';
export type { Result, Ok, Err } from './result';
export { Result } from './result';
export type { TruncateOptions, WrapOptions } from './strings';
export { StringUtils } from './strings';
export type { ValidationResult, ValidatorFunction } from './validation';
export {
  ColorHexSchema,
  EmailSchema,
  NonNegativeIntegerSchema,
  NormalizedPercentageSchema,
  PercentageSchema,
  PortSchema,
  PositiveIntegerSchema,
  UrlSchema,
  UuidSchema,
  ValidationUtils,
} from './validation';
