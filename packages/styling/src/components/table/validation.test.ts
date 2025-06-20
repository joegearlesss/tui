import { describe, expect, test } from 'bun:test';
import { Table } from './operations';
import type { TableConfig } from './types';
import { TableValidation } from './validation';

describe('TableValidation', () => {
  describe('validateTableConfig', () => {
    test('validates valid table configuration', () => {
      const config: TableConfig = Table.rows(
        ['John', '25'],
        ['Jane', '30']
      )(Table.headers('Name', 'Age')(Table.create()));

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates empty table configuration', () => {
      const config: TableConfig = Table.create();

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates table with headers only', () => {
      const config: TableConfig = Table.headers('Name', 'Age', 'City')(Table.create());

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing headers array', () => {
      const config: TableConfig = {
        ...Table.rows(['John', '25'])(Table.create()),
        headers: undefined as any,
      };

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Headers must be an array');
    });

    test('detects missing rows array', () => {
      const config: TableConfig = {
        ...Table.headers('Name', 'Age')(Table.create()),
        rows: undefined as any,
      };

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rows must be an array');
    });

    test('detects invalid width', () => {
      const config: TableConfig = Table.width(-10)(
        Table.rows(['John', '25'])(Table.headers('Name', 'Age')(Table.create()))
      );

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Width must be a positive number');
    });

    test('detects invalid height', () => {
      const config: TableConfig = Table.height(0)(
        Table.rows(['John', '25'])(Table.headers('Name', 'Age')(Table.create()))
      );

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Height must be a positive number');
    });

    test('detects non-function style function', () => {
      const config: TableConfig = {
        ...Table.rows(['John', '25'])(Table.headers('Name', 'Age')(Table.create())),
        styleFunc: 'not a function' as any,
      };

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Style function must be a function');
    });
  });

  describe('validateHeaders', () => {
    test('validates valid headers', () => {
      const headers = ['Name', 'Age', 'City'];
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates empty headers', () => {
      const headers: string[] = [];
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects non-string header', () => {
      const headers = ['Name', 123, 'City'] as any;
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Header at index 1 must be a string');
    });

    test('detects duplicate headers', () => {
      const headers = ['Name', 'Age', 'Name'];
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate header found: Name');
    });

    test('allows empty string headers', () => {
      const headers = ['Name', '', 'Age'];
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Header at index 1 is empty');
    });

    test('warns about very long headers', () => {
      const longHeader = 'A'.repeat(100);
      const headers = ['Name', longHeader];
      const result = TableValidation.validateHeaders(headers);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Header at index 1 is very long (100 characters)');
    });
  });

  describe('validateRows', () => {
    test('validates valid rows', () => {
      const rows = [
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA'],
      ];
      const result = TableValidation.validateRows(rows, 3);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates empty rows', () => {
      const rows: string[][] = [];
      const result = TableValidation.validateRows(rows, 2);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects non-array row', () => {
      const rows = [['John', '25'], 'not an array'] as any;
      const result = TableValidation.validateRows(rows, 2);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Row at index 1 must be an array');
    });

    test('detects non-string cell', () => {
      const rows = [['John', 25]] as any;
      const result = TableValidation.validateRows(rows, 2);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cell at row 0, column 1 must be a string');
    });

    test('detects column count mismatch', () => {
      const rows = [
        ['John', '25', 'NYC'],
        ['Jane', '30'], // Missing city
      ];
      const result = TableValidation.validateRows(rows, 3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Row 1 has 2 columns, expected 3');
    });

    test('warns about extra columns', () => {
      const rows = [
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA', 'Extra'], // Extra column
      ];
      const result = TableValidation.validateRows(rows, 3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Row 1 has 4 columns, expected 3');
    });

    test('allows empty cells', () => {
      const rows = [
        ['John', '', 'NYC'],
        ['', '30', ''],
      ];
      const result = TableValidation.validateRows(rows, 3);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('warns about very long cell content', () => {
      const longContent = 'A'.repeat(200);
      const rows = [['John', longContent]];
      const result = TableValidation.validateRows(rows, 2);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Cell at row 0, column 1 is very long (200 characters)');
    });
  });

  describe('validateBorderConfig', () => {
    test('validates valid border configuration', () => {
      const border = {
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

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates undefined border', () => {
      const result = TableValidation.validateBorderConfig(undefined);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid border type', () => {
      const border = {
        type: 'invalid' as any,
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

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid border type: invalid');
    });

    test('detects missing border chars', () => {
      const border = {
        type: 'normal' as const,
        chars: undefined as any,
        sides: [true, true, true, true] as const,
      };

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Border chars configuration is required');
    });

    test('detects invalid sides array', () => {
      const border = {
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
        sides: [true, true] as any, // Should have 4 elements
      };

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sides array must have exactly 4 elements');
    });

    test('detects missing border characters', () => {
      const border = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          // Missing bottomRight
        } as any,
        sides: [true, true, true, true] as const,
      };

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing border character: bottomRight');
    });

    test('detects non-string border characters', () => {
      const border = {
        type: 'normal' as const,
        chars: {
          top: '─',
          right: '│',
          bottom: '─',
          left: '│',
          topLeft: '┌',
          topRight: '┐',
          bottomLeft: '└',
          bottomRight: 123, // Should be string
        } as any,
        sides: [true, true, true, true] as const,
      };

      const result = TableValidation.validateBorderConfig(border);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Border character bottomRight must be a string');
    });
  });

  describe('validateStyleFunction', () => {
    test('validates working style function', () => {
      const styleFunc = (row: number, _col: number) => ({ bold: row === -1 });
      const result = TableValidation.validateStyleFunction(styleFunc);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates undefined style function', () => {
      const result = TableValidation.validateStyleFunction(undefined);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects non-function style function', () => {
      const styleFunc = 'not a function' as any;
      const result = TableValidation.validateStyleFunction(styleFunc);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Style function must be a function');
    });

    test('detects style function that throws errors', () => {
      const styleFunc = () => {
        throw new Error('Test error');
      };
      const result = TableValidation.validateStyleFunction(styleFunc);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Style function throws an error: Test error');
    });

    test('detects style function that returns non-object', () => {
      const styleFunc = () => 'not an object' as any;
      const result = TableValidation.validateStyleFunction(styleFunc);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Style function must return an object');
    });

    test('validates style function with different parameters', () => {
      const styleFunc = (row: number, col: number) => {
        if (row === -1) return { bold: true }; // Header
        if (col === 0) return { italic: true }; // First column
        return {};
      };
      const result = TableValidation.validateStyleFunction(styleFunc);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTableStructure', () => {
    test('validates consistent table structure', () => {
      const config: TableConfig = Table.rows(
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA']
      )(Table.headers('Name', 'Age', 'City')(Table.create()));

      const result = TableValidation.validateTableStructure(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects inconsistent column counts', () => {
      const config: TableConfig = Table.rows(
        ['John', '25', 'NYC'],
        ['Jane', '30']
      )(
        // First row has extra column
        Table.headers('Name', 'Age')(Table.create())
      );

      const result = TableValidation.validateTableStructure(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Row 0 has 3 columns, expected 2');
    });

    test('validates empty table structure', () => {
      const config: TableConfig = Table.create();

      const result = TableValidation.validateTableStructure(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('warns about large tables', () => {
      const headers = Array.from({ length: 50 }, (_, i) => `Col${i}`);
      const rows = Array.from({ length: 1000 }, (_, i) =>
        Array.from({ length: 50 }, (_, j) => `Cell${i}-${j}`)
      );

      const config: TableConfig = Table.addRows(rows)(Table.headers(...headers)(Table.create()));

      const result = TableValidation.validateTableStructure(config);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Table has a large number of columns (50), which may impact performance'
      );
      expect(result.warnings).toContain(
        'Table has a large number of rows (1000), which may impact performance'
      );
    });
  });

  describe('edge cases and comprehensive validation', () => {
    test('handles null and undefined values gracefully', () => {
      const config = {
        headers: null,
        rows: null,
        border: null,
        styleFunc: null,
        width: null,
        height: null,
      } as any;

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates complex table with all features', () => {
      const config: TableConfig = Table.dimensions(
        80,
        10
      )(
        Table.styleFunc((row, col) => {
          if (row === -1) return { bold: true };
          if (col === 1) return { italic: true };
          return {};
        })(
          Table.border({
            type: 'rounded',
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
            sides: [true, true, true, true],
          })(
            Table.rows(
              ['John Doe', '25', 'New York', 'USA'],
              ['Jane Smith', '30', 'Los Angeles', 'USA'],
              ['Bob Johnson', '35', 'Chicago', 'USA']
            )(Table.headers('Name', 'Age', 'City', 'Country')(Table.create()))
          )
        )
      );

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('accumulates multiple validation errors', () => {
      const config: TableConfig = {
        ...Table.height(0)(
          // Invalid height
          Table.width(-10)(
            // Invalid width
            Table.rows(['John', '25', 'Extra'])(
              // Wrong column count
              Table.headers(
                'Name',
                123 as any
              )(
                // Invalid header
                Table.create()
              )
            )
          )
        ),
        styleFunc: 'not a function' as any, // Invalid style function
      };

      const result = TableValidation.validateTableConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });
});
