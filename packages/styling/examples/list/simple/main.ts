/**
 * List Simple Example - TypeScript/Bun port of lipgloss list/simple/main.go
 * 
 * This example demonstrates a simple nested list with Roman numerals.
 */

import { List, ListBuilder, print } from '@tui/styling';

function main() {
  const nestedList = ListBuilder
    .fromStrings(['D', 'E', 'F'])
    .enumerator(List.Enumerator.ROMAN_UPPER)
    .build();

  const l = ListBuilder
    .create(['A', 'B', 'C', nestedList, 'G'])
    .build();
  
  print(List.render(l));
}

main();