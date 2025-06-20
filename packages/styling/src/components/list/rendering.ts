import type { ListConfig, ListItem, ListRenderOptions } from './types';
import { validateListConfig } from './validation';

/**
 * Renders lists to strings with ANSI support and proper formatting
 */
export namespace ListRenderer {
  /**
   * Default render options
   */
  const DEFAULT_OPTIONS: Required<ListRenderOptions> = {
    applyItemStyling: true,
    applyEnumeratorStyling: true,
    maxDepth: 10,
    indentPerLevel: 4,
    renderHidden: false,
  };

  /**
   * Renders a list configuration to a string
   */
  export function render(config: ListConfig, options: ListRenderOptions = DEFAULT_OPTIONS): string {
    const validConfig = validateListConfig(config);
    const validOptions = { ...DEFAULT_OPTIONS, ...options };

    const lines: string[] = [];
    renderItems(validConfig.items, validConfig, 0, validOptions, lines);

    return lines.join('\n');
  }

  /**
   * Renders list items recursively with proper nesting
   */
  function renderItems(
    items: readonly ListItem[],
    config: ListConfig,
    depth: number,
    options: Required<ListRenderOptions>,
    lines: string[]
  ): void {
    // For root level (depth 0), use config.indentLevel. For nested levels, use indentPerLevel per depth
    const baseIndent =
      depth === 0
        ? ' '.repeat(config.indentLevel || 0)
        : ' '.repeat(options.indentPerLevel * depth);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (typeof item === 'string') {
        // Render string item
        const enumerator = config.enumerator ? config.enumerator(i) : '';
        const styledEnumerator =
          config.enumeratorStyle && enumerator && options.applyEnumeratorStyling
            ? config.enumeratorStyle(enumerator)
            : enumerator;

        const itemText =
          config.itemStyle && options.applyItemStyling ? config.itemStyle(item) : item;

        // Special handling for Roman numerals - right-align within the indent space
        let fullPrefix = '';
        if (styledEnumerator?.match(/^[IVX]+\./)) {
          // For Roman numerals, right-align within the available indent space
          // Use 6 spaces total width to match Go lipgloss behavior
          const totalIndentWidth = 6;
          if (totalIndentWidth > 0) {
            // Calculate padding needed to right-align the Roman numeral
            const enumLength = styledEnumerator.length;
            const paddingNeeded = Math.max(0, totalIndentWidth - enumLength);
            const paddedEnum = ' '.repeat(paddingNeeded) + styledEnumerator;
            fullPrefix = `${paddedEnum} `;
          } else {
            fullPrefix = `${styledEnumerator} `;
          }
        } else {
          // For other enumerators, use normal indent + enumerator
          const prefix = styledEnumerator ? `${styledEnumerator} ` : '';
          fullPrefix = `${baseIndent}${prefix}`;
        }

        // Handle text wrapping if maxWidth is specified
        if (config.maxWidth && item.length > config.maxWidth) {
          const wrappedLines = wrapText(itemText, config.maxWidth);
          const enumeratorPadding = ' '.repeat(fullPrefix.length);

          for (let j = 0; j < wrappedLines.length; j++) {
            const linePrefix = j === 0 ? fullPrefix : enumeratorPadding;
            lines.push(`${linePrefix}${wrappedLines[j]}`);
          }
        } else {
          lines.push(`${fullPrefix}${itemText}`);
        }
      } else {
        // Render nested list directly without container enumerator
        const nestedConfig = validateListConfig(item);

        // Render nested items with increased depth
        renderItems(nestedConfig.items, nestedConfig, depth + 1, options, lines);
      }

      // Add spacing between items (except after the last item)
      if (config.spacing && config.spacing > 0 && i < items.length - 1) {
        for (let s = 0; s < config.spacing; s++) {
          lines.push('');
        }
      }
    }
  }

  /**
   * Wraps text to fit within a specified width
   */
  function wrapText(text: string, maxWidth: number): string[] {
    if (maxWidth <= 0) {
      return [text];
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (word.length > maxWidth) {
        // Handle words longer than maxWidth by breaking them
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = '';
        }

        // Break long word into chunks
        for (let i = 0; i < word.length; i += maxWidth) {
          lines.push(word.slice(i, i + maxWidth));
        }
      } else if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine.trim());
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines.length > 0 ? lines : [''];
  }

  /**
   * Renders a list to an array of lines (without joining)
   */
  export function renderToLines(
    config: ListConfig,
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): string[] {
    const rendered = render(config, options);
    return rendered === '' ? [] : rendered.split('\n');
  }

  /**
   * Renders a list with custom line separator
   */
  export function renderWithSeparator(
    config: ListConfig,
    separator = '\n',
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): string {
    const lines = renderToLines(config, options);
    return lines.join(separator);
  }

  /**
   * Renders a list to Markdown format
   */
  export function renderToMarkdown(
    config: ListConfig,
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): string {
    const validConfig = validateListConfig(config);
    const validOptions = { ...DEFAULT_OPTIONS, ...options };

    const lines: string[] = [];
    renderItemsToMarkdown(validConfig.items, validConfig, 0, validOptions, lines);

    return lines.join('\n');
  }

  /**
   * Helper function to render items to Markdown
   */
  function renderItemsToMarkdown(
    items: readonly ListItem[],
    config: ListConfig,
    depth: number,
    options: Required<ListRenderOptions>,
    lines: string[]
  ): void {
    const indent = '  '.repeat(depth);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;

      if (typeof item === 'string') {
        // Use markdown list syntax - check the actual enumerator output
        let bullet = '-'; // Default to bullet list
        if (config.enumerator) {
          const enumOutput = config.enumerator(0);
          // If enumerator produces numbers or letters, use numbered list
          if (
            /^\d+\./.test(enumOutput) ||
            /^[a-zA-Z]\./.test(enumOutput) ||
            /^[ivxlcdm]+\./.test(enumOutput.toLowerCase())
          ) {
            bullet = '1.';
          }
        }

        lines.push(`${indent}${bullet} ${item}`);
      } else {
        // Render nested list
        renderItemsToMarkdown(item.items, item, depth + 1, options, lines);
      }

      // Add spacing
      if (config.spacing && config.spacing > 0 && i < items.length - 1) {
        for (let s = 0; s < config.spacing; s++) {
          lines.push('');
        }
      }
    }
  }

  /**
   * Gets the rendered dimensions of a list
   */
  export function getDimensions(
    config: ListConfig,
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): {
    width: number;
    height: number;
    lines: number;
  } {
    const lines = renderToLines(config, options);
    const width = lines.length > 0 ? Math.max(...lines.map((line) => stripAnsi(line).length)) : 0;
    const height = lines.length;

    return {
      width,
      height,
      lines: lines.length,
    };
  }

  /**
   * Strips ANSI escape sequences from a string
   */
  function stripAnsi(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  }

  /**
   * Renders a list with line numbers
   */
  export function renderWithLineNumbers(
    config: ListConfig,
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): string {
    const lines = renderToLines(config, options);
    const maxLineNumber = lines.length;
    const padding = maxLineNumber.toString().length;

    return lines
      .map((line, index) => {
        const lineNumber = (index + 1).toString().padStart(padding, ' ');
        return `${lineNumber}: ${line}`;
      })
      .join('\n');
  }

  /**
   * Renders a list with a border around it
   */
  export function renderWithBorder(
    config: ListConfig,
    options: ListRenderOptions = DEFAULT_OPTIONS
  ): string {
    const lines = renderToLines(config, options);
    const maxWidth =
      lines.length > 0 ? Math.max(...lines.map((line) => stripAnsi(line).length)) : 0;

    const topBorder = `┌${'─'.repeat(maxWidth + 2)}┐`;
    const bottomBorder = `└${'─'.repeat(maxWidth + 2)}┘`;

    if (lines.length === 0) {
      return `${topBorder}\n${bottomBorder}`;
    }

    const borderedLines = [
      topBorder,
      ...lines.map((line) => `│ ${line.padEnd(maxWidth)} │`),
      bottomBorder,
    ];

    return borderedLines.join('\n');
  }
}
