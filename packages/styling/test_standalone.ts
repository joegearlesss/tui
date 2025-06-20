import { Border, Color, Layout, Position, StyleBuilder, print } from './src/index.js';

async function main() {
  const hasDarkBG = await Color.hasDarkBackground();
  const lightDark = (light: string, dark: string) => (hasDarkBG ? dark : light);

  const activeButton = StyleBuilder.create()
    .padding(0, 3)
    .background('#FF6AD2')
    .foreground('#FFFCC2')
    .build();
  
  const inactiveButton = StyleBuilder.from(activeButton)
    .background(lightDark('#988F95', '#978692'))
    .foreground(lightDark('#FDFCE3', '#FBFAE7'))
    .build();

  const buttons = ` ${StyleBuilder.from(activeButton).render('Yes')}  ${StyleBuilder.from(inactiveButton).render('No')}`;
  
  console.log('Step 1 - Raw buttons:');
  console.log(buttons);
  
  const content = Layout.joinVertical(Position.CENTER, 'Test text', buttons);
  console.log('\nStep 2 - After joinVertical:');
  console.log(content);
  
  const frameStyle = StyleBuilder.create()
    .border(Border.rounded())
    .borderForeground(lightDark('#C5ADF9', '#864EFF'))
    .padding(1, 3)
    .margin(1, 3)
    .build();
  
  const block = StyleBuilder.from(frameStyle).render(content);
  console.log('\nStep 3 - After frame styling:');
  console.log(block);
  
  console.log('\nStep 4 - Final print:');
  print(block);
}

main();