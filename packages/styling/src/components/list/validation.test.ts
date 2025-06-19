import { describe, expect, test } from 'bun:test';
import type { ListConfig, ListMetrics, ListRenderOptions } from './types';
import {
  EnumeratorFunctionSchema,
  ListConfigSchema,
  ListItemSchema,
  ListMetricsSchema,
  ListRenderOptionsSchema,
  validateEnumeratorFunction,
  validateListConfig,
  validateListItem,
  validateListMetrics,
  validateListRenderOptions,
} from './validation';

describe('ListItemSchema', () => {
  test('validates string items', () => {
    const item = 'Simple text item';
    expect(() => ListItemSchema.parse(item)).not.toThrow();
  });

  test('validates nested list configurations', () => {
    const nestedConfig: ListConfig = {
      items: ['Nested item'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 1,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    expect(() => ListItemSchema.parse(nestedConfig)).not.toThrow();
  });

  test('rejects invalid item types', () => {
    expect(() => ListItemSchema.parse(123)).toThrow();
    expect(() => ListItemSchema.parse(null)).toThrow();
    expect(() => ListItemSchema.parse(undefined)).toThrow();
  });
});

describe('EnumeratorFunctionSchema', () => {
  test('validates function that returns string', () => {
    const enumerator = (index: number) => `${index + 1}.`;
    expect(() => EnumeratorFunctionSchema.parse(enumerator)).not.toThrow();
  });

  test('validates bullet point enumerator', () => {
    const enumerator = () => '•';
    expect(() => EnumeratorFunctionSchema.parse(enumerator)).not.toThrow();
  });

  test('rejects non-function values', () => {
    expect(() => EnumeratorFunctionSchema.parse('not a function')).toThrow();
    expect(() => EnumeratorFunctionSchema.parse(123)).toThrow();
    expect(() => EnumeratorFunctionSchema.parse({})).toThrow();
  });
});

describe('ListConfigSchema', () => {
  test('validates complete list configuration', () => {
    const config: ListConfig = {
      items: ['Item 1', 'Item 2'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 2,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
      maxWidth: 80,
      spacing: 1,
      indent: 4,
    };
    expect(() => ListConfigSchema.parse(config)).not.toThrow();
  });

  test('validates minimal list configuration', () => {
    const config = {
      items: [],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    expect(() => ListConfigSchema.parse(config)).not.toThrow();
  });

  test('validates nested list items', () => {
    const nestedConfig: ListConfig = {
      items: ['Nested'],
      enumerator: () => '-',
      hidden: false,
      indentLevel: 1,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    const config: ListConfig = {
      items: ['Top', nestedConfig],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    expect(() => ListConfigSchema.parse(config)).not.toThrow();
  });

  test('validates indentLevel bounds', () => {
    const baseConfig = {
      items: ['Test'],
      enumerator: () => '•',
      hidden: false,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    expect(() => ListConfigSchema.parse({ ...baseConfig, indentLevel: 0 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, indentLevel: 20 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, indentLevel: -1 })).toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, indentLevel: 21 })).toThrow();
  });

  test('validates enumeratorSpacing bounds', () => {
    const baseConfig = {
      items: ['Test'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
    };

    expect(() => ListConfigSchema.parse({ ...baseConfig, enumeratorSpacing: 0 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, enumeratorSpacing: 10 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, enumeratorSpacing: -1 })).toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, enumeratorSpacing: 11 })).toThrow();
  });

  test('validates maxWidth when specified', () => {
    const baseConfig = {
      items: ['Test'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    expect(() => ListConfigSchema.parse({ ...baseConfig, maxWidth: 1 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, maxWidth: 100 })).not.toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, maxWidth: 0 })).toThrow();
    expect(() => ListConfigSchema.parse({ ...baseConfig, maxWidth: -1 })).toThrow();
  });

  test('rejects missing required fields', () => {
    expect(() => ListConfigSchema.parse({})).toThrow();
    expect(() => ListConfigSchema.parse({ items: ['Test'] })).toThrow();
    expect(() => ListConfigSchema.parse({ enumerator: () => '•' })).toThrow();
  });
});

describe('ListMetricsSchema', () => {
  test('validates complete metrics', () => {
    const metrics: ListMetrics = {
      totalItems: 5,
      maxDepth: 2,
      totalWidth: 80,
      totalHeight: 10,
      topLevelItems: 3,
      itemWidths: [10, 15, 20],
    };
    expect(() => ListMetricsSchema.parse(metrics)).not.toThrow();
  });

  test('validates empty metrics', () => {
    const metrics: ListMetrics = {
      totalItems: 0,
      maxDepth: 0,
      totalWidth: 0,
      totalHeight: 0,
      topLevelItems: 0,
      itemWidths: [],
    };
    expect(() => ListMetricsSchema.parse(metrics)).not.toThrow();
  });

  test('rejects negative values', () => {
    const baseMetrics = {
      totalItems: 5,
      maxDepth: 2,
      totalWidth: 80,
      totalHeight: 10,
      topLevelItems: 3,
      itemWidths: [10, 15, 20],
    };

    expect(() => ListMetricsSchema.parse({ ...baseMetrics, totalItems: -1 })).toThrow();
    expect(() => ListMetricsSchema.parse({ ...baseMetrics, maxDepth: -1 })).toThrow();
    expect(() => ListMetricsSchema.parse({ ...baseMetrics, totalWidth: -1 })).toThrow();
    expect(() => ListMetricsSchema.parse({ ...baseMetrics, totalHeight: -1 })).toThrow();
    expect(() => ListMetricsSchema.parse({ ...baseMetrics, topLevelItems: -1 })).toThrow();
  });

  test('rejects non-integer values', () => {
    const baseMetrics = {
      totalItems: 5,
      maxDepth: 2,
      totalWidth: 80,
      totalHeight: 10,
      topLevelItems: 3,
      itemWidths: [10, 15, 20],
    };

    expect(() => ListMetricsSchema.parse({ ...baseMetrics, totalItems: 5.5 })).toThrow();
    expect(() => ListMetricsSchema.parse({ ...baseMetrics, maxDepth: 2.1 })).toThrow();
  });
});

describe('ListRenderOptionsSchema', () => {
  test('validates complete render options', () => {
    const options: ListRenderOptions = {
      applyItemStyling: true,
      applyEnumeratorStyling: true,
      maxDepth: 5,
      indentPerLevel: 4,
      renderHidden: false,
    };
    expect(() => ListRenderOptionsSchema.parse(options)).not.toThrow();
  });

  test('validates all boolean combinations', () => {
    const baseOptions = {
      maxDepth: 5,
      indentPerLevel: 4,
    };

    const combinations = [
      { applyItemStyling: true, applyEnumeratorStyling: true, renderHidden: true },
      { applyItemStyling: true, applyEnumeratorStyling: false, renderHidden: false },
      { applyItemStyling: false, applyEnumeratorStyling: true, renderHidden: false },
      { applyItemStyling: false, applyEnumeratorStyling: false, renderHidden: false },
    ];

    for (const combo of combinations) {
      expect(() => ListRenderOptionsSchema.parse({ ...baseOptions, ...combo })).not.toThrow();
    }
  });

  test('validates depth and indent bounds', () => {
    const baseOptions = {
      applyItemStyling: true,
      applyEnumeratorStyling: true,
      renderHidden: false,
    };

    expect(() =>
      ListRenderOptionsSchema.parse({ ...baseOptions, maxDepth: 0, indentPerLevel: 0 })
    ).not.toThrow();
    expect(() =>
      ListRenderOptionsSchema.parse({ ...baseOptions, maxDepth: 100, indentPerLevel: 10 })
    ).not.toThrow();
    expect(() =>
      ListRenderOptionsSchema.parse({ ...baseOptions, maxDepth: -1, indentPerLevel: 0 })
    ).toThrow();
    expect(() =>
      ListRenderOptionsSchema.parse({ ...baseOptions, maxDepth: 0, indentPerLevel: -1 })
    ).toThrow();
  });

  test('rejects non-boolean values for boolean fields', () => {
    const baseOptions = {
      maxDepth: 5,
      indentPerLevel: 4,
    };

    expect(() =>
      ListRenderOptionsSchema.parse({
        ...baseOptions,
        applyItemStyling: 'true',
        applyEnumeratorStyling: true,
        renderHidden: false,
      })
    ).toThrow();
  });
});

describe('validation functions', () => {
  describe('validateListItem', () => {
    test('validates string items', () => {
      const item = 'Test item';
      expect(() => validateListItem(item)).not.toThrow();
      expect(validateListItem(item)).toBe(item);
    });

    test('validates nested list items', () => {
      const nestedConfig: ListConfig = {
        items: ['Nested'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 1,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };
      expect(() => validateListItem(nestedConfig)).not.toThrow();
    });

    test('throws on invalid items', () => {
      expect(() => validateListItem(123)).toThrow();
      expect(() => validateListItem(null)).toThrow();
    });
  });

  describe('validateEnumeratorFunction', () => {
    test('validates enumerator functions', () => {
      const enumerator = (i: number) => `${i + 1}.`;
      expect(() => validateEnumeratorFunction(enumerator)).not.toThrow();
    });

    test('throws on non-functions', () => {
      expect(() => validateEnumeratorFunction('not a function')).toThrow();
    });
  });

  describe('validateListConfig', () => {
    test('validates complete config', () => {
      const config: ListConfig = {
        items: ['Test'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };
      expect(() => validateListConfig(config)).not.toThrow();
    });

    test('provides defaults for missing properties', () => {
      const partialConfig = {
        items: ['Test'],
        enumerator: () => '•',
      };
      const result = validateListConfig(partialConfig);

      expect(result.hidden).toBe(false);
      expect(result.indentLevel).toBe(0);
      expect(result.indentString).toBe('  ');
      expect(result.showEnumerators).toBe(true);
      expect(result.enumeratorSpacing).toBe(1);
    });

    test('preserves provided properties', () => {
      const config = {
        items: ['Test'],
        enumerator: () => '•',
        hidden: true,
        indentLevel: 2,
        indentString: '    ',
        showEnumerators: false,
        enumeratorSpacing: 2,
      };
      const result = validateListConfig(config);

      expect(result.hidden).toBe(true);
      expect(result.indentLevel).toBe(2);
      expect(result.indentString).toBe('    ');
      expect(result.showEnumerators).toBe(false);
      expect(result.enumeratorSpacing).toBe(2);
    });
  });

  describe('validateListMetrics', () => {
    test('validates metrics', () => {
      const metrics: ListMetrics = {
        totalItems: 5,
        maxDepth: 2,
        totalWidth: 80,
        totalHeight: 10,
        topLevelItems: 3,
        itemWidths: [10, 15, 20],
      };
      expect(() => validateListMetrics(metrics)).not.toThrow();
    });

    test('throws on invalid metrics', () => {
      const invalidMetrics = {
        totalItems: -1,
        maxDepth: 2,
        totalWidth: 80,
        totalHeight: 10,
        topLevelItems: 3,
        itemWidths: [10, 15, 20],
      };
      expect(() => validateListMetrics(invalidMetrics)).toThrow();
    });
  });

  describe('validateListRenderOptions', () => {
    test('validates render options', () => {
      const options: ListRenderOptions = {
        applyItemStyling: true,
        applyEnumeratorStyling: true,
        maxDepth: 5,
        indentPerLevel: 4,
        renderHidden: false,
      };
      expect(() => validateListRenderOptions(options)).not.toThrow();
    });

    test('throws on invalid options', () => {
      const invalidOptions = {
        applyItemStyling: 'true', // Should be boolean
        applyEnumeratorStyling: true,
        maxDepth: 5,
        indentPerLevel: 4,
        renderHidden: false,
      };
      expect(() => validateListRenderOptions(invalidOptions)).toThrow();
    });
  });
});
