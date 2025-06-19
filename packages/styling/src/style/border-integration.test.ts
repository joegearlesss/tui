/**
 * Border Integration Tests with Style System
 * 
 * Tests the integration between BorderRender and StyleBuilder systems
 * to ensure lipgloss compatibility for border styling.
 */

import { describe, expect, test } from 'bun:test';
import { Border, StyleBuilder } from '@tui/styling';

describe('Border Integration with Style System', () => {
  describe('StyleBuilder border methods', () => {
    test('should support border() method', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .build();
      
      expect(style.border).toBeDefined();
      expect(style.border?.type).toBe('rounded');
      expect(style.border?.chars.topLeft).toBe('╭');
      expect(style.border?.chars.topRight).toBe('╮');
    });

    test('should support borderForeground() method', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .borderForeground('#FF0000')
        .build();
      
      expect(style.border).toBeDefined();
      expect(style.borderForeground).toBe('#FF0000');
    });

    test('should support borderBackground() method', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .borderBackground('#00FF00')
        .build();
      
      expect(style.border).toBeDefined();
      expect(style.borderBackground).toBe('#00FF00');
    });

    test('should support per-side border foreground colors', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .borderTopForeground('#FF0000')
        .borderRightForeground('#00FF00')
        .borderBottomForeground('#0000FF')
        .borderLeftForeground('#FFFF00')
        .build();
      
      expect(style.borderTopForeground).toBe('#FF0000');
      expect(style.borderRightForeground).toBe('#00FF00');
      expect(style.borderBottomForeground).toBe('#0000FF');
      expect(style.borderLeftForeground).toBe('#FFFF00');
    });

    test('should support per-side border background colors', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .borderTopBackground('#FF0000')
        .borderRightBackground('#00FF00')
        .borderBottomBackground('#0000FF')
        .borderLeftBackground('#FFFF00')
        .build();
      
      expect(style.borderTopBackground).toBe('#FF0000');
      expect(style.borderRightBackground).toBe('#00FF00');
      expect(style.borderBottomBackground).toBe('#0000FF');
      expect(style.borderLeftBackground).toBe('#FFFF00');
    });

    test('should support method chaining for border styling', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground('#FFFFFF')
        .borderBackground('#000000')
        .borderTopForeground('#FF0000')
        .padding(1)
        .margin(2)
        .build();
      
      expect(style.border?.type).toBe('rounded');
      expect(style.borderForeground).toBe('#FFFFFF');
      expect(style.borderBackground).toBe('#000000');
      expect(style.borderTopForeground).toBe('#FF0000');
      expect(style.padding?.top).toBe(1);
      expect(style.margin?.top).toBe(2);
    });

    test('should support unsetBorder() method', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground('#FFFFFF')
        .borderTopBackground('#FF0000')
        .unsetBorder()
        .build();
      
      expect(style.border).toBeUndefined();
      expect(style.borderForeground).toBeUndefined();
      expect(style.borderTopBackground).toBeUndefined();
    });
  });

  describe('Border rendering integration', () => {
    test('should render content with border', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .build();
      
      const result = StyleBuilder.from(style).render('Hello');
      
      // Should contain border characters
      expect(result).toContain('╭');
      expect(result).toContain('╮');
      expect(result).toContain('╰');
      expect(result).toContain('╯');
      expect(result).toContain('Hello');
    });

    test('should render border with padding', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .build();
      
      const result = StyleBuilder.from(style).render('Test');
      
      // Should contain border characters and proper spacing
      expect(result).toContain('┌');
      expect(result).toContain('┐');
      expect(result).toContain('└');
      expect(result).toContain('┘');
      expect(result).toContain('Test');
      
      // Should have multiple lines due to padding
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    test('should render different border types correctly', () => {
      const borderTypes = [
        { border: Border.normal(), expected: '┌' },
        { border: Border.rounded(), expected: '╭' },
        { border: Border.thick(), expected: '┏' },
        { border: Border.double(), expected: '╔' }
      ];

      borderTypes.forEach(({ border, expected }) => {
        const style = StyleBuilder.create()
          .border(border)
          .build();
        
        const result = StyleBuilder.from(style).render('Test');
        expect(result).toContain(expected);
      });
    });

    test('should handle multiline content with borders', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .build();
      
      const result = StyleBuilder.from(style).render('Line 1\nLine 2\nLine 3');
      
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(3); // Should have border lines + content lines
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    test('should render empty content with border', () => {
      const style = StyleBuilder.create()
        .border(Border.normal())
        .build();
      
      const result = StyleBuilder.from(style).render('');
      
      // Should still render border even with empty content
      expect(result).toContain('┌');
      expect(result).toContain('┐');
      expect(result).toContain('└');
      expect(result).toContain('┘');
    });
  });

  describe('Lipgloss compatibility patterns', () => {
    test('should support color standalone example pattern', () => {
      // Replicating pattern from color standalone example
      const frameStyle = StyleBuilder.create()
        .foreground('#C5ADF9')
        .border(Border.rounded())
        .padding(1, 3)
        .margin(1, 3)
        .build();
      
      const result = StyleBuilder.from(frameStyle).render('Test content');
      
      expect(result).toContain('╭');
      expect(result).toContain('╯');
      expect(result).toContain('Test content');
      // Should contain ANSI color codes
      expect(result).toMatch(/\x1b\[[0-9;]*m/);
    });

    test('should support style composition with borders', () => {
      const baseStyle = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .build();
      
      const composedStyle = StyleBuilder.from(baseStyle)
        .borderForeground('#FF0000')
        .foreground('#FFFFFF')
        .background('#000000')
        .build();
      
      expect(composedStyle.border?.type).toBe('normal');
      expect(composedStyle.borderForeground).toBe('#FF0000');
      expect(composedStyle.foreground).toBe('#FFFFFF');
      expect(composedStyle.background).toBe('#000000');
      expect(composedStyle.padding?.top).toBe(1);
    });

    test('should support border inheritance patterns', () => {
      const parentStyle = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground('#FF0000')
        .padding(2)
        .build();
      
      const childStyle = StyleBuilder.create()
        .foreground('#FFFFFF')
        .inherit(parentStyle)
        .build();
      
      // Child should inherit border properties from parent
      expect(childStyle.border?.type).toBe('rounded');
      expect(childStyle.borderForeground).toBe('#FF0000');
      expect(childStyle.padding?.top).toBe(2);
      expect(childStyle.foreground).toBe('#FFFFFF');
    });
  });

  describe('Performance considerations', () => {
    test('should handle multiple border renders efficiently', () => {
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .padding(1)
        .build();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        StyleBuilder.from(style).render(`Content ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 renders in reasonable time
      expect(duration).toBeLessThan(50); // 50ms threshold
    });

    test('should handle complex border configurations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const style = StyleBuilder.create()
          .border(Border.rounded())
          .borderForeground(`#FF${i.toString(16).padStart(4, '0')}`)
          .borderTopBackground('#FF0000')
          .borderRightBackground('#00FF00')
          .borderBottomBackground('#0000FF')
          .borderLeftBackground('#FFFF00')
          .padding(1, 2)
          .margin(1)
          .build();
        
        StyleBuilder.from(style).render(`Test content ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle complex configurations efficiently
      expect(duration).toBeLessThan(100); // 100ms threshold
    });
  });
});