/**
 * List Component - Functional list creation and rendering system
 * 
 * This module provides a comprehensive system for creating, manipulating, and rendering
 * lists with support for nested structures, custom enumerators, styling, and various
 * output formats.
 * 
 * @example Basic Usage
 * ```typescript
 * import { List, ListBuilder } from './list';
 * 
 * // Functional approach
 * const list = List.create(['Item 1', 'Item 2', 'Item 3']);
 * const styled = List.withEnumerator(list, List.Enumerator.ARABIC);
 * 
 * // Builder approach
 * const built = ListBuilder
 *   .fromStrings(['Item 1', 'Item 2', 'Item 3'])
 *   .enumerator(List.Enumerator.ARABIC)
 *   .indent(4)
 *   .build();
 * ```
 * 
 * @example Nested Lists
 * ```typescript
 * const nested = List.create([
 *   'Top level item',
 *   List.create(['Nested item 1', 'Nested item 2']),
 *   'Another top level item'
 * ]);
 * ```
 * 
 * @example Custom Styling
 * ```typescript
 * const styled = List.create(['Item 1', 'Item 2'])
 *   |> List.withItemStyle(text => `**${text}**`)
 *   |> List.withEnumeratorStyle(enum => `[${enum}]`);
 * ```
 */

// Core types and interfaces
export type {
  ListItem,
  ListConfig,
  EnumeratorFunction,
  ListMetrics,
  ListRenderOptions
} from './types';

// Validation functions and schemas
export {
  ListItemSchema,
  EnumeratorFunctionSchema,
  ListConfigSchema,
  ListMetricsSchema,
  ListRenderOptionsSchema,
  validateListItem,
  validateEnumeratorFunction,
  validateListConfig,
  validateListMetrics,
  validateListRenderOptions
} from './validation';

// Functional operations (primary API)
export { List } from './operations';

// Import and re-export Enumerator
import { List as ListImport } from './operations';
export const Enumerator = ListImport.Enumerator;

// Builder pattern for fluent API
export { ListBuilder, ListChain } from './builder';

// Rendering system
export { ListRenderer } from './rendering';
import { ListRenderer as ListRendererImport } from './rendering';

// Convenience re-exports for common operations
export const {
  create: createList,
  fromStrings: listFromStrings,
  nested: nestedList,
  calculateMetrics: getListMetrics,
  flatten: flattenList,
  validate: validateList
} = ListImport;

// Convenience re-exports for rendering
export const {
  render: renderList,
  renderToLines: renderListToLines,
  renderToHtml: renderListToHtml,
  renderToMarkdown: renderListToMarkdown,
  getDimensions: getListDimensions
} = ListRendererImport;