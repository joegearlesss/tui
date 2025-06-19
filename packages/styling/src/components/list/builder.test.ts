import { describe, expect, test } from 'bun:test';
import { ListBuilder, ListChain } from './builder';
import type { ListConfig } from './types';

describe('ListBuilder', () => {
  describe('static factory methods', () => {
    test('creates empty list builder', () => {
      const builder = ListBuilder.create();
      expect(builder.length()).toBe(0);
      expect(builder.isEmpty()).toBe(true);
    });

    test('creates list builder with items', () => {
      const builder = ListBuilder.create(['Item 1', 'Item 2']);
      expect(builder.length()).toBe(2);
      expect(builder.isEmpty()).toBe(false);
    });

    test('creates builder from existing config', () => {
      const config: ListConfig = {
        items: ['Test'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 1,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };
      const builder = ListBuilder.from(config);
      expect(builder.length()).toBe(1);
      expect(builder.getItem(0)).toBe('Test');
    });

    test('creates builder from strings', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);
      expect(builder.length()).toBe(3);
      expect(builder.getItem(1)).toBe('B');
    });

    test('creates nested list builder', () => {
      const nestedConfig: ListConfig = {
        items: ['Nested'],
        enumerator: () => '-',
        hidden: false,
        indentLevel: 1,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };
      const builder = ListBuilder.nested(['Top', nestedConfig]);
      expect(builder.length()).toBe(2);
    });
  });

  describe('configuration methods', () => {
    test('sets enumerator function', () => {
      const builder = ListBuilder.create(['A', 'B']).enumerator((i) => `${i + 1}.`);

      const config = builder.get();
      expect(config.enumerator(0)).toBe('1.');
      expect(config.enumerator(1)).toBe('2.');
    });

    test('sets indentation', () => {
      const builder = ListBuilder.create(['Test']).indent(4);
      const config = builder.get();
      expect(config.indentLevel).toBe(4);
    });

    test('sets spacing', () => {
      const builder = ListBuilder.create(['Test']).spacing(2);
      const config = builder.get();
      expect(config.enumeratorSpacing).toBe(2);
    });

    test('sets item style', () => {
      const styleFunction = (text: string) => `**${text}**`;
      const builder = ListBuilder.create(['Test']).itemStyle(styleFunction);
      const config = builder.get();
      expect(config.itemStyle?.('test')).toBe('**test**');
    });

    test('sets enumerator style', () => {
      const styleFunction = (text: string) => `[${text}]`;
      const builder = ListBuilder.create(['Test']).enumeratorStyle(styleFunction);
      const config = builder.get();
      expect(config.enumeratorStyle?.('•')).toBe('[•]');
    });
  });

  describe('item manipulation methods', () => {
    test('appends items', () => {
      const builder = ListBuilder.create(['A']).append('B').append('C');

      expect(builder.length()).toBe(3);
      expect(builder.getItem(2)).toBe('C');
    });

    test('prepends items', () => {
      const builder = ListBuilder.create(['B']).prepend('A');

      expect(builder.length()).toBe(2);
      expect(builder.getItem(0)).toBe('A');
      expect(builder.getItem(1)).toBe('B');
    });

    test('inserts items at specific index', () => {
      const builder = ListBuilder.create(['A', 'C']).insert(1, 'B');

      expect(builder.length()).toBe(3);
      expect(builder.getItem(1)).toBe('B');
    });

    test('removes items by index', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']).remove(1);

      expect(builder.length()).toBe(2);
      expect(builder.getItem(1)).toBe('C');
    });

    test('replaces items by index', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']).replace(1, 'X');

      expect(builder.length()).toBe(3);
      expect(builder.getItem(1)).toBe('X');
    });
  });

  describe('functional methods', () => {
    test('filters items', () => {
      const builder = ListBuilder.create(['A', 'B', 'C', 'D']).filter(
        (_item, index) => index % 2 === 0
      );

      expect(builder.length()).toBe(2);
      expect(builder.getItem(0)).toBe('A');
      expect(builder.getItem(1)).toBe('C');
    });

    test('maps items', () => {
      const builder = ListBuilder.create(['a', 'b', 'c']).map((item) =>
        typeof item === 'string' ? item.toUpperCase() : item
      );

      expect(builder.getItem(0)).toBe('A');
      expect(builder.getItem(1)).toBe('B');
      expect(builder.getItem(2)).toBe('C');
    });

    test('concatenates with another list', () => {
      const otherConfig: ListConfig = {
        items: ['X', 'Y'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const builder = ListBuilder.create(['A', 'B']).concat(otherConfig);

      expect(builder.length()).toBe(4);
      expect(builder.getItem(2)).toBe('X');
      expect(builder.getItem(3)).toBe('Y');
    });

    test('reverses items', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']).reverse();

      expect(builder.getItem(0)).toBe('C');
      expect(builder.getItem(1)).toBe('B');
      expect(builder.getItem(2)).toBe('A');
    });
  });

  describe('query methods', () => {
    test('finds index of item', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']);
      expect(builder.indexOf('B')).toBe(1);
      expect(builder.indexOf('X')).toBe(-1);
    });

    test('checks if contains item', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']);
      expect(builder.contains('B')).toBe(true);
      expect(builder.contains('X')).toBe(false);
    });

    test('calculates metrics', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']);
      const metrics = builder.metrics();
      expect(metrics.totalItems).toBe(3);
      expect(metrics.topLevelItems).toBe(3);
    });

    test('flattens to string array', () => {
      const nestedConfig: ListConfig = {
        items: ['Nested'],
        enumerator: () => '-',
        hidden: false,
        indentLevel: 1,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const builder = ListBuilder.create(['A', nestedConfig, 'B']);
      const flattened = builder.flatten();
      expect(flattened).toContain('A');
      expect(flattened).toContain('B');
      expect(flattened).toContain('Nested');
    });

    test('converts to strings', () => {
      const builder = ListBuilder.create(['A', 'B', 'C']);
      const strings = builder.toStrings();
      expect(strings).toEqual(['A', 'B', 'C']);
    });
  });

  describe('build methods', () => {
    test('builds immutable config', () => {
      const builder = ListBuilder.create(['Test']);
      const config1 = builder.build();
      const config2 = builder.build();

      expect(config1.items).toEqual(config2.items);
      expect(config1.enumerator(0)).toEqual(config2.enumerator(0));
      expect(config1).not.toBe(config2); // Different objects
    });

    test('gets current config', () => {
      const builder = ListBuilder.create(['Test']);
      const config = builder.get();
      expect(config.items).toEqual(['Test']);
    });
  });
});

describe('ListChain', () => {
  describe('static factory methods', () => {
    test('creates chain from config', () => {
      const config: ListConfig = {
        items: ['Test'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };
      const chain = ListChain.from(config);
      expect(chain.get().items).toEqual(['Test']);
    });

    test('creates chain with items', () => {
      const chain = ListChain.create(['A', 'B']);
      expect(chain.get().items).toEqual(['A', 'B']);
    });
  });

  describe('chaining methods', () => {
    test('chains multiple operations', () => {
      const chain = ListChain.create(['a', 'b'])
        .withEnumerator((i) => `${i + 1}.`)
        .withIndent(2)
        .withSpacing(1)
        .append('c')
        .map((item) => (typeof item === 'string' ? item.toUpperCase() : item));

      const config = chain.get();
      expect(config.items).toEqual(['A', 'B', 'C']);
      expect(config.enumerator(0)).toBe('1.');
    });

    test('applies styling functions', () => {
      const chain = ListChain.create(['test'])
        .withItemStyle((text) => `**${text}**`)
        .withEnumeratorStyle((text) => `[${text}]`);

      const config = chain.get();
      expect(config.itemStyle?.('test')).toBe('**test**');
      expect(config.enumeratorStyle?.('•')).toBe('[•]');
    });

    test('manipulates items', () => {
      const chain = ListChain.create(['A', 'B', 'C'])
        .filter((item) => item !== 'B')
        .prepend('X')
        .reverse();

      const config = chain.get();
      expect(config.items).toEqual(['C', 'A', 'X']);
    });

    test('concatenates with other lists', () => {
      const otherConfig: ListConfig = {
        items: ['X', 'Y'],
        enumerator: () => '•',
        hidden: false,
        indentLevel: 0,
        indentString: '  ',
        showEnumerators: true,
        enumeratorSpacing: 1,
      };

      const chain = ListChain.create(['A', 'B']).concat(otherConfig);

      expect(chain.get().items).toEqual(['A', 'B', 'X', 'Y']);
    });
  });

  describe('conversion methods', () => {
    test('converts to builder', () => {
      const chain = ListChain.create(['A', 'B']);
      const builder = chain.toBuilder();
      expect(builder.length()).toBe(2);
      expect(builder.getItem(0)).toBe('A');
    });

    test('builds final config', () => {
      const chain = ListChain.create(['Test']);
      const config = chain.build();
      expect(config.items).toEqual(['Test']);
    });
  });

  describe('immutability', () => {
    test('each operation returns new chain', () => {
      const original = ListChain.create(['A']);
      const modified = original.append('B');

      expect(original.get().items).toEqual(['A']);
      expect(modified.get().items).toEqual(['A', 'B']);
      expect(original).not.toBe(modified);
    });

    test('maintains immutability through complex chains', () => {
      const chain1 = ListChain.create(['A', 'B']);
      const chain2 = chain1.withIndent(2);
      const chain3 = chain2.append('C');

      expect(chain1.get().items).toEqual(['A', 'B']);
      expect(chain2.get().items).toEqual(['A', 'B']);
      expect(chain3.get().items).toEqual(['A', 'B', 'C']);
    });
  });
});
