import { z } from 'zod';
import type { TreeNodeConfig } from './types';

// Create a basic schema for StyleProperties since it's not exported
const StylePropertiesSchema = z.object({}).passthrough().describe('Style properties configuration');

/**
 * Validation schema for tree node configuration
 */
export const TreeNodeConfigSchema: z.ZodType<TreeNodeConfig> = z.lazy(() =>
  z
    .object({
      value: z
        .string()
        .min(1, 'Tree node value cannot be empty')
        .describe('Display text for the tree node'),
      children: z
        .array(TreeNodeConfigSchema)
        .describe('Array of child nodes for hierarchical structure'),
      style: StylePropertiesSchema.optional().describe(
        'Optional styling configuration for this specific node'
      ),
      expanded: z.boolean().describe('Whether this node should show its children when rendered'),
    })
    .describe('Configuration for a single tree node with hierarchical children')
) as z.ZodType<TreeNodeConfig>;

/**
 * Validation schema for tree configuration
 */
export const TreeConfigSchema = z
  .object({
    root: TreeNodeConfigSchema.nullable()
      .optional()
      .describe('Root node of the tree - undefined or null for empty tree'),
    enumerator: z
      .function()
      .describe('Function to generate prefix characters for tree structure visualization'),
    itemStyle: StylePropertiesSchema.nullable()
      .optional()
      .describe('Default styling applied to all tree nodes'),
    enumeratorStyle: StylePropertiesSchema.nullable()
      .optional()
      .describe('Styling applied to tree structure characters (lines, branches)'),
    indentSize: z
      .number()
      .int('Indent size must be an integer')
      .min(0, 'Indent size cannot be negative')
      .max(100, 'Indent size cannot exceed 100 characters')
      .describe('Number of spaces to indent each tree level'),
    showLines: z.boolean().describe('Whether to display connecting lines between tree nodes'),
    expandAll: z
      .boolean()
      .describe(
        'Whether to expand all nodes by default (overrides individual node expanded state)'
      ),
  })
  .describe('Complete tree configuration for hierarchical data visualization');

/**
 * Validation schema for tree metrics
 */
export const TreeMetricsSchema = z
  .object({
    totalNodes: z
      .number()
      .int('Total nodes must be an integer')
      .min(0, 'Total nodes cannot be negative')
      .describe('Total number of nodes in the tree'),
    maxDepth: z
      .number()
      .int('Max depth must be an integer')
      .min(0, 'Max depth cannot be negative')
      .describe('Maximum depth of the tree (root is depth 0)'),
    width: z
      .number()
      .int('Width must be an integer')
      .min(0, 'Width cannot be negative')
      .describe('Maximum display width of any tree line'),
    height: z
      .number()
      .int('Height must be an integer')
      .min(0, 'Height cannot be negative')
      .describe('Total number of lines when tree is rendered'),
  })
  .describe('Metrics and measurements for tree rendering calculations');

/**
 * Tree validation namespace with comprehensive validation functions
 */
export namespace TreeValidation {
  /**
   * Validation result interface
   */
  export interface TreeValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }

  /**
   * Validates a complete tree configuration
   */
  export const validateTreeConfig = (config: any): TreeValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      TreeConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const err of error.errors) {
          if (err.path.includes('indentSize') && err.code === 'too_small') {
            errors.push('Indent size must be non-negative');
          } else if (err.path.includes('enumerator') && err.code === 'invalid_type') {
            errors.push('Enumerator function is required');
          } else {
            errors.push(err.message);
          }
        }
      } else {
        errors.push('Unknown validation error');
      }
    }

    // Additional custom validations
    if (config.root && config.root !== null) {
      const nodeValidation = validateTreeNode(config.root);
      errors.push(...nodeValidation.errors);
      warnings.push(...nodeValidation.warnings);
    }

    if (config.enumerator) {
      const enumValidation = validateEnumeratorFunction(config.enumerator);
      errors.push(...enumValidation.errors);
      warnings.push(...enumValidation.warnings);
    }

    // Check for large indent size
    if (config.indentSize && config.indentSize >= 20) {
      warnings.push(`Large indent size (${config.indentSize}) may cause layout issues`);
    }

    const structureValidation = validateTreeStructure(config);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates a tree node configuration
   */
  export const validateTreeNode = (node: any): TreeValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!node) {
      errors.push('Tree node cannot be null or undefined');
      return { isValid: false, errors, warnings };
    }

    if (typeof node.value !== 'string') {
      errors.push('Node value is required');
    } else if (node.value === '') {
      errors.push('Node value cannot be empty');
    } else if (node.value.length > 1000) {
      warnings.push(`Tree node value is very long (${node.value.length} characters)`);
    }

    if (!Array.isArray(node.children)) {
      errors.push('Children must be an array');
    } else {
      node.children.forEach((child: any, index: number) => {
        const childValidation = validateTreeNode(child);
        errors.push(...childValidation.errors.map((e) => `Child node at index ${index}: ${e}`));
        warnings.push(...childValidation.warnings.map((w) => `Child node at index ${index}: ${w}`));
      });
    }

    if (typeof node.expanded !== 'boolean') {
      errors.push('Tree node expanded property must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates enumerator function
   */
  export const validateEnumeratorFunction = (enumerator: any): TreeValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof enumerator !== 'function') {
      errors.push('Enumerator must be a function');
      return { isValid: false, errors, warnings };
    }

    try {
      const testNode = { value: 'test', children: [], style: undefined, expanded: true };
      const result = enumerator(testNode, 0, false, false);
      if (typeof result !== 'string') {
        errors.push('Enumerator function must return a string');
      }
    } catch (error) {
      errors.push(
        `Enumerator function throws an error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Validates overall tree structure
   */
  export const validateTreeStructure = (config: any): TreeValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config) {
      errors.push('Tree configuration cannot be null or undefined');
      return { isValid: false, errors, warnings };
    }

    // Check for performance-impacting structures
    if (config.root && config.root !== null) {
      const nodeCount = countNodes(config.root);
      if (nodeCount > 1000) {
        warnings.push(
          `Tree has a large number of nodes (${nodeCount}), which may impact performance`
        );
      }

      const depth = calculateDepth(config.root);
      if (depth > 100) {
        errors.push('Tree depth exceeds maximum allowed depth of 100');
      } else if (depth > 50) {
        warnings.push(`Tree has a large depth (${depth}), which may impact performance`);
      }
    }

    // Check for circular references (basic check)
    try {
      JSON.stringify(config);
    } catch (_error) {
      errors.push('Circular reference detected in tree structure');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  /**
   * Helper function to count nodes in a tree (with circular reference protection)
   */
  const countNodes = (node: any, visited = new Set()): number => {
    if (!node || visited.has(node)) return 0;
    visited.add(node);

    if (!Array.isArray(node.children)) return 1;

    let count = 1;
    for (const child of node.children) {
      count += countNodes(child, visited);
    }
    return count;
  };

  /**
   * Helper function to calculate tree depth (with circular reference protection)
   */
  const calculateDepth = (node: any, visited = new Set()): number => {
    if (!node || visited.has(node)) return 0;
    visited.add(node);

    if (!Array.isArray(node.children) || node.children.length === 0) return 1;

    let maxDepth = 0;
    for (const child of node.children) {
      const childDepth = calculateDepth(child, visited);
      if (childDepth > maxDepth) maxDepth = childDepth;
    }
    return 1 + maxDepth;
  };
}
