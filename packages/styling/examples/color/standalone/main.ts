/**
 * This example illustrates how to detect the terminal's background color and
 * choose either light or dark colors accordingly when using TUI Styling in a
 * standalone fashion, i.e. independent of Bubble Tea.
 *
 * This is the TypeScript/Bun equivalent of the Go lipgloss color standalone example.
 */

import { Border, Color, Layout, Position, StyleBuilder } from '@tui/styling';
import { output } from '../../../src/output';

async function main(): Promise<void> {
  // Query for the background color. We only need to do this once, and only
  // when using TUI Styling standalone.
  //
  // In Bubble Tea listen for tea.BackgroundColorMsg in your Update.
  const hasDarkBG = await Color.hasDarkBackground();

  // Create a new helper function for choosing either a light or dark color
  // based on the detected background color.
  const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

  // Define some styles. lightDark() can be used to choose the
  // appropriate light or dark color based on the detected background color.
  const frameStyle = StyleBuilder.create()
    .border(Border.rounded())
    .borderForeground(lightDark('#C5ADF9', '#864EFF'))
    .padding(1, 3)
    .margin(1, 3)
    .build();

  const paragraphStyle = StyleBuilder.create()
    .width(40)
    .marginBottom(1)
    .alignHorizontal(Position.CENTER)
    .build();
  const textStyle = StyleBuilder.create().foreground(lightDark('#696969', '#bdbdbd')).build();
  const keywordStyle = StyleBuilder.create()
    .foreground(lightDark('#37CD96', '#22C78A'))
    .bold()
    .build();

  const activeButton = StyleBuilder.create()
    .padding(0, 3)
    .background('#FF6AD2')
    .foreground('#FFFCC2')
    .build();
  const inactiveButton = StyleBuilder.from(activeButton)
    .background(lightDark('#988F95', '#978692'))
    .foreground(lightDark('#FDFCE3', '#FBFAE7'))
    .build();

  // Build layout.
  const text = StyleBuilder.from(paragraphStyle).render(
    `${StyleBuilder.from(textStyle).render('Are you sure you want to eat that ')}${StyleBuilder.from(keywordStyle).render('moderatly ripe')}${StyleBuilder.from(textStyle).render(' banana?')}`
  );
  const buttons = `${StyleBuilder.from(activeButton).render('Yes')}  ${StyleBuilder.from(inactiveButton).render('No')}`;

  // Create content and apply border using the new border integration
  const content = Layout.joinVertical(Position.CENTER, text, buttons);
  const block = StyleBuilder.from(frameStyle).render(content);

  // Print the block to stdout. It's important to use proper output
  // functions to ensure that colors are downsampled correctly. If output
  // isn't a TTY (i.e. we're logging to a file) colors will be stripped
  // entirely.
  //
  // Note that in Bubble Tea downsampling happens automatically.
  output.print(block);
}

// Only run if this file is executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error('Error running color standalone example:', error);
    process.exit(1);
  });
}

export { main };
