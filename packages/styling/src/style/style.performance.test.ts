import { describe, expect, test } from 'bun:test';
import { Style, StyleBuilder, type StyleProperties } from './style';

describe('Style Performance Tests', () => {
  describe('Style creation performance', () => {
    test('should create empty styles within 1ms for 1000 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.create();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(5);
    });

    test('should create styles from properties within 1ms for 1000 operations', () => {
      const properties: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
        width: 80,
        padding: { top: 1, right: 2, bottom: 3, left: 4 },
      };

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.from(properties);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('StyleBuilder performance', () => {
    test('should build complex styles within 1ms for 100 operations', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        StyleBuilder.create()
          .bold(true)
          .italic(true)
          .foreground('#FF0000')
          .background('#00FF00')
          .width(80)
          .height(24)
          .padding(1, 2, 3, 4)
          .margin(2, 4, 6, 8)
          .align('center', 'middle')
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should chain many operations efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 50; i++) {
        StyleBuilder.create()
          .bold(true)
          .italic(false)
          .underline(true)
          .strikethrough(false)
          .reverse(true)
          .blink(false)
          .faint(true)
          .foreground('#FF0000')
          .background('#00FF00')
          .width(80)
          .height(24)
          .maxWidth(120)
          .maxHeight(40)
          .padding(1)
          .paddingTop(2)
          .paddingRight(3)
          .paddingBottom(4)
          .paddingLeft(5)
          .margin(1)
          .marginTop(2)
          .marginRight(3)
          .marginBottom(4)
          .marginLeft(5)
          .marginBackground('#333333')
          .align('center', 'middle')
          .alignHorizontal('right')
          .alignVertical('bottom')
          .inline(true)
          .tabWidth(8)
          .setString('Hello, world!')
          .transform((text) => text.toUpperCase())
          .build();
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(20);
    });
  });

  describe('Style operations performance', () => {
    test('should copy styles efficiently', () => {
      const style: StyleProperties = {
        bold: true,
        italic: true,
        foreground: '#FF0000',
        background: '#00FF00',
        width: 80,
        height: 24,
        padding: { top: 1, right: 2, bottom: 3, left: 4 },
        margin: { top: 2, right: 4, bottom: 6, left: 8 },
      };

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.copy(style);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should inherit styles efficiently', () => {
      const parent: StyleProperties = {
        bold: true,
        foreground: '#FF0000',
        width: 80,
        padding: { top: 1, right: 2, bottom: 3, left: 4 },
      };

      const child: StyleProperties = {
        italic: true,
        background: '#00FF00',
        height: 24,
        margin: { top: 2, right: 4, bottom: 6, left: 8 },
      };

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.inherit(child, parent);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Style unset operations performance', () => {
    test('should unset properties efficiently', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .italic(true)
        .underline(true)
        .foreground('#FF0000')
        .background('#00FF00')
        .width(80)
        .height(24)
        .padding(1, 2, 3, 4)
        .margin(2, 4, 6, 8)
        .build();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.unsetBold(style);
        Style.unsetItalic(style);
        Style.unsetUnderline(style);
        Style.unsetForeground(style);
        Style.unsetBackground(style);
        Style.unsetWidth(style);
        Style.unsetHeight(style);
        Style.unsetPadding(style);
        Style.unsetMargin(style);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });
  });

  describe('Style rendering performance', () => {
    test('should render simple styles efficiently', () => {
      const style = StyleBuilder.create().bold(true).foreground('#FF0000').build();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.render(style, 'Hello, world!');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });

    test('should render complex styles efficiently', () => {
      const style = StyleBuilder.create()
        .bold(true)
        .italic(true)
        .underline(true)
        .foreground('#FF0000')
        .background('#00FF00')
        .width(80)
        .height(24)
        .padding(1, 2, 3, 4)
        .margin(2, 4, 6, 8)
        .align('center', 'middle')
        .transform((text) => text.toUpperCase())
        .build();

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        Style.render(style, 'Hello, world!');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(15);
    });

    test('should render with pre-set content efficiently', () => {
      const style = StyleBuilder.create()
        .setString('Pre-set content')
        .bold(true)
        .foreground('#FF0000')
        .build();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.renderString(style);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Style property getters performance', () => {
    test('should get properties efficiently', () => {
      const style = StyleBuilder.create()
        .width(80)
        .height(24)
        .padding(1, 2, 3, 4)
        .margin(2, 4, 6, 8)
        .build();

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        Style.getWidth(style);
        Style.getHeight(style);
        Style.getPadding(style);
        Style.getMargin(style);
        Style.getHorizontalPadding(style);
        Style.getVerticalPadding(style);
        Style.getHorizontalMargins(style);
        Style.getVerticalMargins(style);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('Memory usage tests', () => {
    test('should not leak memory when creating many styles', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 5000; i++) {
        StyleBuilder.create()
          .bold(i % 2 === 0)
          .italic(i % 3 === 0)
          .foreground(`#${(i % 256).toString(16).padStart(2, '0')}0000`)
          .background(`#00${(i % 256).toString(16).padStart(2, '0')}00`)
          .width(80 + (i % 40))
          .height(24 + (i % 16))
          .padding(i % 4)
          .margin(i % 3)
          .build();
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle rapid style operations without memory issues', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 2000; i++) {
        const style = StyleBuilder.create()
          .bold(true)
          .foreground('#FF0000')
          .width(80)
          .padding(2)
          .build();

        // Perform various operations
        Style.copy(style);
        Style.getWidth(style);
        Style.getPadding(style);
        Style.render(style, 'test');
        Style.unsetBold(style);
      }

      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Concurrent operations performance', () => {
    test('should handle concurrent style creation efficiently', async () => {
      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return StyleBuilder.create()
          .bold(i % 2 === 0)
          .foreground(`#${(i % 256).toString(16).padStart(2, '0')}0000`)
          .width(80 + i)
          .padding(i % 4)
          .build();
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(50);
    });

    test('should handle concurrent rendering efficiently', async () => {
      const style = StyleBuilder.create()
        .bold(true)
        .foreground('#FF0000')
        .transform((text) => text.toUpperCase())
        .build();

      const start = performance.now();

      const promises = Array.from({ length: 100 }, async (_, i) => {
        return Style.render(style, `Hello, world ${i}!`);
      });

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(30);
    });
  });
});
