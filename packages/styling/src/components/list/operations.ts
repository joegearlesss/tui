import { ListRenderer } from './rendering';
import type {
  EnumeratorFunction,
  ListConfig,
  ListItem,
  ListMetrics,
  ListRenderOptions,
} from './types';
import { validateListConfig, validateListItem } from './validation';

/**
 * Converts a number to Roman numerals using traditional Roman numeral notation
 * Supports numbers from 1 to 3999. Out-of-range values are returned as strings.
 * 
 * @param num - The number to convert (1-3999 for valid Roman numerals)
 * @returns Roman numeral string representation
 * 
 * @example
 * ```typescript
 * toRoman(1)    // "I"
 * toRoman(4)    // "IV" 
 * toRoman(9)    // "IX"
 * toRoman(1994) // "MCMXCIV"
 * toRoman(0)    // "0" (fallback for out-of-range)
 * ```
 * 
 * @internal Used by Roman numeral enumerators
 */
function toRoman(num: number): string {
  if (num <= 0 || num > 3999) {
    return num.toString(); // Fallback for out-of-range values
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

  let result = '';
  let remaining = num;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const symbol = symbols[i];
    if (value === undefined || symbol === undefined) continue;

    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Functional operations for working with lists
 * Follows functional programming principles with immutable data structures
 */
export namespace List {
  /**
   * Pre-built enumerator functions for common list formatting patterns
   * Each function takes an index and returns the appropriate marker string
   * 
   * @example
   * ```typescript
   * const list = List.create(['First', 'Second', 'Third']);
   * 
   * // Use built-in enumerators
   * List.withEnumerator(list, List.Enumerator.ARABIC)        // "1. First"
   * List.withEnumerator(list, List.Enumerator.ALPHA_LOWER)   // "a. First"
   * List.withEnumerator(list, List.Enumerator.ROMAN_UPPER)   // "I. First"
   * ```
   */
  export const Enumerator = {
    BULLET: () => '•',
    DASH: () => '-',
    ASTERISK: () => '*',
    PLUS: () => '+',
    ARABIC: (index: number) => `${index + 1}.`,
    ARABIC_PAREN: (index: number) => `${index + 1})`,
    ARABIC_BOTH_PAREN: (index: number) => `(${index + 1})`,
    ALPHA_LOWER: (index: number) => `${String.fromCharCode(97 + (index % 26))}.`,
    ALPHA_UPPER: (index: number) => `${String.fromCharCode(65 + (index % 26))}.`,
    ALPHA_LOWER_PAREN: (index: number) => `${String.fromCharCode(97 + (index % 26))})`,
    ALPHA_UPPER_PAREN: (index: number) => `${String.fromCharCode(65 + (index % 26))})`,
    ROMAN_LOWER: (index: number) => `${toRoman(index + 1).toLowerCase()}.`,
    ROMAN_UPPER: (index: number) => `${toRoman(index + 1)}.`,
    ARROW: () => '→',
    TRIANGLE: () => '▶',
    DIAMOND: () => '◆',
    SQUARE: () => '■',
    CIRCLE: () => '●',
    NONE: () => '',
    /**
     * Creates a cycling enumerator that repeats through symbols
     * @param symbols - Array of symbols to cycle through (must have at least 1 symbol)
     * @returns Enumerator function that cycles through symbols
     * @throws Error if symbols array is empty
     * 
     * @example
     * ```typescript
     * const enumerator = List.Enumerator.cycle(['→', '▶', '●']);
     * enumerator(0); // "→"
     * enumerator(1); // "▶" 
     * enumerator(2); // "●"
     * enumerator(3); // "→" (cycles back)
     * ```
     */
    cycle: (symbols: string[]) => {
      if (symbols.length === 0) {
        throw new Error('Cycle enumerator requires at least one symbol');
      }
      return (index: number) => symbols[index % symbols.length];
    },
    
    /**
     * Creates a custom numeric enumerator with specified prefix and suffix
     * @param prefix - String to prepend to the number (default: '')
     * @param suffix - String to append to the number (default: '')
     * @returns Enumerator function with custom formatting
     * 
     * @example
     * ```typescript
     * const enumerator = List.Enumerator.custom('[', ']');
     * enumerator(0); // "[1]"
     * enumerator(1); // "[2]"
     * 
     * // For section numbering
     * const section = List.Enumerator.custom('§', '');
     * section(0); // "§1"
     * ```
     */
    custom: (prefix = '', suffix = '') => {
      return (index: number) => `${prefix}${index + 1}${suffix}`;
    },
    
    /**
     * Creates a depth-aware enumerator that changes style based on nesting level
     * Useful for hierarchical lists with different markers per level
     * 
     * @param enumerators - Array of enumerator functions for different nesting levels
     * @returns Enumerator function that selects based on depth
     * @throws Error if enumerators array is empty
     * 
     * @example
     * ```typescript
     * const enumerator = List.Enumerator.depthAware([
     *   List.Enumerator.ARABIC,     // Level 0: "1.", "2.", "3."
     *   List.Enumerator.ALPHA_LOWER, // Level 1: "a.", "b.", "c."
     *   List.Enumerator.ROMAN_LOWER  // Level 2: "i.", "ii.", "iii."
     * ]);
     * 
     * enumerator(0, 0); // "1." (depth 0)
     * enumerator(0, 1); // "a." (depth 1)
     * enumerator(0, 2); // "i." (depth 2)
     * enumerator(0, 3); // "1." (cycles back to depth 0)
     * ```
     */
    depthAware: (enumerators: EnumeratorFunction[]) => {
      if (enumerators.length === 0) {
        throw new Error('Depth-aware enumerator requires at least one enumerator function');
      }
      return (index: number, depth = 0) => {
        const enumerator = enumerators[depth % enumerators.length];
        return enumerator?.(index) ?? '';
      };
    },
  } as const;

  /**
   * Creates a new list configuration with the specified items and default settings
   * All items are validated to ensure they conform to the ListItem type
   * 
   * @param items - Array of list items (strings or nested ListConfig objects)
   * @returns A new validated ListConfig with default settings
   * 
   * @example
   * ```typescript
   * // Simple string list
   * const simpleList = List.create(['First item', 'Second item', 'Third item']);
   * 
   * // Empty list (can add items later)
   * const emptyList = List.create();
   * 
   * // Mixed list with nested items
   * const nestedList = List.create([
   *   'Top level item',
   *   List.create(['Nested item 1', 'Nested item 2']),
   *   'Another top level item'
   * ]);
   * ```
   */
  export function create(items: ListItem[] = []): ListConfig {
    const config: ListConfig = {
      items: items.map(validateListItem),
      enumerator: Enumerator.BULLET,
      itemStyle: undefined,
      enumeratorStyle: undefined,
      hidden: false,
      offset: undefined,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
      maxWidth: undefined,
      spacing: undefined,
      indent: undefined,
    };
    return validateListConfig(config);
  }

  /**
   * Sets items on an existing list configuration, preserving all other settings
   * All new items are validated to ensure they conform to the ListItem type
   * 
   * @param config - Existing list configuration to modify
   * @param newItems - New array of list items to replace existing items
   * @returns New ListConfig with updated items, preserving other settings
   * 
   * @example
   * ```typescript
   * const originalList = List.create(['Old item 1', 'Old item 2']);
   * const customList = List.withEnumerator(originalList, List.Enumerator.ARABIC);
   * 
   * // Replace items while keeping the Arabic enumeration
   * const updatedList = List.items(customList, ['New item 1', 'New item 2', 'New item 3']);
   * // Result: "1. New item 1", "2. New item 2", "3. New item 3"
   * ```
   */
  export function items(config: ListConfig, newItems: ListItem[]): ListConfig {
    return {
      ...config,
      items: newItems.map(validateListItem),
    };
  }

  /**
   * Creates a list configuration from an array of strings
   * Convenience function equivalent to List.create() but with explicit string typing
   * 
   * @param strings - Array of string items to create list from
   * @returns A new ListConfig with string items and default settings
   * 
   * @example
   * ```typescript
   * const todoList = List.fromStrings([
   *   'Complete project documentation',
   *   'Review pull requests', 
   *   'Deploy to production'
   * ]);
   * 
   * // Equivalent to:
   * const equivalentList = List.create([
   *   'Complete project documentation',
   *   'Review pull requests',
   *   'Deploy to production'
   * ]);
   * ```
   */
  export function fromStrings(strings: string[]): ListConfig {
    return create(strings);
  }

  /**
   * Creates a nested list structure from mixed string and ListConfig items
   * Allows creation of hierarchical lists with multiple nesting levels
   * 
   * @param items - Array of strings and/or ListConfig objects for nesting
   * @returns A new ListConfig containing the nested structure
   * 
   * @example
   * ```typescript
   * const fileTree = List.nested([
   *   'src/',
   *   List.create([
   *     'components/',
   *     List.create(['Button.tsx', 'Input.tsx']),
   *     'utils/',
   *     List.create(['helpers.ts', 'constants.ts'])
   *   ]),
   *   'tests/',
   *   List.create(['unit/', 'integration/'])
   * ]);
   * 
   * // Results in:
   * // • src/
   * //   • components/
   * //     • Button.tsx
   * //     • Input.tsx
   * //   • utils/
   * //     • helpers.ts
   * //     • constants.ts
   * // • tests/
   * //   • unit/
   * //   • integration/
   * ```
   */
  export function nested(items: (string | ListConfig)[]): ListConfig {
    return create(items);
  }

  /**
   * Sets the enumerator function for a list, controlling how items are numbered/marked
   * Returns a new list configuration with the specified enumerator applied
   * 
   * @param config - Existing list configuration to modify
   * @param enumerator - Function that generates markers for list items (index) => string
   * @returns New ListConfig with the specified enumerator function
   * 
   * @example
   * ```typescript
   * const list = List.create(['Apple', 'Banana', 'Cherry']);
   * 
   * // Use different built-in enumerators
   * const numbered = List.withEnumerator(list, List.Enumerator.ARABIC);
   * // Result: "1. Apple", "2. Banana", "3. Cherry"
   * 
   * const lettered = List.withEnumerator(list, List.Enumerator.ALPHA_LOWER);
   * // Result: "a. Apple", "b. Banana", "c. Cherry" 
   * 
   * // Use custom enumerator
   * const custom = List.withEnumerator(list, (index) => `[${index + 1}]`);
   * // Result: "[1] Apple", "[2] Banana", "[3] Cherry"
   * ```
   */
  export function withEnumerator(config: ListConfig, enumerator: EnumeratorFunction): ListConfig {
    return validateListConfig({
      ...config,
      enumerator,
    });
  }

  /**
   * Sets the indentation for a list
   */
  export function withIndent(config: ListConfig, indent: number): ListConfig {
    if (indent < 0 || indent > 20) {
      throw new Error('Indent must be between 0 and 20');
    }
    return validateListConfig({
      ...config,
      indentLevel: indent,
    });
  }

  /**
   * Sets the spacing between items
   */
  export function withSpacing(config: ListConfig, spacing: number): ListConfig {
    return validateListConfig({
      ...config,
      spacing,
    });
  }

  /**
   * Sets the spacing between enumerator and item content
   */
  export function withEnumeratorSpacing(config: ListConfig, enumeratorSpacing: number): ListConfig {
    return validateListConfig({
      ...config,
      enumeratorSpacing,
    });
  }

  /**
   * Sets the maximum width for text wrapping
   */
  export function withMaxWidth(config: ListConfig, maxWidth: number): ListConfig {
    return validateListConfig({
      ...config,
      maxWidth,
    });
  }

  /**
   * Sets the item style function
   */
  export function withItemStyle(
    config: ListConfig,
    itemStyle: (text: string) => string
  ): ListConfig {
    return validateListConfig({
      ...config,
      itemStyle,
    });
  }

  /**
   * Sets the enumerator style function
   */
  export function withEnumeratorStyle(
    config: ListConfig,
    enumeratorStyle: (text: string) => string
  ): ListConfig {
    return validateListConfig({
      ...config,
      enumeratorStyle,
    });
  }

  /**
   * Adds an item to the end of a list
   */
  export function append(config: ListConfig, item: ListItem): ListConfig {
    return validateListConfig({
      ...config,
      items: [...config.items, validateListItem(item)],
    });
  }

  /**
   * Adds an item to the beginning of a list
   */
  export function prepend(config: ListConfig, item: ListItem): ListConfig {
    return validateListConfig({
      ...config,
      items: [validateListItem(item), ...config.items],
    });
  }

  /**
   * Inserts an item at a specific index in the list
   * All existing items at and after the index are shifted to the right
   * 
   * @param config - Existing list configuration to modify
   * @param index - Zero-based index where to insert the item (0 = beginning, length = end)
   * @param item - List item to insert (string or nested ListConfig)
   * @returns New ListConfig with the item inserted at the specified position
   * @throws Error if index is out of bounds (< 0 or > length)
   * 
   * @example
   * ```typescript
   * const list = List.create(['First', 'Third']);
   * 
   * // Insert at beginning
   * const withFirst = List.insert(list, 0, 'Zero');
   * // Result: ['Zero', 'First', 'Third']
   * 
   * // Insert in middle  
   * const withSecond = List.insert(list, 1, 'Second');
   * // Result: ['First', 'Second', 'Third']
   * 
   * // Insert at end
   * const withLast = List.insert(list, list.items.length, 'Last');
   * // Result: ['First', 'Third', 'Last']
   * ```
   */
  export function insert(config: ListConfig, index: number, item: ListItem): ListConfig {
    if (index < 0 || index > config.items.length) {
      throw new Error(`Index ${index} is out of bounds for list with ${config.items.length} items`);
    }

    const newItems = [...config.items];
    newItems.splice(index, 0, validateListItem(item));

    return validateListConfig({
      ...config,
      items: newItems,
    });
  }

  /**
   * Removes an item at a specific index
   */
  export function remove(config: ListConfig, index: number): ListConfig {
    if (index < 0 || index >= config.items.length) {
      throw new Error(`Index ${index} is out of bounds for list with ${config.items.length} items`);
    }

    const newItems = [...config.items];
    newItems.splice(index, 1);

    return validateListConfig({
      ...config,
      items: newItems,
    });
  }

  /**
   * Replaces an item at a specific index
   */
  export function replace(config: ListConfig, index: number, item: ListItem): ListConfig {
    if (index < 0 || index >= config.items.length) {
      throw new Error(`Index ${index} is out of bounds for list with ${config.items.length} items`);
    }

    const newItems = [...config.items];
    newItems[index] = validateListItem(item);

    return validateListConfig({
      ...config,
      items: newItems,
    });
  }

  /**
   * Filters list items based on a predicate function
   */
  export function filter(
    config: ListConfig,
    predicate: (item: ListItem, index: number) => boolean
  ): ListConfig {
    return validateListConfig({
      ...config,
      items: config.items.filter(predicate),
    });
  }

  /**
   * Maps over list items with a transformation function
   */
  export function map(
    config: ListConfig,
    transform: (item: ListItem, index: number) => ListItem
  ): ListConfig {
    return validateListConfig({
      ...config,
      items: config.items.map((item, index) => validateListItem(transform(item, index))),
    });
  }

  /**
   * Concatenates two lists together
   */
  export function concat(config1: ListConfig, config2: ListConfig): ListConfig {
    return validateListConfig({
      ...config1,
      items: [...config1.items, ...config2.items],
    });
  }

  /**
   * Reverses the order of items in a list
   */
  export function reverse(config: ListConfig): ListConfig {
    return validateListConfig({
      ...config,
      items: [...config.items].reverse(),
    });
  }

  /**
   * Gets the number of items in a list (not including nested items)
   */
  export function length(config: ListConfig): number {
    return config.items.length;
  }

  /**
   * Checks if a list is empty
   */
  export function isEmpty(config: ListConfig): boolean {
    return config.items.length === 0;
  }

  /**
   * Gets an item at a specific index
   */
  export function get(config: ListConfig, index: number): ListItem | undefined {
    if (index < 0 || index >= config.items.length) {
      return undefined;
    }
    return config.items[index];
  }

  /**
   * Finds the index of an item in the list
   */
  export function indexOf(config: ListConfig, item: ListItem): number {
    return config.items.findIndex((listItem) => {
      if (typeof listItem === 'string' && typeof item === 'string') {
        return listItem === item;
      }
      if (typeof listItem === 'object' && typeof item === 'object') {
        return JSON.stringify(listItem) === JSON.stringify(item);
      }
      return false;
    });
  }

  /**
   * Checks if a list contains a specific item
   */
  export function contains(config: ListConfig, item: ListItem): boolean {
    return indexOf(config, item) !== -1;
  }

  /**
   * Calculates comprehensive metrics for a list
   */
  export function calculateMetrics(config: ListConfig): ListMetrics {
    let totalItems = 0;
    let maxDepth = 0;
    let totalLines = 0;
    let maxItemWidth = 0;

    function processItems(items: readonly ListItem[], depth = 0): void {
      maxDepth = Math.max(maxDepth, depth);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;

        totalItems++;

        if (typeof item === 'string') {
          // Calculate lines for text wrapping if maxWidth is set
          const lines = config.maxWidth ? Math.ceil(item.length / config.maxWidth) : 1;
          totalLines += lines;
          maxItemWidth = Math.max(maxItemWidth, item.length);
        } else {
          // Nested list
          processItems(item.items, depth + 1);
        }

        // Add spacing lines (only between items, not after the last one)
        if (config.spacing && config.spacing > 0 && i < items.length - 1) {
          totalLines += config.spacing;
        }
      }
    }

    processItems(config.items);

    return {
      totalItems,
      maxDepth,
      totalWidth: maxItemWidth,
      totalHeight: totalLines,
      topLevelItems: config.items.length,
      itemWidths: [maxItemWidth],
    };
  }

  /**
   * Flattens a nested list structure into a single level
   */
  export function flatten(config: ListConfig): string[] {
    const result: string[] = [];

    function processItems(items: readonly ListItem[]): void {
      for (const item of items) {
        if (typeof item === 'string') {
          result.push(item);
        } else {
          processItems(item.items);
        }
      }
    }

    processItems(config.items);
    return result;
  }

  /**
   * Converts a list to a plain array of strings (flattened)
   */
  export function toStrings(config: ListConfig): string[] {
    return flatten(config);
  }

  /**
   * Creates a deep copy of a list configuration
   */
  export function clone(config: ListConfig): ListConfig {
    return validateListConfig({
      items: [...config.items.map((item) => (typeof item === 'string' ? item : clone(item)))],
      enumerator: config.enumerator,
      itemStyle: config.itemStyle,
      enumeratorStyle: config.enumeratorStyle,
      hidden: config.hidden,
      offset: config.offset,
      indentLevel: config.indentLevel,
      indentString: config.indentString,
      showEnumerators: config.showEnumerators,
      enumeratorSpacing: config.enumeratorSpacing,
      maxWidth: config.maxWidth,
      spacing: config.spacing,
      indent: config.indent,
    });
  }

  /**
   * Validates a list configuration and returns it if valid
   */
  export function validate(config: unknown): ListConfig {
    return validateListConfig(config);
  }

  /**
   * Renders a list configuration to a string
   */
  export function render(config: ListConfig, options?: ListRenderOptions): string {
    return ListRenderer.render(config, options);
  }
}
