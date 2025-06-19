/**
 * Core type exports for the styling package
 */

// Layout types
export * from './layout';

// Color types
export * from './color';

// Style types
export * from './style';

// Terminal types
export * from './terminal';

// Border types
export type {
  BorderType,
  BorderChars,
  BorderConfig,
  CustomBorderConfig,
  BorderCharsType,
  BorderSidesType,
  BorderConfigType,
  CustomBorderConfigType,
} from '../border/types';

export type {
  BorderRenderOptions,
  BorderDimensions,
} from '../border/rendering';
