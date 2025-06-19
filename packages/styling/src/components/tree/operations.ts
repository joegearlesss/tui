import type { StyleProperties } from '../../style/style';
import type {
  TreeConfig,
  TreeEnumeratorFunction,
  TreeMetrics,
  TreeNodeConfig,
  TreePath,
  TreeTraversalCallback,
} from './types';

/**
 * Tree namespace for hierarchical data operations
 */
namespace Tree {
  /**
   * Creates an empty tree configuration
   */
  export const create = (): TreeConfig => ({
    root: undefined,
    enumerator: TreeEnumerator.LINES,
    itemStyle: undefined,
    enumeratorStyle: undefined,
    indentSize: 2,
    showLines: true,
    expandAll: false,
  });

  /**
   * Creates a tree with a root node
   */
  export const fromRoot = (value: string): TreeConfig => ({
    ...create(),
    root: createNode(value),
  });

  /**
   * Creates a tree from nested string arrays
   */
  export const fromStrings = (data: readonly (string | readonly unknown[])[]): TreeConfig => {
    if (data.length === 0) {
      return create();
    }

    const buildNode = (item: string | readonly unknown[]): TreeNodeConfig => {
      if (typeof item === 'string') {
        return createNode(item);
      }

      if (Array.isArray(item) && item.length > 0) {
        const [value, ...children] = item;
        if (typeof value === 'string') {
          return {
            ...createNode(value),
            children: children.map(buildNode),
          };
        }
      }

      return createNode('Invalid node');
    };

    const [firstItem, ...restItems] = data;
    if (firstItem === undefined) {
      return create();
    }
    const root = buildNode(firstItem);

    if (restItems.length > 0) {
      return {
        ...create(),
        root: {
          ...root,
          children: [...root.children, ...restItems.map(buildNode)],
        },
      };
    }

    return {
      ...create(),
      root,
    };
  };

  /**
   * Sets the tree enumerator function
   */
  export const withEnumerator =
    (enumerator: TreeEnumeratorFunction) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      enumerator,
    });

  /**
   * Sets the default item style
   */
  export const withItemStyle =
    (style: StyleProperties) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      itemStyle: style,
    });

  /**
   * Sets the enumerator style
   */
  export const withEnumeratorStyle =
    (style: StyleProperties) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      enumeratorStyle: style,
    });

  /**
   * Sets the indent size
   */
  export const withIndentSize =
    (size: number) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      indentSize: Math.max(0, Math.min(20, Math.floor(size))),
    });

  /**
   * Sets whether to show connecting lines
   */
  export const withLines =
    (showLines: boolean) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      showLines,
    });

  /**
   * Sets whether to expand all nodes
   */
  export const withExpandAll =
    (expandAll: boolean) =>
    (tree: TreeConfig): TreeConfig => ({
      ...tree,
      expandAll,
    });

  /**
   * Adds a child node to the root
   */
  export const addChild =
    (value: string) =>
    (tree: TreeConfig): TreeConfig => {
      if (tree.root === undefined) {
        return fromRoot(value);
      }

      return {
        ...tree,
        root: {
          ...tree.root,
          children: [...tree.root.children, createNode(value)],
        },
      };
    };

  /**
   * Adds a child node at a specific path
   */
  export const addChildAt =
    (path: TreePath, value: string) =>
    (tree: TreeConfig): TreeConfig => {
      if (tree.root === undefined) {
        return tree;
      }

      const updateNode = (node: TreeNodeConfig, currentPath: TreePath): TreeNodeConfig => {
        if (currentPath.length === 0) {
          return {
            ...node,
            children: [...node.children, createNode(value)],
          };
        }

        const [index, ...restPath] = currentPath;
        if (index === undefined || index < 0 || index >= node.children.length) {
          return node;
        }

        return {
          ...node,
          children: node.children.map((child, i) =>
            i === index ? updateNode(child, restPath) : child
          ),
        };
      };

      return {
        ...tree,
        root: updateNode(tree.root, path),
      };
    };

  /**
   * Removes a node at a specific path
   */
  export const removeAt =
    (path: TreePath) =>
    (tree: TreeConfig): TreeConfig => {
      if (tree.root === undefined || path.length === 0) {
        return tree;
      }

      if (path.length === 1) {
        // Removing direct child of root
        const [index] = path;
        if (index === undefined || index < 0 || index >= tree.root.children.length) {
          return tree;
        }

        return {
          ...tree,
          root: {
            ...tree.root,
            children: tree.root.children.filter((_, i) => i !== index),
          },
        };
      }

      const updateNode = (node: TreeNodeConfig, currentPath: TreePath): TreeNodeConfig => {
        if (currentPath.length === 1) {
          const [index] = currentPath;
          if (index === undefined || index < 0 || index >= node.children.length) {
            return node;
          }

          return {
            ...node,
            children: node.children.filter((_, i) => i !== index),
          };
        }

        const [index, ...restPath] = currentPath;
        if (index === undefined || index < 0 || index >= node.children.length) {
          return node;
        }

        return {
          ...node,
          children: node.children.map((child, i) =>
            i === index ? updateNode(child, restPath) : child
          ),
        };
      };

      return {
        ...tree,
        root: updateNode(tree.root, path),
      };
    };

  /**
   * Expands a node at a specific path
   */
  export const expandAt =
    (path: TreePath) =>
    (tree: TreeConfig): TreeConfig => {
      if (tree.root === undefined) {
        return tree;
      }

      const updateNode = (node: TreeNodeConfig, currentPath: TreePath): TreeNodeConfig => {
        if (currentPath.length === 0) {
          return { ...node, expanded: true };
        }

        const [index, ...restPath] = currentPath;
        if (index === undefined || index < 0 || index >= node.children.length) {
          return node;
        }

        return {
          ...node,
          children: node.children.map((child, i) =>
            i === index ? updateNode(child, restPath) : child
          ),
        };
      };

      return {
        ...tree,
        root: updateNode(tree.root, path),
      };
    };

  /**
   * Collapses a node at a specific path
   */
  export const collapseAt =
    (path: TreePath) =>
    (tree: TreeConfig): TreeConfig => {
      if (tree.root === undefined) {
        return tree;
      }

      const updateNode = (node: TreeNodeConfig, currentPath: TreePath): TreeNodeConfig => {
        if (currentPath.length === 0) {
          return { ...node, expanded: false };
        }

        const [index, ...restPath] = currentPath;
        if (index === undefined || index < 0 || index >= node.children.length) {
          return node;
        }

        return {
          ...node,
          children: node.children.map((child, i) =>
            i === index ? updateNode(child, restPath) : child
          ),
        };
      };

      return {
        ...tree,
        root: updateNode(tree.root, path),
      };
    };

  /**
   * Traverses the tree and calls callback for each node
   */
  export const traverse = (tree: TreeConfig, callback: TreeTraversalCallback): void => {
    if (tree.root === undefined) {
      return;
    }

    const traverseNode = (node: TreeNodeConfig, depth: number, path: TreePath): void => {
      callback(node, depth, path);

      if (node.expanded || tree.expandAll) {
        node.children.forEach((child, index) => {
          traverseNode(child, depth + 1, [...path, index]);
        });
      }
    };

    traverseNode(tree.root, 0, []);
  };

  /**
   * Calculates tree metrics
   */
  export const calculateMetrics = (tree: TreeConfig): TreeMetrics => {
    if (tree.root === undefined) {
      return {
        totalNodes: 0,
        maxDepth: 0,
        width: 0,
        height: 0,
      };
    }

    let totalNodes = 0;
    let maxDepth = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    traverse(tree, (node, depth, _path) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);

      // Calculate display width for this node
      const indent = depth * tree.indentSize;
      const prefix = tree.enumerator(node, depth, false, node.children.length > 0);
      const nodeWidth = indent + prefix.length + node.value.length;
      maxWidth = Math.max(maxWidth, nodeWidth);

      totalHeight++;
    });

    return {
      totalNodes,
      maxDepth,
      width: maxWidth,
      height: totalHeight,
    };
  };

  /**
   * Finds a node at a specific path
   */
  export const getNodeAt = (tree: TreeConfig, path: TreePath): TreeNodeConfig | undefined => {
    if (tree.root === undefined) {
      return undefined;
    }

    let current = tree.root;
    for (const index of path) {
      if (index < 0 || index >= current.children.length) {
        return undefined;
      }
      const nextNode = current.children[index];
      if (nextNode === undefined) {
        return undefined;
      }
      current = nextNode;
    }

    return current;
  };

  /**
   * Checks if tree is empty
   */
  export const isEmpty = (tree: TreeConfig): boolean => {
    return tree.root === undefined;
  };

  /**
   * Gets the total number of visible nodes
   */
  export const getVisibleNodeCount = (tree: TreeConfig): number => {
    let count = 0;
    traverse(tree, () => {
      count++;
    });
    return count;
  };
}

/**
 * Tree node creation utilities
 */
namespace TreeNode {
  /**
   * Creates a new tree node
   */
  export const create = (value: string): TreeNodeConfig => ({
    value,
    children: [],
    style: undefined,
    expanded: true,
  });

  /**
   * Creates a node with children
   */
  export const withChildren =
    (value: string, children: readonly TreeNodeConfig[]) => (): TreeNodeConfig => ({
      value,
      children,
      style: undefined,
      expanded: true,
    });

  /**
   * Creates a node with custom style
   */
  export const withStyle = (value: string, style: StyleProperties): TreeNodeConfig => ({
    value,
    children: [],
    style,
    expanded: true,
  });

  /**
   * Creates a collapsed node
   */
  export const collapsed = (value: string): TreeNodeConfig => ({
    value,
    children: [],
    style: undefined,
    expanded: false,
  });
}

/**
 * Tree enumerator functions for different visual styles
 */
namespace TreeEnumerator {
  /**
   * Simple bullet point enumerator
   */
  export const BULLET: TreeEnumeratorFunction = () => '• ';

  /**
   * Dash enumerator
   */
  export const DASH: TreeEnumeratorFunction = () => '- ';

  /**
   * Plus/minus enumerator based on expansion state
   */
  export const PLUS_MINUS: TreeEnumeratorFunction = (node, _depth, _isLast, hasChildren) => {
    if (!hasChildren) return '  ';
    return node.expanded ? '- ' : '+ ';
  };

  /**
   * Unicode box drawing characters
   */
  export const LINES: TreeEnumeratorFunction = (node, depth, isLast, hasChildren) => {
    if (depth === 0) {
      return hasChildren ? (node.expanded ? '┬ ' : '├ ') : '  ';
    }

    const connector = isLast ? '└─' : '├─';
    return `${connector} `;
  };

  /**
   * ASCII box drawing characters
   */
  export const ASCII_LINES: TreeEnumeratorFunction = (node, depth, isLast, hasChildren) => {
    if (depth === 0) {
      return hasChildren ? (node.expanded ? '+ ' : '+ ') : '  ';
    }

    const connector = isLast ? '\\-' : '|-';
    return `${connector} `;
  };

  /**
   * Folder-style enumerator with icons
   */
  export const FOLDERS: TreeEnumeratorFunction = (node, _depth, _isLast, hasChildren) => {
    if (!hasChildren) return '📄 ';
    return node.expanded ? '📂 ' : '📁 ';
  };

  /**
   * Custom enumerator with user-defined function
   */
  export const custom = (fn: TreeEnumeratorFunction): TreeEnumeratorFunction => fn;

  /**
   * Depth-aware enumerator that changes based on tree level
   */
  export const depthAware =
    (enumerators: readonly TreeEnumeratorFunction[]): TreeEnumeratorFunction =>
    (node, depth, isLast, hasChildren) => {
      const enumerator = enumerators[depth % enumerators.length] || BULLET;
      return enumerator(node, depth, isLast, hasChildren);
    };
}

/**
 * Helper function to create a tree node
 */
const createNode = (value: string): TreeNodeConfig => TreeNode.create(value);

export { Tree, TreeNode, TreeEnumerator };
