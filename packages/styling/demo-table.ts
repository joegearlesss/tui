/**
 * Table Component Demo
 *
 * Demonstrates the table component functionality matching OVERVIEW examples.
 */

import { Border, Style, Table, TableBuilder, TableRender } from './src';

// Create a simple table
const simpleTable = TableBuilder.create()
  .headers('Name', 'Age', 'City')
  .rows(['John', '25', 'NYC'], ['Jane', '30', 'LA'], ['Bob', '35', 'Chicago'])
  .build();

console.log('Simple Table:');
console.log(TableRender.render(simpleTable));
console.log();

// Create a table with borders
const borderedTable = TableBuilder.create()
  .headers('Feature', 'Status', 'Priority')
  .rows(
    ['Color System', '✅ Complete', 'High'],
    ['Border System', '✅ Complete', 'High'],
    ['Table Component', '✅ Complete', 'High'],
    ['List Component', '📋 Planned', 'Medium'],
    ['Tree Component', '📋 Planned', 'Medium']
  )
  .border(Border.rounded())
  .build();

console.log('Bordered Table:');
console.log(TableRender.render(borderedTable));
console.log();

// Create a table with styling
const styledTable = TableBuilder.create()
  .headers('Language', 'Formal', 'Informal')
  .rows(['English', 'Hello', 'Hi'], ['Spanish', 'Hola', 'Hey'], ['French', 'Bonjour', 'Salut'])
  .styleFunc((row, _col) => {
    if (row === Table.HEADER_ROW) {
      return Style.bold(Style.create(), true);
    }
    if (row % 2 === 0) {
      return Style.background(Style.create(), '#F8F8F8');
    }
    return Style.create();
  })
  .border(Border.normal())
  .build();

console.log('Styled Table:');
console.log(TableRender.render(styledTable));
console.log();

// Demonstrate functional composition
const dataTable = Table.headers(
  'Product',
  'Price',
  'Stock'
)(
  Table.rows(
    ['Laptop', '$999', '5'],
    ['Mouse', '$25', '50'],
    ['Keyboard', '$75', '20']
  )(Table.border(Border.thick())(Table.create()))
);

console.log('Functional Composition Table:');
console.log(TableRender.render(dataTable));
console.log();

// Table metrics
const metrics = Table.calculateMetrics(borderedTable);
console.log('Table Metrics:');
console.log(`Columns: ${metrics.columnCount}`);
console.log(`Rows: ${metrics.rowCount}`);
console.log(`Total Width: ${metrics.totalWidth}`);
console.log(`Total Height: ${metrics.totalHeight}`);
console.log(`Column Widths: [${metrics.columnWidths.join(', ')}]`);
console.log();

// Validation example
const invalidTable = Table.rows(['John', '25'])(Table.create()); // No headers
const validation = Table.validate(invalidTable);
console.log('Validation Example:');
console.log(`Valid: ${validation.isValid}`);
console.log(`Errors: ${validation.errors.join(', ')}`);
console.log(`Warnings: ${validation.warnings.join(', ')}`);
