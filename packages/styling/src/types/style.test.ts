import { describe, expect, test } from 'bun:test';
import {
  TextFormattingSchema,
  BorderSideSchema,
  BorderDefinitionSchema,
  BorderVisibilitySchema,
  type TextFormatting,
  type BorderSide,
  type BorderDefinition,
  type BorderVisibility,
} from './style';

describe('TextFormattingSchema', () => {
  test('validates valid text formatting options', () => {
    const validFormatting: TextFormatting = {
      bold: true,
      italic: false,
      underline: true,
    };

    expect(() => TextFormattingSchema.parse(validFormatting)).not.toThrow();
  });

  test('validates empty formatting object', () => {
    expect(() => TextFormattingSchema.parse({})).not.toThrow();
  });

  test('validates all formatting options', () => {
    const allOptions: TextFormatting = {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      reverse: true,
      blink: true,
      faint: true,
      underlineSpaces: true,
      strikethroughSpaces: true,
      colorWhitespace: true,
    };

    expect(() => TextFormattingSchema.parse(allOptions)).not.toThrow();
  });

  test('rejects invalid boolean values', () => {
    expect(() => TextFormattingSchema.parse({ bold: 'true' })).toThrow();
    expect(() => TextFormattingSchema.parse({ italic: 1 })).toThrow();
  });
});

describe('BorderSideSchema', () => {
  test('validates valid border side with character only', () => {
    const borderSide: BorderSide = {
      character: '|',
    };

    expect(() => BorderSideSchema.parse(borderSide)).not.toThrow();
  });

  test('validates border side with colors', () => {
    const borderSide: BorderSide = {
      character: '─',
      foreground: '#ff0000',
      background: '#00ff00',
    };

    expect(() => BorderSideSchema.parse(borderSide)).not.toThrow();
  });

  test('rejects empty character', () => {
    expect(() => BorderSideSchema.parse({ character: '' })).toThrow();
  });

  test('rejects multi-character strings', () => {
    expect(() => BorderSideSchema.parse({ character: '||' })).toThrow();
  });

  test('rejects missing character', () => {
    expect(() => BorderSideSchema.parse({})).toThrow();
  });
});

describe('BorderDefinitionSchema', () => {
  test('validates complete border definition', () => {
    const borderDef: BorderDefinition = {
      top: '─',
      bottom: '─',
      left: '│',
      right: '│',
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
    };

    expect(() => BorderDefinitionSchema.parse(borderDef)).not.toThrow();
  });

  test('validates border definition with optional middle characters', () => {
    const borderDef: BorderDefinition = {
      top: '─',
      bottom: '─',
      left: '│',
      right: '│',
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      middle: '┼',
      middleTop: '┬',
      middleBottom: '┴',
      middleLeft: '├',
      middleRight: '┤',
    };

    expect(() => BorderDefinitionSchema.parse(borderDef)).not.toThrow();
  });

  test('rejects missing required fields', () => {
    expect(() => BorderDefinitionSchema.parse({ top: '─' })).toThrow();
    expect(() => BorderDefinitionSchema.parse({})).toThrow();
  });
});

describe('BorderVisibilitySchema', () => {
  test('validates all sides visible', () => {
    const visibility: BorderVisibility = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };

    expect(() => BorderVisibilitySchema.parse(visibility)).not.toThrow();
  });

  test('validates partial visibility', () => {
    const visibility: BorderVisibility = {
      top: true,
      right: false,
      bottom: true,
      left: false,
    };

    expect(() => BorderVisibilitySchema.parse(visibility)).not.toThrow();
  });

  test('validates no sides visible', () => {
    const visibility: BorderVisibility = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    };

    expect(() => BorderVisibilitySchema.parse(visibility)).not.toThrow();
  });

  test('rejects missing required fields', () => {
    expect(() => BorderVisibilitySchema.parse({ top: true })).toThrow();
    expect(() => BorderVisibilitySchema.parse({})).toThrow();
  });

  test('rejects non-boolean values', () => {
    expect(() => BorderVisibilitySchema.parse({ 
      top: 'true', 
      right: true, 
      bottom: true, 
      left: true 
    })).toThrow();
  });
});