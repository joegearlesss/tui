/**
 * Table Chess Example - TypeScript/Bun port of lipgloss table/chess/main.go
 *
 * This example demonstrates a chess board using a table with Unicode chess pieces.
 */

import { Border, Layout, StyleBuilder, Table, TableBuilder, print } from '@tui/styling';

function main() {
  const labelStyle = StyleBuilder.create().foreground('#6C6C6C'); // Color 241 approximation

  const board = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  const t = TableBuilder.create()
    .border(Border.normal())
    .borderRow(true)
    .borderColumn(true)
    .rows(...board) // No headers - just rows like Go version
    .styleFunc((row: number, col: number) => {
      return {
        padding: { top: 0, right: 1, bottom: 0, left: 1 },
      };
    })
    .build();

  const ranks = labelStyle.render([' A', 'B', 'C', 'D', 'E', 'F', 'G', 'H  '].join('   '));
  const files = labelStyle.render(
    [' 1 ', ' 2 ', ' 3 ', ' 4 ', ' 5 ', ' 6 ', ' 7 ', ' 8 '].join('\n\n')
  );

  const result = `${Layout.joinVertical(
    1.0, // right alignment
    Layout.joinHorizontal(0.5, files, Table.render(t)), // center alignment
    ranks
  )}\n`;

  print(result);
}

main();
