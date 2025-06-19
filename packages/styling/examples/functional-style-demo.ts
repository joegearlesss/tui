/**
 * Comprehensive example demonstrating the functional style system
 * Based on OVERVIEW.internal.md examples
 */

import { Color, Style, StyleBuilder, type StyleProperties } from '@tui/styling';

// Theme configuration using functional approach
namespace Theme {
  export const colors = {
    primary: Color.adaptive('#0066CC', '#4A9EFF'),
    secondary: Color.adaptive('#666666', '#CCCCCC'),
    accent: '#FF6B6B',
    success: '#00AA00',
    warning: '#FFAA00',
    error: '#FF0000',
  } as const;

  export const styles = {
    header: StyleBuilder.create()
      .bold(true)
      .foreground(colors.primary)
      .padding(1, 2)
      .alignHorizontal('center')
      .build(),

    content: StyleBuilder.create().foreground(colors.secondary).padding(2).margin(1, 0).build(),

    emphasis: StyleBuilder.create().bold(true).foreground(colors.accent).build(),

    success: StyleBuilder.create().foreground(colors.success).bold(true).build(),

    warning: StyleBuilder.create().foreground(colors.warning).bold(true).build(),

    error: StyleBuilder.create().foreground(colors.error).bold(true).underline(true).build(),
  } as const;
}

// Functional composition examples
namespace Examples {
  /**
   * Basic styling with function chaining
   */
  export const basicStyling = (): void => {
    console.log('=== Basic Styling Examples ===\n');

    // Simple text formatting
    const boldText = StyleBuilder.create().bold(true).render('This is bold text');

    const coloredText = StyleBuilder.create().foreground('#FF0000').render('This is red text');

    const complexStyle = StyleBuilder.create()
      .bold(true)
      .italic(true)
      .foreground('#FF6B6B')
      .background('#4ECDC4')
      .padding(1, 2)
      .render('Complex styled text');

    console.log(boldText);
    console.log(coloredText);
    console.log(complexStyle);
    console.log();
  };

  /**
   * Style inheritance and composition
   */
  export const styleInheritance = (): void => {
    console.log('=== Style Inheritance Examples ===\n');

    // Base style
    const baseStyle = StyleBuilder.create().foreground('#333333').padding(1).build();

    // Inherit and extend
    const headerStyle = StyleBuilder.from(baseStyle)
      .bold(true)
      .foreground('#000000')
      .alignHorizontal('center')
      .build();

    // Another inheritance
    const emphasisStyle = StyleBuilder.from(baseStyle).italic(true).foreground('#FF6B6B').build();

    console.log(Style.render(baseStyle, 'Base text'));
    console.log(Style.render(headerStyle, 'Header text'));
    console.log(Style.render(emphasisStyle, 'Emphasized text'));
    console.log();
  };

  /**
   * Functional composition with pure functions
   */
  export const functionalComposition = (): void => {
    console.log('=== Functional Composition Examples ===\n');

    // Using Style namespace functions directly
    const style1 = Style.bold(Style.create(), true);
    const style2 = Style.foreground(style1, '#00FF00');
    const style3 = Style.padding(style2, 1, 2);

    console.log(Style.render(style3, 'Functionally composed style'));

    // Function composition with pipe-like pattern
    const pipeStyle = [
      (s: StyleProperties) => Style.bold(s, true),
      (s: StyleProperties) => Style.italic(s, true),
      (s: StyleProperties) => Style.foreground(s, '#9B59B6'),
      (s: StyleProperties) => Style.background(s, '#F8F8F8'),
      (s: StyleProperties) => Style.padding(s, 1, 3),
    ].reduce((style, fn) => fn(style), Style.create());

    console.log(Style.render(pipeStyle, 'Pipe-style composition'));
    console.log();
  };

  /**
   * Theme-based styling
   */
  export const themeStyling = (): void => {
    console.log('=== Theme-based Styling Examples ===\n');

    console.log(Style.render(Theme.styles.header, '🎨 Application Header'));
    console.log(Style.render(Theme.styles.content, 'Regular content text'));
    console.log(Style.render(Theme.styles.emphasis, 'Important information'));
    console.log(Style.render(Theme.styles.success, '✅ Operation successful'));
    console.log(Style.render(Theme.styles.warning, '⚠️  Warning message'));
    console.log(Style.render(Theme.styles.error, '❌ Error occurred'));
    console.log();
  };

  /**
   * Advanced chaining with unset operations
   */
  export const advancedChaining = (): void => {
    console.log('=== Advanced Chaining Examples ===\n');

    // Build up style, then selectively remove properties
    const evolvedStyle = StyleBuilder.create()
      .bold(true)
      .italic(true)
      .underline(true)
      .foreground('#FF0000')
      .background('#FFFF00')
      .padding(2, 4)
      .unsetItalic() // Remove italic
      .unsetBackground() // Remove background
      .foreground('#0000FF') // Change foreground
      .paddingTop(1) // Adjust padding
      .render('Evolved style');

    console.log(evolvedStyle);

    // Conditional styling
    const isError = true;
    const conditionalStyle = StyleBuilder.create()
      .bold(true)
      .foreground(isError ? '#FF0000' : '#00AA00')
      .render(isError ? 'Error message' : 'Success message');

    console.log(conditionalStyle);
    console.log();
  };

  /**
   * Complex layout example
   */
  export const complexLayout = (): void => {
    console.log('=== Complex Layout Example ===\n');

    // Card-like component
    const cardHeader = StyleBuilder.create()
      .bold(true)
      .foreground('#FFFFFF')
      .background('#3498DB')
      .padding(1, 2)
      .alignHorizontal('center')
      .render('📊 Dashboard Card');

    const cardContent = StyleBuilder.create()
      .foreground('#2C3E50')
      .background('#ECF0F1')
      .padding(2, 3)
      .render('This is the card content with some important information.');

    const cardFooter = StyleBuilder.create()
      .faint(true)
      .foreground('#7F8C8D')
      .background('#BDC3C7')
      .padding(1, 2)
      .alignHorizontal('right')
      .render('Last updated: 2024');

    console.log(cardHeader);
    console.log(cardContent);
    console.log(cardFooter);
    console.log();
  };

  /**
   * Adaptive color demonstration
   */
  export const adaptiveColors = (): void => {
    console.log('=== Adaptive Colors Example ===\n');

    const adaptiveStyle = StyleBuilder.create()
      .bold(true)
      .foreground(
        Color.adaptive(
          '#2C3E50', // Dark text for light theme
          '#ECF0F1' // Light text for dark theme
        )
      )
      .background(
        Color.adaptive(
          '#FFFFFF', // Light background for light theme
          '#2C3E50' // Dark background for dark theme
        )
      )
      .padding(1, 2)
      .render('Adaptive themed text');

    console.log(adaptiveStyle);
    console.log();
  };

  /**
   * Text transformation examples
   */
  export const textTransformations = (): void => {
    console.log('=== Text Transformation Examples ===\n');

    const upperCaseStyle = StyleBuilder.create()
      .bold(true)
      .transform((text: string) => text.toUpperCase())
      .render('this will be uppercase');

    const prefixStyle = StyleBuilder.create()
      .foreground('#E74C3C')
      .transform((text: string) => `🔥 ${text}`)
      .render('Hot content');

    const boxedStyle = StyleBuilder.create()
      .foreground('#9B59B6')
      .transform((text: string) => `[ ${text} ]`)
      .render('Boxed text');

    console.log(upperCaseStyle);
    console.log(prefixStyle);
    console.log(boxedStyle);
    console.log();
  };

  /**
   * Performance demonstration with immutability
   */
  export const immutabilityDemo = (): void => {
    console.log('=== Immutability Demonstration ===\n');

    const baseBuilder = StyleBuilder.create().foreground('#34495E');

    // Each operation creates a new builder instance
    const variant1 = baseBuilder.bold(true);
    const variant2 = baseBuilder.italic(true);
    const variant3 = baseBuilder.underline(true);

    // Original builder is unchanged
    console.log('Base:', baseBuilder.render('Original base style'));
    console.log('Variant 1:', variant1.render('Bold variant'));
    console.log('Variant 2:', variant2.render('Italic variant'));
    console.log('Variant 3:', variant3.render('Underlined variant'));

    // Combining variants
    const combined = variant1.copy().italic(true).underline(true).foreground('#E67E22');

    console.log('Combined:', combined.render('All variants combined'));
    console.log();
  };
}

// Run all examples
export const runExamples = (): void => {
  console.log('🎨 TUI Styling Package - Functional Design Examples\n');
  console.log('Based on OVERVIEW.internal.md functional architecture\n');

  Examples.basicStyling();
  Examples.styleInheritance();
  Examples.functionalComposition();
  Examples.themeStyling();
  Examples.advancedChaining();
  Examples.complexLayout();
  Examples.adaptiveColors();
  Examples.textTransformations();
  Examples.immutabilityDemo();

  console.log('✅ All examples completed successfully!');
  console.log('📚 This demonstrates the complete functional style system');
  console.log('🔧 No classes used - pure functions and immutable data only');
};

// Export for use in other files
export { Theme, Examples };

// Run examples if this file is executed directly
if (import.meta.main) {
  runExamples();
}
