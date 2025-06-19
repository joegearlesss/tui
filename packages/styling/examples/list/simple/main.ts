/**
 * List Simple Example - TypeScript/Bun port of lipgloss list/simple/main.go
 * 
 * This example demonstrates a simple nested list with Roman numerals.
 */

import { List, ListBuilder } from '@tui/styling';

function main() {
  const nestedList = ListBuilder
    .fromStrings(['D', 'E', 'F'])
    .enumerator(List.Enumerator.ROMAN_LOWER)
    .build();

  const l = ListBuilder
    .create(['A', 'B', 'C', nestedList, 'G'])
    .build();
  
  console.log(List.render(l));
}

main();