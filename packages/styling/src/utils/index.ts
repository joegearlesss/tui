/**
 * Utils package exports
 * Provides string manipulation, functional programming, caching, and validation utilities
 */

export { StringUtils } from './strings';
export type { TruncateOptions, WrapOptions } from './strings';

export { FunctionalUtils } from './functional';
export type { Predicate, Mapper, Reducer, Comparator } from './functional';

export { CachingUtils } from './caching';
export type { CacheOptions, CacheStats, CacheEntry } from './caching';

export { ValidationUtils } from './validation';
export type { ValidationResult, ValidatorFunction } from './validation';
export {
  EmailSchema,
  UrlSchema,
  UuidSchema,
  ColorHexSchema,
  PortSchema,
  PositiveIntegerSchema,
  NonNegativeIntegerSchema,
  PercentageSchema,
  NormalizedPercentageSchema,
} from './validation';
