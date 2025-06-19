import { describe, expect, test } from 'bun:test';
import type {
  ListConfig,
  ListItem,
  ListRenderOptions,
  ListValidationResult,
  ListMetrics,
  ListItemPosition,
  EnumeratorFunction,
  ListStyleFunction,
  ListItemRenderer,
} from './types';

describe('ListItem type', () => {
  test('accepts string items', () => {
    const item: ListItem = 'Simple text item';
    expect(typeof item).toBe('string');
  });

  test('accepts nested list configurations', () => {
    const nestedList: ListConfig = {
      items: ['Nested item'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 1,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const item: ListItem = nestedList;
    expect(typeof item).toBe('object');
    expect(item.items).toEqual(['Nested item']);
  });
});

describe('EnumeratorFunction type', () => {
  test('accepts function that takes index and returns string', () => {
    const enumerator: EnumeratorFunction = (index: number) => `${index + 1}.`;
    expect(enumerator(0)).toBe('1.');
    expect(enumerator(5)).toBe('6.');
  });

  test('works with bullet point enumerators', () => {
    const enumerator: EnumeratorFunction = () => '•';
    expect(enumerator(0)).toBe('•');
    expect(enumerator(10)).toBe('•');
  });

  test('works with letter enumerators', () => {
    const enumerator: EnumeratorFunction = (index) => `${String.fromCharCode(97 + index)}.`;
    expect(enumerator(0)).toBe('a.');
    expect(enumerator(2)).toBe('c.');
  });
});

describe('ListConfig interface', () => {
  test('creates valid list configuration', () => {
    const config: ListConfig = {
      items: ['Item 1', 'Item 2'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    expect(config.items).toHaveLength(2);
    expect(config.enumerator(0)).toBe('1.');
    expect(config.hidden).toBe(false);
  });

  test('supports optional properties', () => {
    const config: ListConfig = {
      items: ['Test'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
      itemStyle: (text) => `**${text}**`,
      enumeratorStyle: (text) => `[${text}]`,
      offset: [10, 5],
      maxWidth: 80,
      spacing: 2,
      indent: 4,
    };

    expect(config.itemStyle?.('test')).toBe('**test**');
    expect(config.enumeratorStyle?.('•')).toBe('[•]');
    expect(config.offset).toEqual([10, 5]);
    expect(config.maxWidth).toBe(80);
    expect(config.spacing).toBe(2);
    expect(config.indent).toBe(4);
  });

  test('supports nested list items', () => {
    const nestedConfig: ListConfig = {
      items: ['Nested item'],
      enumerator: () => '-',
      hidden: false,
      indentLevel: 1,
      indentString: '    ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    const config: ListConfig = {
      items: ['Top level', nestedConfig],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    expect(config.items).toHaveLength(2);
    expect(typeof config.items[0]).toBe('string');
    expect(typeof config.items[1]).toBe('object');
  });
});

describe('ListRenderOptions interface', () => {
  test('creates valid render options', () => {
    const options: ListRenderOptions = {
      applyItemStyling: true,
      applyEnumeratorStyling: true,
      maxDepth: 5,
      indentPerLevel: 2,
      renderHidden: false,
    };

    expect(options.applyItemStyling).toBe(true);
    expect(options.maxDepth).toBe(5);
    expect(options.indentPerLevel).toBe(2);
  });

  test('supports all boolean combinations', () => {
    const options: ListRenderOptions = {
      applyItemStyling: false,
      applyEnumeratorStyling: false,
      maxDepth: 0,
      indentPerLevel: 0,
      renderHidden: true,
    };

    expect(options.applyItemStyling).toBe(false);
    expect(options.applyEnumeratorStyling).toBe(false);
    expect(options.renderHidden).toBe(true);
  });
});

describe('ListValidationResult interface', () => {
  test('creates valid validation result', () => {
    const result: ListValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test('creates invalid validation result with errors', () => {
    const result: ListValidationResult = {
      isValid: false,
      errors: ['Invalid enumerator', 'Missing items'],
      warnings: ['Performance warning'],
    };

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.warnings).toHaveLength(1);
  });
});

describe('ListMetrics interface', () => {
  test('creates valid metrics', () => {
    const metrics: ListMetrics = {
      totalItems: 10,
      maxDepth: 3,
      totalWidth: 80,
      totalHeight: 15,
      topLevelItems: 5,
      itemWidths: [10, 15, 20, 12, 8],
    };

    expect(metrics.totalItems).toBe(10);
    expect(metrics.maxDepth).toBe(3);
    expect(metrics.itemWidths).toHaveLength(5);
  });

  test('handles empty metrics', () => {
    const metrics: ListMetrics = {
      totalItems: 0,
      maxDepth: 0,
      totalWidth: 0,
      totalHeight: 0,
      topLevelItems: 0,
      itemWidths: [],
    };

    expect(metrics.totalItems).toBe(0);
    expect(metrics.itemWidths).toHaveLength(0);
  });
});

describe('ListItemPosition interface', () => {
  test('creates valid position information', () => {
    const position: ListItemPosition = {
      index: 2,
      depth: 1,
      path: [0, 2],
      isLast: false,
      hasChildren: true,
    };

    expect(position.index).toBe(2);
    expect(position.depth).toBe(1);
    expect(position.path).toEqual([0, 2]);
    expect(position.isLast).toBe(false);
    expect(position.hasChildren).toBe(true);
  });

  test('handles root level position', () => {
    const position: ListItemPosition = {
      index: 0,
      depth: 0,
      path: [0],
      isLast: true,
      hasChildren: false,
    };

    expect(position.depth).toBe(0);
    expect(position.path).toEqual([0]);
    expect(position.hasChildren).toBe(false);
  });
});

describe('ListStyleFunction type', () => {
  test('accepts function that styles based on item and position', () => {
    const styleFunction: ListStyleFunction = (item, position) => ({
      foreground: position.depth === 0 ? '#ff0000' : '#0000ff',
      bold: position.isLast,
    });

    const position: ListItemPosition = {
      index: 0,
      depth: 0,
      path: [0],
      isLast: true,
      hasChildren: false,
    };

    const style = styleFunction('Test item', position);
    expect(style.foreground).toBe('#ff0000');
    expect(style.bold).toBe(true);
  });
});

describe('ListItemRenderer type', () => {
  test('accepts function that renders item with position', () => {
    const renderer: ListItemRenderer = (item, position) => {
      const indent = '  '.repeat(position.depth);
      const prefix = position.isLast ? '└─' : '├─';
      return `${indent}${prefix} ${typeof item === 'string' ? item : '[nested]'}`;
    };

    const position: ListItemPosition = {
      index: 0,
      depth: 1,
      path: [0, 0],
      isLast: true,
      hasChildren: false,
    };

    const result = renderer('Test item', position);
    expect(result).toBe('  └─ Test item');
  });

  test('handles nested list items', () => {
    const renderer: ListItemRenderer = (item, position) => {
      const content = typeof item === 'string' ? item : '[nested list]';
      return `${position.index}: ${content}`;
    };

    const nestedConfig: ListConfig = {
      items: ['nested'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    const position: ListItemPosition = {
      index: 1,
      depth: 0,
      path: [1],
      isLast: false,
      hasChildren: true,
    };

    const result = renderer(nestedConfig, position);
    expect(result).toBe('1: [nested list]');
  });
});