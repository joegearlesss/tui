# Comprehensive Test Plan for 100% Lipgloss Compatibility

## Overview

This document outlines a comprehensive testing strategy to ensure 100% compatibility with Lipgloss by creating verbose tests for every possible pattern from the original codebase, comparing outputs with TUI styling, and implementing fixes.

## Test Categories

### 1. Unit Tests - Core API Compatibility

#### 1.1 Style System Tests (`src/style/`)

**File: `src/style/api-compatibility.test.ts`**
```typescript
describe('Lipgloss API Compatibility - Style System', () => {
  // Test every method from lipgloss style.go
  describe('Style Creation', () => {
    test('NewStyle() equivalent', () => {
      const lipglossEquivalent = StyleBuilder.create();
      expect(lipglossEquivalent).toBeDefined();
    });
    
    test('Copy() method', () => {
      const original = StyleBuilder.create().bold(true).build();
      const copied = Style.copy(original);
      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });
    
    test('Inherit() method', () => {
      const parent = StyleBuilder.create().foreground('#FF0000').padding(1).build();
      const child = StyleBuilder.create().bold(true).build();
      const inherited = Style.inherit(child, parent);
      
      expect(inherited.bold).toBe(true);
      expect(inherited.foreground).toBe('#FF0000');
      expect(inherited.padding).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
    });
  });
  
  describe('Text Formatting', () => {
    test.each([
      ['bold', true],
      ['italic', true],
      ['underline', true],
      ['strikethrough', true],
      ['reverse', true],
      ['blink', true],
      ['faint', true]
    ])('%s formatting', (method, value) => {
      const style = StyleBuilder.create()[method](value).build();
      expect(style[method]).toBe(value);
    });
  });
  
  describe('Color Properties', () => {
    test('foreground color setting', () => {
      const tests = [
        '#FF0000',
        'red',
        '#FFFFFF',
        Color.rgb(255, 0, 0),
        Color.adaptive('#000000', '#FFFFFF')
      ];
      
      tests.forEach(color => {
        const style = StyleBuilder.create().foreground(color).build();
        expect(style.foreground).toBeDefined();
      });
    });
    
    test('background color setting', () => {
      const style = StyleBuilder.create().background('#FF0000').build();
      expect(style.background).toBeDefined();
    });
  });
  
  describe('Spacing - CSS Style', () => {
    test('padding shorthand syntax', () => {
      const tests = [
        { args: [1], expected: { top: 1, right: 1, bottom: 1, left: 1 } },
        { args: [1, 2], expected: { top: 1, right: 2, bottom: 1, left: 2 } },
        { args: [1, 2, 3], expected: { top: 1, right: 2, bottom: 3, left: 2 } },
        { args: [1, 2, 3, 4], expected: { top: 1, right: 2, bottom: 3, left: 4 } }
      ];
      
      tests.forEach(({ args, expected }) => {
        const style = StyleBuilder.create().padding(...args).build();
        expect(style.padding).toEqual(expected);
      });
    });
    
    test('margin shorthand syntax', () => {
      const style = StyleBuilder.create().margin(1, 2, 3, 4).build();
      expect(style.margin).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    });
    
    test('individual spacing properties', () => {
      const style = StyleBuilder.create()
        .paddingTop(1)
        .paddingRight(2)
        .paddingBottom(3)
        .paddingLeft(4)
        .build();
      expect(style.padding).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    });
  });
  
  describe('Dimensions', () => {
    test('width and height', () => {
      const style = StyleBuilder.create().width(80).height(24).build();
      expect(style.width).toBe(80);
      expect(style.height).toBe(24);
    });
    
    test('max width and height', () => {
      const style = StyleBuilder.create().maxWidth(100).maxHeight(50).build();
      expect(style.maxWidth).toBe(100);
      expect(style.maxHeight).toBe(50);
    });
  });
  
  describe('Alignment', () => {
    test('horizontal alignment', () => {
      const tests = ['left', 'center', 'right', 0.0, 0.5, 1.0];
      tests.forEach(align => {
        const style = StyleBuilder.create().alignHorizontal(align).build();
        expect(style.horizontalAlignment).toBeDefined();
      });
    });
    
    test('vertical alignment', () => {
      const tests = ['top', 'middle', 'bottom', 0.0, 0.5, 1.0];
      tests.forEach(align => {
        const style = StyleBuilder.create().alignVertical(align).build();
        expect(style.verticalAlignment).toBeDefined();
      });
    });
  });
});
```

**File: `src/style/transform.test.ts`**
```typescript
describe('Text Transform Functions', () => {
  test('uppercase transform', () => {
    const transform = (text: string) => text.toUpperCase();
    const style = StyleBuilder.create().transform(transform).build();
    const result = Style.render(style, 'hello world');
    expect(result).toContain('HELLO WORLD');
  });
  
  test('custom transform functions', () => {
    const transforms = [
      (text: string) => text.toLowerCase(),
      (text: string) => text.replace(/\s+/g, '_'),
      (text: string) => `[${text}]`,
      (text: string) => text.split('').reverse().join('')
    ];
    
    transforms.forEach(transform => {
      const style = StyleBuilder.create().transform(transform).build();
      expect(() => Style.render(style, 'test')).not.toThrow();
    });
  });
});
```

#### 1.2 Border System Tests (`src/border/`)

**File: `src/border/lipgloss-compatibility.test.ts`**
```typescript
describe('Lipgloss Border Compatibility', () => {
  describe('Border Types', () => {
    test('all predefined border types match lipgloss', () => {
      const lipglossCompatibleBorders = {
        Normal: { top: '─', right: '│', bottom: '─', left: '│', topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
        Rounded: { top: '─', right: '│', bottom: '─', left: '│', topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯' },
        Thick: { top: '━', right: '┃', bottom: '━', left: '┃', topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛' },
        Double: { top: '═', right: '║', bottom: '═', left: '║', topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝' }
      };
      
      Object.entries(lipglossCompatibleBorders).forEach(([name, expectedChars]) => {
        const border = Border[name.toLowerCase()]();
        expect(border.chars).toEqual(expectedChars);
      });
    });
  });
  
  describe('Border Integration with Styles', () => {
    test('border with style builder (when implemented)', () => {
      // TODO: This test will pass once border integration is complete
      const style = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground('#FF0000')
        .padding(1, 2)
        .build();
      
      expect(style.border).toBeDefined();
      expect(style.borderForeground).toBe('#FF0000');
    });
    
    test('per-side border colors', () => {
      // TODO: Implement when per-side border colors are added
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
  });
  
  describe('Border Rendering', () => {
    test('border renders correctly around content', () => {
      const border = Border.rounded();
      const content = 'Hello\nWorld';
      const result = BorderRender.render(border, content);
      
      expect(result).toContain('╭');
      expect(result).toContain('╮');
      expect(result).toContain('╰');
      expect(result).toContain('╯');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });
});
```

#### 1.3 Color System Tests (`src/color/`)

**File: `src/color/adaptive-compatibility.test.ts`**
```typescript
describe('Adaptive Color System - Lipgloss Compatibility', () => {
  describe('LightDark Function', () => {
    test('lightDark helper function', () => {
      const mockDarkBackground = jest.spyOn(Color, 'hasDarkBackground');
      
      // Test with dark background
      mockDarkBackground.mockResolvedValue(true);
      const lightDark = (light: string, dark: string) => 
        Color.hasDarkBackground().then(isDark => isDark ? dark : light);
      
      expect(lightDark('#000000', '#FFFFFF')).resolves.toBe('#FFFFFF');
      
      // Test with light background
      mockDarkBackground.mockResolvedValue(false);
      expect(lightDark('#000000', '#FFFFFF')).resolves.toBe('#000000');
      
      mockDarkBackground.mockRestore();
    });
    
    test('adaptive color creation', () => {
      const adaptiveColor = Color.adaptive('#000000', '#FFFFFF');
      expect(adaptiveColor.light).toBe('#000000');
      expect(adaptiveColor.dark).toBe('#FFFFFF');
    });
  });
  
  describe('Color Profile Detection', () => {
    test('terminal color profile detection', () => {
      const profiles = ['noColor', 'ansi', 'ansi256', 'trueColor'];
      const detected = Terminal.getColorProfile();
      expect(profiles).toContain(detected);
    });
    
    test('color downsampling for profiles', () => {
      const trueColor = '#FF5733';
      const profiles = ['ansi', 'ansi256', 'trueColor'];
      
      profiles.forEach(profile => {
        const converted = Color.getColorForProfile(trueColor, profile);
        expect(converted).toBeDefined();
      });
    });
  });
});
```

#### 1.4 Layout System Tests (`src/layout/`)

**File: `src/layout/lipgloss-compatibility.test.ts`**
```typescript
describe('Layout System - Lipgloss Compatibility', () => {
  describe('Join Functions', () => {
    test('JoinHorizontal equivalent', () => {
      const blocks = ['Block 1', 'Block 2\nSecond line', 'Block 3'];
      const result = Layout.joinHorizontal('top', ...blocks);
      
      // Should align blocks vertically at top
      const lines = result.split('\n');
      expect(lines[0]).toContain('Block 1');
      expect(lines[0]).toContain('Block 2');
      expect(lines[0]).toContain('Block 3');
      expect(lines[1]).toContain('Second line');
    });
    
    test('JoinVertical equivalent', () => {
      const blocks = ['Block 1', 'Block 2', 'Block 3'];
      const result = Layout.joinVertical('center', ...blocks);
      
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('Block 1');
      expect(lines[1]).toContain('Block 2');
      expect(lines[2]).toContain('Block 3');
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
  });
});
```

### 2. Integration Tests - Cross-Component Compatibility

**File: `tests/integration/lipgloss-examples.integration.test.ts`**
```typescript
describe('Lipgloss Examples Integration', () => {
  describe('Layout Example Replication', () => {
    test('complex layout from examples/layout/main.go', async () => {
      // Replicate the exact layout from lipgloss examples
      const hasDarkBG = await Color.hasDarkBackground();
      const lightDark = (light: string, dark: string) => hasDarkBG ? dark : light;
      
      // Header
      const headerStyle = StyleBuilder.create()
        .bold(true)
        .foreground(lightDark('#FAFAFA', '#7D56F4'))
        .background(lightDark('#7D56F4', '#FAFAFA'))
        .padding(0, 1)
        .build();
      
      // Info sections
      const infoStyle = StyleBuilder.create()
        .foreground(lightDark('#7D56F4', '#FAFAFA'))
        .build();
      
      const header = Style.render(headerStyle, 'Mr. Pager');
      const info = Style.render(infoStyle, 'Structured Data');
      
      const layout = Layout.joinVertical(0.0, header, info);
      
      expect(layout).toContain('Mr. Pager');
      expect(layout).toContain('Structured Data');
    });
  });
  
  describe('Table Example Replication', () => {
    test('styled table from examples/table/', () => {
      const table = TableBuilder.create()
        .headers('Name', 'Age', 'City')
        .rows(
          ['John', '25', 'New York'],
          ['Jane', '30', 'San Francisco'],
          ['Bob', '35', 'Chicago']
        )
        .border(Border.rounded())
        .styleFunc((row, col) => {
          if (row === Table.HEADER_ROW) {
            return StyleBuilder.create().bold(true).foreground('#FF0000').build();
          }
          return row % 2 === 0 
            ? StyleBuilder.create().background('#F8F8F8').build()
            : StyleBuilder.create().build();
        })
        .build();
      
      const rendered = Table.render(table);
      expect(rendered).toContain('Name');
      expect(rendered).toContain('John');
      expect(rendered).toContain('╭');
      expect(rendered).toContain('╯');
    });
  });
});
```

### 3. Performance Tests - Benchmark Compatibility

**File: `src/style/style.performance.test.ts`**
```typescript
describe('Style System Performance', () => {
  test('style creation performance', () => {
    const iterations = 10000;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      StyleBuilder.create()
        .bold(true)
        .foreground('#FF0000')
        .background('#00FF00')
        .padding(1, 2)
        .margin(2, 1)
        .width(80)
        .height(24)
        .build();
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
    console.log(`Created ${iterations} styles in ${duration.toFixed(2)}ms`);
  });
  
  test('style rendering performance', () => {
    const style = StyleBuilder.create()
      .bold(true)
      .foreground('#FF0000')
      .background('#00FF00')
      .padding(2, 4)
      .build();
    
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const iterations = 1000;
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      Style.render(style, text);
    }
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50); // Should complete in under 50ms
  });
  
  test('complex style inheritance performance', () => {
    const baseStyle = StyleBuilder.create()
      .foreground('#000000')
      .padding(1)
      .margin(1)
      .build();
    
    const iterations = 1000;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const childStyle = StyleBuilder.create()
        .bold(true)
        .background('#FFFFFF')
        .build();
      
      Style.inherit(childStyle, baseStyle);
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(25);
  });
});
```

### 4. E2E Tests - Complete Usage Scenarios

**File: `tests/e2e/lipgloss-complete.e2e.test.ts`**
```typescript
describe('Complete Lipgloss Usage Scenarios', () => {
  test('dashboard application scenario', async () => {
    // Simulate a complete dashboard application
    const hasDarkBG = await Color.hasDarkBackground();
    const lightDark = (light: string, dark: string) => hasDarkBG ? dark : light;
    
    // Create header
    const headerStyle = StyleBuilder.create()
      .bold(true)
      .foreground(lightDark('#FFFFFF', '#000000'))
      .background(lightDark('#7D56F4', '#FAFAFA'))
      .padding(1, 2)
      .width(80)
      .alignHorizontal(0.5)
      .build();
    
    const header = Style.render(headerStyle, 'System Dashboard');
    
    // Create metrics table
    const metricsTable = TableBuilder.create()
      .headers('Metric', 'Value', 'Status')
      .rows(
        ['CPU Usage', '75%', '⚠️  Warning'],
        ['Memory', '45%', '✅ Good'],
        ['Disk Space', '90%', '🔴 Critical']
      )
      .border(Border.rounded())
      .styleFunc((row, col) => {
        if (row === Table.HEADER_ROW) {
          return StyleBuilder.create()
            .bold(true)
            .foreground('#FFFFFF')
            .background('#333333')
            .build();
        }
        
        // Color code based on status
        if (col === 2) { // Status column
          const status = (Table.getCell(row, col) || '').toLowerCase();
          if (status.includes('critical')) {
            return StyleBuilder.create().foreground('#FF0000').build();
          } else if (status.includes('warning')) {
            return StyleBuilder.create().foreground('#FFA500').build();
          } else if (status.includes('good')) {
            return StyleBuilder.create().foreground('#00FF00').build();
          }
        }
        
        return StyleBuilder.create().build();
      })
      .build();
    
    // Create alerts list
    const alertsList = ListBuilder.create([
      'System alerts:',
      ListBuilder.create([
        'High CPU usage detected',
        'Disk space running low',
        'New user login: admin@example.com'
      ]).enumerator(List.Enumerator.BULLET).build()
    ]).enumerator(List.Enumerator.DASH).build();
    
    // Compose final layout
    const dashboard = Layout.joinVertical(0.0,
      header,
      '',
      Table.render(metricsTable),
      '',
      List.render(alertsList)
    );
    
    // Verify output contains all expected elements
    expect(dashboard).toContain('System Dashboard');
    expect(dashboard).toContain('CPU Usage');
    expect(dashboard).toContain('Memory');
    expect(dashboard).toContain('Disk Space');
    expect(dashboard).toContain('System alerts');
    expect(dashboard).toContain('High CPU usage');
    
    // Verify structure
    const lines = dashboard.split('\n');
    expect(lines.length).toBeGreaterThan(10);
    expect(lines[0]).toContain('System Dashboard');
  });
  
  test('file manager interface scenario', () => {
    // Simulate a file manager interface with tree view
    const fileTree = TreeBuilder.create({
      value: 'project/',
      children: [
        {
          value: 'src/',
          children: [
            { value: 'main.ts', children: [], expanded: true },
            { value: 'utils.ts', children: [], expanded: true }
          ],
          expanded: true
        },
        {
          value: 'tests/',
          children: [
            { value: 'main.test.ts', children: [], expanded: true }
          ],
          expanded: true
        },
        { value: 'package.json', children: [], expanded: true }
      ],
      expanded: true
    })
    .enumerator(TreeEnumerator.DEFAULT)
    .itemStyle(StyleBuilder.create().foreground('#FFFFFF').build())
    .build();
    
    const tree = Tree.render(fileTree);
    
    expect(tree).toContain('project/');
    expect(tree).toContain('src/');
    expect(tree).toContain('main.ts');
    expect(tree).toContain('package.json');
    
    // Verify tree structure with proper indentation
    const lines = tree.split('\n');
    expect(lines.some(line => line.includes('├') || line.includes('└'))).toBe(true);
  });
});
```

### 5. Visual Output Comparison Tests

**File: `tests/integration/visual-output-comparison.test.ts`**
```typescript
describe('Visual Output Comparison with Lipgloss', () => {
  // These tests compare exact visual output with known Lipgloss results
  
  test('color standalone example exact match', async () => {
    // Our implementation
    const result = await import('../../examples/color/standalone/main');
    const output = await captureConsoleOutput(() => result.main());
    
    // Expected patterns based on lipgloss output
    const expectedPatterns = [
      /╭─+╮/,  // Top border
      /│.*Are you sure.*│/,  // Content line 1
      /│.*Yes.*No.*│/,  // Content line 2  
      /╰─+╯/   // Bottom border
    ];
    
    expectedPatterns.forEach(pattern => {
      expect(output).toMatch(pattern);
    });
    
    // Check ANSI color codes
    expect(output).toMatch(/\x1b\[38;2;\d+;\d+;\d+m/); // True color codes
    expect(output).toMatch(/\x1b\[0m/); // Reset codes
  });
  
  test('table rendering exact match', () => {
    const table = TableBuilder.create()
      .headers('ID', 'Name', 'Status')
      .rows(
        ['1', 'Alice', 'Active'],
        ['2', 'Bob', 'Inactive']
      )
      .border(Border.normal())
      .build();
    
    const output = Table.render(table);
    
    // Expected table structure
    const expectedLines = [
      '┌────┬───────┬──────────┐',
      '│ ID │ Name  │ Status   │',
      '├────┼───────┼──────────┤',
      '│ 1  │ Alice │ Active   │',
      '│ 2  │ Bob   │ Inactive │',
      '└────┴───────┴──────────┘'
    ];
    
    const actualLines = output.split('\n');
    expectedLines.forEach((expectedLine, index) => {
      expect(actualLines[index]).toMatch(new RegExp(expectedLine.replace(/[│┌┐├┤┼┬┴└┘]/g, '.')));
    });
  });
});

// Helper function to capture console output
async function captureConsoleOutput(fn: () => Promise<void> | void): Promise<string> {
  const originalLog = console.log;
  let output = '';
  
  console.log = (message: string) => {
    output += message + '\n';
  };
  
  try {
    await fn();
  } finally {
    console.log = originalLog;
  }
  
  return output.trim();
}
```

## Test Execution Strategy

### 1. Test Organization
```
tests/
├── unit/                    # Individual component tests
│   ├── style/
│   ├── border/
│   ├── color/
│   ├── layout/
│   └── components/
├── integration/             # Cross-component tests
│   ├── lipgloss-compatibility/
│   ├── example-replication/
│   └── visual-comparison/
├── performance/             # Performance benchmarks
│   ├── rendering/
│   ├── style-operations/
│   └── large-datasets/
└── e2e/                     # Complete scenarios
    ├── dashboard-apps/
    ├── cli-interfaces/
    └── interactive-demos/
```

### 2. Test Coverage Requirements

| Category | Coverage Target | Performance Target |
|----------|----------------|-------------------|
| Unit Tests | 95%+ | Individual operations < 1ms |
| Integration Tests | 90%+ | Component interactions < 10ms |
| Performance Tests | 100% critical paths | Rendering < 50ms for complex layouts |
| E2E Tests | All major scenarios | Complete applications < 200ms |

### 3. Continuous Testing

#### Test Automation
```bash
# Unit tests
bun test "**/*.test.ts"

# Performance tests  
bun test "**/*.performance.test.ts"

# Integration tests
bun test "**/integration/*.test.ts"

# E2E tests
bun test "**/e2e/*.test.ts"

# Visual comparison tests
bun test "**/visual-*.test.ts"

# Full test suite
bun test
```

#### Performance Monitoring
- Track rendering times for complex layouts
- Monitor memory usage during large operations
- Benchmark against lipgloss when possible

#### Visual Regression Testing
- Capture output of key examples
- Compare with baseline outputs
- Flag any visual differences

## Success Criteria

### Compatibility Metrics
1. **API Coverage**: 100% of lipgloss public API implemented
2. **Example Replication**: All lipgloss examples produce identical visual output
3. **Performance Parity**: Within 10% of lipgloss performance benchmarks
4. **Test Coverage**: 95%+ coverage across all test categories

### Quality Gates
1. **All tests must pass** before merging compatibility features
2. **Performance tests must not regress** beyond acceptable thresholds
3. **Visual output must match** lipgloss examples exactly
4. **Memory usage must not exceed** lipgloss by more than 20%

This comprehensive test plan ensures that every aspect of lipgloss compatibility is thoroughly validated, from individual API methods to complete application scenarios.