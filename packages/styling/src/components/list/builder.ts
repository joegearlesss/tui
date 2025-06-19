import { List } from './operations';
import type { EnumeratorFunction, ListConfig, ListItem } from './types';

/**
 * Fluent API builder for creating lists with method chaining
 * Provides a more intuitive interface while maintaining functional core
 */
export class ListBuilder {
  private config: ListConfig;

  private constructor(config: ListConfig) {
    this.config = config;
  }

  /**
   * Creates a new ListBuilder with the specified items
   */
  static create(items: ListItem[]): ListBuilder {
    return new ListBuilder(List.create(items));
  }

  /**
   * Creates a ListBuilder from an array of strings
   */
  static fromStrings(strings: string[]): ListBuilder {
    return new ListBuilder(List.fromStrings(strings));
  }

  /**
   * Creates a ListBuilder for nested lists
   */
  static nested(items: (string | ListConfig)[]): ListBuilder {
    return new ListBuilder(List.nested(items));
  }

  /**
   * Sets the enumerator function
   */
  enumerator(enumerator: EnumeratorFunction): ListBuilder {
    return new ListBuilder(List.withEnumerator(this.config, enumerator));
  }

  /**
   * Sets the indentation
   */
  indent(indent: number): ListBuilder {
    return new ListBuilder(List.withIndent(this.config, indent));
  }

  /**
   * Sets the spacing between items
   */
  spacing(spacing: number): ListBuilder {
    return new ListBuilder(List.withSpacing(this.config, spacing));
  }

  /**
   * Sets the item style function
   */
  itemStyle(itemStyle: (text: string) => string): ListBuilder {
    return new ListBuilder(List.withItemStyle(this.config, itemStyle));
  }

  /**
   * Sets the enumerator style function
   */
  enumeratorStyle(enumeratorStyle: (text: string) => string): ListBuilder {
    return new ListBuilder(List.withEnumeratorStyle(this.config, enumeratorStyle));
  }

  /**
   * Sets the maximum width for text wrapping
   */
  maxWidth(maxWidth: number): ListBuilder {
    return new ListBuilder(List.withMaxWidth(this.config, maxWidth));
  }

  /**
   * Adds an item to the end of the list
   */
  append(item: ListItem): ListBuilder {
    return new ListBuilder(List.append(this.config, item));
  }

  /**
   * Adds an item to the beginning of the list
   */
  prepend(item: ListItem): ListBuilder {
    return new ListBuilder(List.prepend(this.config, item));
  }

  /**
   * Inserts an item at a specific index
   */
  insert(index: number, item: ListItem): ListBuilder {
    return new ListBuilder(List.insert(this.config, index, item));
  }

  /**
   * Removes an item at a specific index
   */
  remove(index: number): ListBuilder {
    return new ListBuilder(List.remove(this.config, index));
  }

  /**
   * Replaces an item at a specific index
   */
  replace(index: number, item: ListItem): ListBuilder {
    return new ListBuilder(List.replace(this.config, index, item));
  }

  /**
   * Filters list items based on a predicate function
   */
  filter(predicate: (item: ListItem, index: number) => boolean): ListBuilder {
    return new ListBuilder(List.filter(this.config, predicate));
  }

  /**
   * Maps over list items with a transformation function
   */
  map(transform: (item: ListItem, index: number) => ListItem): ListBuilder {
    return new ListBuilder(List.map(this.config, transform));
  }

  /**
   * Concatenates with another list
   */
  concat(other: ListConfig): ListBuilder {
    return new ListBuilder(List.concat(this.config, other));
  }

  /**
   * Reverses the order of items
   */
  reverse(): ListBuilder {
    return new ListBuilder(List.reverse(this.config));
  }

  /**
   * Returns the built list configuration
   */
  build(): ListConfig {
    return List.clone(this.config);
  }

  /**
   * Gets the current configuration (read-only access)
   */
  get(): ListConfig {
    return this.config;
  }

  /**
   * Gets the number of items in the list
   */
  length(): number {
    return List.length(this.config);
  }

  /**
   * Checks if the list is empty
   */
  isEmpty(): boolean {
    return List.isEmpty(this.config);
  }

  /**
   * Gets an item at a specific index
   */
  getItem(index: number): ListItem | undefined {
    return List.get(this.config, index);
  }

  /**
   * Finds the index of an item
   */
  indexOf(item: ListItem): number {
    return List.indexOf(this.config, item);
  }

  /**
   * Checks if the list contains a specific item
   */
  contains(item: ListItem): boolean {
    return List.contains(this.config, item);
  }

  /**
   * Calculates metrics for the list
   */
  metrics() {
    return List.calculateMetrics(this.config);
  }

  /**
   * Flattens the list to an array of strings
   */
  flatten(): string[] {
    return List.flatten(this.config);
  }

  /**
   * Converts to an array of strings
   */
  toStrings(): string[] {
    return List.toStrings(this.config);
  }
}

/**
 * Chainable list operations that return a new ListChain for continued chaining
 * This allows for more complex fluent operations
 */
export class ListChain {
  private config: ListConfig;

  constructor(config: ListConfig) {
    this.config = config;
  }

  /**
   * Creates a new ListChain from a ListConfig
   */
  static from(config: ListConfig): ListChain {
    return new ListChain(config);
  }

  /**
   * Creates a new ListChain with items
   */
  static create(items: ListItem[]): ListChain {
    return new ListChain(List.create(items));
  }

  /**
   * Applies an enumerator function
   */
  withEnumerator(enumerator: EnumeratorFunction): ListChain {
    return new ListChain(List.withEnumerator(this.config, enumerator));
  }

  /**
   * Applies indentation
   */
  withIndent(indent: number): ListChain {
    return new ListChain(List.withIndent(this.config, indent));
  }

  /**
   * Applies spacing
   */
  withSpacing(spacing: number): ListChain {
    return new ListChain(List.withSpacing(this.config, spacing));
  }

  /**
   * Applies item styling
   */
  withItemStyle(itemStyle: (text: string) => string): ListChain {
    return new ListChain(List.withItemStyle(this.config, itemStyle));
  }

  /**
   * Applies enumerator styling
   */
  withEnumeratorStyle(enumeratorStyle: (text: string) => string): ListChain {
    return new ListChain(List.withEnumeratorStyle(this.config, enumeratorStyle));
  }

  /**
   * Applies maximum width
   */
  withMaxWidth(maxWidth: number): ListChain {
    return new ListChain(List.withMaxWidth(this.config, maxWidth));
  }

  /**
   * Appends an item
   */
  append(item: ListItem): ListChain {
    return new ListChain(List.append(this.config, item));
  }

  /**
   * Prepends an item
   */
  prepend(item: ListItem): ListChain {
    return new ListChain(List.prepend(this.config, item));
  }

  /**
   * Filters items
   */
  filter(predicate: (item: ListItem, index: number) => boolean): ListChain {
    return new ListChain(List.filter(this.config, predicate));
  }

  /**
   * Maps items
   */
  map(transform: (item: ListItem, index: number) => ListItem): ListChain {
    return new ListChain(List.map(this.config, transform));
  }

  /**
   * Concatenates with another list
   */
  concat(other: ListConfig): ListChain {
    return new ListChain(List.concat(this.config, other));
  }

  /**
   * Reverses items
   */
  reverse(): ListChain {
    return new ListChain(List.reverse(this.config));
  }

  /**
   * Converts to ListBuilder for additional operations
   */
  toBuilder(): ListBuilder {
    return new ListBuilder(this.config);
  }

  /**
   * Returns the final configuration
   */
  build(): ListConfig {
    return List.clone(this.config);
  }

  /**
   * Gets the current configuration
   */
  get(): ListConfig {
    return this.config;
  }
}
