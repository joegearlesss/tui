# Color Standalone Example

This example demonstrates how to detect the terminal's background color and choose appropriate light or dark colors when using TUI Styling in a standalone fashion (independent of Bubble Tea).

## Files

- `main.ts` - Basic color adaptation example
- `main-with-border.ts` - Enhanced version with borders

## Features Demonstrated

1. **Terminal Background Detection**: Uses `Color.hasDarkBackground()` to detect if the terminal has a dark or light background
2. **Adaptive Color Selection**: Creates a helper function to choose appropriate colors based on background
3. **Style Creation**: Uses `StyleBuilder` for fluent style creation
4. **Layout Composition**: Uses `Layout.joinVertical()` to compose content
5. **Border Rendering**: Shows how to create bordered content (enhanced version)

## Running the Examples

```bash
# Basic example
bun run examples/color/standalone/main.ts

# Enhanced example with borders
bun run examples/color/standalone/main-with-border.ts
```

## Key Concepts

### Background Detection

```typescript
const hasDarkBG = await Color.hasDarkBackground();
```

### Adaptive Color Helper

```typescript
const lightDark = (lightColor: string, darkColor: string): string => {
  return hasDarkBG ? darkColor : lightColor;
};
```

### Style Creation

```typescript
const textStyle = StyleBuilder.create()
  .foreground(lightDark('#696969', '#bdbdbd'))
  .build();
```

### Layout Composition

```typescript
const content = Layout.joinVertical('center', text, buttons);
```

## Original Reference

This is a TypeScript/Bun reimplementation of the Lip Gloss v2 color example:
https://github.com/charmbracelet/lipgloss/blob/v2-exp/examples/color/standalone/main.go

## Implementation Notes

- Uses functional programming principles with namespaces instead of classes
- Follows the project's development guidelines for immutable operations
- Demonstrates the TUI Styling package's color adaptation capabilities
- Shows integration between color, style, layout, and border systems