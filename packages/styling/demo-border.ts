/**
 * Border System Demo
 *
 * Demonstrates the border system functionality and integration with the styling package
 */

import {
  BorderBuilder,
  BorderRender,
  StyleBuilder,
  doubleBorder,
  normalBorder,
  roundedBorder,
  thickBorder,
} from '../src';

console.log('🎨 Border System Demo\n');

// Basic border examples
console.log('📦 Basic Borders:');
console.log('Normal Border:');
console.log(BorderRender.box(normalBorder, 'Hello, World!'));
console.log();

console.log('Rounded Border:');
console.log(BorderRender.box(roundedBorder, 'Rounded corners!'));
console.log();

console.log('Thick Border:');
console.log(BorderRender.box(thickBorder, 'Bold and thick!'));
console.log();

console.log('Double Border:');
console.log(BorderRender.box(doubleBorder, 'Double lines!'));
console.log();

// Builder pattern examples
console.log('🔧 Builder Pattern Examples:');
console.log('Custom Border with Builder:');
const customBorder = BorderBuilder.create()
  .style('rounded')
  .topChar('═')
  .bottomChar('═')
  .corners('╔', '╗', '╚', '╝')
  .build();

console.log(BorderRender.box(customBorder, 'Custom mixed style!'));
console.log();

console.log('Partial Border (horizontal only):');
const horizontalBorder = BorderBuilder.rounded().horizontalOnly().build();

console.log(BorderRender.box(horizontalBorder, 'Only top and bottom borders'));
console.log();

console.log('Partial Border (left only):');
const leftBorder = BorderBuilder.thick().leftOnly().build();

console.log(BorderRender.box(leftBorder, 'Only left border'));
console.log();

// Border with padding
console.log('📏 Border with Padding:');
const paddedContent = BorderRender.boxWithPadding(
  roundedBorder,
  'This content has\ninternal padding\nfor better spacing',
  2
);
console.log(paddedContent);
console.log();

// Border with minimum size
console.log('📐 Border with Minimum Size:');
const sizedContent = BorderRender.boxWithMinSize(doubleBorder, 'Small', 20, 5);
console.log(sizedContent);
console.log();

// Function chaining with pipe
console.log('🔗 Function Chaining with Pipe:');
const pipedBorder = BorderBuilder.create()
  .pipe((chain) => chain.style('thick').topChar('━'))
  .pipe((chain) => chain.bottomChar('━').verticalOnly())
  .build();

console.log(BorderRender.box(pipedBorder, 'Piped transformations!'));
console.log();

// Integration with StyleBuilder (when border support is added to styles)
console.log('🎨 Style Integration Preview:');
const styledText = StyleBuilder.create()
  .bold(true)
  .foreground('#00FF00')
  .background('#000080')
  .render('Styled text ready for borders!');

console.log(BorderRender.box(roundedBorder, styledText));
console.log();

console.log('✅ Border System Demo Complete!');
console.log('The border system is now fully functional and ready for integration.');
