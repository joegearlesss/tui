import { describe, test, expect } from 'bun:test';
import { Result } from '../../utils/result';
import {
  validateListItemSafe,
  validateEnumeratorFunctionSafe,
  validateListConfigSafe,
  validateListMetricsSafe,
  validateListRenderOptionsSafe,
} from './validation';
import type { ListConfig, ListItem, ListMetrics, ListRenderOptions } from './types';

describe('List Validation - Result Types', () => {
  describe('validateListItemSafe', () => {
    test('returns Ok for valid string item', () => {
      const result = validateListItemSafe('Valid list item');
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('Valid list item');
      }
    });

    test('returns Ok for valid nested list configuration', () => {
      const nestedList: ListConfig = {
        items: ['Item 1', 'Item 2'],
        enumerator: () => '•',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        hidden: false,
        indentLevel: 1,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const result = validateListItemSafe(nestedList);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.items).toEqual(nestedList.items);
        expect(result.value.hidden).toBe(nestedList.hidden);
        expect(result.value.indentLevel).toBe(nestedList.indentLevel);
        expect(typeof result.value.enumerator).toBe('function');
      }
    });

    test('returns Err for invalid item type', () => {
      const result = validateListItemSafe(123);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues).toBeDefined();
      }
    });
  });

  describe('validateEnumeratorFunctionSafe', () => {
    test('returns Ok for valid enumerator function', () => {
      const enumerator = (index: number) => `${index + 1}.`;
      const result = validateEnumeratorFunctionSafe(enumerator);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value(0)).toBe('1.');
        expect(result.value(1)).toBe('2.');
      }
    });

    test('returns Err for non-function value', () => {
      const result = validateEnumeratorFunctionSafe('not a function');
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues).toBeDefined();
      }
    });
  });

  describe('validateListConfigSafe', () => {
    test('returns Ok for valid list configuration', () => {
      const validConfig: Partial<ListConfig> = {
        items: ['Item 1', 'Item 2'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        showEnumerators: true,
      };

      const result = validateListConfigSafe(validConfig);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.items).toEqual(['Item 1', 'Item 2']);
        expect(result.value.hidden).toBe(false);
        expect(result.value.indentLevel).toBe(0);
      }
    });

    test('returns Ok with defaults for empty configuration', () => {
      const result = validateListConfigSafe({});
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.items).toEqual([]);
        expect(result.value.hidden).toBe(false);
        expect(result.value.indentLevel).toBe(0);
        expect(result.value.indentString).toBe('  ');
        expect(result.value.showEnumerators).toBe(true);
        expect(result.value.enumeratorSpacing).toBe(1);
      }
    });

    test('returns Err for invalid configuration', () => {
      const invalidConfig = {
        items: 'not an array',
        enumerator: 'not a function',
        indentLevel: -1,
      };

      const result = validateListConfigSafe(invalidConfig);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateListMetricsSafe', () => {
    test('returns Ok for valid metrics', () => {
      const validMetrics: ListMetrics = {
        totalItems: 5,
        maxDepth: 3,
        totalWidth: 100,
        totalHeight: 10,
        topLevelItems: 2,
        itemWidths: [20, 30, 25, 35, 40],
      };

      const result = validateListMetricsSafe(validMetrics);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.totalItems).toBe(5);
        expect(result.value.maxDepth).toBe(3);
        expect(result.value.itemWidths).toEqual([20, 30, 25, 35, 40]);
      }
    });

    test('returns Err for invalid metrics', () => {
      const invalidMetrics = {
        totalItems: -1, // Invalid: negative
        maxDepth: 3,
        totalWidth: 'not a number', // Invalid: string
      };

      const result = validateListMetricsSafe(invalidMetrics);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateListRenderOptionsSafe', () => {
    test('returns Ok for valid render options', () => {
      const validOptions: ListRenderOptions = {
        applyItemStyling: true,
        applyEnumeratorStyling: false,
        maxDepth: 5,
        indentPerLevel: 2,
        renderHidden: false,
      };

      const result = validateListRenderOptionsSafe(validOptions);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.applyItemStyling).toBe(true);
        expect(result.value.maxDepth).toBe(5);
        expect(result.value.indentPerLevel).toBe(2);
      }
    });

    test('returns Err for invalid render options', () => {
      const invalidOptions = {
        applyItemStyling: 'not a boolean',
        maxDepth: -1, // Invalid: negative
        indentPerLevel: 'not a number',
      };

      const result = validateListRenderOptionsSafe(invalidOptions);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Functional composition with Result types', () => {
    test('can chain list validation operations', () => {
      const listData = {
        items: ['Item 1', 'Item 2'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
      };

      const result = Result.chain(
        validateListConfigSafe(listData),
        (config) => {
          // Additional validation logic
          const hasItems = config.items.length > 0;
          return hasItems 
            ? Result.ok(config)
            : Result.err(new Error('List must have at least one item'));
        }
      );

      expect(Result.isOk(result)).toBe(true);
    });

    test('can map list validation results', () => {
      const listData = {
        items: ['Item 1', 'Item 2'],
        enumerator: () => '•',
      };

      const result = Result.map(
        validateListConfigSafe(listData),
        (config) => ({
          ...config,
          validated: true,
        })
      );

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.validated).toBe(true);
      }
    });

    test('can handle multiple validations with Result.all', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      
      const validations = items.map(item => validateListItemSafe(item));
      const allResults = Result.all(validations);
      
      expect(Result.isOk(allResults)).toBe(true);
      if (Result.isOk(allResults)) {
        expect(allResults.value.length).toBe(3);
        expect(allResults.value).toEqual(items);
      }
    });

    test('can provide fallback values on validation failure', () => {
      const invalidData = { invalid: 'data' };
      
      const defaultConfig: ListConfig = {
        items: [],
        enumerator: () => '•',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const result = validateListConfigSafe(invalidData);
      const finalConfig = Result.unwrapOr(result, defaultConfig);
      
      expect(finalConfig.items).toEqual(defaultConfig.items);
      expect(finalConfig.hidden).toBe(defaultConfig.hidden);
      expect(finalConfig.indentLevel).toBe(defaultConfig.indentLevel);
      expect(finalConfig.showEnumerators).toBe(defaultConfig.showEnumerators);
    });
  });
});