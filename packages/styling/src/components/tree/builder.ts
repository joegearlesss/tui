import type { StyleProperties } from '../../style/style';
import { Tree, TreeNode } from './operations';
import { TreeRenderer } from './rendering';
import type {
  TreeConfig,
  TreeEnumeratorFunction,
  TreeMetrics,
  TreeNodeConfig,
  TreeTraversalCallback,
} from './types';

/**
 * Tree builder for fluent API construction
 */
namespace TreeBuilder {
  /**
   * Creates a new tree builder with empty tree
   */
  export const create = () => new TreeChain(Tree.create());

  /**
   * Creates a tree builder with a root node
   */
  export const fromRoot = (value: string) => new TreeChain(Tree.fromRoot(value));

  /**
   * Creates a tree builder from nested string arrays
   */
  export const fromStrings = (data: readonly (string | readonly unknown[])[]) =>
    new TreeChain(Tree.fromStrings(data));

  /**
   * Creates a tree builder from an existing tree configuration
   */
  export const from = (config: TreeConfig) => new TreeChain(config);
}

/**
 * Tree chain class for fluent API
 */
class TreeChain {
  constructor(private readonly config: TreeConfig) {}

  /**
   * Sets the tree enumerator function
   */
  enumerator(enumerator: TreeEnumeratorFunction): TreeChain {
    return new TreeChain(Tree.withEnumerator(enumerator)(this.config));
  }

  /**
   * Sets the default item style
   */
  itemStyle(style: StyleProperties): TreeChain {
    return new TreeChain(Tree.withItemStyle(style)(this.config));
  }

  /**
   * Sets the enumerator style
   */
  enumeratorStyle(style: StyleProperties): TreeChain {
    return new TreeChain(Tree.withEnumeratorStyle(style)(this.config));
  }

  /**
   * Sets the indent size
   */
  indentSize(size: number): TreeChain {
    return new TreeChain(Tree.withIndentSize(size)(this.config));
  }

  /**
   * Sets whether to show connecting lines
   */
  showLines(show: boolean): TreeChain {
    return new TreeChain(Tree.withLines(show)(this.config));
  }

  /**
   * Sets whether to expand all nodes
   */
  expandAll(expand: boolean): TreeChain {
    return new TreeChain(Tree.withExpandAll(expand)(this.config));
  }

  /**
   * Adds a child node to the root
   */
  addChild(value: string): TreeChain {
    return new TreeChain(Tree.addChild(value)(this.config));
  }

  /**
   * Adds multiple child nodes to the root
   */
  addChildren(...values: readonly string[]): TreeChain {
    let result = this.config;
    for (const value of values) {
      result = Tree.addChild(value)(result);
    }
    return new TreeChain(result);
  }

  /**
   * Adds a child node at a specific path
   */
  addChildAt(path: readonly number[], value: string): TreeChain {
    return new TreeChain(Tree.addChildAt(path, value)(this.config));
  }

  /**
   * Removes a node at a specific path
   */
  removeAt(path: readonly number[]): TreeChain {
    return new TreeChain(Tree.removeAt(path)(this.config));
  }

  /**
   * Expands a node at a specific path
   */
  expandAt(path: readonly number[]): TreeChain {
    return new TreeChain(Tree.expandAt(path)(this.config));
  }

  /**
   * Collapses a node at a specific path
   */
  collapseAt(path: readonly number[]): TreeChain {
    return new TreeChain(Tree.collapseAt(path)(this.config));
  }

  /**
   * Sets the root node
   */
  root(value: string): TreeChain {
    return new TreeChain({
      ...this.config,
      root: TreeNode.create(value),
    });
  }

  /**
   * Sets a custom root node
   */
  customRoot(node: TreeNodeConfig): TreeChain {
    return new TreeChain({
      ...this.config,
      root: node,
    });
  }

  /**
   * Adds a child to the root node
   */
  child(value: string): TreeChain {
    return new TreeChain(Tree.addChild(value)(this.config));
  }

  /**
   * Conditional operations
   */
  when(condition: boolean, fn: (chain: TreeChain) => TreeChain): TreeChain {
    return condition ? fn(this) : this;
  }

  /**
   * Applies a transformation function
   */
  pipe(fn: (config: TreeConfig) => TreeConfig): TreeChain {
    return new TreeChain(fn(this.config));
  }

  /**
   * Transforms the tree using a function
   */
  transform(fn: (chain: TreeChain) => TreeChain): TreeChain {
    return fn(this);
  }

  /**
   * Creates a copy of the current tree
   */
  clone(): TreeChain {
    return new TreeChain(this.config);
  }

  /**
   * Query methods
   */

  /**
   * Checks if the tree is empty
   */
  isEmpty(): boolean {
    return Tree.isEmpty(this.config);
  }

  /**
   * Gets the total number of visible nodes
   */
  getVisibleNodeCount(): number {
    return Tree.getVisibleNodeCount(this.config);
  }

  /**
   * Gets a node at a specific path
   */
  getNodeAt(path: readonly number[]): TreeNodeConfig | undefined {
    return Tree.getNodeAt(this.config, path);
  }

  /**
   * Calculates tree metrics
   */
  calculateMetrics(): TreeMetrics {
    return Tree.calculateMetrics(this.config);
  }

  /**
   * Traverses the tree
   */
  traverse(callback: TreeTraversalCallback): TreeChain {
    Tree.traverse(this.config, callback);
    return this;
  }

  /**
   * Builds the final tree configuration
   */
  build(): TreeConfig {
    return this.config;
  }

  /**
   * Renders the tree to a string
   */
  render(): string {
    return TreeRenderer.render(this.config);
  }

  /**
   * Renders the tree to an array of lines
   */
  renderLines(): readonly string[] {
    return TreeRenderer.renderLines(this.config);
  }

  /**
   * Gets the current configuration (for debugging)
   */
  getConfig(): TreeConfig {
    return this.config;
  }
}

export { TreeBuilder, TreeChain };
