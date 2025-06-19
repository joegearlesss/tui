import { describe, expect, test } from 'bun:test';
import type { TreeConfig, TreeNodeConfig } from './types';
import { TreeValidation } from './validation';

describe('TreeValidation', () => {
  describe('validateTreeConfig', () => {
    test('validates valid tree configuration', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
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

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates empty tree configuration', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid indent size', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: -1,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Indent size must be non-negative');
    });

    test('detects missing enumerator function', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: undefined as any,
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enumerator function is required');
    });

    test('validates tree with nested nodes', () => {
      const config: TreeConfig = {
        root: {
          value: 'Root',
          children: [
            {
              value: 'Child1',
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

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTreeNode', () => {
    test('validates valid tree node', () => {
      const node: TreeNodeConfig = {
        value: 'Test Node',
        children: [],
        style: undefined,
        expanded: true,
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates node with children', () => {
      const node: TreeNodeConfig = {
        value: 'Parent',
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
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects empty node value', () => {
      const node: TreeNodeConfig = {
        value: '',
        children: [],
        style: undefined,
        expanded: true,
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node value cannot be empty');
    });

    test('detects missing node value', () => {
      const node: TreeNodeConfig = {
        value: undefined as any,
        children: [],
        style: undefined,
        expanded: true,
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node value is required');
    });

    test('detects invalid children array', () => {
      const node: TreeNodeConfig = {
        value: 'Test',
        children: undefined as any,
        style: undefined,
        expanded: true,
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Children must be an array');
    });

    test('validates nested children recursively', () => {
      const node: TreeNodeConfig = {
        value: 'Parent',
        children: [
          {
            value: 'Valid Child',
            children: [],
            style: undefined,
            expanded: true,
          },
          {
            value: '', // Invalid child
            children: [],
            style: undefined,
            expanded: true,
          },
        ],
        style: undefined,
        expanded: true,
      };

      const result = TreeValidation.validateTreeNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Child node at index 1: Node value cannot be empty');
    });
  });

  describe('validateEnumeratorFunction', () => {
    test('validates working enumerator function', () => {
      const enumerator = (
        _node: TreeNodeConfig,
        _depth: number,
        _isLast: boolean,
        _hasChildren: boolean
      ) => '├─';

      const result = TreeValidation.validateEnumeratorFunction(enumerator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects non-function enumerator', () => {
      const enumerator = '├─' as any;

      const result = TreeValidation.validateEnumeratorFunction(enumerator);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enumerator must be a function');
    });

    test('detects enumerator that throws errors', () => {
      const enumerator = () => {
        throw new Error('Test error');
      };

      const result = TreeValidation.validateEnumeratorFunction(enumerator);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enumerator function throws an error: Test error');
    });

    test('detects enumerator that returns non-string', () => {
      const enumerator = () => 123 as any;

      const result = TreeValidation.validateEnumeratorFunction(enumerator);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enumerator function must return a string');
    });

    test('validates enumerator with different parameters', () => {
      const enumerator = (
        _node: TreeNodeConfig,
        depth: number,
        isLast: boolean,
        _hasChildren: boolean
      ) => {
        if (depth === 0) return '';
        return isLast ? '└─' : '├─';
      };

      const result = TreeValidation.validateEnumeratorFunction(enumerator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateTreeStructure', () => {
    test('validates simple tree structure', () => {
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
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeStructure(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects circular references', () => {
      const node: TreeNodeConfig = {
        value: 'Root',
        children: [],
        style: undefined,
        expanded: true,
      };

      // Create circular reference
      (node as any).children = [node];

      const config: TreeConfig = {
        root: node,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeStructure(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Circular reference detected in tree structure');
    });

    test('detects excessive depth', () => {
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
        root: createDeepNode(1000), // Very deep tree
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeStructure(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tree depth exceeds maximum allowed depth of 100');
    });

    test('validates reasonable depth tree', () => {
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
        root: createDeepNode(10), // Reasonable depth
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeStructure(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases and warnings', () => {
    test('generates warning for large number of nodes', () => {
      const children: TreeNodeConfig[] = [];
      for (let i = 0; i < 1000; i++) {
        children.push({
          value: `Child${i}`,
          children: [],
          style: undefined,
          expanded: true,
        });
      }

      const config: TreeConfig = {
        root: {
          value: 'Root',
          children,
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

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Tree has a large number of nodes (1001), which may impact performance'
      );
    });

    test('generates warning for very large indent size', () => {
      const config: TreeConfig = {
        root: undefined,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 50,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Large indent size (50) may cause layout issues');
    });

    test('handles null and undefined values gracefully', () => {
      const config = {
        root: null,
        enumerator: () => '├─',
        itemStyle: null,
        enumeratorStyle: null,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      } as any;

      const result = TreeValidation.validateTreeConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
