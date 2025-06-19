/**
 * Tree Simple Example - TypeScript/Bun port of lipgloss tree/simple/main.go
 * 
 * This example demonstrates a simple tree structure with operating systems.
 */

import { TreeBuilder } from '@tui/styling';

function main() {
  const t = TreeBuilder
    .fromRoot('.')
    .child('macOS')
    .child('Linux')
    .child('BSD')
    .build();

  console.log(TreeBuilder.from(t).render());
}

main();