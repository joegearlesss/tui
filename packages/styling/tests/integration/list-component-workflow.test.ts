import { describe, test, expect } from 'bun:test';
import { List } from '../../src/components/list/operations';
import { StyleBuilder } from '../../src/style/style';
import { Color } from '../../src/color/color';
import { ANSI } from '../../src/ansi/ansi';
import { Layout } from '../../src/layout/joining';

/**
 * Integration tests for List component workflows
 * Tests end-to-end functionality including creation, styling, and rendering
 */
describe('List Component Integration', () => {
  describe('Basic List Workflow', () => {
    test('creates, styles, and renders a simple list', () => {
      // Create a basic list
      const list = List.create(['Task 1', 'Task 2', 'Task 3']);
      
      // Apply enumeration
      const numberedList = List.withEnumerator(list, List.Enumerator.ARABIC);
      
      // Render the list
      const rendered = List.render(numberedList);
      
      expect(rendered).toContain('1. Task 1');
      expect(rendered).toContain('2. Task 2');
      expect(rendered).toContain('3. Task 3');
    });

    test('creates nested lists with different enumerators', () => {
      // Create nested structure
      const mainList = List.create([
        'Main item 1',
        List.withEnumerator(
          List.create(['Sub item 1', 'Sub item 2']),
          List.Enumerator.ALPHA_LOWER
        ),
        'Main item 2'
      ]);

      const withMainEnumerator = List.withEnumerator(mainList, List.Enumerator.ARABIC);
      const rendered = List.render(withMainEnumerator);

      expect(rendered).toContain('1. Main item 1');
      expect(rendered).toContain('a. Sub item 1');
      expect(rendered).toContain('b. Sub item 2');
      expect(rendered).toContain('3. Main item 2'); // Note: nested list counts as one item
    });
  });

  describe('Styled List Workflow', () => {
    test('applies colors and styling to list items', () => {
      const list = List.create(['Success', 'Warning', 'Error']);
      
      // Apply different styles based on content
      const styledList = List.withItemStyle(list, (text: string) => {
        if (text === 'Success') {
          return StyleBuilder.create().foreground(Color.parseHex('#00FF00')!).render(text);
        }
        if (text === 'Warning') {
          return StyleBuilder.create().foreground(Color.parseHex('#FFFF00')!).render(text);
        }
        if (text === 'Error') {
          return StyleBuilder.create().foreground(Color.parseHex('#FF0000')!).render(text);
        }
        return text;
      });

      const rendered = List.render(styledList);
      
      // In test environment, colors are disabled, so check content structure
      expect(rendered).toContain('Success');
      expect(rendered).toContain('Success');
      expect(rendered).toContain('Warning');
      expect(rendered).toContain('Error');
    });

    test('applies enumeration styling separate from item styling', () => {
      const list = List.create(['Item 1', 'Item 2']);
      
      const styledList = List.withEnumeratorStyle(
        List.withEnumerator(list, List.Enumerator.ARABIC),
        (text: string) => StyleBuilder.create().foreground(Color.parseHex('#0000FF')!).render(text)
      );

      const rendered = List.render(styledList);
      
      expect(rendered).toContain('Item 1');
      expect(rendered).toContain('Item 2');
      // Should have proper enumeration
      expect(rendered).toContain('1.');
      expect(rendered).toContain('2.');
    });
  });

  describe('Advanced List Operations', () => {
    test('creates todo list with operations workflow', () => {
      // Start with empty list
      let todoList = List.create();
      
      // Add items incrementally
      todoList = List.append(todoList, 'Buy groceries');
      todoList = List.append(todoList, 'Walk the dog');
      todoList = List.prepend(todoList, 'Wake up');
      
      // Insert urgent task
      todoList = List.insert(todoList, 1, 'Check emails');
      
      // Apply checkbox enumerator
      const checkboxList = List.withEnumerator(todoList, (index: number) => '☐');
      
      const rendered = List.render(checkboxList);
      
      expect(rendered).toContain('☐ Wake up');
      expect(rendered).toContain('☐ Check emails');
      expect(rendered).toContain('☐ Buy groceries');
      expect(rendered).toContain('☐ Walk the dog');
      
      // Should be in correct order
      const lines = rendered.split('\n').filter(line => line.trim());
      expect(lines[0]).toContain('Wake up');
      expect(lines[1]).toContain('Check emails');
      expect(lines[2]).toContain('Buy groceries');
      expect(lines[3]).toContain('Walk the dog');
    });

    test('filters and maps list items', () => {
      const taskList = List.create([
        'TODO: Implement feature',
        'DONE: Fix bug',
        'TODO: Write tests',
        'DONE: Update docs'
      ]);

      // Filter only TODO items
      const todoItems = List.filter(taskList, (item) => 
        typeof item === 'string' && item.startsWith('TODO:')
      );

      // Map to remove TODO prefix
      const cleanedItems = List.map(todoItems, (item) =>
        typeof item === 'string' ? item.replace('TODO: ', '') : item
      );

      const rendered = List.render(cleanedItems);
      
      expect(rendered).toContain('Implement feature');
      expect(rendered).toContain('Write tests');
      expect(rendered).not.toContain('Fix bug');
      expect(rendered).not.toContain('Update docs');
      expect(rendered).not.toContain('TODO:');
    });
  });

  describe('Layout Integration', () => {
    test('combines multiple lists with layout joining', () => {
      const list1 = List.withEnumerator(
        List.create(['Apple', 'Banana']),
        List.Enumerator.BULLET
      );
      
      const list2 = List.withEnumerator(
        List.create(['Car', 'Bike']),
        List.Enumerator.DASH
      );

      const rendered1 = List.render(list1);
      const rendered2 = List.render(list2);

      // Join horizontally
      const combined = Layout.joinHorizontal('top', rendered1, '  |  ', rendered2);
      
      expect(combined).toContain('Apple');
      expect(combined).toContain('Car');
      expect(combined).toContain('|');
      
      // Should have items side by side
      const lines = combined.split('\n');
      expect(lines[0]).toContain('Apple');
      expect(lines[0]).toContain('Car');
    });
  });

  describe('Depth-Aware Enumerators', () => {
    test('creates hierarchical list with depth-aware styling', () => {
      // Create depth-aware enumerator
      const depthEnumerator = List.Enumerator.depthAware([
        List.Enumerator.ARABIC,           // Level 0: 1., 2., 3.
        List.Enumerator.ALPHA_LOWER,      // Level 1: a., b., c.  
        List.Enumerator.ROMAN_LOWER       // Level 2: i., ii., iii.
      ]);

      // Create nested structure manually to test depth awareness
      const nestedList = List.create([
        'Chapter 1',
        List.withEnumerator(
          List.create([
            'Section A',
            List.withEnumerator(
              List.create(['Subsection I', 'Subsection II']),
              (index: number) => depthEnumerator(index, 2) // Force depth 2
            ),
            'Section B'
          ]),
          (index: number) => depthEnumerator(index, 1) // Force depth 1
        ),
        'Chapter 2'
      ]);

      const withTopLevel = List.withEnumerator(
        nestedList, 
        (index: number) => depthEnumerator(index, 0) // Force depth 0
      );

      const rendered = List.render(withTopLevel);
      
      expect(rendered).toContain('1. Chapter 1');
      expect(rendered).toContain('a. Section A');
      expect(rendered).toContain('i. Subsection I');
      expect(rendered).toContain('ii. Subsection II');
      expect(rendered).toContain('c. Section B');
      expect(rendered).toContain('3. Chapter 2');
    });
  });

  describe('Error Handling Integration', () => {
    test('handles validation errors gracefully', () => {
      // Test with invalid configuration
      expect(() => {
        List.Enumerator.cycle([]); // Empty array should throw
      }).toThrow('Cycle enumerator requires at least one symbol');

      // Test bounds checking
      const list = List.create(['Item 1', 'Item 2']);
      expect(() => {
        List.insert(list, -1, 'Invalid'); // Negative index
      }).toThrow('Index -1 is out of bounds');

      expect(() => {
        List.insert(list, 10, 'Invalid'); // Out of bounds
      }).toThrow('Index 10 is out of bounds');
    });
  });

  describe('Performance Integration', () => {
    test('handles large lists efficiently', () => {
      // Create a large list
      const largeItems = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);
      const largeList = List.create(largeItems);
      
      const start = performance.now();
      
      // Apply operations
      const processed = List.withEnumerator(largeList, List.Enumerator.ARABIC);
      const rendered = List.render(processed);
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second max
      
      // Verify content is correct
      expect(rendered).toContain('1. Item 1');
      expect(rendered).toContain('1000. Item 1000');
      
      // Count lines to ensure all items rendered
      const lines = rendered.split('\n').filter(line => line.trim());
      expect(lines).toHaveLength(1000);
    });
  });

  describe('ANSI Integration', () => {
    test('properly handles ANSI codes in list content', () => {
      // Create list with pre-styled content
      const styledItems = [
        ANSI.wrap('Red text', ANSI.foreground({ hex: '#FF0000' })),
        ANSI.wrap('Blue text', ANSI.foreground({ hex: '#0000FF' })),
        'Normal text'
      ];

      const list = List.create(styledItems);
      const rendered = List.render(list);

      // Should preserve content structure
      expect(rendered.split('\n').length).toBeGreaterThan(2);
      expect(rendered).toContain('Red text');
      expect(rendered).toContain('Blue text');
      expect(rendered).toContain('Normal text');

      // Calculate display width (without ANSI codes)
      const displayWidth = ANSI.width(rendered);
      expect(displayWidth).toBeGreaterThan(0);
    });
  });
});