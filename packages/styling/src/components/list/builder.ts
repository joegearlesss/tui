import { List } from './operations';
import type { EnumeratorFunction, ListConfig, ListItem } from './types';

/**
 * Functional list builder interface for method chaining
 */
export interface ListBuilder {
  readonly config: ListConfig;

  // Configuration methods
  enumerator(enumerator: EnumeratorFunction): ListBuilder;
  items(...items: ListItem[]): ListBuilder;
  indent(indent: number): ListBuilder;
  spacing(spacing: number): ListBuilder;
  itemStyle(itemStyle: (text: string) => string): ListBuilder;
  enumeratorStyle(enumeratorStyle: (text: string) => string): ListBuilder;

  // Manipulation methods
  append(item: ListItem): ListBuilder;
  prepend(item: ListItem): ListBuilder;
  insert(index: number, item: ListItem): ListBuilder;
  remove(index: number): ListBuilder;
  replace(index: number, item: ListItem): ListBuilder;
  filter(predicate: (item: ListItem, index: number) => boolean): ListBuilder;
  map(transform: (item: ListItem, index: number) => ListItem): ListBuilder;
  concat(other: ListConfig): ListBuilder;
  reverse(): ListBuilder;

  // Terminal methods
  build(): ListConfig;
  get(): ListConfig;
  length(): number;
  isEmpty(): boolean;
  getItem(index: number): ListItem | undefined;
  indexOf(item: ListItem): number;
  contains(item: ListItem): boolean;
  metrics(): any;
  flatten(): string[];
  toStrings(): string[];
}

/**
 * Functional list builder namespace providing method chaining without classes
 */
namespace ListBuilder {
  /**
   * Creates a list builder from configuration
   * @param config - List configuration to wrap
   * @returns ListBuilder interface with method chaining
   */
  export const from = (config: ListConfig): ListBuilder => {
    return {
      config,

      // Configuration methods
      enumerator: (enumerator) => from(List.withEnumerator(config, enumerator)),
      items: (...items) => from(List.create(items)),
      indent: (indent) => from(List.withIndent(config, indent)),
      spacing: (spacing) => from(List.withEnumeratorSpacing(config, spacing)),
      itemStyle: (itemStyle) => from(List.withItemStyle(config, itemStyle)),
      enumeratorStyle: (enumeratorStyle) => from(List.withEnumeratorStyle(config, enumeratorStyle)),

      // Manipulation methods
      append: (item) => from(List.append(config, item)),
      prepend: (item) => from(List.prepend(config, item)),
      insert: (index, item) => from(List.insert(config, index, item)),
      remove: (index) => from(List.remove(config, index)),
      replace: (index, item) => from(List.replace(config, index, item)),
      filter: (predicate) => from(List.filter(config, predicate)),
      map: (transform) => from(List.map(config, transform)),
      concat: (other) => from(List.concat(config, other)),
      reverse: () => from(List.reverse(config)),

      // Terminal methods
      build: () => List.clone(config),
      get: () => config,
      length: () => List.length(config),
      isEmpty: () => List.isEmpty(config),
      getItem: (index) => List.get(config, index),
      indexOf: (item) => List.indexOf(config, item),
      contains: (item) => List.contains(config, item),
      metrics: () => List.calculateMetrics(config),
      flatten: () => List.flatten(config),
      toStrings: () => List.toStrings(config),
    };
  };

  /**
   * Creates a new list builder with the specified items
   * @param items - Initial list items
   * @returns New ListBuilder instance
   */
  export const create = (items: ListItem[] = []): ListBuilder => from(List.create(items));

  /**
   * Creates a list builder from an array of strings
   * @param strings - Array of strings to convert to list items
   * @returns New ListBuilder instance
   */
  export const fromStrings = (strings: string[]): ListBuilder => from(List.fromStrings(strings));

  /**
   * Creates a list builder for nested lists
   * @param items - Array of string or list configurations
   * @returns New ListBuilder instance
   */
  export const nested = (items: (string | ListConfig)[]): ListBuilder => from(List.nested(items));
}

/**
 * Functional list chain interface for method chaining
 */
export interface ListChain {
  readonly config: ListConfig;

  // Configuration methods
  withEnumerator(enumerator: EnumeratorFunction): ListChain;
  withIndent(indent: number): ListChain;
  withSpacing(spacing: number): ListChain;
  withItemStyle(itemStyle: (text: string) => string): ListChain;
  withEnumeratorStyle(enumeratorStyle: (text: string) => string): ListChain;

  // Manipulation methods
  append(item: ListItem): ListChain;
  prepend(item: ListItem): ListChain;
  filter(predicate: (item: ListItem, index: number) => boolean): ListChain;
  map(transform: (item: ListItem, index: number) => ListItem): ListChain;
  concat(other: ListConfig): ListChain;
  reverse(): ListChain;

  // Terminal methods
  toBuilder(): ListBuilder;
  build(): ListConfig;
  get(): ListConfig;
}

/**
 * Functional list chain namespace providing method chaining without classes
 */
namespace ListChain {
  /**
   * Creates a list chain from configuration
   * @param config - List configuration to wrap
   * @returns ListChain interface with method chaining
   */
  export const from = (config: ListConfig): ListChain => {
    return {
      config,

      // Configuration methods
      withEnumerator: (enumerator) => from(List.withEnumerator(config, enumerator)),
      withIndent: (indent) => from(List.withIndent(config, indent)),
      withSpacing: (spacing) => from(List.withEnumeratorSpacing(config, spacing)),
      withItemStyle: (itemStyle) => from(List.withItemStyle(config, itemStyle)),
      withEnumeratorStyle: (enumeratorStyle) =>
        from(List.withEnumeratorStyle(config, enumeratorStyle)),

      // Manipulation methods
      append: (item) => from(List.append(config, item)),
      prepend: (item) => from(List.prepend(config, item)),
      filter: (predicate) => from(List.filter(config, predicate)),
      map: (transform) => from(List.map(config, transform)),
      concat: (other) => from(List.concat(config, other)),
      reverse: () => from(List.reverse(config)),

      // Terminal methods
      toBuilder: () => ListBuilder.create([...config.items]),
      build: () => List.clone(config),
      get: () => config,
    };
  };

  /**
   * Creates a new list chain with items
   * @param items - Initial list items
   * @returns New ListChain instance
   */
  export const create = (items: ListItem[] = []): ListChain => from(List.create(items));
}

// Export both interfaces and namespaces
export { type ListBuilder, ListChain };
