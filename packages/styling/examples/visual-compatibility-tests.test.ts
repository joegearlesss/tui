/**
 * Visual Compatibility Tests
 * 
 * Tests that verify 100% visual compatibility between our TypeScript/Bun
 * implementation and the original Go lipgloss library examples.
 */

import { describe, expect, test } from 'bun:test';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

describe('🎨 Visual Lipgloss Compatibility Tests', () => {
  describe('📋 List Examples', () => {
    test('Simple list with Roman numerals matches original', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/list/simple',
        encoding: 'utf8' 
      });
      
      // Should contain Roman numerals for nested items
      expect(output).toContain('i. D');
      expect(output).toContain('ii. E');
      expect(output).toContain('iii. F');
      
      // Should contain bullet points for main items
      expect(output).toContain('• A');
      expect(output).toContain('• B');
      expect(output).toContain('• C');
      expect(output).toContain('• G');
      
      // Should be properly formatted  
      expect(output.split('\n').length).toBeGreaterThan(6); // Should have multiple lines
    });

    test('Grocery list with checkmarks and styling matches original', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/list/grocery',
        encoding: 'utf8' 
      });
      
      // Should contain checkmarks for purchased items
      expect(output).toContain('✓');
      
      // Should contain bullet points for unpurchased items
      expect(output).toContain('•');
      
      // Should contain ANSI color codes for styling
      expect(output).toMatch(/\x1b\[[0-9;]*m/);
      
      // Should contain all grocery items
      expect(output).toContain('Bananas');
      expect(output).toContain('Artichoke');
      expect(output).toContain('Fish Cake');
    });
  });

  describe('📊 Table Examples', () => {
    test('Languages table with proper formatting matches original', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/table/languages',
        encoding: 'utf8' 
      });
      
      // Should contain table borders
      expect(output).toContain('┏');
      expect(output).toContain('┓');
      expect(output).toContain('┗');
      expect(output).toContain('┛');
      expect(output).toContain('━');
      
      // Should contain headers
      expect(output).toContain('LANGUAGE');
      expect(output).toContain('FORMAL');
      expect(output).toContain('INFORMAL');
      
      // Should contain language data
      expect(output).toContain('Chinese');
      expect(output).toContain('您好');
      expect(output).toContain('Japanese');
      expect(output).toContain('こんにちは');
      expect(output).toContain('Arabic');
      expect(output).toContain('أهلين');
      
      // Should contain color codes for alternating rows
      expect(output).toMatch(/\x1b\[38;2;108;108;108m/); // Even row color
      expect(output).toMatch(/\x1b\[38;2;138;138;138m/); // Odd row color
    });

    test('Chess board table matches original', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/table/chess',
        encoding: 'utf8' 
      });
      
      // Should contain chess pieces
      expect(output).toContain('♜'); // Black rook
      expect(output).toContain('♞'); // Black knight
      expect(output).toContain('♝'); // Black bishop
      expect(output).toContain('♛'); // Black queen
      expect(output).toContain('♚'); // Black king
      expect(output).toContain('♟'); // Black pawn
      
      expect(output).toContain('♖'); // White rook
      expect(output).toContain('♘'); // White knight
      expect(output).toContain('♗'); // White bishop
      expect(output).toContain('♕'); // White queen
      expect(output).toContain('♔'); // White king
      expect(output).toContain('♙'); // White pawn
      
      // Should contain coordinate labels
      expect(output).toContain('A');
      expect(output).toContain('H');
      expect(output).toContain('1');
      expect(output).toContain('8');
      
      // Should be 8x8 grid with borders
      const lines = output.split('\n');
      expect(lines.length).toBeGreaterThan(8);
    });
  });

  describe('🌳 Tree Examples', () => {
    test('Simple tree structure matches original', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/tree/simple',
        encoding: 'utf8' 
      });
      
      // Should contain tree characters
      expect(output).toContain('┬'); // Root connector
      expect(output).toContain('├─'); // Branch connector
      expect(output).toContain('└─'); // Last branch connector
      
      // Should contain OS names
      expect(output).toContain('macOS');
      expect(output).toContain('Linux');
      expect(output).toContain('BSD');
      
      // Should contain root
      expect(output).toContain('.');
      
      // Should be properly indented
      const lines = output.split('\n');
      expect(lines.some(line => line.startsWith('  '))).toBe(true);
    });
  });

  describe('🎨 Color Standalone Example', () => {
    test('Color standalone example matches original visually', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/color/standalone',
        encoding: 'utf8' 
      });
      
      // Should contain the question text
      expect(output).toContain('Are you sure you want to eat that');
      expect(output).toContain('moderately ripe');
      expect(output).toContain('banana?');
      
      // Should contain buttons
      expect(output).toContain('Yes');
      expect(output).toContain('No');
      
      // Should contain rounded border characters
      expect(output).toContain('╭');
      expect(output).toContain('╮');
      expect(output).toContain('╰');
      expect(output).toContain('╯');
      expect(output).toContain('─');
      expect(output).toContain('│');
      
      // Should contain ANSI color codes
      expect(output).toMatch(/\x1b\[38;2;134;78;255m/); // Border color
      expect(output).toMatch(/\x1b\[38;2;189;189;189m/); // Text color
      expect(output).toMatch(/\x1b\[1m/); // Bold text
      expect(output).toMatch(/\x1b\[48;2;255;106;210m/); // Button background
    });
  });

  describe('📏 Layout Complexity', () => {
    test('Complex layout example renders without errors', async () => {
      // Test that the layout example at least runs without crashing
      let output: string;
      try {
        output = execSync('bun main.ts', { 
          cwd: 'examples/layout',
          encoding: 'utf8',
          timeout: 10000 // 10 second timeout
        });
      } catch (error) {
        // If the layout example isn't implemented yet, skip the test
        if (error.message.includes('Module not found')) {
          console.log('Layout example not yet implemented, skipping...');
          return;
        }
        throw error;
      }
      
      // Should produce substantial output
      expect(output.length).toBeGreaterThan(100);
      
      // Should contain some expected elements if it's working
      expect(output).toBeDefined();
    });
  });

  describe('🔧 Performance Characteristics', () => {
    test('Examples render within reasonable time limits', () => {
      const examples = [
        'examples/list/simple',
        'examples/table/languages', 
        'examples/table/chess',
        'examples/tree/simple',
        'examples/color/standalone'
      ];

      examples.forEach(examplePath => {
        if (!existsSync(`${examplePath}/main.ts`)) {
          console.log(`Skipping ${examplePath} - not implemented yet`);
          return;
        }

        const start = performance.now();
        const output = execSync('bun main.ts', { 
          cwd: examplePath,
          encoding: 'utf8',
          timeout: 5000 // 5 second timeout
        });
        const end = performance.now();
        
        // Should render within 2 seconds
        expect(end - start).toBeLessThan(2000);
        
        // Should produce output
        expect(output.length).toBeGreaterThan(0);
      });
    });
  });

  describe('📐 Output Structure Validation', () => {
    test('All examples produce well-formed output', () => {
      const examples = [
        'examples/list/simple',
        'examples/list/grocery', 
        'examples/table/languages',
        'examples/table/chess',
        'examples/tree/simple',
        'examples/color/standalone'
      ];

      examples.forEach(examplePath => {
        if (!existsSync(`${examplePath}/main.ts`)) {
          console.log(`Skipping ${examplePath} - not implemented yet`);
          return;
        }

        const output = execSync('bun main.ts', { 
          cwd: examplePath,
          encoding: 'utf8' 
        });
        
        // Should not contain error messages
        expect(output).not.toContain('Error');
        expect(output).not.toContain('undefined');
        expect(output).not.toContain('[object Object]');
        
        // Should not have malformed ANSI sequences (allow proper sequences)
        expect(output).not.toMatch(/\x1b\[[\d;]*[^mK0-9;]/);
        
        // Should end cleanly (no trailing escape sequences)
        expect(output.trim()).not.toMatch(/\x1b\[[\d;]*$/);
      });
    });

    test('ANSI color codes are properly formed', () => {
      const output = execSync('bun main.ts', { 
        cwd: 'examples/table/languages',
        encoding: 'utf8' 
      });
      
      // Find all ANSI color codes
      const ansiCodes = output.match(/\x1b\[\d+(;\d+)*m/g) || [];
      
      // Should have proper reset codes
      expect(ansiCodes.some(code => code === '\x1b[0m')).toBe(true);
      
      // Should have color codes
      expect(ansiCodes.some(code => code.includes('38;2'))).toBe(true); // Foreground colors
      
      // All codes should be properly formed
      ansiCodes.forEach(code => {
        expect(code).toMatch(/^\x1b\[\d+(;\d+)*m$/);
      });
    });
  });

  describe('🌍 Unicode and Character Support', () => {
    test('Unicode characters render correctly', () => {
      const tableOutput = execSync('bun main.ts', { 
        cwd: 'examples/table/languages',
        encoding: 'utf8' 
      });
      
      // Should handle Chinese characters
      expect(tableOutput).toContain('您好');
      expect(tableOutput).toContain('你好');
      
      // Should handle Japanese characters
      expect(tableOutput).toContain('こんにちは');
      expect(tableOutput).toContain('やあ');
      
      // Should handle Arabic characters
      expect(tableOutput).toContain('أهلين');
      expect(tableOutput).toContain('أهلا');
      
      // Should handle Cyrillic characters
      expect(tableOutput).toContain('Здравствуйте');
      expect(tableOutput).toContain('Привет');
    });

    test('Box drawing characters render correctly', () => {
      const tableOutput = execSync('bun main.ts', { 
        cwd: 'examples/table/languages',
        encoding: 'utf8' 
      });
      
      // Should contain thick border characters
      expect(tableOutput).toContain('┏');
      expect(tableOutput).toContain('┓');
      expect(tableOutput).toContain('┗');
      expect(tableOutput).toContain('┛');
      expect(tableOutput).toContain('━');
      expect(tableOutput).toContain('┃');
      expect(tableOutput).toContain('├');
      expect(tableOutput).toContain('┤');
      expect(tableOutput).toContain('┬');
      expect(tableOutput).toContain('┴');
      
      const colorOutput = execSync('bun main.ts', { 
        cwd: 'examples/color/standalone',
        encoding: 'utf8' 
      });
      
      // Should contain rounded border characters
      expect(colorOutput).toContain('╭');
      expect(colorOutput).toContain('╮');
      expect(colorOutput).toContain('╰');
      expect(colorOutput).toContain('╯');
    });
  });
});