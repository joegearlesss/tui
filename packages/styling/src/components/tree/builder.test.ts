import { describe, expect, test } from 'bun:test';
import { TreeBuilder, TreeChain } from './builder';
import type { TreeConfig, TreeNodeConfig } from './types';

describe('TreeBuilder', () => {
  describe('static factory methods', () => {
    test('creates empty tree builder', () => {
      const builder = TreeBuilder.create();
      expect(builder.isEmpty()).toBe(true);
    });

    test('creates tree builder with root node', () => {
      const builder = TreeBuilder.fromRoot('Root');
      expect(builder.isEmpty()).toBe(false);
      const config = builder.getConfig();
      expect(config.root?.value).toBe('Root');
    });

    test('creates tree builder from strings', () => {
      const data = ['Root', ['Child1', 'Child2']];
      const builder = TreeBuilder.fromStrings(data);
      expect(builder.isEmpty()).toBe(false);
    });

    test('creates builder from existing config', () => {
      const config: TreeConfig = {
        root: {
          value: 'Test',
          children: [],
          style: undefined,
          expanded: true,
        },
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };
      const builder = TreeBuilder.from(config);
      expect(builder.getConfig().root?.value).toBe('Test');
    });
  });

  describe('configuration methods', () => {
    test('sets enumerator function', () => {
      const enumerator = (node: any, depth: number) => `${depth}.`;
      const builder = TreeBuilder.create().enumerator(enumerator);
      
      const config = builder.getConfig();
      expect(config.enumerator).toBe(enumerator);
    });

    test('sets item style', () => {
      const style = { bold: true };
      const builder = TreeBuilder.create().itemStyle(style);
      
      const config = builder.getConfig();
      expect(config.itemStyle).toEqual(style);
    });

    test('sets enumerator style', () => {
      const style = { italic: true };
      const builder = TreeBuilder.create().enumeratorStyle(style);
      
      const config = builder.getConfig();
      expect(config.enumeratorStyle).toEqual(style);
    });

    test('sets indent size', () => {
      const builder = TreeBuilder.create().indentSize(4);
      const config = builder.getConfig();
      expect(config.indentSize).toBe(4);
    });

    test('sets show lines', () => {
      const builder = TreeBuilder.create().showLines(false);
      const config = builder.getConfig();
      expect(config.showLines).toBe(false);
    });

    test('sets expand all', () => {
      const builder = TreeBuilder.create().expandAll(true);
      const config = builder.getConfig();
      expect(config.expandAll).toBe(true);
    });
  });

  describe('node manipulation methods', () => {
    test('sets root node', () => {
      const builder = TreeBuilder.create().root('Root');
      const config = builder.getConfig();
      expect(config.root?.value).toBe('Root');
    });

    test('sets custom root node', () => {
      const customNode: TreeNodeConfig = {
        value: 'Custom',
        children: [],
        style: { bold: true },
        expanded: false,
      };
      const builder = TreeBuilder.create().customRoot(customNode);
      const config = builder.getConfig();
      expect(config.root).toEqual(customNode);
    });

    test('adds child to root', () => {
      const builder = TreeBuilder.fromRoot('Root').addChild('Child1');
      const config = builder.getConfig();
      expect(config.root?.children).toHaveLength(1);
      expect(config.root?.children[0]?.value).toBe('Child1');
    });

    test('adds multiple children to root', () => {
      const builder = TreeBuilder.fromRoot('Root').addChildren('Child1', 'Child2', 'Child3');
      const config = builder.getConfig();
      expect(config.root?.children).toHaveLength(3);
      expect(config.root?.children[1]?.value).toBe('Child2');
    });

    test('adds child at specific path', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child1')
        .addChildAt([0], 'Grandchild');
      
      const config = builder.getConfig();
      expect(config.root?.children[0]?.children).toHaveLength(1);
      expect(config.root?.children[0]?.children[0]?.value).toBe('Grandchild');
    });

    test('removes node at path', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChildren('Child1', 'Child2')
        .removeAt([0]);
      
      const config = builder.getConfig();
      expect(config.root?.children).toHaveLength(1);
      expect(config.root?.children[0]?.value).toBe('Child2');
    });

    test('expands node at path', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child1')
        .expandAt([0]);
      
      const node = builder.getNodeAt([0]);
      expect(node?.expanded).toBe(true);
    });

    test('collapses node at path', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child1')
        .collapseAt([0]);
      
      const node = builder.getNodeAt([0]);
      expect(node?.expanded).toBe(false);
    });
  });

  describe('query methods', () => {
    test('checks if tree is empty', () => {
      const emptyBuilder = TreeBuilder.create();
      const nonEmptyBuilder = TreeBuilder.fromRoot('Root');
      
      expect(emptyBuilder.isEmpty()).toBe(true);
      expect(nonEmptyBuilder.isEmpty()).toBe(false);
    });

    test('gets visible node count', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChildren('Child1', 'Child2');
      
      expect(builder.getVisibleNodeCount()).toBeGreaterThan(0);
    });

    test('gets node at path', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child1');
      
      const rootNode = builder.getNodeAt([]);
      const childNode = builder.getNodeAt([0]);
      
      expect(rootNode?.value).toBe('Root');
      expect(childNode?.value).toBe('Child1');
    });

    test('calculates metrics', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChildren('Child1', 'Child2');
      
      const metrics = builder.calculateMetrics();
      expect(metrics.totalNodes).toBeGreaterThan(0);
      expect(metrics.maxDepth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('functional methods', () => {
    test('conditional operations with when', () => {
      const builder = TreeBuilder.create()
        .when(true, (chain) => chain.root('Root'))
        .when(false, (chain) => chain.addChild('ShouldNotExist'));
      
      const config = builder.getConfig();
      expect(config.root?.value).toBe('Root');
      expect(config.root?.children).toHaveLength(0);
    });

    test('pipe transformation', () => {
      const builder = TreeBuilder.create()
        .pipe((config) => ({
          ...config,
          indentSize: 8,
        }));
      
      expect(builder.getConfig().indentSize).toBe(8);
    });

    test('transform with function', () => {
      const builder = TreeBuilder.create()
        .transform((chain) => chain.root('Transformed'));
      
      expect(builder.getConfig().root?.value).toBe('Transformed');
    });

    test('clones tree', () => {
      const original = TreeBuilder.fromRoot('Original');
      const cloned = original.clone();
      
      expect(cloned.getConfig()).toEqual(original.getConfig());
      expect(cloned).not.toBe(original);
    });
  });

  describe('traversal methods', () => {
    test('traverses tree nodes', () => {
      const visitedNodes: string[] = [];
      const builder = TreeBuilder.fromRoot('Root')
        .addChildren('Child1', 'Child2');
      
      builder.traverse((node) => {
        visitedNodes.push(node.value);
      });
      
      expect(visitedNodes).toContain('Root');
      expect(visitedNodes).toContain('Child1');
      expect(visitedNodes).toContain('Child2');
    });
  });

  describe('build and render methods', () => {
    test('builds final config', () => {
      const builder = TreeBuilder.fromRoot('Test');
      const config = builder.build();
      expect(config.root?.value).toBe('Test');
    });

    test('renders tree to string', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child');
      
      const rendered = builder.render();
      expect(typeof rendered).toBe('string');
      expect(rendered.length).toBeGreaterThan(0);
    });

    test('renders tree to lines', () => {
      const builder = TreeBuilder.fromRoot('Root')
        .addChild('Child');
      
      const lines = builder.renderLines();
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
    });
  });
});

describe('TreeChain', () => {
  describe('immutability', () => {
    test('each operation returns new chain', () => {
      const original = TreeBuilder.create();
      const modified = original.root('Root');
      
      expect(original.getConfig().root).toBeUndefined();
      expect(modified.getConfig().root?.value).toBe('Root');
      expect(original).not.toBe(modified);
    });

    test('maintains immutability through complex chains', () => {
      const chain1 = TreeBuilder.create();
      const chain2 = chain1.root('Root');
      const chain3 = chain2.addChild('Child');
      
      expect(chain1.getConfig().root).toBeUndefined();
      expect(chain2.getConfig().root?.value).toBe('Root');
      expect(chain2.getConfig().root?.children).toHaveLength(0);
      expect(chain3.getConfig().root?.children).toHaveLength(1);
    });
  });

  describe('method chaining', () => {
    test('chains multiple operations', () => {
      const chain = TreeBuilder.create()
        .root('Root')
        .indentSize(4)
        .showLines(true)
        .addChildren('Child1', 'Child2')
        .expandAll(true);
      
      const config = chain.getConfig();
      expect(config.root?.value).toBe('Root');
      expect(config.indentSize).toBe(4);
      expect(config.showLines).toBe(true);
      expect(config.expandAll).toBe(true);
      expect(config.root?.children).toHaveLength(2);
    });

    test('applies styling in chain', () => {
      const chain = TreeBuilder.create()
        .root('Root')
        .itemStyle({ bold: true })
        .enumeratorStyle({ italic: true });
      
      const config = chain.getConfig();
      expect(config.itemStyle).toEqual({ bold: true });
      expect(config.enumeratorStyle).toEqual({ italic: true });
    });
  });
});