/**
 * Table Component Tests
 * 
 * Comprehensive unit tests for table component functionality.
 * Tests core operations, builder pattern, validation, and rendering.
 */

import { describe, test, expect } from 'bun:test';
import { Table, TableBuilder, TableRender, type TableConfig } from './index';
import { Border } from '../../border/presets';
import { Style } from '../../style/style';

describe('Table Component', () => {
  describe('Table.create', () => {
    test('should create empty table configuration', () => {
      const table = Table.create();
      
      expect(table.headers).toEqual([]);
      expect(table.rows).toEqual([]);
      expect(table.border).toBeUndefined();
      expect(table.styleFunc).toBeUndefined();
      expect(table.width).toBeUndefined();
      expect(table.height).toBeUndefined();
    });
  });

  describe('Table operations', () => {
    test('should set headers', () => {
      const table = Table.create();
      const withHeaders = Table.headers('Name', 'Age', 'City')(table);
      
      expect(withHeaders.headers).toEqual(['Name', 'Age', 'City']);
      expect(withHeaders.rows).toEqual([]);
    });

    test('should set rows', () => {
      const table = Table.create();
      const withRows = Table.rows(
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA']
      )(table);
      
      expect(withRows.rows).toEqual([
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA']
      ]);
    });

    test('should add single row', () => {
      const table = Table.rows(['John', '25', 'NYC'])(Table.create());
      const withNewRow = Table.addRow(['Jane', '30', 'LA'])(table);
      
      expect(withNewRow.rows).toEqual([
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA']
      ]);
    });

    test('should add multiple rows', () => {
      const table = Table.rows(['John', '25', 'NYC'])(Table.create());
      const withNewRows = Table.addRows([
        ['Jane', '30', 'LA'],
        ['Bob', '35', 'Chicago']
      ])(table);
      
      expect(withNewRows.rows).toEqual([
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA'],
        ['Bob', '35', 'Chicago']
      ]);
    });

    test('should set border', () => {
      const table = Table.create();
      const border = Border.normal();
      const withBorder = Table.border(border)(table);
      
      expect(withBorder.border).toBe(border);
    });

    test('should remove border', () => {
      const table = Table.border(Border.normal())(Table.create());
      const withoutBorder = Table.noBorder()(table);
      
      expect(withoutBorder.border).toBeUndefined();
    });

    test('should set style function', () => {
      const table = Table.create();
      const styleFunc = (row: number, col: number) => Style.create();
      const withStyle = Table.styleFunc(styleFunc)(table);
      
      expect(withStyle.styleFunc).toBe(styleFunc);
    });

    test('should set dimensions', () => {
      const table = Table.create();
      const withDimensions = Table.dimensions(80, 20)(table);
      
      expect(withDimensions.width).toBe(80);
      expect(withDimensions.height).toBe(20);
    });
  });

  describe('Table validation', () => {
    test('should validate empty table as invalid', () => {
      const table = Table.create();
      const result = Table.validate(table);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Table must have at least one header');
    });

    test('should validate table with headers as valid', () => {
      const table = Table.headers('Name', 'Age')(Table.create());
      const result = Table.validate(table);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should warn about inconsistent row lengths', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John'], ['Jane', '30', 'Extra'])(Table.create())
      );
      const result = Table.validate(table);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('cells but table has'))).toBe(true);
    });

    test('should warn about empty cells', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John', ''], ['', '30'])(Table.create())
      );
      const result = Table.validate(table);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Empty cell'))).toBe(true);
    });
  });

  describe('Table metrics', () => {
    test('should calculate basic metrics', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John', '25'], ['Jane', '30'])(Table.create())
      );
      const metrics = Table.calculateMetrics(table);
      
      expect(metrics.columnCount).toBe(2);
      expect(metrics.rowCount).toBe(3); // header + 2 data rows
      expect(metrics.columnWidths).toHaveLength(2);
      expect(metrics.rowHeights).toHaveLength(3);
    });

    test('should calculate column widths based on content', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John', '25'], ['Alexander', '30'])(Table.create())
      );
      const metrics = Table.calculateMetrics(table);
      
      // 'Alexander' is longer than 'Name', so first column should be wider
      expect(metrics.columnWidths[0]).toBeGreaterThan(metrics.columnWidths[1]);
    });
  });

  describe('Table utility functions', () => {
    test('should check if table is empty', () => {
      const emptyTable = Table.create();
      const tableWithHeaders = Table.headers('Name')(Table.create());
      const tableWithRows = Table.rows(['John'])(Table.create());
      
      expect(Table.isEmpty(emptyTable)).toBe(true);
      expect(Table.isEmpty(tableWithHeaders)).toBe(false);
      expect(Table.isEmpty(tableWithRows)).toBe(false);
    });

    test('should get column count', () => {
      const table = Table.headers('Name', 'Age', 'City')(Table.create());
      expect(Table.getColumnCount(table)).toBe(3);
    });

    test('should get row count', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John', '25'], ['Jane', '30'])(Table.create())
      );
      expect(Table.getRowCount(table)).toBe(2);
      expect(Table.getTotalRowCount(table)).toBe(3);
    });

    test('should get cell value', () => {
      const table = Table.headers('Name', 'Age')(
        Table.rows(['John', '25'], ['Jane', '30'])(Table.create())
      );
      
      expect(Table.getCellValue(table, Table.HEADER_ROW, 0)).toBe('Name');
      expect(Table.getCellValue(table, 0, 0)).toBe('John');
      expect(Table.getCellValue(table, 1, 1)).toBe('30');
      expect(Table.getCellValue(table, 5, 0)).toBe(''); // Out of bounds
    });

    test('should convert from/to array', () => {
      const data = [
        ['Name', 'Age'],
        ['John', '25'],
        ['Jane', '30']
      ];
      
      const table = Table.fromArray(data);
      expect(table.headers).toEqual(['Name', 'Age']);
      expect(table.rows).toEqual([['John', '25'], ['Jane', '30']]);
      
      const backToArray = Table.toArray(table);
      expect(backToArray).toEqual(data);
    });
  });

  describe('TableBuilder', () => {
    test('should create table using builder pattern', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(
          ['John', '25', 'NYC'],
          ['Jane', '30', 'LA']
        )
        .border(Border.normal())
        .width(80)
        .build();
      
      expect(table.headers).toEqual(['Name', 'Age', 'City']);
      expect(table.rows).toHaveLength(2);
      expect(table.border).toBeDefined();
      expect(table.width).toBe(80);
    });

    test('should support method chaining', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .addRow(['Jane', '30'])
        .noBorder()
        .noStyleFunc();
      
      const table = builder.build();
      expect(table.headers).toEqual(['Name', 'Age']);
      expect(table.rows).toHaveLength(2);
      expect(table.border).toBeUndefined();
      expect(table.styleFunc).toBeUndefined();
    });

    test('should support conditional operations', () => {
      const shouldAddBorder = true;
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .when(shouldAddBorder, builder => builder.border(Border.rounded()))
        .build();
      
      expect(table.border).toBeDefined();
    });

    test('should support transformation', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .transform(config => Table.addRow(['John', '25'])(config))
        .build();
      
      expect(table.rows).toHaveLength(1);
      expect(table.rows[0]).toEqual(['John', '25']);
    });

    test('should support pipe operations', () => {
      const addTestData = (builder: any) => builder
        .headers('Name', 'Age')
        .addRow(['John', '25']);
      
      const table = TableBuilder.create()
        .pipe(addTestData)
        .build();
      
      expect(table.headers).toEqual(['Name', 'Age']);
      expect(table.rows).toHaveLength(1);
    });

    test('should support cloning', () => {
      const original = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25']);
      
      const cloned = original.clone()
        .addRow(['Jane', '30']);
      
      expect(original.getRowCount()).toBe(1);
      expect(cloned.getRowCount()).toBe(2);
    });

    test('should provide utility methods', () => {
      const builder = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25']);
      
      expect(builder.isEmpty()).toBe(false);
      expect(builder.getColumnCount()).toBe(2);
      expect(builder.getRowCount()).toBe(1);
      expect(builder.getTotalRowCount()).toBe(2);
      
      const validation = builder.validate();
      expect(validation.isValid).toBe(true);
      
      const metrics = builder.calculateMetrics();
      expect(metrics.columnCount).toBe(2);
    });
  });

  describe('Table rendering', () => {
    test('should render simple table without borders', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .addRow(['Jane', '30'])
        .build();
      
      const rendered = TableRender.renderNoBorder(table);
      expect(rendered).toContain('Name');
      expect(rendered).toContain('Age');
      expect(rendered).toContain('John');
      expect(rendered).toContain('Jane');
    });

    test('should render table with borders', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .border(Border.normal())
        .build();
      
      const rendered = TableRender.render(table);
      expect(rendered).toContain('─'); // Top border
      expect(rendered).toContain('│'); // Side border
    });

    test('should handle empty table rendering', () => {
      const table = Table.create();
      const rendered = TableRender.render(table);
      expect(rendered).toBe('');
    });

    test('should throw error for invalid table', () => {
      const table = TableBuilder.create()
        .rows(['John', '25']) // Rows without headers is invalid
        .build();
      expect(() => TableRender.render(table)).toThrow('Cannot render invalid table');
    });

    test('should render with custom column widths', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .build();
      
      const rendered = TableRender.renderWithWidths(table, [20, 10]);
      expect(rendered).toBeDefined();
      expect(rendered.length).toBeGreaterThan(0);
    });

    test('should calculate rendered dimensions', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .border(Border.normal())
        .build();
      
      const width = TableRender.getRenderedWidth(table);
      const height = TableRender.getRenderedHeight(table);
      const [w, h] = TableRender.getRenderedDimensions(table);
      
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(w).toBe(width);
      expect(h).toBe(height);
    });
  });

  describe('Table styling', () => {
    test('should apply style function to cells', () => {
      const styleFunc = (row: number, col: number) => {
        if (row === Table.HEADER_ROW) {
          return Style.bold(Style.create(), true);
        }
        return Style.create();
      };
      
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .styleFunc(styleFunc)
        .build();
      
      const headerStyle = Table.getCellStyle(table, Table.HEADER_ROW, 0);
      const cellStyle = Table.getCellStyle(table, 0, 0);
      
      expect(headerStyle).toBeDefined();
      expect(headerStyle?.bold).toBe(true);
      expect(cellStyle).toBeDefined();
      expect(cellStyle?.bold).toBeUndefined(); // Default style has undefined bold
    });

    test('should return undefined for cells without style function', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age')
        .addRow(['John', '25'])
        .build();
      
      const style = Table.getCellStyle(table, 0, 0);
      expect(style).toBeUndefined();
    });
  });

  describe('Table constants', () => {
    test('should have HEADER_ROW constant', () => {
      expect(Table.HEADER_ROW).toBe(-1);
    });
  });

  describe('Edge cases', () => {
    test('should handle table with headers but no rows', () => {
      const table = Table.headers('Name', 'Age')(Table.create());
      const validation = Table.validate(table);
      
      expect(validation.isValid).toBe(true);
      expect(Table.getRowCount(table)).toBe(0);
      expect(Table.getTotalRowCount(table)).toBe(1);
    });

    test('should handle table with rows but no headers', () => {
      const table = Table.rows(['John', '25'])(Table.create());
      const validation = Table.validate(table);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Table must have at least one header');
    });

    test('should handle out-of-bounds cell access', () => {
      const table = TableBuilder.create()
        .headers('Name')
        .addRow(['John'])
        .build();
      
      expect(Table.getCellValue(table, 0, 5)).toBe('');
      expect(Table.getCellValue(table, 5, 0)).toBe('');
      expect(Table.getCellValue(table, -2, 0)).toBe('');
    });

    test('should handle fromArray with empty data', () => {
      const table = Table.fromArray([]);
      expect(Table.isEmpty(table)).toBe(true);
    });

    test('should handle fromArray with single row', () => {
      const table = Table.fromArray([['Name', 'Age']]);
      expect(table.headers).toEqual(['Name', 'Age']);
      expect(table.rows).toEqual([]);
    });
  });
});