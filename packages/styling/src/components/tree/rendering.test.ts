import { describe, expect, test } from 'bun:test';
import { TreeRenderer } from './rendering';
import type { TreeConfig, TreeNodeConfig } from './types';

describe('TreeRenderer', () => {
  describe('basic rendering', () => {
    test('renders empty tree', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toBe('');
    });

    test('renders single node tree', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [],
          style: undefined,
          expanded: true,
        },
        enumerator: () => '',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: false,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('Root');
    });

    test('renders tree with children', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child1',
              children: [],
              style: undefined,
              expanded: true,
            },
            {
              value: 'Child2',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
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

      const result = TreeRenderer.render(config);
      expect(result).toContain('Root');
      expect(result).toContain('Child1');
      expect(result).toContain('Child2');
    });

    test('renders nested tree structure', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Parent',
              children: [
                {
                  value: 'Grandchild',
                  children: [],
                  style: undefined,
                  expanded: true,
                },
              ],
              style: undefined,
              expanded: true,
            },
          ],
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

      const result = TreeRenderer.render(config);
      expect(result).toContain('Root');
      expect(result).toContain('Parent');
      expect(result).toContain('Grandchild');
    });
  });

  describe('enumerator rendering', () => {
    test('applies custom enumerator function', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
          style: undefined,
          expanded: true,
        },
        enumerator: (_node, depth, isLast, _hasChildren) => {
          if (depth === 0) return '';
          return isLast ? '└─' : '├─';
        },
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('└─');
    });

    test('handles different enumerator styles', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'First',
              children: [],
              style: undefined,
              expanded: true,
            },
            {
              value: 'Last',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
          style: undefined,
          expanded: true,
        },
        enumerator: (_node, depth, isLast) => {
          if (depth === 0) return '';
          return isLast ? '└─' : '├─';
        },
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('├─');
      expect(result).toContain('└─');
    });

    test('handles numeric enumerators', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'First',
              children: [],
              style: undefined,
              expanded: true,
            },
            {
              value: 'Second',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
          style: undefined,
          expanded: true,
        },
        enumerator: (node, depth, _isLast, _hasChildren) => {
          if (depth === 0) return '';
          const index = node.value === 'First' ? 1 : 2;
          return `${index}. `;
        },
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: false,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('1. ');
      expect(result).toContain('2. ');
    });
  });

  describe('indentation and lines', () => {
    test('applies custom indent size', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
          style: undefined,
          expanded: true,
        },
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 4,
        showLines: true,
        expandAll: false,
      };

      const lines = TreeRenderer.renderLines(config);
      const childLine = lines.find((line) => line.includes('Child'));
      expect(childLine).toBeDefined();
      // Should have proper indentation
      expect(childLine?.startsWith('    ')).toBe(true);
    });

    test('handles showLines configuration', () => {
      const configWithLines: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
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

      const configWithoutLines: TreeConfig = {
        ...configWithLines,
        showLines: false,
      };

      const withLines = TreeRenderer.render(configWithLines);
      const withoutLines = TreeRenderer.render(configWithoutLines);

      expect(withLines).toContain('├─');
      expect(withoutLines).toContain('├─'); // Enumerator still appears, just no connecting lines
    });
  });

  describe('expansion and collapse', () => {
    test('respects node expansion state', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Expanded',
              children: [
                {
                  value: 'Visible',
                  children: [],
                  style: undefined,
                  expanded: true,
                },
              ],
              style: undefined,
              expanded: true,
            },
            {
              value: 'Collapsed',
              children: [
                {
                  value: 'Hidden',
                  children: [],
                  style: undefined,
                  expanded: true,
                },
              ],
              style: undefined,
              expanded: false,
            },
          ],
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

      const result = TreeRenderer.render(config);
      expect(result).toContain('Expanded');
      expect(result).toContain('Visible');
      expect(result).toContain('Collapsed');
      expect(result).not.toContain('Hidden');
    });

    test('expandAll overrides individual node states', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'ShouldBeVisible',
              children: [
                {
                  value: 'AlsoVisible',
                  children: [],
                  style: undefined,
                  expanded: false,
                },
              ],
              style: undefined,
              expanded: false,
            },
          ],
          style: undefined,
          expanded: true,
        },
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: true,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('ShouldBeVisible');
      expect(result).toContain('AlsoVisible');
    });
  });

  describe('renderLines method', () => {
    test('returns array of lines', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child1',
              children: [],
              style: undefined,
              expanded: true,
            },
            {
              value: 'Child2',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
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

      const lines = TreeRenderer.renderLines(config);
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.some((line) => line.includes('Root'))).toBe(true);
      expect(lines.some((line) => line.includes('Child1'))).toBe(true);
      expect(lines.some((line) => line.includes('Child2'))).toBe(true);
    });

    test('empty tree returns empty array', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const lines = TreeRenderer.renderLines(config);
      expect(lines).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('handles deeply nested trees', () => {
      const createDeepNode = (depth: number): TreeNodeConfig => {
        if (depth === 0) {
          return {
            value: 'Leaf',
            children: [],
            style: undefined,
            expanded: true,
          };
        }
        return {
          value: `Level${depth}`,
          children: [createDeepNode(depth - 1)],
          style: undefined,
          expanded: true,
        };
      };

      const config: TreeConfig = {
        root: createDeepNode(5),
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeRenderer.render(config);
      expect(result).toContain('Level5');
      expect(result).toContain('Leaf');
    });

    test('handles empty node values', () => {
      const config: TreeConfig = {
        root: {
          value: '',
          children: [
            {
              value: 'Child',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
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

      const result = TreeRenderer.render(config);
      expect(result).toContain('Child');
    });

    test('handles nodes with special characters', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root with spaces & symbols!',
          children: [
            {
              value: 'Child\nwith\nnewlines',
              children: [],
              style: undefined,
              expanded: true,
            },
          ],
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

      const result = TreeRenderer.render(config);
      expect(result).toContain('Root with spaces & symbols!');
      expect(result).toContain('Child');
    });
  });
});
