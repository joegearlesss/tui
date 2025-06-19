import { z } from 'zod';
import type {
  EnumeratorFunction,
  ListConfig,
  ListItem,
  ListMetrics,
  ListRenderOptions,
} from './types';

/**
 * Validates a list item which can be either a string or nested list configuration
 */
export const ListItemSchema: z.ZodType<ListItem> = z.lazy(() =>
  z.union([
    z.string().describe('A simple text item in the list'),
    ListConfigSchema.describe('A nested list configuration for hierarchical lists'),
  ])
);

/**
 * Validates an enumerator function that generates bullet points or numbering
 */
export const EnumeratorFunctionSchema: z.ZodType<EnumeratorFunction> = z
  .function()
  .args(z.number().describe('The index of the item (0-based)'))
  .returns(z.string().describe('The enumerator string (e.g., "•", "1.", "a)")'))
  .describe('Function that generates enumerator strings for list items');

/**
 * Validates the main list configuration object
 */
export const ListConfigSchema: z.ZodType<ListConfig> = z
  .object({
    items: z
      .array(ListItemSchema)
      .min(0, 'List can be empty')
      .describe('Array of list items, can be strings or nested list configurations'),

    enumerator: EnumeratorFunctionSchema.describe(
      'Function to generate bullet points or numbering'
    ),

    itemStyle: z.any().optional().describe('Optional style configuration for list items'),

    enumeratorStyle: z.any().optional().describe('Optional style configuration for enumerators'),

    hidden: z.boolean().describe('Whether the list should be hidden from rendering'),

    offset: z
      .tuple([z.number(), z.number()])
      .optional()
      .describe('Optional offset for positioning [x, y]'),

    indentLevel: z.number().int().min(0).max(20).describe('Indentation level for nested lists'),

    indentString: z.string().describe('Custom indentation string (overrides default spacing)'),

    showEnumerators: z.boolean().describe('Whether to show enumerators for this list'),

    enumeratorSpacing: z
      .number()
      .int()
      .min(0)
      .max(10)
      .describe('Spacing between enumerator and item content'),

    maxWidth: z.number().int().min(1).optional().describe('Maximum width for text wrapping'),

    spacing: z.number().int().min(0).optional().describe('Spacing between list items'),

    indent: z.number().int().min(0).optional().describe('Base indentation for the list'),
  })
  .describe('Complete list configuration with items, styling, and layout options');

/**
 * Validates list metrics containing calculated dimensions and properties
 */
export const ListMetricsSchema: z.ZodType<ListMetrics> = z
  .object({
    totalItems: z.number().int().min(0).describe('Total number of items including nested items'),

    maxDepth: z.number().int().min(0).describe('Maximum nesting depth of the list'),

    totalWidth: z.number().int().min(0).describe('Total rendered width'),

    totalHeight: z.number().int().min(0).describe('Total rendered height in lines'),

    topLevelItems: z.number().int().min(0).describe('Number of top-level items'),

    itemWidths: z.array(z.number().int().min(0)).describe('Array of item widths'),
  })
  .describe('Calculated metrics and dimensions of a list');

/**
 * Validates rendering options for list output
 */
export const ListRenderOptionsSchema: z.ZodType<ListRenderOptions> = z
  .object({
    applyItemStyling: z.boolean().describe('Whether to apply item styling'),

    applyEnumeratorStyling: z.boolean().describe('Whether to apply enumerator styling'),

    maxDepth: z.number().int().min(0).describe('Maximum depth for nested list rendering'),

    indentPerLevel: z.number().int().min(0).describe('Custom indentation per level'),

    renderHidden: z.boolean().describe('Whether to render hidden lists'),
  })
  .describe('Options for controlling list rendering output');

/**
 * Validates a complete list item which can be a string or nested configuration
 */
export function validateListItem(item: unknown): ListItem {
  return ListItemSchema.parse(item);
}

/**
 * Validates an enumerator function
 */
export function validateEnumeratorFunction(fn: unknown): EnumeratorFunction {
  return EnumeratorFunctionSchema.parse(fn);
}

/**
 * Validates a list configuration object
 */
export function validateListConfig(config: unknown): ListConfig {
  // Provide defaults for missing properties
  const configWithDefaults = {
    items: [],
    enumerator: () => '•',
    itemStyle: undefined,
    enumeratorStyle: undefined,
    hidden: false,
    offset: undefined,
    indentLevel: 0,
    indentString: '  ',
    showEnumerators: true,
    enumeratorSpacing: 1,
    ...(config as Partial<ListConfig>),
  };
  return ListConfigSchema.parse(configWithDefaults);
}

/**
 * Validates list metrics
 */
export function validateListMetrics(metrics: unknown): ListMetrics {
  return ListMetricsSchema.parse(metrics);
}

/**
 * Validates list render options
 */
export function validateListRenderOptions(options: unknown): ListRenderOptions {
  return ListRenderOptionsSchema.parse(options);
}
