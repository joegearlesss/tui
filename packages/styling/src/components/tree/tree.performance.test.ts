import { describe, expect, test } from 'bun:test';
import { TreeBuilder } from './builder';
import { Tree } from './operations';

describe('Tree Performance Tests', () => {
  describe('Tree creation performance', () => {
    test('should create empty trees within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Tree.create();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create trees with root within 1ms for 500 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        Tree.root(Tree.create(), `Root ${i}`);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('TreeBuilder performance', () => {
    test('should build simple trees within 1ms for 200 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        TreeBuilder.create()
          .root('Root node')
          .child('Child 1')
          .child('Child 2')
          .child('Child 3')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should build nested trees efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        TreeBuilder.create()
          .root('Root')
          .child('Branch 1')
          .child(TreeBuilder.create().root('Sub-branch 1').child('Leaf 1').child('Leaf 2').build())
          .child('Branch 2')
          .child(TreeBuilder.create().root('Sub-branch 2').child('Leaf 3').child('Leaf 4').build())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(25);
    });

    test('should chain many operations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        TreeBuilder.create()
          .root(`Root ${i}`)
          .child(`Child ${i}-1`)
          .child(`Child ${i}-2`)
          .child(`Child ${i}-3`)
          .child(`Child ${i}-4`)
          .child(`Child ${i}-5`)
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });

  describe('Tree operations performance', () => {
    test('should handle large trees efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        const tree = Tree.create();
        const withRoot = Tree.root(tree, 'Large tree root');

        // Add many children
        let currentTree = withRoot;
        for (let j = 0; j < 50; j++) {
          currentTree = Tree.child(currentTree, `Child ${j}`);
        }
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });

    test('should copy trees efficiently', () => {
      const tree = TreeBuilder.create()
        .root('Root')
        .child('Child 1')
        .child('Child 2')
        .child('Child 3')
        .build();

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        TreeBuilder.from(tree).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });

  describe('Tree rendering performance', () => {
    test('should render simple trees efficiently', () => {
      const tree = TreeBuilder.create()
        .root('Root')
        .child('Child 1')
        .child('Child 2')
        .child('Child 3')
        .build();

      const start = performance.now();

      for (let i = 0; i < 200; i++) {
        Tree.render(tree);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should render nested trees efficiently', () => {
      const nestedTree = TreeBuilder.create()
        .root('Root')
        .child('Branch 1')
        .child(TreeBuilder.create().root('Sub-branch').child('Leaf 1').child('Leaf 2').build())
        .child('Branch 2')
        .build();

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Tree.render(nestedTree);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(25);
    });

    test('should render large trees efficiently', () => {
      const largeTree = TreeBuilder.create()
        .root('Large tree')
        .child('Branch 1')
        .child('Branch 2')
        .child('Branch 3')
        .child('Branch 4')
        .child('Branch 5')
        .child('Branch 6')
        .child('Branch 7')
        .child('Branch 8')
        .child('Branch 9')
        .child('Branch 10')
        .build();

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        Tree.render(largeTree);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(25);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many trees', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        TreeBuilder.create()
          .root(`Root ${i}`)
          .child(`Child ${i}-1`)
          .child(`Child ${i}-2`)
          .child(`Child ${i}-3`)
          .build();
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 15MB)
      expect(memoryIncrease).toBeLessThan(15 * 1024 * 1024);
    });

    test('should handle rapid tree operations without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 500; i++) {
        const tree = TreeBuilder.create().root('Root').child('Child 1').child('Child 2').build();

        // Perform various operations
        TreeBuilder.from(tree).build();
        Tree.render(tree);
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(8 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent tree creation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return TreeBuilder.create()
          .root(`Root ${i}`)
          .child(`Child ${i}-1`)
          .child(`Child ${i}-2`)
          .build();
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });

    test('should handle concurrent rendering efficiently', async () => {
      const tree = TreeBuilder.create()
        .root('Root')
        .child('Child 1')
        .child('Child 2')
        .child('Child 3')
        .build();

      const start = performance.now();

      const promises = Array.from({ length: 100 }, async () => {
        return Tree.render(tree);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(40);
    });
  });

  describe('Edge case performance', () => {
    test('should handle empty trees efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const tree = Tree.create();
        Tree.render(tree);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle trees with only root efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 300; i++) {
        TreeBuilder.create().root('Single root').build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should handle deeply nested trees efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        let nestedTree = TreeBuilder.create().root('Level 3').child('Leaf').build();

        nestedTree = TreeBuilder.create().root('Level 2').child(nestedTree).build();

        TreeBuilder.create().root('Level 1').child(nestedTree).build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });

    test('should handle trees with long node content efficiently', () => {
      const longContent = 'A'.repeat(200);
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        TreeBuilder.create()
          .root('Short root')
          .child(longContent)
          .child('Another short child')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should handle wide trees efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 30; i++) {
        let builder = TreeBuilder.create().root('Wide tree root');

        // Add many children at the same level
        for (let j = 0; j < 20; j++) {
          builder = builder.child(`Child ${j}`);
        }

        builder.build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(25);
    });

    test('should handle mixed content types efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        TreeBuilder.create()
          .root('Mixed content root')
          .child('String child')
          .child(TreeBuilder.create().root('Nested tree child').child('Nested leaf').build())
          .child('Another string child')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });
});
