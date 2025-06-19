import { describe, expect, test } from 'bun:test';
import { TableBuilder, TableChain } from './builder';
import type { TableConfig } from './types';

describe('TableBuilder', () => {
  describe('static factory methods', () => {
    test('creates empty table builder', () => {
      const builder = TableBuilder.create();
      expect(builder.isEmpty()).toBe(true);
      expect(builder.getColumnCount()).toBe(0);
      expect(builder.getRowCount()).toBe(0);
    });

    test('creates table builder from existing config', () => {
      const config: TableConfig = {
        headers: ['Name', 'Age'],
        rows: [['John', '25'], ['Jane', '30']],
        border: undefined,
        styleFunc: undefined,
        width: undefined,
        height: undefined,
      };
      const builder = TableBuilder.from(config);
      expect(builder.getColumnCount()).toBe(2);
      expect(builder.getRowCount()).toBe(2);
    });
  });

  describe('header and row methods', () => {
    test('sets table headers', () => {
      const builder = TableBuilder.create().headers('Name', 'Age', 'City');
      const config = builder.getConfig();
      expect(config.headers).toEqual(['Name', 'Age', 'City']);
      expect(builder.getColumnCount()).toBe(3);
    });

    test('sets table rows', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      const config = builder.getConfig();
      expect(config.rows).toEqual([['John', '25'], ['Jane', '30']]);
      expect(builder.getRowCount()).toBe(2);
    });

    test('adds single row', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25']);
      
      const config = builder.getConfig();
      expect(config.rows).toEqual([['John', '25']]);
      expect(builder.getRowCount()).toBe(1);
    });

    test('adds multiple rows', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .addRows([['John', '25'], ['Jane', '30']]);
      
      const config = builder.getConfig();
      expect(config.rows).toEqual([['John', '25'], ['Jane', '30']]);
      expect(builder.getRowCount()).toBe(2);
    });

    test('chains row operations', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .addRow(['Jane', '30'])
        .addRows([['Bob', '35'], ['Alice', '28']]);
      
      expect(builder.getRowCount()).toBe(4);
      const config = builder.getConfig();
      expect(config.rows[2]).toEqual(['Bob', '35']);
    });
  });

  describe('border configuration', () => {
    test('sets border configuration', () => {
      const borderConfig = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true] as const,
      };

      const builder = TableBuilder.create().border(borderConfig);
      const config = builder.getConfig();
      expect(config.border).toEqual(borderConfig);
    });

    test('removes border', () => {
      const borderConfig = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true] as const,
      };

      const builder = TableBuilder.create()
        .border(borderConfig)
        .noBorder();
      
      const config = builder.getConfig();
      expect(config.border).toBeUndefined();
    });
  });

  describe('style function configuration', () => {
    test('sets style function', () => {
      const styleFunc = (row: number, col: number) => ({ bold: row === -1 });
      const builder = TableBuilder.create().styleFunc(styleFunc);
      
      const config = builder.getConfig();
      expect(config.styleFunc).toBe(styleFunc);
    });

    test('removes style function', () => {
      const styleFunc = (row: number, col: number) => ({ bold: true });
      const builder = TableBuilder.create()
        .styleFunc(styleFunc)
        .noStyleFunc();
      
      const config = builder.getConfig();
      expect(config.styleFunc).toBeUndefined();
    });
  });

  describe('dimension configuration', () => {
    test('sets table width', () => {
      const builder = TableBuilder.create().width(80);
      const config = builder.getConfig();
      expect(config.width).toBe(80);
    });

    test('sets table height', () => {
      const builder = TableBuilder.create().height(20);
      const config = builder.getConfig();
      expect(config.height).toBe(20);
    });

    test('sets both dimensions', () => {
      const builder = TableBuilder.create().dimensions(80, 20);
      const config = builder.getConfig();
      expect(config.width).toBe(80);
      expect(config.height).toBe(20);
    });
  });

  describe('data manipulation methods', () => {
    test('creates table from 2D array', () => {
      const data = [
        ['Name', 'Age', 'City'],
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA'],
      ];

      const builder = TableBuilder.create().fromArray(data);
      const config = builder.getConfig();
      expect(config.headers).toEqual(['Name', 'Age', 'City']);
      expect(config.rows).toEqual([['John', '25', 'NYC'], ['Jane', '30', 'LA']]);
    });

    test('converts table to 2D array', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      const array = builder.toArray();
      expect(array).toEqual([
        ['Name', 'Age'],
        ['John', '25'],
        ['Jane', '30'],
      ]);
    });
  });

  describe('query methods', () => {
    test('checks if table is empty', () => {
      const emptyBuilder = TableBuilder.create();
      const nonEmptyBuilder = TableBuilder.create().headers('Name');
      
      expect(emptyBuilder.isEmpty()).toBe(true);
      expect(nonEmptyBuilder.isEmpty()).toBe(false);
    });

    test('gets column count', () => {
      const builder = TableBuilder.create().headers('Name', 'Age', 'City');
      expect(builder.getColumnCount()).toBe(3);
    });

    test('gets row count', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      expect(builder.getRowCount()).toBe(2);
    });

    test('gets total row count including header', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      expect(builder.getTotalRowCount()).toBe(3);
    });

    test('calculates metrics', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      const metrics = builder.calculateMetrics();
      expect(metrics.columnCount).toBe(2);
      expect(metrics.rowCount).toBe(3);
    });

    test('validates table configuration', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane', '30']);
      
      const validation = builder.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('functional methods', () => {
    test('clones table', () => {
      const original = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25']);
      
      const cloned = original.clone();
      expect(cloned.getConfig()).toEqual(original.getConfig());
      expect(cloned).not.toBe(original);
    });

    test('transforms table configuration', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .transform((config) => ({
          ...config,
          width: 100,
        }));
      
      expect(builder.getConfig().width).toBe(100);
    });

    test('conditional operations with when', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .when(true, (chain) => chain.width(80))
        .when(false, (chain) => chain.height(20));
      
      const config = builder.getConfig();
      expect(config.width).toBe(80);
      expect(config.height).toBeUndefined();
    });

    test('pipe transformation', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .pipe((chain) => chain.width(100));
      
      expect(builder.getConfig().width).toBe(100);
    });
  });

  describe('build methods', () => {
    test('builds final configuration', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25']);
      
      const config = builder.build();
      expect(config.headers).toEqual(['Name', 'Age']);
      expect(config.rows).toEqual([['John', '25']]);
    });

    test('gets current configuration', () => {
      const builder = TableBuilder.create().headers('Name', 'Age');
      const config = builder.getConfig();
      expect(config.headers).toEqual(['Name', 'Age']);
    });
  });
});

describe('TableChain', () => {
  describe('immutability', () => {
    test('each operation returns new chain', () => {
      const original = TableBuilder.create();
      const modified = original.headers('Name', 'Age');
      
      expect(original.getConfig().headers).toHaveLength(0);
      expect(modified.getConfig().headers).toEqual(['Name', 'Age']);
      expect(original).not.toBe(modified);
    });

    test('maintains immutability through complex chains', () => {
      const chain1 = TableBuilder.create();
      const chain2 = chain1.headers('Name', 'Age');
      const chain3 = chain2.addRow(['John', '25']);
      
      expect(chain1.getConfig().headers).toHaveLength(0);
      expect(chain2.getConfig().headers).toEqual(['Name', 'Age']);
      expect(chain2.getConfig().rows).toHaveLength(0);
      expect(chain3.getConfig().rows).toHaveLength(1);
    });
  });

  describe('method chaining', () => {
    test('chains multiple operations', () => {
      const borderConfig = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: '┘',
        },
        sides: [true, true, true, true] as const,
      };

      const chain = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(['John', '25', 'NYC'], ['Jane', '30', 'LA'])
        .border(borderConfig)
        .width(80)
        .styleFunc((row, col) => ({ bold: row === -1 }));
      
      const config = chain.getConfig();
      expect(config.headers).toEqual(['Name', 'Age', 'City']);
      expect(config.rows).toHaveLength(2);
      expect(config.border).toEqual(borderConfig);
      expect(config.width).toBe(80);
      expect(config.styleFunc).toBeDefined();
    });

    test('chains data operations', () => {
      const chain = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .addRow(['Jane', '30'])
        .addRows([['Bob', '35'], ['Alice', '28']]);
      
      expect(chain.getRowCount()).toBe(4);
      expect(chain.getColumnCount()).toBe(2);
    });
  });

  describe('complex scenarios', () => {
    test('builds complete table with all features', () => {
      const styleFunc = (row: number, col: number) => {
        if (row === -1) return { bold: true }; // Header row
        if (col === 1) return { italic: true }; // Age column
        return {};
      };

      const borderConfig = {
        type: 'rounded' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '╭',
          topRight: '╮',
          bottomLeft: '╰',
          bottomRight: '╯',
        },
        sides: [true, true, true, true] as const,
      };

      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City', 'Country')
        .rows(
          ['John Doe', '25', 'New York', 'USA'],
          ['Jane Smith', '30', 'Los Angeles', 'USA'],
          ['Bob Johnson', '35', 'Chicago', 'USA']
        )
        .border(borderConfig)
        .styleFunc(styleFunc)
        .dimensions(100, 20);

      const config = table.build();
      expect(config.headers).toHaveLength(4);
      expect(config.rows).toHaveLength(3);
      expect(config.border?.type).toBe('rounded');
      expect(config.styleFunc).toBe(styleFunc);
      expect(config.width).toBe(100);
      expect(config.height).toBe(20);

      const metrics = table.calculateMetrics();
      expect(metrics.columnCount).toBe(4);
      expect(metrics.rowCount).toBe(4); // Including header
    });

    test('handles empty and sparse data', () => {
      const table = TableBuilder.create()
        .headers('A', 'B', 'C')
        .rows(['', 'data', ''], ['value', '', 'end']);

      const config = table.build();
      expect(config.rows[0]).toEqual(['', 'data', '']);
      expect(config.rows[1]).toEqual(['value', '', 'end']);
    });

    test('validates complex table configurations', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .rows(['John', '25'], ['Jane']); // Mismatched column count

      const validation = table.validate();
      expect(validation.isValid).toBe(true); // Column mismatch is a warning, not error
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Row 1 has 1 cells but table has 2 headers');
    });
  });
});