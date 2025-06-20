/**
 * List Grocery Example - TypeScript/Bun port of lipgloss list/grocery/main.go
 *
 * This example demonstrates a grocery list with custom enumerators and styling
 * to show purchased items with checkmarks and strikethrough text.
 */

import { List, ListBuilder } from '@tui/styling';
import { output } from '@tui/styling/output';

const purchased = [
  'Bananas',
  'Barley',
  'Cashews',
  'Coconut Milk',
  'Dill',
  'Eggs',
  'Fish Cake',
  'Leeks',
  'Papaya',
];

const groceryItems = [
  'Artichoke',
  'Baking Flour',
  'Bananas',
  'Barley',
  'Bean Sprouts',
  'Cashew Apple',
  'Cashews',
  'Coconut Milk',
  'Curry Paste',
  'Currywurst',
  'Dill',
  'Dragonfruit',
  'Dried Shrimp',
  'Eggs',
  'Fish Cake',
  'Furikake',
  'Jicama',
  'Kohlrabi',
  'Leeks',
  'Lentils',
  'Licorice Root',
];

function groceryEnumerator(index: number): string {
  const item = groceryItems[index];
  for (const p of purchased) {
    if (item === p) {
      return '✓';
    }
  }
  return '•';
}

function itemStyleFunc(text: string): string {
  for (const p of purchased) {
    if (text === p) {
      // Apply strikethrough for purchased items
      return `\x1b[9m${text}\x1b[29m`; // ANSI strikethrough
    }
  }
  return text;
}

function enumeratorStyleFunc(text: string): string {
  if (text === '✓') {
    return `\x1b[32m${text}\x1b[0m`; // Green checkmark
  }
  return `\x1b[90m${text}\x1b[0m`; // Dim bullet
}

function main() {
  const l = ListBuilder.fromStrings(groceryItems)
    .enumerator(groceryEnumerator)
    .enumeratorStyle(enumeratorStyleFunc)
    .itemStyle(itemStyleFunc)
    .build();

  output.print(List.render(l));
}

main();
