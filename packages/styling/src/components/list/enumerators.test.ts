import { describe, expect, test } from 'bun:test';
import { Enumerator } from './enumerators';

describe('Enumerator constants', () => {
  test('BULLET returns bullet point', () => {
    expect(Enumerator.BULLET(0)).toBe('•');
    expect(Enumerator.BULLET(5)).toBe('•');
  });

  test('DASH returns dash', () => {
    expect(Enumerator.DASH(0)).toBe('-');
    expect(Enumerator.DASH(10)).toBe('-');
  });

  test('ASTERISK returns asterisk', () => {
    expect(Enumerator.ASTERISK(0)).toBe('*');
    expect(Enumerator.ASTERISK(3)).toBe('*');
  });

  test('PLUS returns plus sign', () => {
    expect(Enumerator.PLUS(0)).toBe('+');
    expect(Enumerator.PLUS(7)).toBe('+');
  });

  test('ARABIC returns numbered list', () => {
    expect(Enumerator.ARABIC(0)).toBe('1.');
    expect(Enumerator.ARABIC(1)).toBe('2.');
    expect(Enumerator.ARABIC(9)).toBe('10.');
  });

  test('ARABIC_PAREN returns numbered list with parenthesis', () => {
    expect(Enumerator.ARABIC_PAREN(0)).toBe('1)');
    expect(Enumerator.ARABIC_PAREN(1)).toBe('2)');
    expect(Enumerator.ARABIC_PAREN(9)).toBe('10)');
  });

  test('ARABIC_BOTH_PAREN returns numbered list with both parentheses', () => {
    expect(Enumerator.ARABIC_BOTH_PAREN(0)).toBe('(1)');
    expect(Enumerator.ARABIC_BOTH_PAREN(1)).toBe('(2)');
    expect(Enumerator.ARABIC_BOTH_PAREN(9)).toBe('(10)');
  });

  test('ALPHA_LOWER returns lowercase letters', () => {
    expect(Enumerator.ALPHA_LOWER(0)).toBe('a.');
    expect(Enumerator.ALPHA_LOWER(1)).toBe('b.');
    expect(Enumerator.ALPHA_LOWER(25)).toBe('z.');
    expect(Enumerator.ALPHA_LOWER(26)).toBe('a.'); // Cycles back
  });

  test('ALPHA_UPPER returns uppercase letters', () => {
    expect(Enumerator.ALPHA_UPPER(0)).toBe('A.');
    expect(Enumerator.ALPHA_UPPER(1)).toBe('B.');
    expect(Enumerator.ALPHA_UPPER(25)).toBe('Z.');
    expect(Enumerator.ALPHA_UPPER(26)).toBe('A.'); // Cycles back
  });

  test('ALPHA_LOWER_PAREN returns lowercase letters with parenthesis', () => {
    expect(Enumerator.ALPHA_LOWER_PAREN(0)).toBe('a)');
    expect(Enumerator.ALPHA_LOWER_PAREN(1)).toBe('b)');
    expect(Enumerator.ALPHA_LOWER_PAREN(25)).toBe('z)');
  });

  test('ALPHA_UPPER_PAREN returns uppercase letters with parenthesis', () => {
    expect(Enumerator.ALPHA_UPPER_PAREN(0)).toBe('A)');
    expect(Enumerator.ALPHA_UPPER_PAREN(1)).toBe('B)');
    expect(Enumerator.ALPHA_UPPER_PAREN(25)).toBe('Z)');
  });

  test('ROMAN_LOWER returns lowercase roman numerals', () => {
    expect(Enumerator.ROMAN_LOWER(0)).toBe('i.');
    expect(Enumerator.ROMAN_LOWER(1)).toBe('ii.');
    expect(Enumerator.ROMAN_LOWER(2)).toBe('iii.');
    expect(Enumerator.ROMAN_LOWER(3)).toBe('iv.');
    expect(Enumerator.ROMAN_LOWER(4)).toBe('v.');
    expect(Enumerator.ROMAN_LOWER(9)).toBe('x.');
  });

  test('ROMAN_UPPER returns uppercase roman numerals', () => {
    expect(Enumerator.ROMAN_UPPER(0)).toBe('I.');
    expect(Enumerator.ROMAN_UPPER(1)).toBe('II.');
    expect(Enumerator.ROMAN_UPPER(2)).toBe('III.');
    expect(Enumerator.ROMAN_UPPER(3)).toBe('IV.');
    expect(Enumerator.ROMAN_UPPER(4)).toBe('V.');
    expect(Enumerator.ROMAN_UPPER(9)).toBe('X.');
  });

  test('Unicode symbol enumerators', () => {
    expect(Enumerator.ARROW(0)).toBe('→');
    expect(Enumerator.TRIANGLE(0)).toBe('▶');
    expect(Enumerator.DIAMOND(0)).toBe('◆');
    expect(Enumerator.SQUARE(0)).toBe('■');
    expect(Enumerator.CIRCLE(0)).toBe('●');
  });

  test('NONE returns empty string', () => {
    expect(Enumerator.NONE(0)).toBe('');
    expect(Enumerator.NONE(5)).toBe('');
  });
});

describe('Enumerator convenience functions', () => {
  test('bullet() returns BULLET function', () => {
    const bulletFn = Enumerator.bullet();
    expect(bulletFn(0)).toBe('•');
  });

  test('dash() returns DASH function', () => {
    const dashFn = Enumerator.dash();
    expect(dashFn(0)).toBe('-');
  });

  test('asterisk() returns ASTERISK function', () => {
    const asteriskFn = Enumerator.asterisk();
    expect(asteriskFn(0)).toBe('*');
  });

  test('plus() returns PLUS function', () => {
    const plusFn = Enumerator.plus();
    expect(plusFn(0)).toBe('+');
  });

  test('arabic() returns ARABIC function', () => {
    const arabicFn = Enumerator.arabic();
    expect(arabicFn(0)).toBe('1.');
    expect(arabicFn(4)).toBe('5.');
  });

  test('alphabet() returns ALPHA_LOWER function', () => {
    const alphabetFn = Enumerator.alphabet();
    expect(alphabetFn(0)).toBe('a.');
    expect(alphabetFn(1)).toBe('b.');
  });

  test('roman() returns ROMAN_LOWER function', () => {
    const romanFn = Enumerator.roman();
    expect(romanFn(0)).toBe('i.');
    expect(romanFn(4)).toBe('v.');
  });
});

describe('Enumerator custom functions', () => {
  test('cycle() creates cycling enumerator', () => {
    const cycleFn = Enumerator.cycle(['●', '○', '◆']);
    
    expect(cycleFn(0)).toBe('●');
    expect(cycleFn(1)).toBe('○');
    expect(cycleFn(2)).toBe('◆');
    expect(cycleFn(3)).toBe('●'); // Cycles back
    expect(cycleFn(4)).toBe('○');
  });

  test('cycle() throws error with empty array', () => {
    expect(() => Enumerator.cycle([])).toThrow('Cycle enumerator requires at least one symbol');
  });

  test('cycle() handles single symbol', () => {
    const cycleFn = Enumerator.cycle(['★']);
    expect(cycleFn(0)).toBe('★');
    expect(cycleFn(5)).toBe('★');
  });

  test('custom() creates enumerator with prefix and suffix', () => {
    const customFn = Enumerator.custom('[', ']');
    
    expect(customFn(0)).toBe('[1]');
    expect(customFn(1)).toBe('[2]');
    expect(customFn(9)).toBe('[10]');
  });

  test('custom() works with empty prefix and suffix', () => {
    const customFn = Enumerator.custom();
    
    expect(customFn(0)).toBe('1');
    expect(customFn(1)).toBe('2');
  });

  test('custom() works with only prefix', () => {
    const customFn = Enumerator.custom('Step ');
    
    expect(customFn(0)).toBe('Step 1');
    expect(customFn(1)).toBe('Step 2');
  });

  test('custom() works with only suffix', () => {
    const customFn = Enumerator.custom('', ':');
    
    expect(customFn(0)).toBe('1:');
    expect(customFn(1)).toBe('2:');
  });

  test('depthAware() creates depth-sensitive enumerator', () => {
    const depthFn = Enumerator.depthAware([
      Enumerator.ARABIC,
      Enumerator.ALPHA_LOWER,
      Enumerator.ROMAN_LOWER,
    ]);
    
    expect(depthFn(0, 0)).toBe('1.');
    expect(depthFn(0, 1)).toBe('a.');
    expect(depthFn(0, 2)).toBe('i.');
    expect(depthFn(0, 3)).toBe('1.'); // Cycles back to first
  });

  test('depthAware() throws error with empty array', () => {
    expect(() => Enumerator.depthAware([])).toThrow('Depth-aware enumerator requires at least one enumerator function');
  });

  test('depthAware() works with single enumerator', () => {
    const depthFn = Enumerator.depthAware([Enumerator.BULLET]);
    
    expect(depthFn(0, 0)).toBe('•');
    expect(depthFn(0, 1)).toBe('•');
    expect(depthFn(0, 5)).toBe('•');
  });

  test('depthAware() handles default depth parameter', () => {
    const depthFn = Enumerator.depthAware([
      Enumerator.ARABIC,
      Enumerator.ALPHA_LOWER,
    ]);
    
    // When depth is not provided, should default to 0
    expect(depthFn(0)).toBe('1.');
    expect(depthFn(1)).toBe('2.');
  });
});

describe('Roman numeral conversion', () => {
  test('converts basic numbers to roman numerals', () => {
    expect(Enumerator.ROMAN_UPPER(0)).toBe('I.');
    expect(Enumerator.ROMAN_UPPER(4)).toBe('V.');
    expect(Enumerator.ROMAN_UPPER(9)).toBe('X.');
    expect(Enumerator.ROMAN_UPPER(49)).toBe('L.');
    expect(Enumerator.ROMAN_UPPER(99)).toBe('C.');
    expect(Enumerator.ROMAN_UPPER(499)).toBe('D.');
    expect(Enumerator.ROMAN_UPPER(999)).toBe('M.');
  });

  test('converts complex numbers to roman numerals', () => {
    expect(Enumerator.ROMAN_UPPER(3)).toBe('IV.');
    expect(Enumerator.ROMAN_UPPER(8)).toBe('IX.');
    expect(Enumerator.ROMAN_UPPER(39)).toBe('XL.');
    expect(Enumerator.ROMAN_UPPER(89)).toBe('XC.');
    expect(Enumerator.ROMAN_UPPER(399)).toBe('CD.');
    expect(Enumerator.ROMAN_UPPER(899)).toBe('CM.');
  });

  test('handles edge cases for roman numerals', () => {
    // Test year-like numbers
    expect(Enumerator.ROMAN_UPPER(1993)).toBe('MCMXCIV.');
    expect(Enumerator.ROMAN_UPPER(2023)).toBe('MMXXIV.');
  });

  test('handles out-of-range values', () => {
    // Should fallback to regular numbers for values outside roman numeral range
    expect(Enumerator.ROMAN_UPPER(-1)).toBe('0.');
    expect(Enumerator.ROMAN_UPPER(3999)).toBe('4000.');
  });
});

describe('Enumerator function types', () => {
  test('all enumerators return strings', () => {
    const enumerators = [
      Enumerator.BULLET,
      Enumerator.DASH,
      Enumerator.ASTERISK,
      Enumerator.PLUS,
      Enumerator.ARABIC,
      Enumerator.ARABIC_PAREN,
      Enumerator.ARABIC_BOTH_PAREN,
      Enumerator.ALPHA_LOWER,
      Enumerator.ALPHA_UPPER,
      Enumerator.ALPHA_LOWER_PAREN,
      Enumerator.ALPHA_UPPER_PAREN,
      Enumerator.ROMAN_LOWER,
      Enumerator.ROMAN_UPPER,
      Enumerator.ARROW,
      Enumerator.TRIANGLE,
      Enumerator.DIAMOND,
      Enumerator.SQUARE,
      Enumerator.CIRCLE,
      Enumerator.NONE,
    ];

    for (const enumerator of enumerators) {
      expect(typeof enumerator(0)).toBe('string');
      expect(typeof enumerator(5)).toBe('string');
    }
  });

  test('all convenience functions return functions', () => {
    const functions = [
      Enumerator.bullet,
      Enumerator.dash,
      Enumerator.asterisk,
      Enumerator.plus,
      Enumerator.arabic,
      Enumerator.alphabet,
      Enumerator.roman,
    ];

    for (const fn of functions) {
      const result = fn();
      expect(typeof result).toBe('function');
      expect(typeof result(0)).toBe('string');
    }
  });
});