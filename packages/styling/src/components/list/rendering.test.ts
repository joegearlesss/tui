import { describe, expect, test } from 'bun:test';
import { ListRenderer } from './rendering';
import type { ListConfig, ListRenderOptions } from './types';

const createSimpleList = (): ListConfig => ({
  items: ['Item 1', 'Item 2', 'Item 3'],
  enumerator: (i) => `${i + 1}.`,
  hidden: false,
  indentLevel: 0,
  indentString: '  ',
  showEnumerators: true,
  enumeratorSpacing: 1,
});

const createNestedList = (): ListConfig => {
  const nestedConfig: ListConfig = {
    items: ['Nested A', 'Nested B'],
    enumerator: (i) => `${String.fromCharCode(97 + i)})`,
    hidden: false,
    indentLevel: 1,
    indentString: '  ',
    showEnumerators: true,
    enumeratorSpacing: 1,
  };

  return {
    items: ['Top 1', nestedConfig, 'Top 2'],
    enumerator: (i) => `${i + 1}.`,
    hidden: false,
    indentLevel: 0,
    indentString: '  ',
    showEnumerators: true,
    enumeratorSpacing: 1,
  };
};

describe('ListRenderer.render', () => {
  test('renders simple list with enumerators', () => {
    const list = createSimpleList();
    const result = ListRenderer.render(list);
    
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('1. Item 1');
    expect(lines[1]).toBe('2. Item 2');
    expect(lines[2]).toBe('3. Item 3');
  });

  test('renders list without enumerators', () => {
    const list: ListConfig = {
      ...createSimpleList(),
      enumerator: () => '', // Empty enumerator
    };
    const result = ListRenderer.render(list);
    
    const lines = result.split('\n');
    expect(lines[0]).toBe('Item 1');
    expect(lines[1]).toBe('Item 2');
    expect(lines[2]).toBe('Item 3');
  });

  test('renders nested lists', () => {
    const list = createNestedList();
    const result = ListRenderer.render(list);
    
    const lines = result.split('\n');
    expect(lines).toContain('1. Top 1');
    expect(lines).toContain('2.');
    expect(lines).toContain('3. Top 2');
    expect(lines.some(line => line.includes('Nested A'))).toBe(true);
    expect(lines.some(line => line.includes('Nested B'))).toBe(true);
  });

  test('applies item styling when enabled', () => {
    const list: ListConfig = {
      ...createSimpleList(),
      itemStyle: (text) => `**${text}**`,
    };
    const result = ListRenderer.render(list);
    
    expect(result).toContain('**Item 1**');
    expect(result).toContain('**Item 2**');
  });

  test('applies enumerator styling when enabled', () => {
    const list: ListConfig = {
      ...createSimpleList(),
      enumeratorStyle: (text) => `[${text}]`,
    };
    const result = ListRenderer.render(list);
    
    expect(result).toContain('[1.]');
    expect(result).toContain('[2.]');
  });

  test('handles text wrapping with maxWidth', () => {
    const list: ListConfig = {
      items: ['This is a very long item that should be wrapped'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
      maxWidth: 20,
    };
    const result = ListRenderer.render(list);
    
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });

  test('adds spacing between items', () => {
    const list: ListConfig = {
      ...createSimpleList(),
      spacing: 1,
    };
    const result = ListRenderer.render(list);
    
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(3); // Should have empty lines
    expect(lines.some(line => line === '')).toBe(true);
  });

  test('respects render options', () => {
    const list = createSimpleList();
    const options: ListRenderOptions = {
      applyItemStyling: false,
      applyEnumeratorStyling: false,
      maxDepth: 2,
      indentPerLevel: 4,
      renderHidden: false,
    };
    
    const result = ListRenderer.render(list, options);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('ListRenderer.renderToLines', () => {
  test('returns array of lines', () => {
    const list = createSimpleList();
    const lines = ListRenderer.renderToLines(list);
    
    expect(Array.isArray(lines)).toBe(true);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('1. Item 1');
  });
});

describe('ListRenderer.renderWithSeparator', () => {
  test('uses custom separator', () => {
    const list = createSimpleList();
    const result = ListRenderer.renderWithSeparator(list, ' | ');
    
    expect(result).toContain(' | ');
    expect(result.split(' | ')).toHaveLength(3);
  });

  test('uses default separator when not specified', () => {
    const list = createSimpleList();
    const result = ListRenderer.renderWithSeparator(list);
    
    expect(result).toContain('\n');
  });
});

describe('ListRenderer.renderToMarkdown', () => {
  test('renders bullet list in markdown format', () => {
    const list: ListConfig = {
      items: ['Item 1', 'Item 2'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const result = ListRenderer.renderToMarkdown(list);
    
    expect(result).toContain('- Item 1');
    expect(result).toContain('- Item 2');
  });

  test('renders numbered list in markdown format', () => {
    const list = createSimpleList();
    const result = ListRenderer.renderToMarkdown(list);
    
    expect(result).toContain('1. Item 1');
    expect(result).toContain('1. Item 2');
  });

  test('handles nested lists in markdown', () => {
    const nestedConfig: ListConfig = {
      items: ['Nested item'],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 1,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    const list: ListConfig = {
      items: ['Top item', nestedConfig],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };

    const result = ListRenderer.renderToMarkdown(list);
    expect(result).toContain('1. Top item');
    expect(result).toContain('  - Nested item');
  });
});

describe('ListRenderer.getDimensions', () => {
  test('calculates correct dimensions', () => {
    const list = createSimpleList();
    const dimensions = ListRenderer.getDimensions(list);
    
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBe(3);
    expect(dimensions.lines).toBe(3);
  });

  test('handles empty list', () => {
    const list: ListConfig = {
      items: [],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const dimensions = ListRenderer.getDimensions(list);
    
    expect(dimensions.width).toBe(0);
    expect(dimensions.height).toBe(0);
    expect(dimensions.lines).toBe(0);
  });

  test('accounts for ANSI sequences in width calculation', () => {
    const list: ListConfig = {
      items: ['\x1b[31mRed text\x1b[0m'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const dimensions = ListRenderer.getDimensions(list);
    
    // Width should not include ANSI escape sequences
    expect(dimensions.width).toBeLessThan(20); // Less than the full string with ANSI
  });
});

describe('ListRenderer.renderWithLineNumbers', () => {
  test('adds line numbers to output', () => {
    const list = createSimpleList();
    const result = ListRenderer.renderWithLineNumbers(list);
    
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^1: /);
    expect(lines[1]).toMatch(/^2: /);
    expect(lines[2]).toMatch(/^3: /);
  });

  test('pads line numbers correctly', () => {
    const list: ListConfig = {
      items: Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`),
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const result = ListRenderer.renderWithLineNumbers(list);
    
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^ 1: /); // Padded with space
    expect(lines[9]).toMatch(/^10: /); // No padding needed
  });
});

describe('ListRenderer.renderWithBorder', () => {
  test('adds border around list', () => {
    const list = createSimpleList();
    const result = ListRenderer.renderWithBorder(list);
    
    const lines = result.split('\n');
    expect(lines[0]).toMatch(/^┌─+┐$/); // Top border
    expect(lines[lines.length - 1]).toMatch(/^└─+┘$/); // Bottom border
    expect(lines[1]).toMatch(/^│.*│$/); // Side borders
  });

  test('handles empty list with border', () => {
    const list: ListConfig = {
      items: [],
      enumerator: () => '•',
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const result = ListRenderer.renderWithBorder(list);
    
    expect(result).toBe('┌──┐\n└──┘');
  });

  test('adjusts border width to content', () => {
    const list: ListConfig = {
      items: ['Short', 'This is a much longer item'],
      enumerator: (i) => `${i + 1}.`,
      hidden: false,
      indentLevel: 0,
      indentString: '  ',
      showEnumerators: true,
      enumeratorSpacing: 1,
    };
    const result = ListRenderer.renderWithBorder(list);
    
    const lines = result.split('\n');
    const topBorder = lines[0];
    const bottomBorder = lines[lines.length - 1];
    
    expect(topBorder?.length).toBe(bottomBorder?.length);
    expect(topBorder?.length).toBeGreaterThan(20); // Should be wide enough for longest item
  });
});