# TUI Styling Package Development Guidelines

> **Extends**: `/DEVELOPMENT_GUIDELINE.md` - This document contains styling-specific rules only

## Terminal Output Guidelines

### Styled Output Rules

#### NEVER Use `console.log` for Styled Output
```typescript
// ❌ FORBIDDEN - console.log strips styling and breaks terminal output
console.log(styledText);
console.log('Styled content with colors');

// ✅ REQUIRED - Use output utility for styled content
import { output } from '../output';
output.print(styledText);

// ✅ REQUIRED - Use specific output methods
output.stdout(styledText);    // For normal output
output.stderr(errorText);     // For error output
```

#### Output Utility Usage
```typescript
// Import the output utility
import { output } from '@tui/styling/output';

// ✅ Good - Styled text output
const styledTitle = StyleBuilder.create()
  .bold(true)
  .foreground('#00FF00')
  .render('Success!');

output.print(styledTitle);

// ✅ Good - Component output
const table = TableBuilder.create()
  .headers('Name', 'Status')
  .rows(['Task 1', '✅ Complete'])
  .border(Border.rounded())
  .render();

output.print(table);

// ✅ Good - Conditional output with proper terminal detection
if (output.isTerminal()) {
  output.print(styledContent);
} else {
  output.print(plainTextContent);
}
```

### Debug Output Rules

#### Use Specific Debug Utilities
```typescript
// ❌ FORBIDDEN - console.log for debugging
console.log('Debug info:', data);
console.error('Error:', error);

// ✅ REQUIRED - Use debug utility
import { debug } from '@tui/styling/debug';

debug.log('Debug info:', data);        // Development only
debug.error('Error:', error);          // Styled error output
debug.warn('Warning:', warning);       // Styled warning output
debug.info('Info:', info);             // Styled info output

// ✅ REQUIRED - Conditional debug output
if (debug.isEnabled()) {
  debug.log('Detailed debug info:', complexData);
}
```

### Terminal Detection and Compatibility

#### Always Check Terminal Capabilities
```typescript
// ✅ REQUIRED - Check terminal capabilities before styling
import { terminal } from '@tui/styling/terminal';

namespace MyComponent {
  export const render = (content: string): string => {
    const capabilities = terminal.getCapabilities();
    
    if (capabilities.colorSupport === 'truecolor') {
      // Use full RGB colors
      return StyleBuilder.create()
        .foreground('#FF6B6B')
        .render(content);
    } else if (capabilities.colorSupport === '256color') {
      // Use 256-color palette
      return StyleBuilder.create()
        .foreground('196')
        .render(content);
    } else {
      // Fallback to basic colors or no styling
      return content;
    }
  };
}
```

#### Ghostty-Specific Optimizations
```typescript
// ✅ REQUIRED - Optimize for Ghostty when detected
import { ghostty } from '@tui/styling/terminal/ghostty';

namespace Performance {
  export const optimizeForTerminal = (config: RenderConfig): RenderConfig => {
    if (ghostty.isGhostty()) {
      return {
        ...config,
        useGPUAcceleration: true,
        enableLigatures: true,
        batchAnsiSequences: true,
        useAdvancedUnicode: true,
      };
    }
    
    return config;
  };
}
```

## Component Development Rules

### Visual Output Validation

#### MANDATORY - Compare Against Lipgloss Reference
```typescript
// ✅ REQUIRED - Every component must validate against Go Lipgloss
namespace TableComponent {
  export const render = (config: TableConfig): string => {
    const result = renderTable(config);
    
    // Development-time validation
    if (process.env.NODE_ENV === 'development') {
      validateAgainstLipgloss('table', config, result);
    }
    
    return result;
  };
}

// ✅ REQUIRED - Visual regression testing
import { VisualTester } from '@tui/styling/testing/visual';

// In tests
test('table matches lipgloss output exactly', () => {
  const config = { /* table config */ };
  const result = TableComponent.render(config);
  const reference = VisualTester.getLipglossReference('table', config);
  
  expect(VisualTester.compare(result, reference).isIdentical).toBe(true);
});
```

### Rendering Pipeline Rules

#### MANDATORY - Use Rendering Engine
```typescript
// ❌ FORBIDDEN - Direct ANSI sequence generation
const styledText = '\x1b[1m\x1b[32mBold Green\x1b[0m';

// ✅ REQUIRED - Use rendering engine
import { RenderEngine } from '@tui/styling/rendering';

const styledText = RenderEngine.render({
  text: 'Bold Green',
  bold: true,
  foreground: { type: 'ansi', value: 2 }
});
```

#### MANDATORY - Immutable Rendering Operations
```typescript
// ❌ FORBIDDEN - Mutating style objects
const style = { bold: false };
style.bold = true;  // Mutation!

// ✅ REQUIRED - Immutable operations
const baseStyle = Style.create();
const boldStyle = Style.bold(true)(baseStyle);
const finalStyle = Style.foreground('#FF0000')(boldStyle);
```

## Testing Requirements

### Visual Testing Rules

#### MANDATORY - Visual Regression Tests
```typescript
// ✅ REQUIRED - Every component needs visual tests
describe('TableComponent Visual Tests', () => {
  test('matches lipgloss chess table exactly', async () => {
    const result = await runExample('table/chess');
    const reference = await getLipglossReference('table/chess');
    
    const comparison = VisualDiff.compare(reference, result);
    expect(comparison.accuracy).toBe(100);
  });
  
  test('renders correctly in Ghostty', async () => {
    mockTerminal('ghostty');
    const result = TableComponent.render(chessTableConfig);
    
    expect(result).toMatchGhosttySnapshot();
  });
});
```

#### MANDATORY - Cross-Terminal Testing
```typescript
// ✅ REQUIRED - Test across terminal types
describe('Cross-Terminal Compatibility', () => {
  const terminals = ['ghostty', 'iterm2', 'alacritty', 'kitty'];
  
  test.each(terminals)('renders correctly in %s', (terminal) => {
    mockTerminal(terminal);
    const result = MyComponent.render(config);
    
    expect(result).toMatchTerminalSnapshot(terminal);
  });
});
```

### Performance Testing Rules

#### MANDATORY - Rendering Performance Tests
```typescript
// ✅ REQUIRED - Performance tests for all components
describe('TableComponent Performance', () => {
  test('renders large table within time limit', () => {
    const largeTable = generateLargeTable(1000, 20); // 1000 rows, 20 cols
    
    const start = performance.now();
    TableComponent.render(largeTable);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100); // Must render within 100ms
  });
  
  test('no memory leaks in repeated rendering', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 1000; i++) {
      TableComponent.render(standardConfig);
    }
    
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });
});
```

## Styling System Rules

### Color Handling Rules

#### MANDATORY - Use Color Namespace
```typescript
// ❌ FORBIDDEN - Raw color values
const redText = '\x1b[31mRed\x1b[0m';
const greenBg = '\x1b[42mGreen Background\x1b[0m';

// ✅ REQUIRED - Use Color namespace
import { Color } from '@tui/styling/color';

const redColor = Color.rgb(255, 0, 0);
const greenColor = Color.ansi(2);
const adaptiveColor = Color.adaptive({
  light: '#FF0000',
  dark: '#FF6B6B'
});
```

#### MANDATORY - Terminal-Aware Color Selection
```typescript
// ✅ REQUIRED - Always check color support
namespace ColorUtils {
  export const selectColor = (colors: ColorOptions): ColorConfig => {
    const capabilities = terminal.getCapabilities();
    
    if (capabilities.colorSupport === 'truecolor') {
      return Color.parse(colors.truecolor);
    } else if (capabilities.colorSupport === '256color') {
      return Color.ansi256(colors.ansi256);
    } else if (capabilities.colorSupport === '16color') {
      return Color.ansi(colors.ansi);
    } else {
      return Color.noColor();
    }
  };
}
```

### Border Handling Rules

#### MANDATORY - Unicode-Safe Border Rendering
```typescript
// ✅ REQUIRED - Check Unicode support before using fancy borders
namespace BorderRenderer {
  export const selectBorderChars = (border: BorderType): BorderChars => {
    const capabilities = terminal.getCapabilities();
    
    if (capabilities.unicodeSupport === 'full') {
      return getBorderChars(border); // Full Unicode support
    } else if (capabilities.unicodeSupport === 'basic') {
      return getAsciiBorderChars(border); // ASCII fallback
    } else {
      return getMinimalBorderChars(); // Minimal ASCII
    }
  };
}
```

## Layout System Rules

### Canvas and Positioning Rules

#### MANDATORY - Coordinate System Validation
```typescript
// ✅ REQUIRED - Validate positioning operations
namespace Layout {
  export const place = (
    content: string,
    x: number,
    y: number,
    bounds: Bounds
  ): string => {
    // Validate coordinates
    if (x < 0 || y < 0) {
      throw new Error('Coordinates must be non-negative');
    }
    
    if (x >= bounds.width || y >= bounds.height) {
      throw new Error('Coordinates exceed bounds');
    }
    
    return performPlacement(content, x, y, bounds);
  };
}
```

#### MANDATORY - Text Measurement Accuracy
```typescript
// ✅ REQUIRED - Accurate text measurement considering ANSI sequences
import { TextMeasurement } from '@tui/styling/layout/measurement';

namespace ComponentLayout {
  export const calculateLayout = (content: string): LayoutInfo => {
    // Measure without ANSI sequences for layout calculations
    const visualWidth = TextMeasurement.visualWidth(content);
    const visualHeight = TextMeasurement.visualHeight(content);
    
    // Account for terminal-specific rendering differences
    const capabilities = terminal.getCapabilities();
    const adjustedWidth = TextMeasurement.adjustForTerminal(visualWidth, capabilities);
    
    return {
      width: adjustedWidth,
      height: visualHeight,
      baseline: TextMeasurement.getBaseline(content)
    };
  };
}
```

## Development Workflow Rules

### File Organization Rules

#### MANDATORY - Styling Package Structure
```
packages/styling/
├── src/
│   ├── terminal/           # Terminal detection and capabilities
│   │   ├── ghostty.ts     # Ghostty-specific optimizations
│   │   └── detection.ts   # Multi-terminal detection
│   ├── rendering/         # Core rendering engine
│   │   ├── ansi.ts       # ANSI sequence generation
│   │   └── optimizer.ts  # Performance optimizations
│   ├── components/        # Visual components
│   │   ├── table/        # Table component
│   │   ├── list/         # List component
│   │   └── tree/         # Tree component
│   ├── output.ts         # Output utilities (replaces console.log)
│   └── debug.ts          # Debug utilities
├── examples/             # Example implementations
│   ├── table/
│   │   ├── chess/
│   │   │   └── main.ts   # Must match lipgloss/examples/table/chess/main.go
│   │   └── languages/
│   │       └── main.ts   # Must match lipgloss/examples/table/languages/main.go
│   └── layout/
│       └── main.ts       # Must match lipgloss/examples/layout/main.go
└── test-references/      # Go lipgloss reference outputs
    ├── table-chess-reference.txt
    └── layout-reference.txt
```

### Example Implementation Rules

#### MANDATORY - Lipgloss Parity Examples
```typescript
// ✅ REQUIRED - Every example must match Go lipgloss exactly
// examples/table/chess/main.ts

import { TableBuilder, Border, Style, Color, output } from '@tui/styling';

// Must produce identical output to lipgloss/examples/table/chess/main.go
const chessTable = TableBuilder.create()
  .headers('', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H')
  .rows(
    ['8', '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['7', '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    // ... exact same board as Go version
  )
  .border(Border.normal())
  .styleFunc((row, col) => {
    // Must match Go lipgloss styling logic exactly
    return (row + col) % 2 === 0 
      ? Style.create().background('#DDDDDD')
      : Style.create().background('#FFFFFF');
  })
  .render();

// Use output utility, not console.log
output.print(chessTable);
```

### Debug and Development Rules

#### MANDATORY - Development Mode Validation
```typescript
// ✅ REQUIRED - Enhanced validation in development
namespace StyleRenderer {
  export const render = (config: StyleConfig): string => {
    const result = performRendering(config);
    
    if (process.env.NODE_ENV === 'development') {
      // Validate ANSI sequences are correct
      validateAnsiSequences(result);
      
      // Check for common rendering issues
      checkRenderingIssues(result);
      
      // Verify terminal compatibility
      verifyTerminalCompatibility(result);
    }
    
    return result;
  };
}
```

#### MANDATORY - Progressive Enhancement
```typescript
// ✅ REQUIRED - Graceful degradation across terminal capabilities
namespace ComponentRenderer {
  export const render = (component: Component): string => {
    const capabilities = terminal.getCapabilities();
    
    // Start with most advanced rendering
    if (capabilities.colorSupport === 'truecolor' && capabilities.unicodeSupport === 'full') {
      return renderAdvanced(component);
    }
    
    // Fall back to 256-color with Unicode
    if (capabilities.colorSupport === '256color' && capabilities.unicodeSupport === 'full') {
      return render256Color(component);
    }
    
    // Fall back to basic color with ASCII
    if (capabilities.colorSupport === '16color') {
      return renderBasicColor(component);
    }
    
    // Final fallback to plain text
    return renderPlainText(component);
  };
}
```

## Error Handling Rules

### Terminal Error Handling

#### MANDATORY - Terminal-Specific Error Recovery
```typescript
// ✅ REQUIRED - Handle terminal-specific errors gracefully
namespace TerminalErrorHandler {
  export const safeRender = (content: string): string => {
    try {
      return RenderEngine.render(content);
    } catch (error) {
      if (error instanceof TerminalCapabilityError) {
        // Fall back to simpler rendering
        return RenderEngine.renderBasic(content);
      }
      
      if (error instanceof UnicodeRenderError) {
        // Fall back to ASCII-only rendering
        return RenderEngine.renderAscii(content);
      }
      
      // Last resort: plain text
      debug.error('Rendering failed, using plain text:', error);
      return stripAnsiSequences(content);
    }
  };
}
```

## Validation Rules

### Visual Output Validation

#### MANDATORY - Reference Validation
```typescript
// ✅ REQUIRED - All visual output must be validated
namespace OutputValidator {
  export const validateOutput = (
    componentName: string,
    config: unknown,
    output: string
  ): ValidationResult => {
    const reference = getReferenceOutput(componentName, config);
    const comparison = VisualDiff.compare(reference, output);
    
    if (comparison.accuracy < 100) {
      return {
        valid: false,
        errors: comparison.differences,
        accuracy: comparison.accuracy
      };
    }
    
    return { valid: true, accuracy: 100 };
  };
}
```

## Performance Rules

### Rendering Performance

#### MANDATORY - Rendering Benchmarks
```typescript
// ✅ REQUIRED - All components must meet performance requirements
namespace PerformanceRequirements {
  export const RENDERING_LIMITS = {
    smallComponent: 10,   // < 10ms
    mediumComponent: 50,  // < 50ms
    largeComponent: 100,  // < 100ms
    hugeComponent: 500    // < 500ms
  } as const;
  
  export const validatePerformance = (
    componentSize: keyof typeof RENDERING_LIMITS,
    renderTime: number
  ): boolean => {
    return renderTime < RENDERING_LIMITS[componentSize];
  };
}
```

## Summary of Key Rules

### 🚫 FORBIDDEN
- `console.log` for styled output
- Direct ANSI sequence generation
- Mutating style objects
- Skipping visual validation against Lipgloss
- Using generic string types for colors/borders
- Relative imports for core functionality

### ✅ REQUIRED
- Use `output.print()` for all styled output
- Use `debug.*()` for development output
- Validate against Lipgloss reference outputs
- Test across multiple terminal types
- Check terminal capabilities before styling
- Optimize for Ghostty (primary environment)
- Implement graceful degradation
- Include visual regression tests
- Meet performance benchmarks

### 🎯 BEST PRACTICES
- Progressive enhancement based on terminal capabilities
- Immutable rendering operations
- Comprehensive error handling with fallbacks
- Development-time validation and warnings
- Character-perfect visual parity with Go Lipgloss

---

**Remember**: Every styled output must be identical to the Go Lipgloss reference implementation. Use the provided utilities and follow the terminal compatibility guidelines to ensure consistent behavior across all supported environments.

*Last Updated: December 2024*  
*Extends: /DEVELOPMENT_GUIDELINE.md*