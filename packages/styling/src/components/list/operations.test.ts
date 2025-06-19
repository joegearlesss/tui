import { describe, expect, it } from 'bun:test';
import { Enumerator, List, ListBuilder, ListRenderer } from './index';
import type { ListConfig, ListItem } from './types';

describe('List Component', () => {
  describe('List.create', () => {
    it('should create a basic list with strings', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);

      expect(list.items).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(list.enumerator!(0)).toBe('•'); // Test function result instead of reference
      expect(list.indent).toBe(0);
      expect(list.spacing).toBe(0);
    });

    it('should create a list with nested items', () => {
      const nested = List.create(['Nested 1', 'Nested 2']);
      const list = List.create(['Item 1', nested, 'Item 3']);

      expect(list.items).toHaveLength(3);
      expect(typeof list.items[0]).toBe('string');
      expect(typeof list.items[1]).toBe('object');
      expect(typeof list.items[2]).toBe('string');
    });

    it('should validate items during creation', () => {
      // Empty lists should be allowed
      expect(() => List.create([])).not.toThrow();
    });
  });

  describe('List.fromStrings', () => {
    it('should create a list from string array', () => {
      const list = List.fromStrings(['A', 'B', 'C']);

      expect(list.items).toEqual(['A', 'B', 'C']);
    });
  });

  describe('List.withEnumerator', () => {
    it('should set bullet enumerator', () => {
      const list = List.create(['Item 1']);
      const withEnum = List.withEnumerator(list, Enumerator.BULLET);

      expect(withEnum.enumerator!(0)).toBe('•');
    });

    it('should set arabic enumerator', () => {
      const list = List.create(['Item 1']);
      const withEnum = List.withEnumerator(list, Enumerator.ARABIC);

      expect(withEnum.enumerator!(0)).toBe('1.');
    });

    it('should set custom enumerator', () => {
      const customEnum = (index: number) => `[${index + 1}]`;
      const list = List.create(['Item 1']);
      const withEnum = List.withEnumerator(list, customEnum);

      expect(withEnum.enumerator!(0)).toBe('[1]');
    });
  });

  describe('List.withIndent', () => {
    it('should set indentation', () => {
      const list = List.create(['Item 1']);
      const withIndent = List.withIndent(list, 4);

      expect(withIndent.indent).toBe(4);
    });

    it('should validate indentation range', () => {
      const list = List.create(['Item 1']);

      expect(() => List.withIndent(list, -1)).toThrow();
      expect(() => List.withIndent(list, 21)).toThrow();
    });
  });

  describe('List.withSpacing', () => {
    it('should set spacing between items', () => {
      const list = List.create(['Item 1']);
      const withSpacing = List.withSpacing(list, 2);

      expect(withSpacing.spacing).toBe(2);
    });
  });

  describe('List.withItemStyle', () => {
    it('should set item style function', () => {
      const styleFunc = (text: string) => `**${text}**`;
      const list = List.create(['Item 1']);
      const withStyle = List.withItemStyle(list, styleFunc);

      expect(withStyle.itemStyle!('test')).toBe('**test**');
    });
  });

  describe('List.withEnumeratorStyle', () => {
    it('should set enumerator style function', () => {
      const styleFunc = (text: string) => `[${text}]`;
      const list = List.create(['Item 1']);
      const withStyle = List.withEnumeratorStyle(list, styleFunc);

      expect(withStyle.enumeratorStyle!('•')).toBe('[•]');
    });
  });

  describe('List.withMaxWidth', () => {
    it('should set maximum width', () => {
      const list = List.create(['Item 1']);
      const withWidth = List.withMaxWidth(list, 50);

      expect(withWidth.maxWidth).toBe(50);
    });
  });

  describe('List.append', () => {
    it('should append string item', () => {
      const list = List.create(['Item 1']);
      const appended = List.append(list, 'Item 2');

      expect(appended.items).toEqual(['Item 1', 'Item 2']);
    });

    it('should append nested list', () => {
      const list = List.create(['Item 1']);
      const nested = List.create(['Nested 1']);
      const appended = List.append(list, nested);

      expect(appended.items).toHaveLength(2);
      expect(typeof appended.items[1]).toBe('object');
    });
  });

  describe('List.prepend', () => {
    it('should prepend item', () => {
      const list = List.create(['Item 2']);
      const prepended = List.prepend(list, 'Item 1');

      expect(prepended.items).toEqual(['Item 1', 'Item 2']);
    });
  });

  describe('List.insert', () => {
    it('should insert item at index', () => {
      const list = List.create(['Item 1', 'Item 3']);
      const inserted = List.insert(list, 1, 'Item 2');

      expect(inserted.items).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });

    it('should throw on invalid index', () => {
      const list = List.create(['Item 1']);

      expect(() => List.insert(list, -1, 'Item')).toThrow();
      expect(() => List.insert(list, 2, 'Item')).toThrow();
    });
  });

  describe('List.remove', () => {
    it('should remove item at index', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);
      const removed = List.remove(list, 1);

      expect(removed.items).toEqual(['Item 1', 'Item 3']);
    });

    it('should throw on invalid index', () => {
      const list = List.create(['Item 1']);

      expect(() => List.remove(list, -1)).toThrow();
      expect(() => List.remove(list, 1)).toThrow();
    });
  });

  describe('List.replace', () => {
    it('should replace item at index', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);
      const replaced = List.replace(list, 1, 'New Item');

      expect(replaced.items).toEqual(['Item 1', 'New Item', 'Item 3']);
    });
  });

  describe('List.filter', () => {
    it('should filter string items', () => {
      const list = List.create(['Apple', 'Banana', 'Cherry']);
      const filtered = List.filter(
        list,
        (item) => typeof item === 'string' && item.startsWith('A')
      );

      expect(filtered.items).toEqual(['Apple']);
    });
  });

  describe('List.map', () => {
    it('should transform string items', () => {
      const list = List.create(['apple', 'banana']);
      const mapped = List.map(list, (item) =>
        typeof item === 'string' ? item.toUpperCase() : item
      );

      expect(mapped.items).toEqual(['APPLE', 'BANANA']);
    });
  });

  describe('List.concat', () => {
    it('should concatenate two lists', () => {
      const list1 = List.create(['Item 1', 'Item 2']);
      const list2 = List.create(['Item 3', 'Item 4']);
      const concatenated = List.concat(list1, list2);

      expect(concatenated.items).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
    });
  });

  describe('List.reverse', () => {
    it('should reverse item order', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);
      const reversed = List.reverse(list);

      expect(reversed.items).toEqual(['Item 3', 'Item 2', 'Item 1']);
    });
  });

  describe('List.length', () => {
    it('should return number of items', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);

      expect(List.length(list)).toBe(3);
    });
  });

  describe('List.isEmpty', () => {
    it('should return true for empty list', () => {
      const list = List.create(['Item 1']);
      const empty = List.filter(list, () => false);

      expect(List.isEmpty(empty)).toBe(true);
    });

    it('should return false for non-empty list', () => {
      const list = List.create(['Item 1']);

      expect(List.isEmpty(list)).toBe(false);
    });
  });

  describe('List.get', () => {
    it('should get item at index', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);

      expect(List.get(list, 0)).toBe('Item 1');
      expect(List.get(list, 1)).toBe('Item 2');
      expect(List.get(list, 2)).toBe('Item 3');
    });

    it('should return undefined for invalid index', () => {
      const list = List.create(['Item 1']);

      expect(List.get(list, -1)).toBeUndefined();
      expect(List.get(list, 1)).toBeUndefined();
    });
  });

  describe('List.indexOf', () => {
    it('should find index of string item', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);

      expect(List.indexOf(list, 'Item 2')).toBe(1);
    });

    it('should return -1 for non-existent item', () => {
      const list = List.create(['Item 1', 'Item 2']);

      expect(List.indexOf(list, 'Item 3')).toBe(-1);
    });
  });

  describe('List.contains', () => {
    it('should return true for existing item', () => {
      const list = List.create(['Item 1', 'Item 2']);

      expect(List.contains(list, 'Item 1')).toBe(true);
    });

    it('should return false for non-existing item', () => {
      const list = List.create(['Item 1', 'Item 2']);

      expect(List.contains(list, 'Item 3')).toBe(false);
    });
  });

  describe('List.calculateMetrics', () => {
    it('should calculate metrics for simple list', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);
      const metrics = List.calculateMetrics(list);

      expect(metrics.totalItems).toBe(3);
      expect(metrics.maxDepth).toBe(0);
      expect(metrics.totalLines).toBe(3);
      expect(metrics.maxItemWidth).toBe(6); // "Item 1".length
    });

    it('should calculate metrics for nested list', () => {
      const nested = List.create(['Nested 1', 'Nested 2']);
      const list = List.create(['Item 1', nested, 'Item 3']);
      const metrics = List.calculateMetrics(list);

      expect(metrics.totalItems).toBe(5); // 3 + 2 nested
      expect(metrics.maxDepth).toBe(1);
    });

    it('should account for spacing in metrics', () => {
      const list = List.withSpacing(List.create(['Item 1', 'Item 2']), 1);
      const metrics = List.calculateMetrics(list);

      expect(metrics.totalLines).toBe(3); // 2 items + 1 spacing line
    });
  });

  describe('List.flatten', () => {
    it('should flatten nested list to strings', () => {
      const nested = List.create(['Nested 1', 'Nested 2']);
      const list = List.create(['Item 1', nested, 'Item 3']);
      const flattened = List.flatten(list);

      expect(flattened).toEqual(['Item 1', 'Nested 1', 'Nested 2', 'Item 3']);
    });
  });

  describe('List.clone', () => {
    it('should create deep copy of list', () => {
      const original = List.create(['Item 1', 'Item 2']);
      const cloned = List.clone(original);

      expect(cloned.items).toEqual(original.items);
      expect(cloned.indent).toEqual(original.indent);
      expect(cloned.spacing).toEqual(original.spacing);
      expect(cloned).not.toBe(original);
      expect(cloned.items).not.toBe(original.items);
    });
  });
});

describe('Enumerator Functions', () => {
  describe('Basic Enumerators', () => {
    it('should generate bullet points', () => {
      expect(Enumerator.BULLET(0)).toBe('•');
      expect(Enumerator.BULLET(5)).toBe('•');
    });

    it('should generate dashes', () => {
      expect(Enumerator.DASH(0)).toBe('-');
      expect(Enumerator.DASH(5)).toBe('-');
    });

    it('should generate arabic numerals', () => {
      expect(Enumerator.ARABIC(0)).toBe('1.');
      expect(Enumerator.ARABIC(1)).toBe('2.');
      expect(Enumerator.ARABIC(9)).toBe('10.');
    });

    it('should generate lowercase letters', () => {
      expect(Enumerator.ALPHA_LOWER(0)).toBe('a.');
      expect(Enumerator.ALPHA_LOWER(1)).toBe('b.');
      expect(Enumerator.ALPHA_LOWER(25)).toBe('z.');
      expect(Enumerator.ALPHA_LOWER(26)).toBe('a.'); // Cycles back
    });

    it('should generate uppercase letters', () => {
      expect(Enumerator.ALPHA_UPPER(0)).toBe('A.');
      expect(Enumerator.ALPHA_UPPER(1)).toBe('B.');
      expect(Enumerator.ALPHA_UPPER(25)).toBe('Z.');
    });

    it('should generate roman numerals', () => {
      expect(Enumerator.ROMAN_LOWER(0)).toBe('i.');
      expect(Enumerator.ROMAN_LOWER(1)).toBe('ii.');
      expect(Enumerator.ROMAN_LOWER(2)).toBe('iii.');
      expect(Enumerator.ROMAN_LOWER(3)).toBe('iv.');
      expect(Enumerator.ROMAN_LOWER(4)).toBe('v.');
    });

    it('should generate uppercase roman numerals', () => {
      expect(Enumerator.ROMAN_UPPER(0)).toBe('I.');
      expect(Enumerator.ROMAN_UPPER(1)).toBe('II.');
      expect(Enumerator.ROMAN_UPPER(4)).toBe('V.');
      expect(Enumerator.ROMAN_UPPER(9)).toBe('X.');
    });
  });

  describe('Custom Enumerators', () => {
    it('should create cycling enumerator', () => {
      const cycler = Enumerator.cycle(['→', '⇒', '⟹']);

      expect(cycler(0)).toBe('→');
      expect(cycler(1)).toBe('⇒');
      expect(cycler(2)).toBe('⟹');
      expect(cycler(3)).toBe('→'); // Cycles back
    });

    it('should throw for empty cycle array', () => {
      expect(() => Enumerator.cycle([])).toThrow();
    });

    it('should create custom prefix/suffix enumerator', () => {
      const custom = Enumerator.custom('[', ']');

      expect(custom(0)).toBe('[1]');
      expect(custom(1)).toBe('[2]');
      expect(custom(9)).toBe('[10]');
    });

    it('should create depth-aware enumerator', () => {
      const depthAware = Enumerator.depthAware([
        Enumerator.ARABIC,
        Enumerator.ALPHA_LOWER,
        Enumerator.ROMAN_LOWER,
      ]);

      expect(depthAware(0, 0)).toBe('1.');
      expect(depthAware(0, 1)).toBe('a.');
      expect(depthAware(0, 2)).toBe('i.');
      expect(depthAware(0, 3)).toBe('1.'); // Cycles back
    });
  });
});

describe('ListBuilder', () => {
  describe('Creation', () => {
    it('should create builder with items', () => {
      const builder = ListBuilder.create(['Item 1', 'Item 2']);
      const config = builder.build();

      expect(config.items).toEqual(['Item 1', 'Item 2']);
    });

    it('should create builder from strings', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);
      const config = builder.build();

      expect(config.items).toEqual(['A', 'B', 'C']);
    });
  });

  describe('Fluent API', () => {
    it('should chain configuration methods', () => {
      const config = ListBuilder.fromStrings(['Item 1', 'Item 2'])
        .enumerator(Enumerator.ARABIC)
        .indent(4)
        .spacing(1)
        .build();

      expect(config.enumerator!(0)).toBe('1.');
      expect(config.indent).toBe(4);
      expect(config.spacing).toBe(1);
    });

    it('should chain item manipulation methods', () => {
      const config = ListBuilder.fromStrings(['Item 1']).append('Item 2').prepend('Item 0').build();

      expect(config.items).toEqual(['Item 0', 'Item 1', 'Item 2']);
    });

    it('should chain transformation methods', () => {
      const config = ListBuilder.fromStrings(['apple', 'banana', 'cherry'])
        .filter((item) => typeof item === 'string' && item.length > 5)
        .map((item) => (typeof item === 'string' ? item.toUpperCase() : item))
        .build();

      expect(config.items).toEqual(['BANANA', 'CHERRY']);
    });
  });

  describe('Query Methods', () => {
    it('should provide length', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);

      expect(builder.length()).toBe(3);
    });

    it('should check if empty', () => {
      const empty = ListBuilder.create([]).filter(() => false);
      const nonEmpty = ListBuilder.fromStrings(['A']);

      expect(empty.isEmpty()).toBe(true);
      expect(nonEmpty.isEmpty()).toBe(false);
    });

    it('should get items by index', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);

      expect(builder.getItem(0)).toBe('A');
      expect(builder.getItem(1)).toBe('B');
      expect(builder.getItem(3)).toBeUndefined();
    });

    it('should find item index', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);

      expect(builder.indexOf('B')).toBe(1);
      expect(builder.indexOf('D')).toBe(-1);
    });

    it('should check if contains item', () => {
      const builder = ListBuilder.fromStrings(['A', 'B', 'C']);

      expect(builder.contains('B')).toBe(true);
      expect(builder.contains('D')).toBe(false);
    });
  });

  describe('Metrics and Utilities', () => {
    it('should calculate metrics', () => {
      const builder = ListBuilder.fromStrings(['Item 1', 'Item 2', 'Item 3']);
      const metrics = builder.metrics();

      expect(metrics.totalItems).toBe(3);
      expect(metrics.maxDepth).toBe(0);
    });

    it('should flatten to strings', () => {
      const nested = List.create(['Nested 1', 'Nested 2']);
      const builder = ListBuilder.create(['Item 1', nested]);
      const flattened = builder.flatten();

      expect(flattened).toEqual(['Item 1', 'Nested 1', 'Nested 2']);
    });
  });
});

describe('ListRenderer', () => {
  describe('Basic Rendering', () => {
    it('should render simple list with bullets', () => {
      const list = List.create(['Item 1', 'Item 2', 'Item 3']);
      const rendered = ListRenderer.render(list);

      expect(rendered).toContain('• Item 1');
      expect(rendered).toContain('• Item 2');
      expect(rendered).toContain('• Item 3');
    });

    it('should render with arabic numerals', () => {
      const list = List.withEnumerator(
        List.create(['First', 'Second', 'Third']),
        Enumerator.ARABIC
      );
      const rendered = ListRenderer.render(list);

      expect(rendered).toContain('1. First');
      expect(rendered).toContain('2. Second');
      expect(rendered).toContain('3. Third');
    });

    it('should render with custom indentation', () => {
      const list = List.withIndent(List.create(['Item 1', 'Item 2']), 4);
      const rendered = ListRenderer.render(list);
      const lines = rendered.split('\n');

      expect(lines[0]).toMatch(/^ {4}• Item 1$/);
      expect(lines[1]).toMatch(/^ {4}• Item 2$/);
    });

    it('should render with spacing between items', () => {
      const list = List.withSpacing(List.create(['Item 1', 'Item 2']), 1);
      const rendered = ListRenderer.render(list);
      const lines = rendered.split('\n');

      expect(lines).toHaveLength(3); // 2 items + 1 spacing line
      expect(lines[1]).toBe(''); // Empty spacing line
    });
  });

  describe('Nested Rendering', () => {
    it('should render nested lists with proper indentation', () => {
      const nested = List.create(['Nested 1', 'Nested 2']);
      const list = List.create(['Item 1', nested, 'Item 3']);
      const rendered = ListRenderer.render(list);

      expect(rendered).toContain('• Item 1');
      expect(rendered).toContain('    • Nested 1');
      expect(rendered).toContain('    • Nested 2');
      expect(rendered).toContain('• Item 3');
    });

    it('should handle deeply nested lists', () => {
      const level2 = List.create(['Level 2']);
      const level1 = List.create(['Level 1', level2]);
      const root = List.create(['Root', level1]);
      const rendered = ListRenderer.render(root);

      expect(rendered).toContain('• Root');
      expect(rendered).toContain('    • Level 1');
      expect(rendered).toContain('        • Level 2');
    });
  });

  describe('Styling', () => {
    it('should apply item styling', () => {
      const list = List.withItemStyle(List.create(['Item 1', 'Item 2']), (text) => `**${text}**`);
      const rendered = ListRenderer.render(list);

      expect(rendered).toContain('• **Item 1**');
      expect(rendered).toContain('• **Item 2**');
    });

    it('should apply enumerator styling', () => {
      const list = List.withEnumeratorStyle(
        List.withEnumerator(List.create(['Item 1']), Enumerator.ARABIC),
        (enum_) => `[${enum_}]`
      );
      const rendered = ListRenderer.render(list);

      expect(rendered).toContain('[1.] Item 1');
    });
  });

  describe('Text Wrapping', () => {
    it('should wrap long text items', () => {
      const longText = 'This is a very long text item that should be wrapped when maxWidth is set';
      const list = List.withMaxWidth(List.create([longText]), 20);
      const rendered = ListRenderer.render(list);
      const lines = rendered.split('\n');

      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain('• This is a very long');
    });

    it('should handle wrapped text indentation', () => {
      const longText = 'This is a very long text item that should be wrapped';
      const list = List.withMaxWidth(List.create([longText]), 20);
      const rendered = ListRenderer.render(list);
      const lines = rendered.split('\n');

      // Second line should be indented to align with text (not enumerator)
      expect(lines[1]).toMatch(/^ {2}/); // Should start with spaces
    });
  });

  describe('Render Options', () => {
    it('should apply base indentation', () => {
      const list = List.create(['Item 1']);
      const rendered = ListRenderer.render(list, { baseIndent: 4 });

      expect(rendered).toMatch(/^ {4}• Item 1$/);
    });

    it('should handle ANSI option', () => {
      const list = List.create(['Item 1']);
      const withAnsi = ListRenderer.render(list, { includeAnsi: true });
      const withoutAnsi = ListRenderer.render(list, { includeAnsi: false });

      // Both should contain the basic text (ANSI handling is more complex)
      expect(withAnsi).toContain('• Item 1');
      expect(withoutAnsi).toContain('• Item 1');
    });
  });

  describe('Alternative Formats', () => {
    it('should render to lines array', () => {
      const list = List.create(['Item 1', 'Item 2']);
      const lines = ListRenderer.renderToLines(list);

      expect(lines).toEqual(['• Item 1', '• Item 2']);
    });

    it('should render with custom separator', () => {
      const list = List.create(['Item 1', 'Item 2']);
      const rendered = ListRenderer.renderWithSeparator(list, ' | ');

      expect(rendered).toBe('• Item 1 | • Item 2');
    });

    it('should render to HTML', () => {
      const list = List.create(['Item 1', 'Item 2']);
      const html = ListRenderer.renderToHtml(list);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    it('should render to Markdown', () => {
      const list = List.create(['Item 1', 'Item 2']);
      const markdown = ListRenderer.renderToMarkdown(list);

      expect(markdown).toContain('- Item 1');
      expect(markdown).toContain('- Item 2');
    });
  });

  describe('Utility Functions', () => {
    it('should calculate dimensions', () => {
      const list = List.create(['Short', 'Much longer item']);
      const dimensions = ListRenderer.getDimensions(list);

      expect(dimensions.lines).toBe(2);
      expect(dimensions.height).toBe(2);
      expect(dimensions.width).toBeGreaterThan(10);
    });

    it('should render with line numbers', () => {
      const list = List.create(['Item 1', 'Item 2']);
      const numbered = ListRenderer.renderWithLineNumbers(list);

      expect(numbered).toContain('1: • Item 1');
      expect(numbered).toContain('2: • Item 2');
    });

    it('should render with border', () => {
      const list = List.create(['Item 1']);
      const bordered = ListRenderer.renderWithBorder(list);

      expect(bordered).toContain('┌');
      expect(bordered).toContain('┐');
      expect(bordered).toContain('└');
      expect(bordered).toContain('┘');
      expect(bordered).toContain('│ • Item 1');
    });
  });
});

describe('Integration Tests', () => {
  it('should work with complex nested structure', () => {
    const subList = ListBuilder.fromStrings(['Sub item 1', 'Sub item 2'])
      .enumerator(Enumerator.ALPHA_LOWER)
      .indent(3)
      .build();

    const mainList = ListBuilder.fromStrings(['Main item 1'])
      .append(subList)
      .append('Main item 3')
      .enumerator(Enumerator.ARABIC)
      .spacing(1)
      .build();

    const rendered = ListRenderer.render(mainList);

    expect(rendered).toContain('1. Main item 1');
    expect(rendered).toContain('2.');
    expect(rendered).toContain('a. Sub item 1');
    expect(rendered).toContain('b. Sub item 2');
    expect(rendered).toContain('3. Main item 3');
  });

  it('should work with styled nested lists', () => {
    const styledSub = List.withItemStyle(List.create(['Styled sub']), (text) => `*${text}*`);

    const styledMain = List.withEnumeratorStyle(
      List.create(['Main', styledSub]),
      (enum_) => `[${enum_}]`
    );

    const rendered = ListRenderer.render(styledMain);

    expect(rendered).toContain('[•] Main');
    expect(rendered).toContain('• *Styled sub*');
  });

  it('should handle all enumerator types in nested structure', () => {
    const level3 = List.withEnumerator(List.create(['Level 3']), Enumerator.ROMAN_LOWER);
    const level2 = List.withEnumerator(List.create(['Level 2', level3]), Enumerator.ALPHA_LOWER);
    const level1 = List.withEnumerator(List.create(['Level 1', level2]), Enumerator.ARABIC);

    const rendered = ListRenderer.render(level1);

    expect(rendered).toContain('1. Level 1');
    expect(rendered).toContain('a. Level 2');
    expect(rendered).toContain('i. Level 3');
  });
});
