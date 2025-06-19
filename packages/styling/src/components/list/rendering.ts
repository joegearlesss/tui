import type { ListConfig, ListItem, ListRenderOptions } from './types.js';
import { validateListConfig, validateListRenderOptions } from './validation.js';

/**
 * Renders lists to strings with ANSI support and proper formatting
 */
export namespace ListRenderer {
  /**
   * Default render options
   */
  const DEFAULT_OPTIONS: Required<ListRenderOptions> = {
    includeAnsi: true,
    baseIndent: 0
  };

  /**
   * Renders a list configuration to a string
   */
  export function render(config: ListConfig, options: ListRenderOptions = {}): string {
    const validConfig = validateListConfig(config);
    const validOptions = { ...DEFAULT_OPTIONS, ...validateListRenderOptions(options) };
    
    const lines: string[] = [];
    renderItems(validConfig.items, validConfig, 0, validOptions, lines);
    
    return lines.join('\n');
  }

  /**
   * Renders list items recursively with proper nesting
   */
  function renderItems(
    items: ListItem[],
    config: ListConfig,
    depth: number,
    options: Required<ListRenderOptions>,
    lines: string[]
  ): void {
    const baseIndent = ' '.repeat(options.baseIndent);
    // For root level (depth 0), use config.indent. For nested levels, use 4 spaces per depth
    const itemIndent = depth === 0 
      ? ' '.repeat(config.indent || 0)
      : ' '.repeat(4 * depth);
    const fullIndent = baseIndent + itemIndent;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (typeof item === 'string') {
        // Render string item
        const enumerator = config.enumerator ? config.enumerator(i, depth) : '';
        const styledEnumerator = config.enumeratorStyle && enumerator
          ? config.enumeratorStyle(enumerator)
          : enumerator;
        
        const itemText = config.itemStyle ? config.itemStyle(item) : item;
        
        // Handle text wrapping if maxWidth is specified
        if (config.maxWidth && item.length > config.maxWidth) {
          const wrappedLines = wrapText(itemText, config.maxWidth);
          const enumeratorPadding = ' '.repeat(styledEnumerator.length + 1);
          
          for (let j = 0; j < wrappedLines.length; j++) {
            const prefix = j === 0 
              ? (styledEnumerator ? `${styledEnumerator} ` : '')
              : enumeratorPadding;
            lines.push(`${fullIndent}${prefix}${wrappedLines[j]}`);
          }
        } else {
          const prefix = styledEnumerator ? `${styledEnumerator} ` : '';
          lines.push(`${fullIndent}${prefix}${itemText}`);
        }
      } else {
        // Render nested list
        const nestedConfig = validateListConfig(item);
        
        // Add enumerator for the nested list container if parent has one
        if (config.enumerator) {
          const enumerator = config.enumerator(i, depth);
          const styledEnumerator = config.enumeratorStyle 
            ? config.enumeratorStyle(enumerator)
            : enumerator;
          
          if (styledEnumerator) {
            lines.push(`${fullIndent}${styledEnumerator}`);
          }
        }
        
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
  export function renderToLines(config: ListConfig, options: ListRenderOptions = {}): string[] {
    const rendered = render(config, options);
    return rendered.split('\n');
  }

  /**
   * Renders a list with custom line separator
   */
  export function renderWithSeparator(
    config: ListConfig, 
    separator: string = '\n', 
    options: ListRenderOptions = {}
  ): string {
    const lines = renderToLines(config, options);
    return lines.join(separator);
  }

  /**
   * Renders a list to HTML format (basic conversion)
   */
  export function renderToHtml(config: ListConfig): string {
    const validConfig = validateListConfig(config);
    const lines: string[] = ['<ul>'];
    
    renderItemsToHtml(validConfig.items, validConfig, lines);
    lines.push('</ul>');
    
    return lines.join('\n');
  }

  /**
   * Helper function to render items to HTML
   */
  function renderItemsToHtml(items: ListItem[], config: ListConfig, lines: string[]): void {
    for (const item of items) {
      if (typeof item === 'string') {
        const escapedText = escapeHtml(item);
        lines.push(`  <li>${escapedText}</li>`);
      } else {
        lines.push('  <li>');
        lines.push('    <ul>');
        renderItemsToHtml(item.items, item, lines);
        lines.push('    </ul>');
        lines.push('  </li>');
      }
    }
  }

  /**
   * Escapes HTML special characters
   */
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Renders a list to Markdown format
   */
  export function renderToMarkdown(config: ListConfig, options: ListRenderOptions = {}): string {
    const validConfig = validateListConfig(config);
    const validOptions = { ...DEFAULT_OPTIONS, ...validateListRenderOptions(options) };
    
    const lines: string[] = [];
    renderItemsToMarkdown(validConfig.items, validConfig, 0, validOptions, lines);
    
    return lines.join('\n');
  }

  /**
   * Helper function to render items to Markdown
   */
  function renderItemsToMarkdown(
    items: ListItem[],
    config: ListConfig,
    depth: number,
    options: Required<ListRenderOptions>,
    lines: string[]
  ): void {
    const indent = '  '.repeat(depth);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (typeof item === 'string') {
        // Use markdown list syntax - check the actual enumerator output
        let bullet = '-'; // Default to bullet list
        if (config.enumerator) {
          const enumOutput = config.enumerator(0);
          // If enumerator produces numbers or letters, use numbered list
          if (/^\d+\./.test(enumOutput) || /^[a-zA-Z]\./.test(enumOutput) || /^[ivxlcdm]+\./.test(enumOutput.toLowerCase())) {
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
  export function getDimensions(config: ListConfig, options: ListRenderOptions = {}): {
    width: number;
    height: number;
    lines: number;
  } {
    const lines = renderToLines(config, options);
    const width = Math.max(...lines.map(line => stripAnsi(line).length));
    const height = lines.length;
    
    return {
      width,
      height,
      lines: lines.length
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
    options: ListRenderOptions = {}
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
    options: ListRenderOptions = {}
  ): string {
    const lines = renderToLines(config, options);
    const maxWidth = Math.max(...lines.map(line => stripAnsi(line).length));
    
    const topBorder = '┌' + '─'.repeat(maxWidth + 2) + '┐';
    const bottomBorder = '└' + '─'.repeat(maxWidth + 2) + '┘';
    
    const borderedLines = [
      topBorder,
      ...lines.map(line => `│ ${line.padEnd(maxWidth)} │`),
      bottomBorder
    ];
    
    return borderedLines.join('\n');
  }
}