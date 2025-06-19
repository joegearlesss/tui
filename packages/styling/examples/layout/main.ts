/**
 * Layout Example - TypeScript/Bun port of lipgloss layout/main.go
 * 
 * This example demonstrates various Lip Gloss style and layout features,
 * including tabs, dialogs, lists, color grids, and status bars.
 */

import { Border, Color, Layout, StyleBuilder, Canvas, newLayer, print } from '@tui/styling';

const width = 96;
const columnWidth = 30;

// Detect background color and create lightDark helper
const hasDarkBG = await Color.hasDarkBackground();
const lightDark = (light: string, dark: string) => hasDarkBG ? dark : light;

// Style definitions
const subtle = lightDark('#D9DCCF', '#383838');
const highlight = lightDark('#874BFD', '#7D56F4');
const special = lightDark('#43BF6D', '#73F59F');

const divider = StyleBuilder.create()
  .setString('•')
  .padding(0, 1)
  .foreground(subtle)
  .render('');

const url = (text: string) => StyleBuilder.create().foreground(special).render(text);

// Tab borders
const activeTabBorder = Border.custom({
  chars: {
    top: '─',
    bottom: ' ',
    left: '│',
    right: '│',
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '┘',
    bottomRight: '└'
  }
});

const tabBorder = Border.custom({
  chars: {
    top: '─',
    bottom: '─',
    left: '│',
    right: '│',
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '┴',
    bottomRight: '┴'
  }
});

const tab = StyleBuilder.create()
  .border(tabBorder)
  .borderForeground(highlight)
  .padding(0, 1);

const activeTab = StyleBuilder.create()
  .border(activeTabBorder)
  .borderForeground(highlight)
  .padding(0, 1);

const tabGap = StyleBuilder.create()
  .border(tabBorder)
  .borderForeground(highlight)
  .padding(0, 1);

// Title
const titleStyle = StyleBuilder.create()
  .marginLeft(1)
  .marginRight(5)
  .padding(0, 1)
  .italic(true)
  .foreground('#FFF7DB')
  .setString('Lip Gloss');

const descStyle = StyleBuilder.create().marginTop(1);

const infoStyle = StyleBuilder.create()
  .border(Border.normal())
  .borderForeground(subtle);

// Dialog
const dialogBoxStyle = StyleBuilder.create()
  .border(Border.rounded())
  .padding(1, 0);

const buttonStyle = StyleBuilder.create()
  .foreground('#FFF7DB')
  .background('#888B7E')
  .padding(0, 3)
  .marginTop(1);

const activeButtonStyle = StyleBuilder.create()
  .foreground('#FFF7DB')
  .background('#F25D94')
  .padding(0, 3)
  .marginTop(1)
  .marginRight(2)
  .underline(true);

// List
const list = StyleBuilder.create()
  .border(Border.normal())
  .borderForeground(subtle)
  .marginRight(1)
  .height(8)
  .width(Math.floor(width / 3));

const listHeader = (text: string) => StyleBuilder.create()
  .border(Border.normal())
  .borderForeground(subtle)
  .marginRight(2)
  .render(text);

const listItem = (text: string) => StyleBuilder.create().paddingLeft(2).render(text);

const checkMark = StyleBuilder.create()
  .foreground(special)
  .paddingRight(1)
  .render('✓');

const listDone = (s: string) => checkMark + StyleBuilder.create()
  .strikethrough(true)
  .foreground(lightDark('#969B86', '#696969'))
  .render(s);

// Paragraphs/History
const historyStyle = StyleBuilder.create()
  .alignHorizontal('left')
  .foreground('#FAFAFA')
  .background(highlight)
  .margin(1, 3, 0, 0)
  .padding(1, 2)
  .height(19)
  .width(columnWidth);

// Status Bar
const statusNugget = StyleBuilder.create()
  .foreground('#FFFDF5')
  .padding(0, 1);

const statusBarStyle = StyleBuilder.create()
  .foreground(lightDark('#343433', '#C1C6B2'))
  .background(lightDark('#D9DCCF', '#353533'));

const statusStyle = StyleBuilder.create()
  .inherit(statusBarStyle.build())
  .foreground('#FFFDF5')
  .background('#FF5F87')
  .padding(0, 1)
  .marginRight(1);

const encodingStyle = StyleBuilder.create()
  .inherit(statusNugget.build())
  .background('#A550DF')
  .alignHorizontal('right');

const statusText = StyleBuilder.create().inherit(statusBarStyle.build());

const fishCakeStyle = StyleBuilder.create()
  .inherit(statusNugget.build())
  .background('#6124DF');

// Floating thing
const floatingStyle = StyleBuilder.create()
  .italic(true)
  .foreground('#FFF7DB')
  .background('#F25D94')
  .padding(1, 6)
  .alignHorizontal('center');

// Page
const docStyle = StyleBuilder.create().padding(1, 2, 1, 2);

// Helper function to generate color grid
function colorGrid(xSteps: number, ySteps: number): string[][] {
  // Using predefined colors since we don't have the colorful library
  const colors = [
    ['#F25D94', '#F56D9A', '#F87DA0', '#FB8DA6'],
    ['#E457A0', '#E767A6', '#EA77AC', '#ED87B2'],
    ['#D651AC', '#D961B2', '#DC71B8', '#DF81BE'],
    ['#C84BB8', '#CB5BBE', '#CE6BC4', '#D17BCA'],
    ['#BA45C4', '#BD55CA', '#C065D0', '#C375D6'],
    ['#AC3FD0', '#AF4FD6', '#B25FDC', '#B56FE2'],
    ['#9E39DC', '#A149E2', '#A459E8', '#A769EE'],
    ['#9033E8', '#9343EE', '#9653F4', '#9963FA']
  ];

  return colors.slice(0, ySteps).map(row => row.slice(0, xSteps));
}

// Helper function to apply gradient (simplified version)
function applyGradient(base: any, input: string, from: string, to: string): string {
  // For now, just return the plain text with the 'from' color
  // The gradient effect will be simpler but functional
  return StyleBuilder.create().foreground(from).render(input);
}

// Build the document
let doc = '';

// Tabs
{
  const row = Layout.joinHorizontal(
    0.0, // top alignment
    activeTab.render('Lip Gloss'),
    tab.render('Blush'),
    tab.render('Eye Shadow'),
    tab.render('Mascara'),
    tab.render('Foundation')
  );
  
  const gap = tabGap.render(' '.repeat(Math.max(0, width - row.length - 2)));
  const fullRow = Layout.joinHorizontal(1.0, row, gap); // bottom alignment
  doc += fullRow + '\n\n';
}

// Title
{
  const colors = colorGrid(1, 5);
  let title = '';
  
  for (let i = 0; i < colors.length; i++) {
    const offset = 2;
    const c = colors[i][0];
    const titleLine = StyleBuilder.create()
      .inherit(titleStyle.build())
      .marginLeft(i * offset)
      .background(c)
      .render('');
    title += titleLine;
    if (i < colors.length - 1) {
      title += '\n';
    }
  }

  const desc = Layout.joinVertical(
    0.0, // left alignment
    descStyle.render('Style Definitions for Nice Terminal Layouts'),
    infoStyle.render('From Charm' + divider + url('https://github.com/charmbracelet/lipgloss'))
  );

  const row = Layout.joinHorizontal(0.0, title, desc); // top alignment
  doc += row + '\n\n';
}

// Dialog
{
  // Create simpler buttons to avoid styling issues
  const okButton = '   Yes   ';
  const cancelButton = '   Maybe   ';

  const questionText = 'Are you sure you want to eat marmalade?';

  // Build dialog content manually to avoid styling issues  
  const question = Layout.place(50, 1, 0.5, 0.5, questionText);
  const buttons = Layout.joinHorizontal(0.5, okButton, cancelButton);
  
  const dialogContent = Layout.joinVertical(0.5, 
    '', // empty line for spacing
    question,
    '', // empty line for spacing
    buttons,
    '' // empty line for spacing
  );

  const dialog = Layout.place(width, 9, 0.5, 0.5, // center, center
    dialogBoxStyle.render(dialogContent),
    {
      whitespaceChars: '猫咪',
      whitespaceStyle: { foreground: subtle }
    }
  );

  doc += dialog + '\n\n';
}

// Color grid
const colors = (() => {
  const colors = colorGrid(14, 8);
  let result = '';
  
  for (const row of colors) {
    for (const color of row) {
      const s = StyleBuilder.create().background(color).render('  ');
      result += s;
    }
    result += '\n';
  }
  
  
  return result;
})();

// Lists
const lists = Layout.joinHorizontal(0.0, // top alignment
  list.render(
    Layout.joinVertical(0.0, // left alignment
      listHeader('Citrus Fruits to Try'),
      listDone('Grapefruit'),
      listDone('Yuzu'),
      listItem('Citron'),
      listItem('Kumquat'),
      listItem('Pomelo')
    )
  ),
  list.render(
    Layout.joinVertical(0.0, // left alignment
      listHeader('Actual Lip Gloss Vendors'),
      listItem('Glossier'),
      listItem("Claire's Boutique"),
      listDone('Nyx'),
      listItem('Mac'),
      listDone('Milk')
    )
  )
);

doc += Layout.joinHorizontal(0.0, lists, colors); // top alignment

// Marmalade history
{
  const historyA = "The Romans learned from the Greeks that quinces slowly cooked with honey would \"set\" when cool. The Apicius gives a recipe for preserving whole quinces, stems and leaves attached, in a bath of honey diluted with defrutum: Roman marmalade. Preserves of quince and lemon appear (along with rose, apple, plum and pear) in the Book of ceremonies of the Byzantine Emperor Constantine VII Porphyrogennetos.";
  const historyB = "Medieval quince preserves, which went by the French name cotignac, produced in a clear version and a fruit pulp version, began to lose their medieval seasoning of spices in the 16th century. In the 17th century, La Varenne provided recipes for both thick and clear cotignac.";
  const historyC = "In 1524, Henry VIII, King of England, received a \"box of marmalade\" from Mr. Hull of Exeter. This was probably marmelada, a solid quince paste from Portugal, still made and sold in southern Europe today. It became a favourite treat of Anne Boleyn and her ladies in waiting.";

  doc += Layout.joinHorizontal(0.0, // top alignment
    historyStyle.alignHorizontal('right').render(historyA),
    historyStyle.alignHorizontal('center').render(historyB),
    historyStyle.marginRight(0).render(historyC)
  );

  doc += '\n\n';
}

// Status bar
{
  const lightDarkState = hasDarkBG ? 'Dark' : 'Light';

  const statusKey = statusStyle.render('STATUS');
  const encoding = encodingStyle.render('UTF-8');
  const fishCake = fishCakeStyle.render('🍥 Fish Cake');
  
  const statusVal = statusText
    .width(width - statusKey.length - encoding.length - fishCake.length)
    .render('Ravishingly ' + lightDarkState + '!');

  const bar = Layout.joinHorizontal(0.0, // top alignment
    statusKey,
    statusVal,
    encoding,
    fishCake
  );

  doc += statusBarStyle.width(width).render(bar);
}

// Render the document
const document = docStyle.render(doc);

// Surprise! Composite some bonus content on top of the document.
const modal = floatingStyle.render('Now with Compositing!');
const canvas = new Canvas(
  newLayer(document),
  newLayer(modal).x(58).y(44)
);

// Print the result
print(canvas.render());