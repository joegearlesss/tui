import type { EnumeratorFunction } from './types';

/**
 * Built-in enumerator functions for common list styles
 */
export namespace Enumerator {
  /**
   * Simple bullet point enumerator (•)
   */
  export const BULLET: EnumeratorFunction = () => '•';

  /**
   * Dash enumerator (-)
   */
  export const DASH: EnumeratorFunction = () => '-';

  /**
   * Asterisk enumerator (*)
   */
  export const ASTERISK: EnumeratorFunction = () => '*';

  /**
   * Plus sign enumerator (+)
   */
  export const PLUS: EnumeratorFunction = () => '+';

  /**
   * Arabic numerals with period (1. 2. 3.)
   */
  export const ARABIC: EnumeratorFunction = (index: number) => `${index + 1}.`;

  /**
   * Arabic numerals with parenthesis (1) 2) 3))
   */
  export const ARABIC_PAREN: EnumeratorFunction = (index: number) => `${index + 1})`;

  /**
   * Arabic numerals with both parentheses ((1) (2) (3))
   */
  export const ARABIC_BOTH_PAREN: EnumeratorFunction = (index: number) => `(${index + 1})`;

  /**
   * Lowercase letters with period (a. b. c.)
   */
  export const ALPHA_LOWER: EnumeratorFunction = (index: number) => {
    const letter = String.fromCharCode(97 + (index % 26)); // a-z
    return `${letter}.`;
  };

  /**
   * Uppercase letters with period (A. B. C.)
   */
  export const ALPHA_UPPER: EnumeratorFunction = (index: number) => {
    const letter = String.fromCharCode(65 + (index % 26)); // A-Z
    return `${letter}.`;
  };

  /**
   * Lowercase letters with parenthesis (a) b) c))
   */
  export const ALPHA_LOWER_PAREN: EnumeratorFunction = (index: number) => {
    const letter = String.fromCharCode(97 + (index % 26));
    return `${letter})`;
  };

  /**
   * Uppercase letters with parenthesis (A) B) C))
   */
  export const ALPHA_UPPER_PAREN: EnumeratorFunction = (index: number) => {
    const letter = String.fromCharCode(65 + (index % 26));
    return `${letter})`;
  };

  /**
   * Roman numerals lowercase with period (i. ii. iii.)
   */
  export const ROMAN_LOWER: EnumeratorFunction = (index: number) => {
    const roman = toRoman(index + 1).toLowerCase();
    return `${roman}.`;
  };

  /**
   * Roman numerals uppercase with period (I. II. III.)
   */
  export const ROMAN_UPPER: EnumeratorFunction = (index: number) => {
    const roman = toRoman(index + 1);
    return `${roman}.`;
  };

  /**
   * Unicode arrows (→)
   */
  export const ARROW: EnumeratorFunction = () => '→';

  /**
   * Unicode triangles (▶)
   */
  export const TRIANGLE: EnumeratorFunction = () => '▶';

  /**
   * Unicode diamonds (◆)
   */
  export const DIAMOND: EnumeratorFunction = () => '◆';

  /**
   * Unicode squares (■)
   */
  export const SQUARE: EnumeratorFunction = () => '■';

  /**
   * Unicode circles (●)
   */
  export const CIRCLE: EnumeratorFunction = () => '●';

  /**
   * Empty/invisible enumerator for plain text lists
   */
  export const NONE: EnumeratorFunction = () => '';

  /**
   * Custom enumerator that cycles through multiple symbols
   */
  export function cycle(symbols: string[]): EnumeratorFunction {
    if (symbols.length === 0) {
      throw new Error('Cycle enumerator requires at least one symbol');
    }
    return (index: number) => symbols[index % symbols.length] ?? '';
  }

  /**
   * Custom enumerator with a prefix and suffix
   */
  export function custom(prefix = '', suffix = ''): EnumeratorFunction {
    return (index: number) => `${prefix}${index + 1}${suffix}`;
  }

  /**
   * Depth-aware enumerator that changes style based on nesting level
   */
  export function depthAware(enumerators: EnumeratorFunction[]): EnumeratorFunction {
    if (enumerators.length === 0) {
      throw new Error('Depth-aware enumerator requires at least one enumerator function');
    }
    return (index: number, depth = 0) => {
      const enumerator = enumerators[depth % enumerators.length];
      return enumerator ? enumerator(index) : '';
    };
  }
}

/**
 * Converts a number to Roman numerals
 */
function toRoman(num: number): string {
  if (num <= 0 || num > 3999) {
    return num.toString(); // Fallback for out-of-range values
  }

  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

  let result = '';
  let remaining = num;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const symbol = symbols[i];
    if (value !== undefined && symbol !== undefined) {
      while (remaining >= value) {
        result += symbol;
        remaining -= value;
      }
    }
  }

  return result;
}
