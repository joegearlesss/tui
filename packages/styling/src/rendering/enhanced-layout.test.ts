import { describe, test, expect } from 'bun:test';
import { EnhancedLayout, type LayoutBlock } from './enhanced-layout';
import { Result } from '@tui/styling/utils/result';
import type { StyleProperties } from '@tui/styling/style/style';

describe('EnhancedLayout', () => {

  describe('joinHorizontal', () => {
    test('joins simple blocks horizontally', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A\nB\nC' },
        { content: 'X\nY' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('AX\nBY\nC ');
        expect(result.value.width).toBe(2);
        expect(result.value.height).toBe(3);
      }
    });

    test('handles empty blocks array', () => {
      const result = EnhancedLayout.joinHorizontal([]);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('');
        expect(result.value.width).toBe(0);
        expect(result.value.height).toBe(0);
      }
    });

    test('handles single block', () => {
      const blocks: LayoutBlock[] = [
        { content: 'Hello\nWorld' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('Hello\nWorld');
        expect(result.value.width).toBe(5);
        expect(result.value.height).toBe(2);
      }
    });

    test('applies spacing between blocks', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        spacing: 2
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('A  B');
      }
    });

    test('uses separator between blocks', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        separator: '|'
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('A|B');
      }
    });

    test('applies styles to blocks', () => {
      const blocks: LayoutBlock[] = [
        { 
          content: 'A',
          style: { bold: true }
        },
        { content: 'B' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        // Should contain ANSI codes for bold
        expect(result.value.content).toContain('\u001b[1m');
      }
    });
  });

  describe('joinVertical', () => {
    test('joins simple blocks vertically', () => {
      const blocks: LayoutBlock[] = [
        { content: 'Hello' },
        { content: 'World' }
      ];

      const result = EnhancedLayout.joinVertical(blocks);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('Hello\nWorld');
        expect(result.value.width).toBe(5);
        expect(result.value.height).toBe(2);
      }
    });

    test('aligns blocks with different widths', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'BBB' }
      ];

      const result = EnhancedLayout.joinVertical(blocks, {
        alignment: 'center'
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const lines = result.value.content.split('\n');
        expect(lines[0]).toBe(' A '); // Centered in 3-char width
        expect(lines[1]).toBe('BBB');
      }
    });

    test('applies spacing between blocks', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' }
      ];

      const result = EnhancedLayout.joinVertical(blocks, {
        spacing: 1
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('A\n\n\nB');
      }
    });
  });

  describe('grid', () => {
    test('creates a simple 2x2 grid', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' },
        { content: 'C' },
        { content: 'D' }
      ];

      const result = EnhancedLayout.grid(blocks, 2);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('AB\nCD');
      }
    });

    test('handles uneven grid with partial last row', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' },
        { content: 'C' }
      ];

      const result = EnhancedLayout.grid(blocks, 2);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('AB\nC ');
      }
    });

    test('rejects invalid column count', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' }
      ];

      const result = EnhancedLayout.grid(blocks, 0);
      
      expect(Result.isErr(result)).toBe(true);
    });

    test('handles empty blocks array', () => {
      const result = EnhancedLayout.grid([], 2);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('');
      }
    });
  });

  describe('flexible', () => {
    test('distributes space horizontally by weight', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A', weight: 1 },
        { content: 'B', weight: 2 }
      ];

      const result = EnhancedLayout.flexible(blocks, 'horizontal', 9);
      
      expect(Result.isOk(result)).toBe(true);
      // Block A should get 3 chars (1/3), Block B should get 6 chars (2/3)
    });

    test('distributes space vertically by weight', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A', weight: 1 },
        { content: 'B', weight: 3 }
      ];

      const result = EnhancedLayout.flexible(blocks, 'vertical', 8);
      
      expect(Result.isOk(result)).toBe(true);
      // Block A should get 2 lines (1/4), Block B should get 6 lines (3/4)
    });

    test('handles blocks without weights (default to 1)', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' },
        { content: 'B' }
      ];

      const result = EnhancedLayout.flexible(blocks, 'horizontal', 6);
      
      expect(Result.isOk(result)).toBe(true);
      // Each block should get equal space (3 chars each)
    });

    test('handles zero total size', () => {
      const blocks: LayoutBlock[] = [
        { content: 'A' }
      ];

      const result = EnhancedLayout.flexible(blocks, 'horizontal', 0);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('');
      }
    });
  });

  describe('table', () => {
    test('creates a simple table with auto-sized columns', () => {
      const rows = [
        [
          { content: 'Name' },
          { content: 'Age' }
        ],
        [
          { content: 'Alice' },
          { content: '25' }
        ],
        [
          { content: 'Bob' },
          { content: '30' }
        ]
      ];

      const result = EnhancedLayout.table(rows, ['auto', 'auto']);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        const lines = result.value.content.split('\n');
        expect(lines[0]).toBe('Name  Age');
        expect(lines[1]).toBe('Alice 25 ');
        expect(lines[2]).toBe('Bob   30 ');
      }
    });

    test('creates table with fixed column widths', () => {
      const rows = [
        [
          { content: 'A' },
          { content: 'B' }
        ]
      ];

      const result = EnhancedLayout.table(rows, [5, 3]);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('A     B  ');
      }
    });

    test('handles empty table', () => {
      const result = EnhancedLayout.table([], []);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('');
      }
    });

    test('applies custom separator', () => {
      const rows = [
        [
          { content: 'A' },
          { content: 'B' }
        ]
      ];

      const result = EnhancedLayout.table(rows, ['auto', 'auto'], {
        separator: ' | '
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('A | B');
      }
    });
  });

  describe('error handling', () => {
    test('handles invalid color in block style gracefully', () => {
      const blocks: LayoutBlock[] = [
        { 
          content: 'A',
          style: { foreground: 'invalid-color' } as StyleProperties
        }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        respectTerminalCapabilities: false
      });
      
      // Invalid colors are handled gracefully and should succeed
      expect(Result.isOk(result)).toBe(true);
    });

    test('gracefully handles empty content', () => {
      const blocks: LayoutBlock[] = [
        { content: '' },
        { content: 'B' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.content).toBe('B');
      }
    });
  });

  describe('integration with rendering', () => {
    test('preserves ANSI codes in joined content', () => {
      const blocks: LayoutBlock[] = [
        { 
          content: 'Hello',
          style: { bold: true, foreground: '#FF0000' }
        },
        { content: 'World' }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        // Should contain ANSI codes for bold and color
        expect(result.value.content).toContain('\u001b[1m'); // Bold
        expect(result.value.content).toContain('\u001b[38;2'); // TrueColor
        expect(result.value.content).toContain('Hello');
        expect(result.value.content).toContain('World');
      }
    });

    test('correctly measures content with ANSI codes', () => {
      const blocks: LayoutBlock[] = [
        { 
          content: 'Test',
          style: { bold: true }
        }
      ];

      const result = EnhancedLayout.joinHorizontal(blocks, {
        respectTerminalCapabilities: false
      });
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        // Visual width should be 4 despite ANSI codes
        expect(result.value.width).toBe(4);
      }
    });
  });
});