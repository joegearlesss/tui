import { BorderRender } from '../../border/rendering';
import type { BorderConfig } from '../../border/types';
import { Style } from '../../style/style';
import { Tree } from './operations';
import type { TreeConfig, TreeMetrics, TreeNodeConfig } from './types';

/**
 * Tree rendering namespace for string output generation
 */
namespace TreeRenderer {
  /**
   * Renders a tree to a string
   */
  export const render = (tree: TreeConfig): string => {
    return renderLines(tree).join('\n');
  };

  /**
   * Renders a tree to an array of lines
   */
  export const renderLines = (tree: TreeConfig): readonly string[] => {
    if (tree.root === undefined) {
      return [];
    }

    const lines: string[] = [];
    const _prefixStack: string[] = [];

    const renderNode = (
      node: TreeNodeConfig,
      depth: number,
      isLast: boolean,
      parentPrefix: string
    ): void => {
      const hasChildren = node.children.length > 0;
      const shouldShowChildren = (node.expanded || tree.expandAll) && hasChildren;

      // Generate the enumerator prefix
      const enumeratorPrefix = tree.enumerator(node, depth, isLast, hasChildren);

      // Apply enumerator styling if specified
      const styledEnumerator = tree.enumeratorStyle
        ? Style.render(tree.enumeratorStyle, enumeratorPrefix)
        : enumeratorPrefix;

      // Apply node styling if specified (node style takes precedence over tree style)
      const nodeStyle = node.style || tree.itemStyle;
      const styledValue = nodeStyle ? Style.render(nodeStyle, node.value) : node.value;

      // Build proper indentation for child nodes
      const indent = depth > 0 ? ' '.repeat(tree.indentSize) : '';
      
      // Build the full line
      const line = `${parentPrefix}${indent}${styledEnumerator}${styledValue}`;
      lines.push(line);

      // Render children if expanded
      if (shouldShowChildren) {
        const childPrefix = tree.showLines
          ? buildChildPrefix(parentPrefix, depth, isLast, tree.indentSize)
          : parentPrefix;

        node.children.forEach((child, index) => {
          const isLastChild = index === node.children.length - 1;
          renderNode(child, depth + 1, isLastChild, childPrefix);
        });
      }
    };

    renderNode(tree.root, 0, true, '');
    return lines;
  };

  /**
   * Renders tree with line numbers
   */
  export const renderWithLineNumbers = (tree: TreeConfig): string => {
    const lines = renderLines(tree);
    const maxLineNumber = lines.length;
    const lineNumberWidth = maxLineNumber.toString().length;

    return lines
      .map((line, index) => {
        const lineNumber = (index + 1).toString().padStart(lineNumberWidth, ' ');
        return `${lineNumber}: ${line}`;
      })
      .join('\n');
  };

  /**
   * Renders tree with borders
   */
  export const renderWithBorder = (tree: TreeConfig, borderConfig: BorderConfig): string => {
    const lines = renderLines(tree);
    if (lines.length === 0) {
      return BorderRender.box(borderConfig, '(empty tree)');
    }

    const content = lines.join('\n');
    return BorderRender.box(borderConfig, content);
  };

  /**
   * Renders tree in compact format (minimal spacing)
   */
  export const renderCompact = (tree: TreeConfig): string => {
    const compactTree: TreeConfig = {
      ...tree,
      indentSize: 1,
      showLines: false,
    };
    return render(compactTree);
  };

  /**
   * Renders tree in expanded format (all nodes expanded)
   */
  export const renderExpanded = (tree: TreeConfig): string => {
    const expandedTree: TreeConfig = {
      ...tree,
      expandAll: true,
    };
    return render(expandedTree);
  };

  /**
   * Renders tree with custom formatting
   */
  export const renderCustom = (
    tree: TreeConfig,
    options: {
      readonly linePrefix?: string;
      readonly lineSuffix?: string;
      readonly emptyMessage?: string;
      readonly maxWidth?: number;
    } = {}
  ): string => {
    const lines = renderLines(tree);

    if (lines.length === 0) {
      return options.emptyMessage || '(empty tree)';
    }

    return lines
      .map((line) => {
        let formattedLine = line;

        // Truncate if max width specified
        if (options.maxWidth && formattedLine.length > options.maxWidth) {
          formattedLine = `${formattedLine.substring(0, options.maxWidth - 3)}...`;
        }

        // Add prefix and suffix
        const prefix = options.linePrefix || '';
        const suffix = options.lineSuffix || '';

        return `${prefix}${formattedLine}${suffix}`;
      })
      .join('\n');
  };

  /**
   * Renders tree as markdown
   */
  export const renderMarkdown = (tree: TreeConfig): string => {
    if (tree.root === undefined) {
      return '';
    }

    const lines: string[] = [];

    const renderNode = (node: TreeNodeConfig, depth: number): void => {
      const indent = '  '.repeat(depth);
      const bullet = depth === 0 ? '#' : '-';
      lines.push(`${indent}${bullet} ${node.value}`);

      if ((node.expanded || tree.expandAll) && node.children.length > 0) {
        for (const child of node.children) {
          renderNode(child, depth + 1);
        }
      }
    };

    renderNode(tree.root, 0);
    return lines.join('\n');
  };

  /**
   * Renders tree as JSON
   */
  export const renderJson = (tree: TreeConfig): string => {
    if (tree.root === undefined) {
      return 'null';
    }

    const convertNode = (
      node: TreeNodeConfig
    ): { value: string; expanded: boolean; children: unknown[] } => ({
      value: node.value,
      expanded: node.expanded,
      children: node.children.map(convertNode),
    });

    return JSON.stringify(convertNode(tree.root), null, 2);
  };

  /**
   * Gets tree rendering metrics
   */
  export const getMetrics = (tree: TreeConfig): TreeMetrics => {
    return Tree.calculateMetrics(tree);
  };
}

/**
 * Helper function to build child prefix for line connections
 */
const buildChildPrefix = (parentPrefix: string, depth: number, isLast: boolean, indentSize: number): string => {
  if (depth === 0) {
    return parentPrefix;
  }

  const spaces = ' '.repeat(indentSize);
  const connector = isLast ? spaces : '│' + ' '.repeat(indentSize - 1);
  return parentPrefix + connector;
};

export { TreeRenderer };
