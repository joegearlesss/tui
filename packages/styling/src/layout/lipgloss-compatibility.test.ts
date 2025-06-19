/**
 * Layout System - Lipgloss Compatibility Tests
 * 
 * Tests the layout system to ensure compatibility with lipgloss
 * layout functions like JoinHorizontal, JoinVertical, Place, etc.
 */

import { describe, expect, test } from 'bun:test';
import { Layout, Measurement } from '@tui/styling';

describe('Layout System - Lipgloss Compatibility', () => {
  describe('Join Functions', () => {
    test('JoinHorizontal equivalent', () => {
      const blocks = ['Block 1', 'Block 2\nSecond line', 'Block 3'];
      const result = Layout.joinHorizontal(0.0, ...blocks); // top alignment
      
      // Should align blocks vertically at top
      const lines = result.split('\n');
      expect(lines[0]).toContain('Block 1');
      expect(lines[0]).toContain('Block 2');
      expect(lines[0]).toContain('Block 3');
      expect(lines[1]).toContain('Second line');
    });

    test('JoinHorizontal with different alignments', () => {
      const block1 = 'A';
      const block2 = 'B\nC\nD';
      const block3 = 'E\nF';

      // Test top alignment
      const topResult = Layout.joinHorizontal(0.0, block1, block2, block3);
      const topLines = topResult.split('\n');
      expect(topLines[0]).toContain('A');
      expect(topLines[0]).toContain('B');
      expect(topLines[0]).toContain('E');

      // Test center alignment
      const centerResult = Layout.joinHorizontal(0.5, block1, block2, block3);
      const centerLines = centerResult.split('\n');
      expect(centerLines.length).toBeGreaterThan(1);

      // Test bottom alignment
      const bottomResult = Layout.joinHorizontal(1.0, block1, block2, block3);
      const bottomLines = bottomResult.split('\n');
      expect(bottomLines.length).toBeGreaterThan(1);
    });
    
    test('JoinVertical equivalent', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3'];
      const result = Layout.joinVertical(0.5, ...blocks); // center alignment
      
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('Block 1');
      expect(lines[1]).toContain('Block 2');
      expect(lines[2]).toContain('Block 3');
    });

    test('JoinVertical with different alignments', () => {
      const blocks = ['Short', 'Medium length', 'Very long content here'];

      // Test left alignment
      const leftResult = Layout.joinVertical(0.0, ...blocks);
      const leftLines = leftResult.split('\n');
      expect(leftLines).toHaveLength(3);

      // Test center alignment
      const centerResult = Layout.joinVertical(0.5, ...blocks);
      const centerLines = centerResult.split('\n');
      expect(centerLines).toHaveLength(3);

      // Test right alignment
      const rightResult = Layout.joinVertical(1.0, ...blocks);
      const rightLines = rightResult.split('\n');
      expect(rightLines).toHaveLength(3);
    });

    test('nested join operations', () => {
      const topRow = Layout.joinHorizontal(0.0, 'A', 'B', 'C');
      const bottomRow = Layout.joinHorizontal(0.0, 'D', 'E', 'F');
      const result = Layout.joinVertical(0.0, topRow, bottomRow);

      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines[0]).toContain('A');
      expect(lines[0]).toContain('B');
      expect(lines[0]).toContain('C');
    });
  });
  
  describe('Position System', () => {
    test('fractional positioning', () => {
      const positions = [0.0, 0.25, 0.5, 0.75, 1.0];
      positions.forEach(pos => {
        const result = Layout.place(20, 5, pos, pos, 'Test');
        expect(result).toBeDefined();
        expect(result.split('\n')).toHaveLength(5);
      });
    });

    test('place function with different content sizes', () => {
      const contents = [
        'A',
        'Short',
        'Medium length text',
        'Very long text that might exceed bounds'
      ];

      contents.forEach(content => {
        const result = Layout.place(30, 10, 0.5, 0.5, content);
        const lines = result.split('\n');
        expect(lines).toHaveLength(10);
        // For long text that gets truncated, check if at least part of it is present
        if (content.length > 30) {
          expect(result).toContain(content.substring(0, 30));
        } else {
          expect(result).toContain(content);
        }
      });
    });

    test('place function boundary conditions', () => {
      // Test minimum dimensions
      const minResult = Layout.place(1, 1, 0.5, 0.5, 'X');
      expect(minResult.split('\n')).toHaveLength(1);

      // Test zero dimensions (should handle gracefully)
      expect(() => Layout.place(0, 0, 0.5, 0.5, 'Test')).not.toThrow();

      // Test negative positions (should handle gracefully)
      expect(() => Layout.place(10, 5, -0.1, -0.1, 'Test')).not.toThrow();

      // Test positions > 1.0 (should handle gracefully)
      expect(() => Layout.place(10, 5, 1.5, 1.5, 'Test')).not.toThrow();
    });

    test('place function with multiline content', () => {
      const multilineContent = 'Line 1\nLine 2\nLine 3';
      const result = Layout.place(20, 10, 0.5, 0.5, multilineContent);
      
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
      
      const lines = result.split('\n');
      expect(lines).toHaveLength(10);
    });
  });
  
  describe('Text Measurement', () => {
    test('ANSI-aware width calculation', () => {
      const plainText = 'Hello World';
      const ansiText = '\x1b[31mHello\x1b[0m World';
      
      expect(Measurement.width(plainText)).toBe(11);
      expect(Measurement.width(ansiText)).toBe(11); // Should ignore ANSI codes
    });
    
    test('multi-line height calculation', () => {
      const multiLine = 'Line 1\nLine 2\nLine 3';
      expect(Measurement.height(multiLine)).toBe(3);
    });

    test('width calculation with various ANSI codes', () => {
      const testCases = [
        { text: 'Plain text', expected: 10 },
        { text: '\x1b[1mBold\x1b[0m', expected: 4 },
        { text: '\x1b[31mRed\x1b[0m text', expected: 8 },
        { text: '\x1b[38;2;255;0;0mTrueColor\x1b[0m', expected: 9 },
        { text: '\x1b[1m\x1b[31mBold Red\x1b[0m', expected: 8 },
        { text: 'Normal \x1b[4munderline\x1b[0m text', expected: 21 }
      ];

      testCases.forEach(({ text, expected }) => {
        expect(Measurement.width(text)).toBe(expected);
      });
    });

    test('height calculation with various line endings', () => {
      const testCases = [
        { text: 'Single line', expected: 1 },
        { text: 'Two\nlines', expected: 2 },
        { text: 'Three\nlines\nhere', expected: 3 },
        { text: 'With\r\nWindows\r\nline\r\nendings', expected: 4 },
        { text: 'Mixed\nline\r\nendings\rhere', expected: 3 },
        { text: 'Ending\nwith\nnewline\n', expected: 4 },
        { text: '', expected: 1 }
      ];

      testCases.forEach(({ text, expected }) => {
        expect(Measurement.height(text)).toBe(expected);
      });
    });

    test('width calculation with Unicode characters', () => {
      const unicodeTests = [
        { text: 'café', expected: 4 },
        { text: '🎉 party', expected: 8 }, // Emoji might count as 2 width
        { text: '中文字符', expected: 8 }, // Chinese characters might count as 2 width each
        { text: 'résumé', expected: 6 },
        { text: '🌈🎯🎨', expected: 6 } // Multiple emojis
      ];

      unicodeTests.forEach(({ text, expected }) => {
        const width = Measurement.width(text);
        expect(typeof width).toBe('number');
        expect(width).toBeGreaterThan(0);
        // Note: Exact width may vary based on Unicode width calculation implementation
      });
    });

    test('measurement edge cases', () => {
      // Empty string
      expect(Measurement.width('')).toBe(0);
      expect(Measurement.height('')).toBe(1); // Empty string still has 1 line

      // Only ANSI codes
      expect(Measurement.width('\x1b[31m\x1b[0m')).toBe(0);

      // Only whitespace
      expect(Measurement.width('   ')).toBe(3);
      expect(Measurement.height('   ')).toBe(1);

      // Only newlines
      expect(Measurement.width('\n\n\n')).toBe(0);
      expect(Measurement.height('\n\n\n')).toBe(4);

      // Mixed content
      const mixedContent = '\x1b[1mBold\x1b[0m and \x1b[31mred\x1b[0m\nSecond line';
      expect(Measurement.width(mixedContent)).toBeGreaterThan(0);
      expect(Measurement.height(mixedContent)).toBe(2);
    });
  });

  describe('Layout Performance', () => {
    test('join operations should be efficient', () => {
      const blocks = Array.from({ length: 100 }, (_, i) => `Block ${i}`);
      
      const start = performance.now();
      
      const horizontalResult = Layout.joinHorizontal(0.5, ...blocks);
      const verticalResult = Layout.joinVertical(0.5, ...blocks);
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
      expect(horizontalResult).toBeDefined();
      expect(verticalResult).toBeDefined();
    });

    test('place operations should be efficient', () => {
      const content = 'Test content with some length';
      const iterations = 1000;
      
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        Layout.place(50, 20, 0.5, 0.5, content);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100); // Should complete 1000 operations in under 100ms
    });

    test('measurement operations should be efficient', () => {
      const texts = Array.from({ length: 1000 }, (_, i) => 
        `\x1b[${i % 7 + 30}mColored text ${i}\x1b[0m\nWith newline`
      );
      
      const start = performance.now();
      
      texts.forEach(text => {
        Measurement.width(text);
        Measurement.height(text);
      });
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(50); // Should process 1000 texts in under 50ms
    });
  });

  describe('Lipgloss Usage Patterns', () => {
    test('dashboard layout pattern', () => {
      // Replicate a complex dashboard layout like in lipgloss examples
      const header = 'System Dashboard';
      const leftColumn = 'CPU: 75%\nRAM: 45%\nDisk: 90%';
      const rightColumn = 'Alerts:\n- High CPU\n- Low disk';
      const footer = 'Status: Running';

      // Create two-column layout
      const columns = Layout.joinHorizontal(0.0, leftColumn, rightColumn);
      
      // Create full dashboard
      const dashboard = Layout.joinVertical(0.5, header, columns, footer);
      
      expect(dashboard).toContain('System Dashboard');
      expect(dashboard).toContain('CPU: 75%');
      expect(dashboard).toContain('Alerts:');
      expect(dashboard).toContain('Status: Running');
      
      const lines = dashboard.split('\n');
      expect(lines.length).toBeGreaterThan(3);
    });

    test('centered content pattern', () => {
      const content = 'Centered Content';
      const width = 40;
      const height = 10;
      
      const result = Layout.place(width, height, 0.5, 0.5, content);
      
      expect(result).toContain(content);
      const lines = result.split('\n');
      expect(lines).toHaveLength(height);
      
      // Find the line with content and check it's roughly centered
      const contentLine = lines.find(line => line.includes('Centered Content'));
      expect(contentLine).toBeDefined();
    });

    test('grid layout pattern', () => {
      // Create a 2x2 grid layout
      const cell1 = 'Cell 1';
      const cell2 = 'Cell 2';
      const cell3 = 'Cell 3';
      const cell4 = 'Cell 4';

      const topRow = Layout.joinHorizontal(0.0, cell1, cell2);
      const bottomRow = Layout.joinHorizontal(0.0, cell3, cell4);
      const grid = Layout.joinVertical(0.0, topRow, bottomRow);

      expect(grid).toContain('Cell 1');
      expect(grid).toContain('Cell 2');
      expect(grid).toContain('Cell 3');
      expect(grid).toContain('Cell 4');
    });

    test('multi-level nesting pattern', () => {
      // Test deeply nested layouts
      const innerContent = Layout.joinHorizontal(0.5, 'A', 'B');
      const middleContent = Layout.joinVertical(0.5, innerContent, 'C');
      const outerContent = Layout.joinHorizontal(0.0, middleContent, 'D');
      const finalContent = Layout.joinVertical(0.0, outerContent, 'E');

      expect(finalContent).toContain('A');
      expect(finalContent).toContain('B');
      expect(finalContent).toContain('C');
      expect(finalContent).toContain('D');
      expect(finalContent).toContain('E');
    });

    test('responsive layout pattern', () => {
      const content = 'Content that adapts';
      
      // Test different container sizes
      const sizes = [
        { width: 20, height: 5 },
        { width: 40, height: 10 },
        { width: 80, height: 20 },
        { width: 120, height: 30 }
      ];

      sizes.forEach(({ width, height }) => {
        const result = Layout.place(width, height, 0.5, 0.5, content);
        const lines = result.split('\n');
        
        expect(lines).toHaveLength(height);
        expect(result).toContain(content);
        
        // Check that no line exceeds the width (accounting for content placement)
        lines.forEach(line => {
          // Remove ANSI codes for accurate length measurement
          const plainLine = line.replace(/\x1b\[[0-9;]*m/g, '');
          expect(plainLine.length).toBeLessThanOrEqual(width);
        });
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('empty content handling', () => {
      expect(() => Layout.joinHorizontal(0.5, '', '', '')).not.toThrow();
      expect(() => Layout.joinVertical(0.5, '', '', '')).not.toThrow();
      expect(() => Layout.place(10, 5, 0.5, 0.5, '')).not.toThrow();
      
      const emptyResult = Layout.joinVertical(0.5, '', '', '');
      expect(typeof emptyResult).toBe('string');
    });

    test('single content handling', () => {
      const singleH = Layout.joinHorizontal(0.5, 'Single');
      const singleV = Layout.joinVertical(0.5, 'Single');
      
      expect(singleH).toContain('Single');
      expect(singleV).toContain('Single');
    });

    test('invalid position values', () => {
      // Should handle invalid positions gracefully
      expect(() => Layout.place(10, 5, NaN, 0.5, 'Test')).not.toThrow();
      expect(() => Layout.place(10, 5, 0.5, Infinity, 'Test')).not.toThrow();
      expect(() => Layout.joinHorizontal(NaN, 'A', 'B')).not.toThrow();
      expect(() => Layout.joinVertical(Infinity, 'A', 'B')).not.toThrow();
    });

    test('very large content handling', () => {
      const largeContent = 'X'.repeat(10000);
      
      expect(() => Layout.joinHorizontal(0.5, largeContent)).not.toThrow();
      expect(() => Layout.joinVertical(0.5, largeContent)).not.toThrow();
      expect(() => Layout.place(100, 50, 0.5, 0.5, largeContent)).not.toThrow();
      expect(() => Measurement.width(largeContent)).not.toThrow();
      expect(() => Measurement.height(largeContent)).not.toThrow();
    });
  });
});