import type { ListItem, ListConfig, ListMetrics, EnumeratorFunction } from './types';
import { validateListConfig, validateListItem } from './validation';

/**
 * Converts a number to Roman numerals
 */
function toRoman(num: number): string {
  if (num <= 0 || num > 3999) {
    return num.toString(); // Fallback for out-of-range values
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
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
   * Enumerator functions for convenience
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
    cycle: (symbols: string[]) => {
      if (symbols.length === 0) {
        throw new Error('Cycle enumerator requires at least one symbol');
      }
      return (index: number) => symbols[index % symbols.length];
    },
    custom: (prefix: string = '', suffix: string = '') => {
      return (index: number) => `${prefix}${index + 1}${suffix}`;
    },
    depthAware: (enumerators: EnumeratorFunction[]) => {
      if (enumerators.length === 0) {
        throw new Error('Depth-aware enumerator requires at least one enumerator function');
      }
      return (index: number, depth: number = 0) => {
        const enumerator = enumerators[depth % enumerators.length];
        return enumerator(index, depth);
      };
    }
  } as const;

  /**
   * Creates a new list configuration with the specified items
   */
  export function create(items: ListItem[]): ListConfig {
    const config: ListConfig = {
      items: items.map(validateListItem),
      enumerator: Enumerator.BULLET,
      indent: 0,
      spacing: 0
    };
    return validateListConfig(config);
  }

  /**
   * Creates a list from an array of strings
   */
  export function fromStrings(strings: string[]): ListConfig {
    return create(strings);
  }

  /**
   * Creates a nested list structure
   */
  export function nested(items: (string | ListConfig)[]): ListConfig {
    return create(items);
  }

  /**
   * Sets the enumerator function for a list
   */
  export function withEnumerator(config: ListConfig, enumerator: EnumeratorFunction): ListConfig {
    return validateListConfig({
      ...config,
      enumerator
    });
  }

  /**
   * Sets the indentation for a list
   */
  export function withIndent(config: ListConfig, indent: number): ListConfig {
    return validateListConfig({
      ...config,
      indent
    });
  }

  /**
   * Sets the spacing between items
   */
  export function withSpacing(config: ListConfig, spacing: number): ListConfig {
    return validateListConfig({
      ...config,
      spacing
    });
  }

  /**
   * Sets the item style function
   */
  export function withItemStyle(config: ListConfig, itemStyle: (text: string) => string): ListConfig {
    return validateListConfig({
      ...config,
      itemStyle
    });
  }

  /**
   * Sets the enumerator style function
   */
  export function withEnumeratorStyle(config: ListConfig, enumeratorStyle: (text: string) => string): ListConfig {
    return validateListConfig({
      ...config,
      enumeratorStyle
    });
  }

  /**
   * Sets the maximum width for text wrapping
   */
  export function withMaxWidth(config: ListConfig, maxWidth: number): ListConfig {
    return validateListConfig({
      ...config,
      maxWidth
    });
  }

  /**
   * Adds an item to the end of a list
   */
  export function append(config: ListConfig, item: ListItem): ListConfig {
    return validateListConfig({
      ...config,
      items: [...config.items, validateListItem(item)]
    });
  }

  /**
   * Adds an item to the beginning of a list
   */
  export function prepend(config: ListConfig, item: ListItem): ListConfig {
    return validateListConfig({
      ...config,
      items: [validateListItem(item), ...config.items]
    });
  }

  /**
   * Inserts an item at a specific index
   */
  export function insert(config: ListConfig, index: number, item: ListItem): ListConfig {
    if (index < 0 || index > config.items.length) {
      throw new Error(`Index ${index} is out of bounds for list with ${config.items.length} items`);
    }
    
    const newItems = [...config.items];
    newItems.splice(index, 0, validateListItem(item));
    
    return validateListConfig({
      ...config,
      items: newItems
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
      items: newItems
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
      items: newItems
    });
  }

  /**
   * Filters list items based on a predicate function
   */
  export function filter(config: ListConfig, predicate: (item: ListItem, index: number) => boolean): ListConfig {
    return validateListConfig({
      ...config,
      items: config.items.filter(predicate)
    });
  }

  /**
   * Maps over list items with a transformation function
   */
  export function map(config: ListConfig, transform: (item: ListItem, index: number) => ListItem): ListConfig {
    return validateListConfig({
      ...config,
      items: config.items.map((item, index) => validateListItem(transform(item, index)))
    });
  }

  /**
   * Concatenates two lists together
   */
  export function concat(config1: ListConfig, config2: ListConfig): ListConfig {
    return validateListConfig({
      ...config1,
      items: [...config1.items, ...config2.items]
    });
  }

  /**
   * Reverses the order of items in a list
   */
  export function reverse(config: ListConfig): ListConfig {
    return validateListConfig({
      ...config,
      items: [...config.items].reverse()
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
    return config.items.findIndex(listItem => {
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

    function processItems(items: ListItem[], depth: number = 0): void {
      maxDepth = Math.max(maxDepth, depth);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        totalItems++;
        
        if (typeof item === 'string') {
          // Calculate lines for text wrapping if maxWidth is set
          const lines = config.maxWidth 
            ? Math.ceil(item.length / config.maxWidth) 
            : 1;
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
      totalLines,
      maxItemWidth
    };
  }

  /**
   * Flattens a nested list structure into a single level
   */
  export function flatten(config: ListConfig): string[] {
    const result: string[] = [];
    
    function processItems(items: ListItem[]): void {
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
      items: [...config.items.map(item => 
        typeof item === 'string' ? item : clone(item)
      )],
      enumerator: config.enumerator,
      indent: config.indent,
      spacing: config.spacing,
      itemStyle: config.itemStyle,
      enumeratorStyle: config.enumeratorStyle,
      maxWidth: config.maxWidth
    });
  }

  /**
   * Validates a list configuration and returns it if valid
   */
  export function validate(config: unknown): ListConfig {
    return validateListConfig(config);
  }
}