/**
 * Table Languages Example - TypeScript/Bun port of lipgloss table/languages/main.go
 *
 * This example demonstrates a table with different language greetings,
 * showing styled headers, alternating row colors, and cell alignment.
 */

import { Border, Table, TableBuilder, print } from '@tui/styling';

const purple = '#9966CC'; // Color 99 approximation
const gray = '#8A8A8A'; // Color 245 approximation
const lightGray = '#6C6C6C'; // Color 241 approximation

function main() {
  const rows = [
    ['Chinese', '您好', '你好'],
    ['Japanese', 'こんにちは', 'やあ'],
    ['Arabic', 'أهلين', 'أهلا'],
    ['Russian', 'Здравствуйте', 'Привет'],
    ['Spanish', 'Hola', '¿Qué tal?'],
  ];

  const t = TableBuilder.create()
    .border(Border.thick())
    .borderColumn(true)
    .styleFunc((row: number, col: number) => {
      // Note: In our API, row -1 represents header row
      if (row === Table.HEADER_ROW) {
        return {
          foreground: purple,
          bold: true,
          padding: { top: 0, right: 1, bottom: 0, left: 1 },
          width: 14,
          horizontalAlignment: 'center',
        };
      }

      const isEvenRow = row % 2 === 0;
      const foreground = isEvenRow ? lightGray : gray;
      let width = 14;

      // Make the second column a little wider
      if (col === 1) {
        width = 22;
      }

      const style: any = {
        foreground,
        padding: { top: 0, right: 1, bottom: 0, left: 1 },
        width,
      };

      // Arabic is a right-to-left language, so right align the text
      if (row < rows.length && rows[row][0] === 'Arabic' && col !== 0) {
        style.horizontalAlignment = 'right';
      }

      return style;
    })
    .headers('LANGUAGE', 'FORMAL', 'INFORMAL')
    .rows(...rows)
    .addRow(['English', 'You look absolutely fabulous.', "How's it going?"])
    .build();

  print(Table.render(t));
}

main();
