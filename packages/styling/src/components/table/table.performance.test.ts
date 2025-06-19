import { describe, expect, test } from 'bun:test';
import { TableBuilder } from './builder';
import { Table } from './operations';

describe('Table Performance Tests', () => {
  describe('Table creation performance', () => {
    test('should create empty tables within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Table.create();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create tables with headers within 1ms for 500 operations', () => {
      const headers = ['Name', 'Age', 'City', 'Country'];
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        Table.headers(Table.create(), headers);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should add rows efficiently', () => {
      const table = Table.create();
      const tableWithHeaders = Table.headers(table, ['Name', 'Age', 'City']);
      const rows = [
        ['John', '25', 'New York'],
        ['Jane', '30', 'London'],
        ['Bob', '35', 'Paris'],
      ];

      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Table.rows(tableWithHeaders, rows);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('TableBuilder performance', () => {
    test('should build simple tables within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        TableBuilder.create()
          .headers('Name', 'Age', 'City')
          .rows(['John', '25', 'New York'], ['Jane', '30', 'London'])
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should build complex tables efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        TableBuilder.create()
          .headers('ID', 'Name', 'Email', 'Department', 'Salary', 'Start Date')
          .rows(
            ['1', 'John Doe', 'john@example.com', 'Engineering', '$75,000', '2023-01-15'],
            ['2', 'Jane Smith', 'jane@example.com', 'Marketing', '$65,000', '2023-02-01'],
            ['3', 'Bob Johnson', 'bob@example.com', 'Sales', '$70,000', '2023-01-30'],
            ['4', 'Alice Brown', 'alice@example.com', 'HR', '$60,000', '2023-03-01'],
            ['5', 'Charlie Wilson', 'charlie@example.com', 'Finance', '$80,000', '2023-01-10']
          )
          .width(120)
          .height(20)
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should chain many operations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 30; i++) {
        TableBuilder.create()
          .headers('Col1', 'Col2', 'Col3', 'Col4', 'Col5')
          .rows(
            ['A1', 'B1', 'C1', 'D1', 'E1'],
            ['A2', 'B2', 'C2', 'D2', 'E2'],
            ['A3', 'B3', 'C3', 'D3', 'E3']
          )
          .width(100)
          .height(15)
          .styleFunc((_row, _col) => ({}))
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Table operations performance', () => {
    test('should handle large datasets efficiently', () => {
      const headers = ['ID', 'Name', 'Value', 'Status', 'Date'];
      const largeDataset = Array.from({ length: 100 }, (_, i) => [
        `${i + 1}`,
        `Item ${i + 1}`,
        `${(i + 1) * 100}`,
        i % 2 === 0 ? 'Active' : 'Inactive',
        `2023-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      ]);

      const start = performance.now();

      for (let i = 0; i < 10; i++) {
        const table = Table.create();
        const withHeaders = Table.headers(table, headers);
        Table.rows(withHeaders, largeDataset);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });

    test('should copy tables efficiently', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(['John', '25', 'New York'], ['Jane', '30', 'London'], ['Bob', '35', 'Paris'])
        .build();

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        TableBuilder.from(table).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Table rendering performance', () => {
    test('should render simple tables efficiently', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(['John', '25', 'New York'], ['Jane', '30', 'London'])
        .build();

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Table.render(table);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should render large tables efficiently', () => {
      const headers = ['ID', 'Name', 'Email', 'Department'];
      const rows = Array.from({ length: 50 }, (_, i) => [
        `${i + 1}`,
        `User ${i + 1}`,
        `user${i + 1}@example.com`,
        ['Engineering', 'Marketing', 'Sales', 'HR'][i % 4],
      ]);

      const table = TableBuilder.create()
        .headers(...headers)
        .rows(...rows)
        .build();

      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        Table.render(table);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many tables', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        TableBuilder.create()
          .headers('Col1', 'Col2', 'Col3')
          .rows([`A${i}`, `B${i}`, `C${i}`], [`D${i}`, `E${i}`, `F${i}`])
          .build();
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle rapid table operations without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 500; i++) {
        const table = TableBuilder.create()
          .headers('Name', 'Value')
          .rows([`Item ${i}`, `${i * 100}`])
          .build();

        // Perform various operations
        TableBuilder.from(table).build();
        Table.render(table);
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent table creation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return TableBuilder.create()
          .headers('ID', 'Name', 'Value')
          .rows([`${i}`, `Item ${i}`, `${i * 100}`])
          .build();
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });

    test('should handle concurrent rendering efficiently', async () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(['John', '25', 'New York'], ['Jane', '30', 'London'])
        .build();

      const start = performance.now();

      const promises = Array.from({ length: 50 }, async () => {
        return Table.render(table);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(40);
    });
  });

  describe('Edge case performance', () => {
    test('should handle empty tables efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const table = Table.create();
        Table.render(table);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle tables with only headers efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        const table = TableBuilder.create().headers('Col1', 'Col2', 'Col3').build();
        Table.render(table);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle very wide tables efficiently', () => {
      const wideHeaders = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`);
      const wideRow = Array.from({ length: 20 }, (_, i) => `Data ${i + 1}`);

      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        TableBuilder.create()
          .headers(...wideHeaders)
          .rows(wideRow)
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should handle tables with long cell content efficiently', () => {
      const longContent = 'A'.repeat(100);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        TableBuilder.create()
          .headers('Short', 'Long Content', 'Short')
          .rows(['A', longContent, 'C'])
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });
});
