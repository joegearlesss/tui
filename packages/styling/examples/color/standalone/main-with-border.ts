/**
 * Enhanced version of the color example with borders
 * This example illustrates how to detect the terminal's background color and
 * choose either light or dark colors accordingly when using TUI Styling in a
 * standalone fashion, i.e. independent of Bubble Tea.
 *
 * This is a TypeScript/Bun reimplementation of the Lip Gloss v2 color example:
 * https://github.com/charmbracelet/lipgloss/blob/v2-exp/examples/color/standalone/main.go
 */

import { Border, Color, Layout, Position, Style, StyleBuilder } from '@tui/styling';

async function main(): Promise<void> {
  // Query for the background color. We only need to do this once, and only
  // when using TUI Styling standalone.
  //
  // In Bubble Tea listen for tea.BackgroundColorMsg in your Update.
  const hasDarkBG = await Color.hasDarkBackground();

  // Create a new helper function for choosing either a light or dark color
  // based on the detected background color.
  const lightDark = (lightColor: string, darkColor: string): string => {
    return hasDarkBG ? darkColor : lightColor;
  };

  // Define some styles. lightDark() can be used to choose the
  // appropriate light or dark color based on the detected background color.
  const frameStyle = StyleBuilder.create().padding(1, 3).margin(1, 3).build();

  const paragraphStyle = StyleBuilder.create()
    .width(40)
    .marginBottom(1)
    .alignHorizontal('center')
    .build();

  const textStyle = StyleBuilder.create().foreground(lightDark('#696969', '#bdbdbd')).build();

  const keywordStyle = StyleBuilder.create()
    .foreground(lightDark('#37CD96', '#22C78A'))
    .bold(true)
    .build();

  const activeButton = StyleBuilder.create()
    .padding(0, 3)
    .background('#FF6AD2')
    .foreground('#FFFCC2')
    .build();

  const inactiveButton = StyleBuilder.create()
    .padding(0, 3)
    .background(lightDark('#988F95', '#978692'))
    .foreground(lightDark('#FDFCE3', '#FBFAE7'))
    .build();

  // Build layout.
  const text = Style.render(
    paragraphStyle,
    Style.render(textStyle, 'Are you sure you want to eat that ') +
      Style.render(keywordStyle, 'moderately ripe') +
      Style.render(textStyle, ' banana?')
  );

  const buttons = `${Style.render(activeButton, 'Yes')} ${Style.render(inactiveButton, 'No')}`;

  const content = Layout.joinVertical(Position.CENTER, text, buttons);

  // Create a border around the content
  const borderConfig = Border.rounded();
  const borderColor = lightDark('#C5ADF9', '#864EFF');

  // For now, we'll create a simple bordered frame manually
  // since the border integration with styles needs more work
  const lines = content.split('\n');
  const maxWidth = Math.max(...lines.map((line) => line.length));
  const borderWidth = maxWidth + 6; // padding + border chars

  const topBorder =
    borderConfig.chars.topLeft +
    borderConfig.chars.top.repeat(borderWidth - 2) +
    borderConfig.chars.topRight;
  const bottomBorder =
    borderConfig.chars.bottomLeft +
    borderConfig.chars.bottom.repeat(borderWidth - 2) +
    borderConfig.chars.bottomRight;

  const borderedLines = [
    Style.render(StyleBuilder.create().foreground(borderColor).build(), topBorder),
    ...lines.map(
      (line) =>
        Style.render(
          StyleBuilder.create().foreground(borderColor).build(),
          borderConfig.chars.left
        ) +
        ' '.repeat(3) +
        line.padEnd(maxWidth) +
        ' '.repeat(3) +
        Style.render(
          StyleBuilder.create().foreground(borderColor).build(),
          borderConfig.chars.right
        )
    ),
    Style.render(StyleBuilder.create().foreground(borderColor).build(), bottomBorder),
  ];

  const block = Style.render(frameStyle, borderedLines.join('\n'));

  // Print the block to stdout. It's important to use TUI Styling's print
  // functions to ensure that colors are downsampled correctly. If output
  // isn't a TTY (i.e. we're logging to a file) colors will be stripped
  // entirely.
  //
  // Note that in Bubble Tea downsampling happens automatically.
  console.log(block);
}

// Run the example
main().catch(console.error);
