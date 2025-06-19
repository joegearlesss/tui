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
    root: TreeNodeConfigSchema.optional().describe(
      'Root node of the tree - undefined for empty tree'
    ),
    enumerator: z
      .function()
      .describe('Function to generate prefix characters for tree structure visualization'),
    itemStyle: StylePropertiesSchema.optional().describe(
      'Default styling applied to all tree nodes'
    ),
    enumeratorStyle: StylePropertiesSchema.optional().describe(
      'Styling applied to tree structure characters (lines, branches)'
    ),
    indentSize: z
      .number()
      .int('Indent size must be an integer')
      .min(0, 'Indent size cannot be negative')
      .max(20, 'Indent size cannot exceed 20 characters')
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
