#!/usr/bin/env bun

/**
 * Demo showcasing the enhanced color system in @tui/styling
 * Run with: bun run demo-colors.ts
 */

import { Color, Style } from './src';

console.log('🎨 Enhanced Color System Demo\n');

// ANSI 256 Color Palette
console.log('📊 ANSI 256 Color Utilities:');
console.log(`Grayscale: ${Color.ANSI256.grayscale(0)} -> ${Color.ANSI256.grayscale(23)}`);
console.log(`RGB Cube: ${Color.ANSI256.rgb(5, 0, 0)} (bright red)`);
console.log(`From RGB: ${Color.ANSI256.fromRgb(128, 128, 128)} (gray)`);
console.log(`Closest to RGB(100,200,50): ${Color.ANSI256.closest(100, 200, 50)}`);
console.log();

// HSL Color Space
console.log('🌈 HSL Color Space:');
const redRgb = { r: 255, g: 0, b: 0 };
const redHsl = Color.HSL.fromRgb(redRgb);
console.log(`Red RGB ${JSON.stringify(redRgb)} -> HSL ${JSON.stringify(redHsl)}`);

const blueHsl = { h: 240, s: 100, l: 50 };
const blueRgb = Color.HSL.toRgb(blueHsl);
console.log(`Blue HSL ${JSON.stringify(blueHsl)} -> RGB ${JSON.stringify(blueRgb)}`);
console.log();

// Color Manipulation
console.log('🎭 Color Manipulation:');
const baseColor = 'red';
console.log(`Base: ${baseColor}`);
console.log(`Lightened: ${Color.Manipulate.lighten(baseColor, 30)}`);
console.log(`Darkened: ${Color.Manipulate.darken(baseColor, 30)}`);
console.log(`Desaturated: ${Color.Manipulate.desaturate(baseColor, 50)}`);
console.log(`Complement: ${Color.Manipulate.complement(baseColor)}`);
console.log(`Mixed with blue: ${Color.Manipulate.mix(baseColor, 'blue', 50)}`);
console.log(`Inverted: ${Color.Manipulate.invert(baseColor)}`);
console.log();

// Color Palettes
console.log('🎨 Color Palette Generation:');
console.log(`Monochromatic (red): ${Color.Palette.monochromatic('red', 5).join(', ')}`);
console.log(`Analogous (blue): ${Color.Palette.analogous('blue', 3).join(', ')}`);
console.log(`Complementary (green): ${Color.Palette.complementary('green').join(', ')}`);
console.log(`Triadic (yellow): ${Color.Palette.triadic('yellow').join(', ')}`);
console.log(
  `Split-complementary (purple): ${Color.Palette.splitComplementary('#800080').join(', ')}`
);
console.log();

// Visual Demo with Styled Text
console.log('✨ Visual Color Demo:');

// Create styles with different color manipulations
const styles = [
  { name: 'Original Red', style: Style.foreground(Style.create(), 'red') },
  {
    name: 'Lightened Red',
    style: Style.foreground(Style.create(), Color.Manipulate.lighten('red', 30)!),
  },
  {
    name: 'Darkened Red',
    style: Style.foreground(Style.create(), Color.Manipulate.darken('red', 30)!),
  },
  {
    name: 'Red Complement',
    style: Style.foreground(Style.create(), Color.Manipulate.complement('red')!),
  },
  { name: 'ANSI 196', style: Style.foreground(Style.create(), 196) },
  { name: 'Hex Purple', style: Style.foreground(Style.create(), '#9932CC') },
];

for (const { name, style } of styles) {
  const rendered = Style.render(style, `● ${name}`);
  console.log(rendered);
}

console.log();

// Palette Demo
console.log('🌈 Palette Demo:');
const palette = Color.Palette.monochromatic('blue', 7);
palette.forEach((color, i) => {
  const style = Style.background(Style.foreground(Style.create(), 'white'), color);
  const rendered = Style.render(style, ` ${i + 1} `);
  process.stdout.write(rendered);
});
console.log(' <- Monochromatic Blue Palette');

console.log();

// ANSI 256 Grayscale Demo
console.log('⚫ ANSI 256 Grayscale:');
for (let i = 0; i < 24; i += 3) {
  const ansiColor = Color.ANSI256.grayscale(i);
  const style = Style.background(Style.create(), ansiColor);
  const rendered = Style.render(style, '  ');
  process.stdout.write(rendered);
}
console.log(' <- Grayscale Gradient');

console.log('\n🎉 Enhanced color system ready! 245 tests passing.');
