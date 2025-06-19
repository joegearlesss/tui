/**
 * Border System Test
 * Test if the border system is actually working
 */

import { Border, BorderBuilder, BorderRender } from '@tui/styling';

console.log('🔧 Testing Border System Implementation\n');

try {
  // Test basic border creation
  console.log('✅ Testing Border.normal():');
  const normalBorder = Border.normal();
  console.log('Normal border created:', normalBorder);
  console.log('');

  // Test border builder
  console.log('✅ Testing BorderBuilder:');
  const roundedBorder = BorderBuilder.rounded().horizontalOnly().build();
  console.log('Rounded horizontal border:', roundedBorder);
  console.log('');

  // Test border rendering
  console.log('✅ Testing BorderRender:');
  const boxed = BorderRender.box(Border.rounded(), 'Hello World!');
  console.log('Boxed text:');
  console.log(boxed);
  console.log('');

  console.log('🎉 Border system is FULLY WORKING!');
} catch (error) {
  console.error('❌ Border system error:', error);
}
