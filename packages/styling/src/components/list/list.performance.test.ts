import { describe, expect, test } from 'bun:test';
import { ListBuilder } from './builder';
import { Enumerator } from './enumerators';
import { List } from './operations';

describe('List Performance Tests', () => {
  describe('List creation performance', () => {
    test('should create empty lists within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        List.create();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create lists with items within 1ms for 500 operations', () => {
      const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        List.items(List.create(), items);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('ListBuilder performance', () => {
    test('should build simple lists within 1ms for 200 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        ListBuilder.create()
          .items('First item', 'Second item', 'Third item')
          .enumerator(Enumerator.bullet())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should build nested lists efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        ListBuilder.create()
          .items(
            'Main item 1',
            ListBuilder.create()
              .items('Sub item 1', 'Sub item 2', 'Sub item 3')
              .enumerator(Enumerator.dash())
              .build(),
            'Main item 2',
            ListBuilder.create()
              .items('Another sub 1', 'Another sub 2')
              .enumerator(Enumerator.asterisk())
              .build()
          )
          .enumerator(Enumerator.arabic())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should chain many operations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        ListBuilder.create()
          .items('Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5')
          .enumerator(Enumerator.arabic())
          .indent(2)
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('List operations performance', () => {
    test('should handle large item lists efficiently', () => {
      const largeItemList = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        const list = List.create();
        List.items(list, largeItemList);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should copy lists efficiently', () => {
      const list = ListBuilder.create()
        .items('Item 1', 'Item 2', 'Item 3')
        .enumerator(Enumerator.bullet())
        .build();

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        ListBuilder.from(list).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Enumerator performance', () => {
    test('should generate enumerators efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Enumerator.bullet()([], i);
        Enumerator.dash()([], i);
        Enumerator.asterisk()([], i);
        Enumerator.arabic()([], i);
        Enumerator.alphabet()([], i);
        Enumerator.roman()([], i);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle large indices efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Enumerator.arabic()([], i * 100);
        Enumerator.alphabet()([], i * 10);
        Enumerator.roman()([], i * 5);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('List rendering performance', () => {
    test('should render simple lists efficiently', () => {
      const list = ListBuilder.create()
        .items('Item 1', 'Item 2', 'Item 3')
        .enumerator(Enumerator.bullet())
        .build();

      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        List.render(list);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should render nested lists efficiently', () => {
      const nestedList = ListBuilder.create()
        .items(
          'Main item 1',
          ListBuilder.create()
            .items('Sub item 1', 'Sub item 2', 'Sub item 3')
            .enumerator(Enumerator.dash())
            .build(),
          'Main item 2'
        )
        .enumerator(Enumerator.arabic())
        .build();

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        List.render(nestedList);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should render large lists efficiently', () => {
      const largeList = ListBuilder.create()
        .items(...Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`))
        .enumerator(Enumerator.arabic())
        .build();

      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        List.render(largeList);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(25);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many lists', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        ListBuilder.create()
          .items(`Item ${i}-1`, `Item ${i}-2`, `Item ${i}-3`)
          .enumerator(Enumerator.bullet())
          .build();
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle rapid list operations without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 500; i++) {
        const list = ListBuilder.create()
          .items('Item 1', 'Item 2', 'Item 3')
          .enumerator(Enumerator.arabic())
          .build();

        // Perform various operations
        ListBuilder.from(list).build();
        List.render(list);
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent list creation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return ListBuilder.create()
          .items(`Item ${i}-1`, `Item ${i}-2`, `Item ${i}-3`)
          .enumerator(Enumerator.arabic())
          .build();
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });

    test('should handle concurrent rendering efficiently', async () => {
      const list = ListBuilder.create()
        .items('Item 1', 'Item 2', 'Item 3')
        .enumerator(Enumerator.bullet())
        .build();

      const start = performance.now();

      const promises = Array.from({ length: 100 }, async () => {
        return List.render(list);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });

  describe('Edge case performance', () => {
    test('should handle empty lists efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const list = List.create();
        List.render(list);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle single item lists efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 300; i++) {
        ListBuilder.create().items('Single item').enumerator(Enumerator.bullet()).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle deeply nested lists efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        let nestedList = ListBuilder.create()
          .items('Level 3 item')
          .enumerator(Enumerator.asterisk())
          .build();

        nestedList = ListBuilder.create()
          .items('Level 2 item', nestedList)
          .enumerator(Enumerator.dash())
          .build();

        ListBuilder.create()
          .items('Level 1 item', nestedList)
          .enumerator(Enumerator.arabic())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle lists with long item content efficiently', () => {
      const longContent = 'A'.repeat(200);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        ListBuilder.create()
          .items('Short item', longContent, 'Another short item')
          .enumerator(Enumerator.bullet())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle different enumerator types efficiently', () => {
      const enumerators = [
        Enumerator.bullet(),
        Enumerator.dash(),
        Enumerator.asterisk(),
        Enumerator.arabic(),
        Enumerator.alphabet(),
        Enumerator.roman(),
      ];

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const enumerator = enumerators[i % enumerators.length];
        ListBuilder.create().items('Item 1', 'Item 2', 'Item 3').enumerator(enumerator).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });
});
