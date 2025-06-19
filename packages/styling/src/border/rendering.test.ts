import { describe, expect, test } from 'bun:test';
import { BorderRender, type BorderRenderOptions, type BorderDimensions } from './rendering';
import type { BorderConfig } from './types';

const createTestBorder = (): BorderConfig => ({
  type: 'normal',
  chars: {
    top: '─',
    right: '│',
    bottom: '─',
    left: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
  },
  sides: [true, true, true, true],
});

const createPartialBorder = (): BorderConfig => ({
  type: 'normal',
  chars: {
    top: '─',
    right: '│',
    bottom: '─',
    left: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
  },
  sides: [true, false, true, false], // Only top and bottom
});

describe('BorderRender.render', () => {
  test('renders simple border around single line content', () => {
    const border = createTestBorder();
    const content = 'Hello';
    const result = BorderRender.render(border, content);

    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('┌─────┐');
    expect(lines[1]).toBe('│Hello│');
    expect(lines[2]).toBe('└─────┘');
  });

  test('renders border around multi-line content', () => {
    const border = createTestBorder();
    const content = 'Line 1\nLine 2';
    const result = BorderRender.render(border, content);

    const lines = result.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('┌──────┐');
    expect(lines[1]).toBe('│Line 1│');
    expect(lines[2]).toBe('│Line 2│');
    expect(lines[3]).toBe('└──────┘');
  });

  test('renders border with padding', () => {
    const border = createTestBorder();
    const content = 'Test';
    const options: BorderRenderOptions = { padding: 1 };
    const result = BorderRender.render(border, content, options);

    const lines = result.split('\n');
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe('┌──────┐');
    expect(lines[1]).toBe('│      │');
    expect(lines[2]).toBe('│ Test │');
    expect(lines[3]).toBe('│      │');
    expect(lines[4]).toBe('└──────┘');
  });

  test('renders border with minimum dimensions', () => {
    const border = createTestBorder();
    const content = 'Hi';
    const options: BorderRenderOptions = { minWidth: 10, minHeight: 3 };
    const result = BorderRender.render(border, content, options);

    const lines = result.split('\n');
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe('┌──────────┐');
    expect(lines[1]).toBe('│Hi        │');
    expect(lines[2]).toBe('│          │');
    expect(lines[3]).toBe('│          │');
    expect(lines[4]).toBe('└──────────┘');
  });

  test('renders partial border (only top and bottom)', () => {
    const border = createPartialBorder();
    const content = 'Test';
    const result = BorderRender.render(border, content);

    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('────');
    expect(lines[1]).toBe('Test');
    expect(lines[2]).toBe('────');
  });

  test('trims content when requested', () => {
    const border = createTestBorder();
    const content = '  Trimmed  ';
    const options: BorderRenderOptions = { trimContent: true };
    const result = BorderRender.render(border, content, options);

    const lines = result.split('\n');
    expect(lines[1]).toBe('│Trimmed│');
  });

  test('handles empty content', () => {
    const border = createTestBorder();
    const content = '';
    const result = BorderRender.render(border, content);

    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('┌┐');
    expect(lines[1]).toBe('││');
    expect(lines[2]).toBe('└┘');
  });
});

describe('BorderRender.calculateDimensions', () => {
  test('calculates dimensions for simple content', () => {
    const border = createTestBorder();
    const contentLines = ['Hello', 'World'];
    const dimensions = BorderRender.calculateDimensions(border, contentLines);

    expect(dimensions.contentWidth).toBe(5);
    expect(dimensions.contentHeight).toBe(2);
    expect(dimensions.totalWidth).toBe(7); // 5 + 2 borders
    expect(dimensions.totalHeight).toBe(4); // 2 + 2 borders
    expect(dimensions.hasTop).toBe(true);
    expect(dimensions.hasRight).toBe(true);
    expect(dimensions.hasBottom).toBe(true);
    expect(dimensions.hasLeft).toBe(true);
  });

  test('calculates dimensions with padding', () => {
    const border = createTestBorder();
    const contentLines = ['Test'];
    const dimensions = BorderRender.calculateDimensions(border, contentLines, 0, 0, 2);

    expect(dimensions.contentWidth).toBe(8); // 4 + 4 padding
    expect(dimensions.contentHeight).toBe(5); // 1 + 4 padding
    expect(dimensions.totalWidth).toBe(10); // 8 + 2 borders
    expect(dimensions.totalHeight).toBe(7); // 5 + 2 borders
  });

  test('calculates dimensions with minimum sizes', () => {
    const border = createTestBorder();
    const contentLines = ['Hi'];
    const dimensions = BorderRender.calculateDimensions(border, contentLines, 10, 5);

    expect(dimensions.contentWidth).toBe(10);
    expect(dimensions.contentHeight).toBe(5);
    expect(dimensions.totalWidth).toBe(12);
    expect(dimensions.totalHeight).toBe(7);
  });

  test('calculates dimensions for partial border', () => {
    const border = createPartialBorder();
    const contentLines = ['Test'];
    const dimensions = BorderRender.calculateDimensions(border, contentLines);

    expect(dimensions.contentWidth).toBe(4);
    expect(dimensions.contentHeight).toBe(1);
    expect(dimensions.totalWidth).toBe(4); // No left/right borders
    expect(dimensions.totalHeight).toBe(3); // 1 + 2 borders (top/bottom)
    expect(dimensions.hasTop).toBe(true);
    expect(dimensions.hasRight).toBe(false);
    expect(dimensions.hasBottom).toBe(true);
    expect(dimensions.hasLeft).toBe(false);
  });
});

describe('BorderRender.box', () => {
  test('creates simple box', () => {
    const border = createTestBorder();
    const content = 'Boxed';
    const result = BorderRender.box(border, content);

    expect(result).toContain('┌─────┐');
    expect(result).toContain('│Boxed│');
    expect(result).toContain('└─────┘');
  });
});

describe('BorderRender.boxWithPadding', () => {
  test('creates box with padding', () => {
    const border = createTestBorder();
    const content = 'Test';
    const result = BorderRender.boxWithPadding(border, content, 1);

    const lines = result.split('\n');
    expect(lines[2]).toBe('│ Test │');
  });
});

describe('BorderRender.boxWithMinSize', () => {
  test('creates box with minimum size', () => {
    const border = createTestBorder();
    const content = 'Hi';
    const result = BorderRender.boxWithMinSize(border, content, 8, 3);

    const lines = result.split('\n');
    expect(lines[0]).toBe('┌────────┐');
    expect(lines).toHaveLength(5); // 3 content + 2 borders
  });
});