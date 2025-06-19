/**
 * Layout Joining and Measurement Tests
 */

import { describe, test, expect } from 'bun:test';
import { Layout, Measurement } from './joining';

describe('Layout', () => {
  describe('joinHorizontal', () => {
    test('should join blocks horizontally with top alignment', () => {
      const block1 = 'A\nB\nC';
      const block2 = 'X\nY';
      
      const result = Layout.joinHorizontal('top', block1, block2);
      expect(result).toBe('AX\nBY\nC');
    });

    test('should join blocks horizontally with bottom alignment', () => {
      const block1 = 'A\nB\nC';
      const block2 = 'X\nY';
      
      const result = Layout.joinHorizontal('bottom', block1, block2);
      expect(result).toBe('A\nBX\nCY');
    });

    test('should join blocks horizontally with middle alignment', () => {
      const block1 = 'A\nB\nC\nD\nE';
      const block2 = 'X\nY\nZ';
      
      const result = Layout.joinHorizontal('middle', block1, block2);
      expect(result).toBe('A\nBX\nCY\nDZ\nE');
    });

    test('should handle numeric alignment values', () => {
      const block1 = 'A\nB\nC';
      const block2 = 'X';
      
      const result = Layout.joinHorizontal(0.5, block1, block2);
      expect(result).toBe('A\nBX\nC');
    });

    test('should handle empty blocks', () => {
      expect(Layout.joinHorizontal('top')).toBe('');
      expect(Layout.joinHorizontal('top', 'A')).toBe('A');
    });

    test('should handle single line blocks', () => {
      const result = Layout.joinHorizontal('top', 'Hello', ' ', 'World');
      expect(result).toBe('Hello World');
    });
  });

  describe('joinVertical', () => {
    test('should join blocks vertically with left alignment', () => {
      const block1 = 'ABC';
      const block2 = 'XY';
      
      const result = Layout.joinVertical('left', block1, block2);
      expect(result).toBe('ABC\nXY ');
    });

    test('should join blocks vertically with right alignment', () => {
      const block1 = 'ABC';
      const block2 = 'XY';
      
      const result = Layout.joinVertical('right', block1, block2);
      expect(result).toBe('ABC\n XY');
    });

    test('should join blocks vertically with center alignment', () => {
      const block1 = 'ABCDE';
      const block2 = 'XY';
      
      const result = Layout.joinVertical('center', block1, block2);
      expect(result).toBe('ABCDE\n XY  ');
    });

    test('should handle numeric alignment values', () => {
      const block1 = 'ABCD';
      const block2 = 'XY';
      
      const result = Layout.joinVertical(0.5, block1, block2);
      expect(result).toBe('ABCD\n XY ');
    });

    test('should handle multiline blocks', () => {
      const block1 = 'A\nBC';
      const block2 = 'XYZ';
      
      const result = Layout.joinVertical('left', block1, block2);
      expect(result).toBe('A  \nBC \nXYZ');
    });

    test('should handle empty blocks', () => {
      expect(Layout.joinVertical('left')).toBe('');
      expect(Layout.joinVertical('left', 'A')).toBe('A');
    });
  });

  describe('place', () => {
    test('should place content in top-left corner', () => {
      const result = Layout.place(5, 3, 'left', 'top', 'Hi');
      expect(result).toBe('Hi   \n     \n     ');
    });

    test('should place content in center', () => {
      const result = Layout.place(5, 3, 'center', 'middle', 'Hi');
      expect(result).toBe('     \n Hi  \n     ');
    });

    test('should place content in bottom-right corner', () => {
      const result = Layout.place(5, 3, 'right', 'bottom', 'Hi');
      expect(result).toBe('     \n     \n   Hi');
    });

    test('should handle numeric alignment values', () => {
      const result = Layout.place(5, 3, 0.5, 0.5, 'Hi');
      expect(result).toBe('     \n Hi  \n     ');
    });

    test('should handle multiline content', () => {
      const result = Layout.place(5, 4, 'center', 'middle', 'A\nB');
      expect(result).toBe('     \n  A  \n  B  \n     ');
    });

    test('should handle content larger than container', () => {
      const result = Layout.place(3, 2, 'left', 'top', 'Hello\nWorld');
      expect(result).toBe('Hel\nWor');
    });

    test('should handle zero dimensions', () => {
      expect(Layout.place(0, 0, 'left', 'top', 'Hi')).toBe('');
      expect(Layout.place(5, 0, 'left', 'top', 'Hi')).toBe('');
      expect(Layout.place(0, 3, 'left', 'top', 'Hi')).toBe('');
    });
  });
});

describe('Measurement', () => {
  describe('width', () => {
    test('should calculate width of single line text', () => {
      expect(Measurement.width('Hello')).toBe(5);
      expect(Measurement.width('')).toBe(0);
    });

    test('should calculate width of multiline text', () => {
      expect(Measurement.width('Hello\nWorld')).toBe(5);
      expect(Measurement.width('A\nLonger\nB')).toBe(6);
    });

    test('should ignore ANSI escape sequences', () => {
      expect(Measurement.width('\x1b[1mBold\x1b[0m')).toBe(4);
      expect(Measurement.width('\x1b[31mRed\x1b[0m Text')).toBe(8);
    });
  });

  describe('height', () => {
    test('should calculate height of text', () => {
      expect(Measurement.height('Hello')).toBe(1);
      expect(Measurement.height('Hello\nWorld')).toBe(2);
      expect(Measurement.height('A\nB\nC\nD')).toBe(4);
      expect(Measurement.height('')).toBe(1);
    });
  });

  describe('size', () => {
    test('should calculate both width and height', () => {
      expect(Measurement.size('Hello')).toEqual([5, 1]);
      expect(Measurement.size('Hello\nWorld')).toEqual([5, 2]);
      expect(Measurement.size('A\nLonger\nB')).toEqual([6, 3]);
      expect(Measurement.size('')).toEqual([0, 1]);
    });

    test('should handle ANSI sequences in size calculation', () => {
      expect(Measurement.size('\x1b[1mBold\x1b[0m\nText')).toEqual([4, 2]);
    });
  });
});

describe('Layout integration', () => {
  test('should work with complex layout composition', () => {
    const header = 'HEADER';
    const content = 'Content\nLine 2';
    const footer = 'Footer';
    
    const layout = Layout.joinVertical(
      'center',
      header,
      content,
      footer
    );
    
    expect(layout).toBe('HEADER \nContent\nLine 2 \nFooter ');
  });

  test('should work with nested layouts', () => {
    const left = 'L1\nL2';
    const right = 'R1\nR2';
    
    const horizontal = Layout.joinHorizontal('top', left, right);
    const final = Layout.joinVertical('center', 'Title', horizontal);
    
    expect(final).toBe('Title\nL1R1 \nL2R2 ');
  });

  test('should work with placement and joining', () => {
    const content = Layout.place(6, 3, 'center', 'middle', 'Hi');
    const bordered = Layout.joinVertical('left', '------', content, '------');
    
    expect(bordered).toBe('------\n      \n  Hi  \n      \n------');
  });
});