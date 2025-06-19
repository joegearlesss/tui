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

    enumerator: EnumeratorFunctionSchema.optional().describe(
      'Function to generate bullet points or numbering. Defaults to bullet points'
    ),

    indent: z
      .number()
      .int()
      .min(0)
      .max(20)
      .optional()
      .describe('Number of spaces to indent the list. Defaults to 2'),

    spacing: z
      .number()
      .int()
      .min(0)
      .max(5)
      .optional()
      .describe('Number of blank lines between items. Defaults to 0'),

    itemStyle: z
      .function()
      .args(z.string().describe('The text content of the list item'))
      .returns(z.string().describe('The styled text content with formatting applied'))
      .optional()
      .describe('Style function to apply to each item text'),

    enumeratorStyle: z
      .function()
      .args(z.string().describe('The enumerator symbol (e.g., "•", "1.", "a)")'))
      .returns(z.string().describe('The styled enumerator symbol with formatting applied'))
      .optional()
      .describe('Style function to apply to enumerator symbols'),

    maxWidth: z
      .number()
      .int()
      .min(10)
      .max(1000)
      .optional()
      .describe('Maximum width for text wrapping. Items longer than this will wrap'),
  })
  .describe('Configuration object for creating and styling lists');

/**
 * Validates list metrics containing calculated dimensions and properties
 */
export const ListMetricsSchema: z.ZodType<ListMetrics> = z
  .object({
    totalItems: z.number().int().min(0).describe('Total number of items including nested items'),

    maxDepth: z.number().int().min(0).describe('Maximum nesting depth of the list'),

    totalLines: z
      .number()
      .int()
      .min(0)
      .describe('Total number of lines the rendered list will occupy'),

    maxItemWidth: z
      .number()
      .int()
      .min(0)
      .describe('Width of the longest item text (excluding enumerator and indentation)'),
  })
  .describe('Calculated metrics and dimensions of a list');

/**
 * Validates rendering options for list output
 */
export const ListRenderOptionsSchema: z.ZodType<ListRenderOptions> = z
  .object({
    includeAnsi: z
      .boolean()
      .optional()
      .describe('Whether to include ANSI escape sequences in output. Defaults to true'),

    baseIndent: z
      .number()
      .int()
      .min(0)
      .max(50)
      .optional()
      .describe('Base indentation to apply to the entire list. Defaults to 0'),
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
  return ListConfigSchema.parse(config);
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
