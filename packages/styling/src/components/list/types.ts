/**
 * List Component Types
 *
 * Defines the core types and interfaces for the list component system.
 * Based on OVERVIEW.internal.md Section 5 (List Component) specification.
 */

import type { StyleProperties } from '../../style/style';

/**
 * List item can be either a string or a nested list configuration
 */
export type ListItem = string | ListConfig;

/**
 * Enumerator function type - takes current index, returns enumeration string
 */
export type EnumeratorFunction = (index: number) => string;

/**
 * Depth-aware enumerator function type - takes index and optional depth
 */
export type DepthAwareEnumeratorFunction = (index: number, depth?: number) => string;

/**
 * List configuration interface with readonly properties for immutability
 */
export interface ListConfig {
  /** Array of list items (strings or nested lists) */
  readonly items: readonly ListItem[];

  /** Function that generates enumeration for each item */
  readonly enumerator: EnumeratorFunction;

  /** Optional style function for list items */
  readonly itemStyle?: ((text: string) => string) | undefined;

  /** Optional style function for enumerators */
  readonly enumeratorStyle?: ((text: string) => string) | undefined;

  /** Whether the list should be hidden from rendering */
  readonly hidden: boolean;

  /** Optional offset for positioning [x, y] */
  readonly offset?: readonly [number, number] | undefined;

  /** Indentation level for nested lists */
  readonly indentLevel: number;

  /** Custom indentation string (overrides default spacing) */
  readonly indentString: string | undefined;

  /** Whether to show enumerators for this list */
  readonly showEnumerators: boolean;

  /** Spacing between enumerator and item content */
  readonly enumeratorSpacing: number;

  /** Maximum width for text wrapping */
  readonly maxWidth?: number;

  /** Spacing between list items */
  readonly spacing?: number;

  /** Base indentation for the list */
  readonly indent?: number;
}

/**
 * List rendering options
 */
export interface ListRenderOptions {
  /** Whether to apply item styling */
  readonly applyItemStyling: boolean;

  /** Whether to apply enumerator styling */
  readonly applyEnumeratorStyling: boolean;

  /** Maximum depth for nested list rendering */
  readonly maxDepth: number;

  /** Custom indentation per level */
  readonly indentPerLevel: number;

  /** Whether to render hidden lists */
  readonly renderHidden: boolean;
}

/**
 * List validation result
 */
export interface ListValidationResult {
  /** Whether the list configuration is valid */
  readonly isValid: boolean;

  /** Array of validation error messages */
  readonly errors: readonly string[];

  /** Array of validation warnings */
  readonly warnings: readonly string[];
}

/**
 * List metrics for layout calculations
 */
export interface ListMetrics {
  /** Total number of items (including nested) */
  readonly totalItems: number;

  /** Maximum nesting depth */
  readonly maxDepth: number;

  /** Total rendered width */
  readonly totalWidth: number;

  /** Total rendered height in lines */
  readonly totalHeight: number;

  /** Number of top-level items */
  readonly topLevelItems: number;

  /** Array of item widths */
  readonly itemWidths: readonly number[];
}

/**
 * List item position information
 */
export interface ListItemPosition {
  /** Index in the current level */
  readonly index: number;

  /** Nesting depth (0 for top level) */
  readonly depth: number;

  /** Path to this item (array of indices) */
  readonly path: readonly number[];

  /** Whether this is the last item at its level */
  readonly isLast: boolean;

  /** Whether this item has children */
  readonly hasChildren: boolean;
}

/**
 * List style function type - takes item content and position, returns style
 */
export type ListStyleFunction = (item: ListItem, position: ListItemPosition) => StyleProperties;

/**
 * List item renderer function type - takes item and position, returns formatted string
 */
export type ListItemRenderer = (item: ListItem, position: ListItemPosition) => string;
