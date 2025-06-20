import { describe, test, expect } from 'bun:test';
import { StyleBuilder } from '../../src/style/style';
import { Color } from '../../src/color/color';
import { Border } from '../../src/border/index';
import { Layout } from '../../src/layout/joining';
import { Canvas } from '../../src/canvas/canvas';
import { Layer } from '../../src/canvas/layer';
import { ANSI } from '../../src/ansi/ansi';

/**
 * Integration tests for Style and Layout component interactions
 * Tests complex workflows involving styling, borders, layouts, and canvas operations
 */
describe('Style and Layout Integration', () => {
  describe('Styled Border Workflows', () => {
    test('creates styled content with borders and layouts', () => {
      // Create styled content blocks
      const header = StyleBuilder.create()
        .foreground(Color.parseHex('#FFFFFF')!)
        .background(Color.parseHex('#0000FF')!)
        .padding(1)
        .render('HEADER');

      const content = StyleBuilder.create()
        .foreground(Color.parseHex('#000000')!)
        .background(Color.parseHex('#FFFFFF')!)
        .padding(2)
        .render('Main Content\nSecond Line');

      const footer = StyleBuilder.create()
        .foreground(Color.parseHex('#FFFFFF')!)
        .background(Color.parseHex('#808080')!)
        .padding(1)
        .render('FOOTER');

      // Join vertically to create a document structure
      const document = Layout.joinVertical('left', header, content, footer);

      expect(document).toContain('HEADER');
      expect(document).toContain('Main Content');
      expect(document).toContain('FOOTER');
      // In test environment, colors are disabled, so just check structure
      expect(document.split('\n').length).toBeGreaterThan(3);
    });

    test('applies borders to styled content', () => {
      // Create styled content
      const styledContent = StyleBuilder.create()
        .foreground(Color.parseHex('#00FF00')!)
        .background(Color.parseHex('#000000')!)
        .padding(1)
        .render('Success Message');

      // Apply border
      const borderedContent = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground(Color.parseHex('#00FF00')!)
        .render(styledContent);

      expect(borderedContent).toContain('Success Message');
      expect(borderedContent).toContain('╭'); // Rounded border corners
      expect(borderedContent).toContain('╯');
      // Check that border was applied
      expect(borderedContent.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('Canvas Layout Integration', () => {
    test('creates complex layouts with canvas and layers', () => {
      // Create styled layers
      const headerLayer = Layer.create(
        StyleBuilder.create()
          .background(Color.parseHex('#0000FF')!)
          .foreground(Color.parseHex('#FFFFFF')!)
          .width(20)
          .align('center')
          .render('APPLICATION')
      ).position(0, 0);

      const menuLayer = Layer.create(
        StyleBuilder.create()
          .border(Border.normal())
          .padding(1)
          .render('1. Option A\n2. Option B\n3. Option C')
      ).position(0, 2);

      const contentLayer = Layer.create(
        StyleBuilder.create()
          .border(Border.thick())
          .borderForeground(Color.parseNamed('yellow')!)
          .padding(2)
          .width(30)
          .render('Main content area\nwith multiple lines\nof information')
      ).position(25, 2);

      // Combine into canvas
      const canvas = Canvas.create()
        .addLayer(headerLayer)
        .addLayer(menuLayer)
        .addLayer(contentLayer);

      const rendered = canvas.render();

      expect(rendered).toContain('APPLICATION');
      expect(rendered).toContain('Option A');
      expect(rendered).toContain('Main content area');
      
      // Should have proper positioning
      const lines = rendered.split('\n');
      expect(lines[0]).toContain('APPLICATION'); // Header at top
      expect(lines.length).toBeGreaterThan(5); // Multiple layers create height
    });

    test('handles overlapping layers correctly', () => {
      // Create overlapping layers
      const backgroundLayer = Layer.create(
        StyleBuilder.create()
          .background(Color.parseNamed('red')!)
          .width(10)
          .height(5)
          .render('BACKGROUND')
      ).position(0, 0);

      const overlayLayer = Layer.create(
        StyleBuilder.create()
          .background(Color.parseNamed('blue')!)
          .foreground(Color.parseNamed('white')!)
          .width(8)
          .height(3)
          .render('OVERLAY')
      ).position(2, 1);

      const canvas = Canvas.create()
        .addLayer(backgroundLayer)
        .addLayer(overlayLayer); // Added second, should be on top

      const rendered = canvas.render();

      expect(rendered).toContain('BACKGROUND');
      expect(rendered).toContain('OVERLAY');
      
      // Overlay should be visible (last layer wins in overlapping areas)
      const lines = rendered.split('\n');
      expect(lines[1]).toContain('OVERLAY'); // Overlay at y=1
    });
  });

  describe('Advanced Layout Compositions', () => {
    test('creates dashboard-like layout with multiple styled components', () => {
      // Create status indicators
      const statusOk = StyleBuilder.create()
        .foreground(Color.parseNamed('green')!)
        .render('● OK');
      
      const statusWarn = StyleBuilder.create()
        .foreground(Color.parseNamed('yellow')!)
        .render('● WARN');

      const statusError = StyleBuilder.create()
        .foreground(Color.parseNamed('red')!)
        .render('● ERROR');

      // Create status panel
      const statusPanel = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .render(Layout.joinVertical('left', 
          'System Status:',
          statusOk,
          statusWarn, 
          statusError
        ));

      // Create metrics panel
      const metricsPanel = StyleBuilder.create()
        .border(Border.thick())
        .borderForeground(Color.parseNamed('blue')!)
        .padding(1)
        .render(Layout.joinVertical('left',
          'Metrics:',
          'CPU: 45%',
          'Memory: 67%',
          'Disk: 23%'
        ));

      // Create logs panel
      const logsPanel = StyleBuilder.create()
        .border(Border.rounded())
        .borderForeground(Color.parseNamed('gray')!)
        .padding(1)
        .height(8)
        .render(Layout.joinVertical('left',
          'Recent Logs:',
          '[INFO] Application started',
          '[WARN] Connection timeout',
          '[ERROR] Failed to connect'
        ));

      // Combine panels horizontally
      const topRow = Layout.joinHorizontal('top', statusPanel, '  ', metricsPanel);
      
      // Create full dashboard
      const dashboard = Layout.joinVertical('left', topRow, '', logsPanel);

      expect(dashboard).toContain('System Status');
      expect(dashboard).toContain('Metrics');
      expect(dashboard).toContain('Recent Logs');
      expect(dashboard).toContain('● OK');
      expect(dashboard).toContain('CPU: 45%');
      expect(dashboard).toContain('[INFO]');
      
      // Should have proper structure
      expect(dashboard.split('\n').length).toBeGreaterThan(8);
      expect(dashboard).toContain('┌'); // Normal borders
      expect(dashboard).toContain('┏'); // Thick borders  
      expect(dashboard).toContain('╭'); // Rounded borders
    });

    test('creates responsive layout that adapts to content', () => {
      // Create variable content
      const shortContent = 'Short';
      const longContent = 'This is a much longer piece of content that should affect layout';

      // Test with short content
      const shortStyled = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .render(shortContent);

      const longStyled = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .render(longContent);

      // Join horizontally - should adapt to content width
      const shortLayout = Layout.joinHorizontal('middle', shortStyled, ' | ', shortStyled);
      const longLayout = Layout.joinHorizontal('middle', longStyled, ' | ', shortStyled);

      // Short layout should be narrower
      const shortWidth = ANSI.width(shortLayout.split('\n')[0] || '');
      const longWidth = ANSI.width(longLayout.split('\n')[0] || '');

      expect(longWidth).toBeGreaterThan(shortWidth);
      expect(shortLayout).toContain('Short');
      expect(longLayout).toContain('much longer piece');
    });
  });

  describe('Color and Theme Integration', () => {
    test('applies consistent color theme across components', () => {
      // Define a color theme
      const theme = {
        primary: Color.parseNamed('blue')!,
        secondary: Color.parseNamed('cyan')!,
        success: Color.parseNamed('green')!,
        warning: Color.parseNamed('yellow')!,
        error: Color.parseNamed('red')!,
        background: Color.parseNamed('black')!,
        foreground: Color.parseNamed('white')!
      };

      // Create themed components
      const header = StyleBuilder.create()
        .background(theme.primary)
        .foreground(theme.foreground)
        .padding(1)
        .align('center')
        .width(40)
        .render('THEMED APPLICATION');

      const successMessage = StyleBuilder.create()
        .foreground(theme.success)
        .border(Border.normal())
        .borderForeground(theme.success)
        .padding(1)
        .render('✓ Operation completed successfully');

      const warningMessage = StyleBuilder.create()
        .foreground(theme.warning)
        .border(Border.normal())
        .borderForeground(theme.warning)
        .padding(1)
        .render('⚠ Warning: Check configuration');

      const errorMessage = StyleBuilder.create()
        .foreground(theme.error)
        .border(Border.thick())
        .borderForeground(theme.error)
        .padding(1)
        .render('✗ Error: Connection failed');

      // Combine into themed layout
      const themedApp = Layout.joinVertical('left',
        header,
        '',
        successMessage,
        warningMessage,
        errorMessage
      );

      expect(themedApp).toContain('THEMED APPLICATION');
      expect(themedApp).toContain('Operation completed');
      expect(themedApp).toContain('Warning: Check');
      expect(themedApp).toContain('Error: Connection');
      
      // Check that components were combined
      expect(themedApp.split('\n').length).toBeGreaterThan(5);
    });
  });

  describe('Border Style Combinations', () => {
    test('combines different border styles in layout', () => {
      // Create content with different border styles
      const normalBorder = StyleBuilder.create()
        .border(Border.normal())
        .padding(1)
        .render('Normal Border');

      const thickBorder = StyleBuilder.create()
        .border(Border.thick())
        .padding(1)
        .render('Thick Border');

      const roundedBorder = StyleBuilder.create()
        .border(Border.rounded())
        .padding(1)
        .render('Rounded Border');

      const doubleBorder = StyleBuilder.create()
        .border(Border.double())
        .padding(1)
        .render('Double Border');

      // Join in a grid layout
      const topRow = Layout.joinHorizontal('top', normalBorder, '  ', thickBorder);
      const bottomRow = Layout.joinHorizontal('top', roundedBorder, '  ', doubleBorder);
      const grid = Layout.joinVertical('left', topRow, '', bottomRow);

      expect(grid).toContain('Normal Border');
      expect(grid).toContain('Thick Border');
      expect(grid).toContain('Rounded Border');
      expect(grid).toContain('Double Border');

      // Should contain different border characters
      expect(grid).toContain('┌'); // Normal corners
      expect(grid).toContain('┏'); // Thick corners
      expect(grid).toContain('╭'); // Rounded corners
      expect(grid).toContain('╔'); // Double corners
    });
  });

  describe('Performance Integration', () => {
    test('handles complex layouts efficiently', () => {
      const start = performance.now();

      // Create a complex nested layout
      const components: string[] = [];
      
      for (let i = 0; i < 50; i++) {
        const component = StyleBuilder.create()
          .border(Border.normal())
          .borderForeground(i % 2 === 0 ? Color.parseNamed('blue')! : Color.parseNamed('green')!)
          .padding(1)
          .render(`Component ${i + 1}`);
        components.push(component);
      }

      // Create grid layout (10x5)
      const rows: string[] = [];
      for (let row = 0; row < 5; row++) {
        const rowComponents = components.slice(row * 10, (row + 1) * 10);
        const joinedRow = Layout.joinHorizontal('top', ...rowComponents);
        rows.push(joinedRow);
      }

      const complexLayout = Layout.joinVertical('left', ...rows);

      const end = performance.now();
      const duration = end - start;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second max

      // Verify content exists
      expect(complexLayout).toContain('Component 1');
      expect(complexLayout).toContain('Component 50');
      // Check that layout was created
      expect(complexLayout.split('\n').length).toBeGreaterThan(10);
    });
  });

  describe('Text Alignment Integration', () => {
    test('creates aligned layouts with different content lengths', () => {
      // Create content with different lengths
      const short = StyleBuilder.create()
        .border(Border.normal())
        .width(20)
        .align('center')
        .render('Short');

      const medium = StyleBuilder.create()
        .border(Border.normal())
        .width(20)
        .align('center')
        .render('Medium length');

      const long = StyleBuilder.create()
        .border(Border.normal())
        .width(20)
        .align('center')
        .render('Very long content here');

      // Test different alignments
      const leftAligned = Layout.joinVertical('left', short, medium, long);
      const centerAligned = Layout.joinVertical('center', short, medium, long);
      const rightAligned = Layout.joinVertical('right', short, medium, long);

      // All should contain the content
      [leftAligned, centerAligned, rightAligned].forEach(layout => {
        expect(layout).toContain('Short');
        expect(layout).toContain('Medium length');
        expect(layout).toContain('Very long content');
      });

      // Should have different positioning (hard to test precisely without exact measurements)
      expect(leftAligned).not.toBe(centerAligned);
      expect(centerAligned).not.toBe(rightAligned);
    });
  });
});