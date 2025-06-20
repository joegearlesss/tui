import { describe, test, expect } from 'bun:test';
import { Result } from '../../utils/result';
import { TreeValidation } from './validation';
import type { TreeNodeConfig } from './types';

describe('Tree Validation - Result Types', () => {
  describe('validateTreeConfigSafe', () => {
    test('returns Ok for valid tree configuration', () => {
      const rootNode: TreeNodeConfig = {
        value: 'Root',
        style: undefined,
        children: [
          { value: 'Child 1', children: [], expanded: true, style: undefined },
          { value: 'Child 2', children: [], expanded: false, style: undefined },
        ],
        expanded: true,
      };

      const validConfig = {
        root: rootNode,
        enumerator: () => '├─',
        itemStyle: undefined,
        enumeratorStyle: undefined,
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = TreeValidation.validateTreeConfigSafe(validConfig);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.root?.value).toBe('Root');
        expect(result.value.indentSize).toBe(2);
        expect(result.value.showLines).toBe(true);
      }
    });

    test('returns Ok for null root tree', () => {
      const validConfig = {
        root: null,
        enumerator: () => '├─',
        indentSize: 4,
        showLines: false,
        expandAll: true,
      };

      const result = TreeValidation.validateTreeConfigSafe(validConfig);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.root).toBeNull();
        expect(result.value.indentSize).toBe(4);
      }
    });

    test('returns Err for invalid tree configuration', () => {
      const invalidConfig = {
        root: { value: '', children: [] }, // Invalid: empty value
        enumerator: 'not a function', // Invalid: not a function
        indentSize: -1, // Invalid: negative
      };

      const result = TreeValidation.validateTreeConfigSafe(invalidConfig);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateTreeNodeConfigSafe', () => {
    test('returns Ok for valid tree node', () => {
      const validNode: TreeNodeConfig = {
        value: 'Test Node',
        style: undefined,
        children: [
          { value: 'Child 1', children: [], expanded: true, style: undefined },
          { value: 'Child 2', children: [], expanded: false, style: undefined },
        ],
        expanded: true,
      };

      const result = TreeValidation.validateTreeNodeConfigSafe(validNode);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('Test Node');
        expect(result.value.children.length).toBe(2);
        expect(result.value.expanded).toBe(true);
      }
    });

    test('returns Ok for leaf node', () => {
      const leafNode: TreeNodeConfig = {
        value: 'Leaf Node',
        style: undefined,
        children: [],
        expanded: true,
      };

      const result = TreeValidation.validateTreeNodeConfigSafe(leafNode);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('Leaf Node');
        expect(result.value.children).toEqual([]);
      }
    });

    test('returns Err for invalid tree node', () => {
      const invalidNode = {
        value: '', // Invalid: empty string
        children: 'not an array', // Invalid: not an array
        expanded: 'not a boolean', // Invalid: not a boolean
      };

      const result = TreeValidation.validateTreeNodeConfigSafe(invalidNode);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateTreeMetricsSafe', () => {
    test('returns Ok for valid tree metrics', () => {
      const validMetrics = {
        totalNodes: 10,
        maxDepth: 3,
        width: 50,
        height: 8,
      };

      const result = TreeValidation.validateTreeMetricsSafe(validMetrics);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.totalNodes).toBe(10);
        expect(result.value.maxDepth).toBe(3);
        expect(result.value.width).toBe(50);
        expect(result.value.height).toBe(8);
      }
    });

    test('returns Err for invalid tree metrics', () => {
      const invalidMetrics = {
        totalNodes: -1, // Invalid: negative
        maxDepth: 'not a number', // Invalid: string
        width: 50.5, // Invalid: not an integer
        height: -5, // Invalid: negative
      };

      const result = TreeValidation.validateTreeMetricsSafe(invalidMetrics);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateEnumeratorFunctionSafe', () => {
    test('returns Ok for valid enumerator function', () => {
      const enumerator = (node: TreeNodeConfig, depth: number, isLast: boolean, hasChildren: boolean) => {
        return isLast ? '└─' : '├─';
      };

      const result = TreeValidation.validateEnumeratorFunctionSafe(enumerator);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(typeof result.value).toBe('function');
      }
    });

    test('returns Ok for simple enumerator function', () => {
      const enumerator = () => '●';

      const result = TreeValidation.validateEnumeratorFunctionSafe(enumerator);
      
      expect(Result.isOk(result)).toBe(true);
    });

    test('returns Err for non-function value', () => {
      const result = TreeValidation.validateEnumeratorFunctionSafe('not a function');
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.message).toContain('Enumerator must be a function');
      }
    });

    test('returns Err for function that does not return string', () => {
      const badEnumerator = () => 123; // Returns number instead of string

      const result = TreeValidation.validateEnumeratorFunctionSafe(badEnumerator);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.message).toContain('must return a string');
      }
    });

    test('returns Err for function that throws error', () => {
      const throwingEnumerator = () => {
        throw new Error('Test error');
      };

      const result = TreeValidation.validateEnumeratorFunctionSafe(throwingEnumerator);
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error.message).toContain('throws an error');
      }
    });
  });

  describe('Functional composition with Result types', () => {
    test('can chain tree validation operations', () => {
      const treeData = {
        root: {
          value: 'Root',
          children: [
            { value: 'Child', children: [], expanded: true },
          ],
          expanded: true,
        },
        enumerator: () => '├─',
        indentSize: 2,
        showLines: true,
        expandAll: false,
      };

      const result = Result.chain(
        TreeValidation.validateTreeConfigSafe(treeData),
        (config) => {
          // Additional validation logic
          const hasRoot = config.root !== null && config.root !== undefined;
          return hasRoot 
            ? Result.ok(config)
            : Result.err(new Error('Tree must have a root node'));
        }
      );

      expect(Result.isOk(result)).toBe(true);
    });

    test('can map tree validation results', () => {
      const nodeData = {
        value: 'Test Node',
        children: [],
        expanded: true,
      };

      const result = Result.map(
        TreeValidation.validateTreeNodeConfigSafe(nodeData),
        (node) => ({
          ...node,
          validated: true,
        })
      );

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.validated).toBe(true);
      }
    });

    test('can handle multiple node validations with Result.all', () => {
      const nodes = [
        { value: 'Node 1', children: [], expanded: true },
        { value: 'Node 2', children: [], expanded: false },
        { value: 'Node 3', children: [], expanded: true },
      ];
      
      const validations = nodes.map(node => TreeValidation.validateTreeNodeConfigSafe(node));
      const allResults = Result.all(validations);
      
      expect(Result.isOk(allResults)).toBe(true);
      if (Result.isOk(allResults)) {
        expect(allResults.value.length).toBe(3);
        expect(allResults.value[0]).toBeDefined();
        expect(allResults.value[1]).toBeDefined();
        expect(allResults.value[2]).toBeDefined();
        expect(allResults.value[0]!.value).toBe('Node 1');
        expect(allResults.value[1]!.value).toBe('Node 2');
        expect(allResults.value[2]!.value).toBe('Node 3');
      }
    });

    test('can provide fallback values on validation failure', () => {
      const invalidData = { invalid: 'data' };
      
      const defaultNode: TreeNodeConfig = {
        value: 'Default Node',
        style: undefined,
        children: [],
        expanded: true,
      };

      const result = TreeValidation.validateTreeNodeConfigSafe(invalidData);
      const finalNode = Result.unwrapOr(result, defaultNode);
      
      expect(finalNode).toBe(defaultNode);
      expect(finalNode.value).toBe('Default Node');
    });

    test('can tap into tree validation for side effects', () => {
      const nodeData = {
        value: 'Test Node',
        children: [],
        expanded: true,
      };

      let sideEffectExecuted = false;

      const result = Result.tap(
        TreeValidation.validateTreeNodeConfigSafe(nodeData),
        (node) => {
          sideEffectExecuted = true;
          expect(node.value).toBe('Test Node');
        }
      );

      expect(Result.isOk(result)).toBe(true);
      expect(sideEffectExecuted).toBe(true);
    });
  });
});