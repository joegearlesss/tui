import { describe, expect, test } from 'bun:test';
import { Style } from '../../style/style';
import {
  Tree,
  TreeBuilder,
  TreeEnumerator,
  TreeNode,
  type TreeNodeConfig,
  TreeRenderer,
} from './index';

describe('Tree Operations', () => {
  describe('Tree.create', () => {
    test('should create empty tree configuration', () => {
      const tree = Tree.create();

      expect(tree.root).toBeUndefined();
      expect(tree.indentSize).toBe(2);
      expect(tree.showLines).toBe(true);
      expect(tree.expandAll).toBe(false);
      expect(tree.itemStyle).toBeUndefined();
      expect(tree.enumeratorStyle).toBeUndefined();
    });
  });

  describe('Tree.fromRoot', () => {
    test('should create tree with root node', () => {
      const tree = Tree.fromRoot('Root');

      expect(tree.root).toBeDefined();
      expect(tree.root?.value).toBe('Root');
      expect(tree.root?.children).toEqual([]);
      expect(tree.root?.expanded).toBe(true);
    });
  });

  describe('Tree.fromStrings', () => {
    test('should create tree from simple string array', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', 'Child2']);

      expect(tree.root?.value).toBe('Root');
      expect(tree.root?.children).toHaveLength(2);
      expect(tree.root?.children[0]?.value).toBe('Child1');
      expect(tree.root?.children[1]?.value).toBe('Child2');
    });

    test('should create tree from nested arrays', () => {
      const tree = Tree.fromStrings([
        'Root',
        ['Parent1', 'Child1', 'Child2'],
        ['Parent2', 'Child3'],
      ]);

      expect(tree.root?.value).toBe('Root');
      expect(tree.root?.children).toHaveLength(2);
      expect(tree.root?.children[0]?.value).toBe('Parent1');
      expect(tree.root?.children[0]?.children).toHaveLength(2);
      expect(tree.root?.children[1]?.value).toBe('Parent2');
      expect(tree.root?.children[1]?.children).toHaveLength(1);
    });

    test('should handle empty array', () => {
      const tree = Tree.fromStrings([]);

      expect(tree.root).toBeUndefined();
    });
  });

  describe('Tree configuration methods', () => {
    test('should set enumerator', () => {
      const tree = Tree.create();
      const updated = Tree.withEnumerator(TreeEnumerator.BULLET)(tree);

      expect(updated.enumerator).toBe(TreeEnumerator.BULLET);
    });

    test('should set item style', () => {
      const tree = Tree.create();
      const style = Style.create();
      const updated = Tree.withItemStyle(style)(tree);

      expect(updated.itemStyle).toBe(style);
    });

    test('should set indent size with bounds', () => {
      const tree = Tree.create();

      const normal = Tree.withIndentSize(4)(tree);
      expect(normal.indentSize).toBe(4);

      const negative = Tree.withIndentSize(-1)(tree);
      expect(negative.indentSize).toBe(0);

      const tooLarge = Tree.withIndentSize(25)(tree);
      expect(tooLarge.indentSize).toBe(20);
    });

    test('should set show lines', () => {
      const tree = Tree.create();
      const updated = Tree.withLines(false)(tree);

      expect(updated.showLines).toBe(false);
    });

    test('should set expand all', () => {
      const tree = Tree.create();
      const updated = Tree.withExpandAll(true)(tree);

      expect(updated.expandAll).toBe(true);
    });
  });

  describe('Tree manipulation', () => {
    test('should add child to root', () => {
      const tree = Tree.fromRoot('Root');
      const updated = Tree.addChild('Child1')(tree);

      expect(updated.root?.children).toHaveLength(1);
      expect(updated.root?.children[0]?.value).toBe('Child1');
    });

    test('should add child to empty tree', () => {
      const tree = Tree.create();
      const updated = Tree.addChild('Root')(tree);

      expect(updated.root?.value).toBe('Root');
    });

    test('should add child at specific path', () => {
      const tree = Tree.fromStrings(['Root', 'Child1']);
      const updated = Tree.addChildAt([0], 'Grandchild')(tree);

      expect(updated.root?.children[0]?.children).toHaveLength(1);
      expect(updated.root?.children[0]?.children[0]?.value).toBe('Grandchild');
    });

    test('should remove node at path', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', 'Child2']);
      const updated = Tree.removeAt([0])(tree);

      expect(updated.root?.children).toHaveLength(1);
      expect(updated.root?.children[0]?.value).toBe('Child2');
    });

    test('should expand node at path', () => {
      const tree = Tree.fromRoot('Root');
      const collapsed = Tree.collapseAt([])(tree);
      const expanded = Tree.expandAt([])(collapsed);

      expect(expanded.root?.expanded).toBe(true);
    });

    test('should collapse node at path', () => {
      const tree = Tree.fromRoot('Root');
      const collapsed = Tree.collapseAt([])(tree);

      expect(collapsed.root?.expanded).toBe(false);
    });
  });

  describe('Tree traversal', () => {
    test('should traverse all visible nodes', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', ['Child2', 'Grandchild']]);
      const visited: string[] = [];

      Tree.traverse(tree, (node) => {
        visited.push(node.value);
      });

      expect(visited).toEqual(['Root', 'Child1', 'Child2', 'Grandchild']);
    });

    test('should respect collapsed nodes', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', ['Child2', 'Grandchild']]);
      const collapsed = Tree.collapseAt([1])(tree);
      const visited: string[] = [];

      Tree.traverse(collapsed, (node) => {
        visited.push(node.value);
      });

      expect(visited).toEqual(['Root', 'Child1', 'Child2']);
    });

    test('should expand all when expandAll is true', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', ['Child2', 'Grandchild']]);
      const collapsed = Tree.collapseAt([1])(tree);
      const expandAll = Tree.withExpandAll(true)(collapsed);
      const visited: string[] = [];

      Tree.traverse(expandAll, (node) => {
        visited.push(node.value);
      });

      expect(visited).toEqual(['Root', 'Child1', 'Child2', 'Grandchild']);
    });
  });

  describe('Tree metrics', () => {
    test('should calculate metrics for empty tree', () => {
      const tree = Tree.create();
      const metrics = Tree.calculateMetrics(tree);

      expect(metrics.totalNodes).toBe(0);
      expect(metrics.maxDepth).toBe(0);
      expect(metrics.width).toBe(0);
      expect(metrics.height).toBe(0);
    });

    test('should calculate metrics for simple tree', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', 'Child2']);
      const metrics = Tree.calculateMetrics(tree);

      expect(metrics.totalNodes).toBe(3);
      expect(metrics.maxDepth).toBe(1);
      expect(metrics.height).toBe(3);
      expect(metrics.width).toBeGreaterThan(0);
    });

    test('should calculate metrics for nested tree', () => {
      const tree = Tree.fromStrings(['Root', ['Child1', 'Grandchild']]);
      const metrics = Tree.calculateMetrics(tree);

      expect(metrics.totalNodes).toBe(3);
      expect(metrics.maxDepth).toBe(2);
      expect(metrics.height).toBe(3);
    });
  });

  describe('Tree utilities', () => {
    test('should find node at path', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', ['Child2', 'Grandchild']]);

      const root = Tree.getNodeAt(tree, []);
      expect(root?.value).toBe('Root');

      const child1 = Tree.getNodeAt(tree, [0]);
      expect(child1?.value).toBe('Child1');

      const grandchild = Tree.getNodeAt(tree, [1, 0]);
      expect(grandchild?.value).toBe('Grandchild');

      const notFound = Tree.getNodeAt(tree, [5]);
      expect(notFound).toBeUndefined();
    });

    test('should check if tree is empty', () => {
      const empty = Tree.create();
      expect(Tree.isEmpty(empty)).toBe(true);

      const notEmpty = Tree.fromRoot('Root');
      expect(Tree.isEmpty(notEmpty)).toBe(false);
    });

    test('should count visible nodes', () => {
      const tree = Tree.fromStrings(['Root', 'Child1', ['Child2', 'Grandchild']]);
      expect(Tree.getVisibleNodeCount(tree)).toBe(4);

      const collapsed = Tree.collapseAt([1])(tree);
      expect(Tree.getVisibleNodeCount(collapsed)).toBe(3);
    });
  });
});

describe('TreeNode Operations', () => {
  test('should create basic node', () => {
    const node = TreeNode.create('Test');

    expect(node.value).toBe('Test');
    expect(node.children).toEqual([]);
    expect(node.style).toBeUndefined();
    expect(node.expanded).toBe(true);
  });

  test('should create node with children', () => {
    const child1 = TreeNode.create('Child1');
    const child2 = TreeNode.create('Child2');
    const parent = TreeNode.withChildren('Parent', [child1, child2])();

    expect(parent.value).toBe('Parent');
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
  });

  test('should create node with style', () => {
    const style = Style.create();
    const node = TreeNode.withStyle('Styled', style);

    expect(node.value).toBe('Styled');
    expect(node.style).toBe(style);
  });

  test('should create collapsed node', () => {
    const node = TreeNode.collapsed('Collapsed');

    expect(node.value).toBe('Collapsed');
    expect(node.expanded).toBe(false);
  });
});

describe('TreeEnumerator Functions', () => {
  const mockNode: TreeNodeConfig = {
    value: 'Test',
    children: [],
    style: undefined,
    expanded: true,
  };

  test('BULLET enumerator', () => {
    const result = TreeEnumerator.BULLET(mockNode, 0, false, false);
    expect(result).toBe('• ');
  });

  test('DASH enumerator', () => {
    const result = TreeEnumerator.DASH(mockNode, 0, false, false);
    expect(result).toBe('- ');
  });

  test('PLUS_MINUS enumerator', () => {
    const noChildren = TreeEnumerator.PLUS_MINUS(mockNode, 0, false, false);
    expect(noChildren).toBe('  ');

    const expanded = TreeEnumerator.PLUS_MINUS(mockNode, 0, false, true);
    expect(expanded).toBe('- ');

    const collapsed = TreeEnumerator.PLUS_MINUS({ ...mockNode, expanded: false }, 0, false, true);
    expect(collapsed).toBe('+ ');
  });

  test('LINES enumerator', () => {
    const root = TreeEnumerator.LINES(mockNode, 0, false, true);
    expect(root).toBe('┬ ');

    const child = TreeEnumerator.LINES(mockNode, 1, false, false);
    expect(child).toBe('├─ ');

    const lastChild = TreeEnumerator.LINES(mockNode, 1, true, false);
    expect(lastChild).toBe('└─ ');
  });

  test('ASCII_LINES enumerator', () => {
    const child = TreeEnumerator.ASCII_LINES(mockNode, 1, false, false);
    expect(child).toBe('|- ');

    const lastChild = TreeEnumerator.ASCII_LINES(mockNode, 1, true, false);
    expect(lastChild).toBe('\\- ');
  });

  test('FOLDERS enumerator', () => {
    const file = TreeEnumerator.FOLDERS(mockNode, 0, false, false);
    expect(file).toBe('📄 ');

    const openFolder = TreeEnumerator.FOLDERS(mockNode, 0, false, true);
    expect(openFolder).toBe('📂 ');

    const closedFolder = TreeEnumerator.FOLDERS({ ...mockNode, expanded: false }, 0, false, true);
    expect(closedFolder).toBe('📁 ');
  });

  test('custom enumerator', () => {
    const customFn = () => 'CUSTOM ';
    const custom = TreeEnumerator.custom(customFn);

    const result = custom(mockNode, 0, false, false);
    expect(result).toBe('CUSTOM ');
  });

  test('depthAware enumerator', () => {
    const enumerators = [TreeEnumerator.BULLET, TreeEnumerator.DASH];
    const depthAware = TreeEnumerator.depthAware(enumerators);

    const depth0 = depthAware(mockNode, 0, false, false);
    expect(depth0).toBe('• ');

    const depth1 = depthAware(mockNode, 1, false, false);
    expect(depth1).toBe('- ');

    const depth2 = depthAware(mockNode, 2, false, false);
    expect(depth2).toBe('• ');
  });
});

describe('TreeBuilder', () => {
  test('should create empty tree builder', () => {
    const builder = TreeBuilder.create();
    const tree = builder.build();

    expect(tree.root).toBeUndefined();
  });

  test('should create builder from root', () => {
    const builder = TreeBuilder.fromRoot('Root');
    const tree = builder.build();

    expect(tree.root?.value).toBe('Root');
  });

  test('should create builder from strings', () => {
    const builder = TreeBuilder.fromStrings(['Root', 'Child']);
    const tree = builder.build();

    expect(tree.root?.value).toBe('Root');
    expect(tree.root?.children).toHaveLength(1);
  });

  test('should chain configuration methods', () => {
    const style = Style.create();
    const tree = TreeBuilder.create()
      .root('Root')
      .enumerator(TreeEnumerator.BULLET)
      .itemStyle(style)
      .indentSize(4)
      .showLines(false)
      .expandAll(true)
      .build();

    expect(tree.root?.value).toBe('Root');
    expect(tree.enumerator).toBe(TreeEnumerator.BULLET);
    expect(tree.itemStyle).toBe(style);
    expect(tree.indentSize).toBe(4);
    expect(tree.showLines).toBe(false);
    expect(tree.expandAll).toBe(true);
  });

  test('should add children', () => {
    const tree = TreeBuilder.create()
      .root('Root')
      .addChild('Child1')
      .addChildren('Child2', 'Child3')
      .build();

    expect(tree.root?.children).toHaveLength(3);
    expect(tree.root?.children[0]?.value).toBe('Child1');
    expect(tree.root?.children[1]?.value).toBe('Child2');
    expect(tree.root?.children[2]?.value).toBe('Child3');
  });

  test('should support conditional operations', () => {
    const tree = TreeBuilder.create()
      .root('Root')
      .when(true, (builder) => builder.addChild('Conditional'))
      .when(false, (builder) => builder.addChild('Skipped'))
      .build();

    expect(tree.root?.children).toHaveLength(1);
    expect(tree.root?.children[0]?.value).toBe('Conditional');
  });

  test('should support transformations', () => {
    const tree = TreeBuilder.create()
      .root('Root')
      .pipe((config) => Tree.addChild('Piped')(config))
      .transform((builder) => builder.addChild('Transformed'))
      .build();

    expect(tree.root?.children).toHaveLength(2);
    expect(tree.root?.children[0]?.value).toBe('Piped');
    expect(tree.root?.children[1]?.value).toBe('Transformed');
  });

  test('should provide query methods', () => {
    const builder = TreeBuilder.create().root('Root').addChildren('Child1', 'Child2');

    expect(builder.isEmpty()).toBe(false);
    expect(builder.getVisibleNodeCount()).toBe(3);

    const metrics = builder.calculateMetrics();
    expect(metrics.totalNodes).toBe(3);
  });

  test('should support cloning', () => {
    const original = TreeBuilder.create().root('Root');
    const clone = original.clone().addChild('Child');

    expect(original.build().root?.children).toHaveLength(0);
    expect(clone.build().root?.children).toHaveLength(1);
  });
});

describe('TreeRenderer', () => {
  test('should render empty tree', () => {
    const tree = Tree.create();
    const result = TreeRenderer.render(tree);

    expect(result).toBe('');
  });

  test('should render simple tree', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').build();

    const result = TreeRenderer.render(tree);
    const lines = result.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Root');
    expect(lines[1]).toContain('Child');
  });

  test('should render tree with custom enumerator', () => {
    const tree = TreeBuilder.create()
      .root('Root')
      .addChild('Child')
      .enumerator(TreeEnumerator.BULLET)
      .build();

    const result = TreeRenderer.render(tree);

    expect(result).toContain('•');
  });

  test('should render tree with styling', () => {
    const style = Style.bold(Style.create(), true);
    const tree = TreeBuilder.create().root('Root').itemStyle(style).build();

    const result = TreeRenderer.render(tree);

    expect(result).toContain('\x1b[1m'); // Bold ANSI code
  });

  test('should render lines array', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').build();

    const lines = TreeRenderer.renderLines(tree);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Root');
    expect(lines[1]).toContain('Child');
  });

  test('should render with line numbers', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').build();

    const result = TreeRenderer.renderWithLineNumbers(tree);

    expect(result).toContain('1:');
    expect(result).toContain('2:');
  });

  test('should render compact format', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').indentSize(4).build();

    const compact = TreeRenderer.renderCompact(tree);
    const normal = TreeRenderer.render(tree);

    expect(compact.length).toBeLessThan(normal.length);
  });

  test('should render expanded format', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').collapseAt([]).build();

    const expanded = TreeRenderer.renderExpanded(tree);

    expect(expanded).toContain('Child');
  });

  test('should render as markdown', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').build();

    const markdown = TreeRenderer.renderMarkdown(tree);

    expect(markdown).toContain('# Root');
    expect(markdown).toContain('- Child');
  });

  test('should render as JSON', () => {
    const tree = TreeBuilder.create().root('Root').addChild('Child').build();

    const json = TreeRenderer.renderJson(tree);
    const parsed = JSON.parse(json);

    expect(parsed.value).toBe('Root');
    expect(parsed.children).toHaveLength(1);
    expect(parsed.children[0].value).toBe('Child');
  });

  test('should render with custom options', () => {
    const tree = TreeBuilder.create().root('Root').build();

    const custom = TreeRenderer.renderCustom(tree, {
      linePrefix: '> ',
      lineSuffix: ' <',
      maxWidth: 10,
    });

    expect(custom).toContain('> ');
    expect(custom).toContain(' <');
  });

  test('should handle empty tree in custom render', () => {
    const tree = Tree.create();

    const custom = TreeRenderer.renderCustom(tree, {
      emptyMessage: 'No data',
    });

    expect(custom).toBe('No data');
  });
});
