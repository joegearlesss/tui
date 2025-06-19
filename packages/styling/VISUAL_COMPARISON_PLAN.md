# Visual Comparison Plan: Lipgloss → @tui/styling

This document outlines a comprehensive plan to achieve 100% visual identity between the Go lipgloss library and the TypeScript @tui/styling implementation.

## Overview

The goal is to ensure that every visual component, style, and layout feature in lipgloss produces identical output in the TypeScript port. This requires systematic testing of all visual elements and their combinations.

## Testing Strategy

### Phase 1: Core Style Components

#### 1.1 Text Styling
- **Bold, Italic, Underline, Strikethrough, Reverse, Blink, Faint**
- **Combinations of multiple text styles**
- **Test Approach**: Create matrix of all style combinations
- **Success Criteria**: Identical ANSI escape sequences and visual output

#### 1.2 Color System
- **ANSI 16 colors (4-bit)**: Basic terminal colors `0-15`
- **ANSI 256 colors (8-bit)**: Extended palette `0-255`
- **True Color (24-bit)**: Hex colors `#RRGGBB`
- **Adaptive colors**: Light/dark background variants
- **Complete colors**: Multi-format color definitions
- **Foreground and background colors**
- **Test Files**: 
  - `lipgloss/examples/color/standalone/main.go`
  - `lipgloss/examples/color/bubbletea/main.go`
- **Success Criteria**: Identical color rendering across all color depths

#### 1.3 Layout & Spacing
- **Padding**: All variations (shorthand and individual sides)
- **Margins**: All variations (shorthand and individual sides) 
- **Width/Height constraints**: Fixed and maximum dimensions
- **Test Approach**: Grid of all spacing combinations
- **Success Criteria**: Identical whitespace and content positioning

#### 1.4 Text Alignment
- **Horizontal**: Left, Center, Right
- **Vertical**: Top, Center, Bottom
- **Custom positioning**: Percentage-based alignment
- **Test Approach**: Alignment matrix with various content sizes
- **Success Criteria**: Identical text placement in containers

### Phase 2: Border Systems

#### 2.1 Border Types
- **NormalBorder**: `┌──┬──┐ │  │  │ ├──┼──┤ └──┴──┘`
- **RoundedBorder**: `╭──┬──╮ │  │  │ ├──┼──┤ ╰──┴──╯`
- **ThickBorder**: `┏━━┳━━┓ ┃  ┃  ┃ ┣━━╋━━┫ ┗━━┻━━┛`
- **DoubleBorder**: `╔══╦══╗ ║  ║  ║ ╠══╬══╣ ╚══╩══╝`
- **BlockBorder**: `█▀▀█▀▀█ █  █  █ █▄▄█▄▄█ █▄▄█▄▄█`
- **ASCIIBorder**: `+--+--+ |  |  | +--+--+ +--+--+`
- **MarkdownBorder**: `|--+--| |  |  | |--+--| |--+--|`
- **HiddenBorder**: No visible characters
- **Test Reference**: `lipgloss/table/testdata/TestBorderStyles/`
- **Success Criteria**: Exact Unicode character matching

#### 2.2 Border Configuration
- **Individual sides**: Top, Right, Bottom, Left
- **Border colors**: Per-side foreground and background
- **Custom borders**: User-defined characters
- **Success Criteria**: Pixel-perfect border rendering

### Phase 3: Component Systems

#### 3.1 Table Component
**Test Files**:
- `lipgloss/examples/table/chess/main.go` - Chess board layout
- `lipgloss/examples/table/languages/main.go` - Multi-column data
- `lipgloss/examples/table/ansi/main.go` - ANSI styling
- `lipgloss/examples/table/pokemon/main.go` - Complex data
- `lipgloss/examples/table/mindy/main.go` - Advanced styling

**Features to Test**:
- Basic table rendering with headers and rows
- All border styles (8 types × various configurations)
- Row/column separators
- Cell styling with StyleFunc
- Column width control
- Table height and overflow
- Content wrapping in cells
- Cell alignment (left, center, right)
- Tables with/without headers
- Cell padding and margins

**Golden Files**: `lipgloss/table/testdata/` (150+ test scenarios)
**Success Criteria**: Identical table layout, borders, and content formatting

#### 3.2 List Component
**Test Files**:
- `lipgloss/examples/list/simple/main.go` - Basic lists
- `lipgloss/examples/list/grocery/main.go` - Custom bullets
- `lipgloss/examples/list/duckduckgoose/main.go` - Custom enumerators
- `lipgloss/examples/list/roman/main.go` - Roman numerals
- `lipgloss/examples/list/sublist/main.go` - Nested lists

**Features to Test**:
- Bullet lists (•, *, -, etc.)
- Numbered lists (1, 2, 3...)
- Roman numerals (I, II, III...)
- Alphabetic lists (A, B, C...)
- Custom enumerators
- Nested lists and sublists
- List item styling
- Enumerator styling

**Golden Files**: `lipgloss/list/testdata/` (15+ test scenarios)
**Success Criteria**: Identical list formatting and enumerator rendering

#### 3.3 Tree Component
**Test Files**:
- `lipgloss/examples/tree/simple/main.go` - Basic trees
- `lipgloss/examples/tree/styles/main.go` - Styled trees
- `lipgloss/examples/tree/makeup/main.go` - Custom enumerators
- `lipgloss/examples/tree/background/main.go` - Background styling
- `lipgloss/examples/tree/rounded/main.go` - Rounded tree chars
- `lipgloss/examples/tree/toggle/main.go` - Interactive trees

**Features to Test**:
- Basic tree structure (root + children)
- Nested trees (multiple levels)
- Tree enumerators (Default, Rounded, Custom)
- Tree styling (root, item, enumerator styles)
- Trees with/without roots
- Tree backgrounds
- Custom tree characters

**Golden Files**: `lipgloss/tree/testdata/` (25+ test scenarios)
**Success Criteria**: Identical tree structure and character rendering

### Phase 4: Layout & Composition

#### 4.1 Layout Features
**Test File**: `lipgloss/examples/layout/main.go` (Most comprehensive visual test)

**Features to Test**:
- Horizontal joining (`JoinHorizontal`)
- Vertical joining (`JoinVertical`)
- Position-based joining (Top, Center, Bottom, percentages)
- Canvas and layer compositing
- Text placement (`PlaceHorizontal`, `PlaceVertical`, `Place`)
- Complex multi-component layouts

**Success Criteria**: Identical positioning and composition

#### 4.2 Advanced Layout
- Floating elements and modals
- Background patterns
- Color gradients and effects
- Tab and whitespace handling
- Multi-layer compositions

### Phase 5: Terminal Integration

#### 5.1 Color Adaptation
- Background color detection
- Light/dark theme adaptation
- Color profile detection
- TTY vs non-TTY output

#### 5.2 Compatibility
- Legacy color support
- Profile-based rendering
- Responsive width detection

## Implementation Plan

### Step 1: Automated Testing Infrastructure
1. **Output Capture System**: Capture exact terminal output from both implementations
2. **Visual Diff Tool**: Compare outputs character-by-character
3. **Test Runner**: Execute all example files and compare outputs
4. **CI Integration**: Automated testing on every change

### Step 2: Systematic Component Testing
1. **Phase 1**: Core styles (colors, text, spacing, alignment)
2. **Phase 2**: Borders (all 8 types + configurations)
3. **Phase 3**: Components (table, list, tree)
4. **Phase 4**: Layout systems
5. **Phase 5**: Terminal integration

### Step 3: Golden File Validation
1. **Extract Golden Files**: Use lipgloss test golden files as reference
2. **Compare Outputs**: Ensure TypeScript matches golden file outputs
3. **Create Test Suite**: Comprehensive test coverage

### Step 4: Example Parity
1. **Port All Examples**: Create TypeScript equivalents of all Go examples
2. **Visual Validation**: Manual and automated comparison
3. **Documentation**: Update examples with TypeScript versions

## Success Metrics

### Quantitative Metrics
- **100% Golden File Match**: All lipgloss testdata golden files produce identical output
- **100% Example Parity**: All lipgloss examples work identically in TypeScript
- **0 Visual Regressions**: No differences in visual output

### Qualitative Metrics
- **Character-Perfect Borders**: Exact Unicode character matching
- **Pixel-Perfect Layouts**: Identical spacing and positioning
- **Color Accuracy**: Identical ANSI escape sequences
- **Feature Completeness**: All lipgloss features implemented

## Test Execution Strategy

### Automated Testing
```bash
# Run Go lipgloss example
cd lipgloss/examples/table/chess
go run main.go > go_output.txt

# Run TypeScript equivalent
cd tui/packages/styling/examples/table/chess
bun run main.ts > ts_output.txt

# Compare outputs
diff go_output.txt ts_output.txt
```

### Manual Verification
1. **Side-by-side comparison** in terminal
2. **Screenshot comparison** for complex layouts
3. **Interactive testing** for dynamic features

## Risk Mitigation

### High-Risk Areas
1. **Unicode Border Characters**: Platform-specific rendering differences
2. **Color Profiles**: Terminal-specific color support
3. **Complex Layouts**: Floating point positioning edge cases
4. **Performance**: Large table/tree rendering speed

### Mitigation Strategies
1. **Cross-platform testing**: Multiple OS and terminal combinations
2. **Fallback strategies**: Graceful degradation for unsupported features
3. **Performance benchmarks**: Ensure TypeScript performance matches Go
4. **Extensive testing**: Cover edge cases and boundary conditions

## Deliverables

1. **Complete Test Suite**: Automated tests for all components
2. **Visual Regression Tests**: Prevent future visual breaks
3. **Example Parity**: TypeScript versions of all Go examples
4. **Documentation**: Visual comparison guide and troubleshooting
5. **CI/CD Integration**: Automated visual testing pipeline

## Timeline Estimate

- **Phase 1-2 (Core + Borders)**: 2-3 weeks
- **Phase 3 (Components)**: 3-4 weeks  
- **Phase 4 (Layout)**: 2-3 weeks
- **Phase 5 (Integration)**: 1-2 weeks
- **Testing & Polish**: 1-2 weeks

**Total Estimated Duration**: 9-14 weeks for complete visual parity

This comprehensive plan ensures systematic verification of every visual aspect, guaranteeing 100% visual identity between the Go lipgloss library and TypeScript @tui/styling implementation.