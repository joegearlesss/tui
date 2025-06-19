import type { StyleProperties } from '../../style/style';

/**
 * Tree node configuration for hierarchical data structures
 */
export interface TreeNodeConfig {
  readonly value: string;
  readonly children: readonly TreeNodeConfig[];
  readonly style: StyleProperties | undefined;
  readonly expanded: boolean;
}

/**
 * Tree configuration for hierarchical rendering
 */
export interface TreeConfig {
  readonly root: TreeNodeConfig | undefined;
  readonly enumerator: TreeEnumeratorFunction;
  readonly itemStyle: StyleProperties | undefined;
  readonly enumeratorStyle: StyleProperties | undefined;
  readonly indentSize: number;
  readonly showLines: boolean;
  readonly expandAll: boolean;
}

/**
 * Function type for tree node enumeration
 */
export type TreeEnumeratorFunction = (
  node: TreeNodeConfig,
  depth: number,
  isLast: boolean,
  hasChildren: boolean
) => string;

/**
 * Tree metrics for size calculations
 */
export interface TreeMetrics {
  readonly totalNodes: number;
  readonly maxDepth: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Tree traversal callback function
 */
export type TreeTraversalCallback = (
  node: TreeNodeConfig,
  depth: number,
  path: readonly number[]
) => void;

/**
 * Tree node path for navigation
 */
export type TreePath = readonly number[];
