/**
 * Visual Diff Analyzer - Comprehensive visual comparison system
 * 
 * Provides character-level precision analysis for Lipgloss output parity testing
 * Based on VISUAL_TESTING.md specifications
 */

interface DiffResult {
  isIdentical: boolean;
  differences: VisualDifference[];
  stats: DiffStats;
}

interface VisualDifference {
  type: 'character' | 'ansi' | 'spacing' | 'line';
  position: { line: number; column: number };
  expected: string;
  actual: string;
  context: string;
  severity: 'critical' | 'major' | 'minor';
}

interface DiffStats {
  totalLines: number;
  differentLines: number;
  characterDifferences: number;
  ansiDifferences: number;
  accuracyPercentage: number;
}

/**
 * Advanced visual comparison analyzer for terminal output
 */
export class VisualDiffAnalyzer {
  
  /**
   * Performs comprehensive visual comparison between reference and actual output
   */
  static compare(reference: string, actual: string): DiffResult {
    const refLines = this.normalizeOutput(reference).split('\n');
    const actLines = this.normalizeOutput(actual).split('\n');
    
    const differences: VisualDifference[] = [];
    let characterDiffs = 0;
    let ansiDiffs = 0;
    
    const maxLines = Math.max(refLines.length, actLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const refLine = refLines[i] || '';
      const actLine = actLines[i] || '';
      
      if (refLine !== actLine) {
        const lineDiffs = this.compareLines(refLine, actLine, i);
        differences.push(...lineDiffs);
        
        // Count specific difference types
        for (const diff of lineDiffs) {
          if (diff.type === 'character') characterDiffs++;
          if (diff.type === 'ansi') ansiDiffs++;
        }
      }
    }
    
    return {
      isIdentical: differences.length === 0,
      differences,
      stats: {
        totalLines: maxLines,
        differentLines: differences.filter(d => d.type === 'line').length,
        characterDifferences: characterDiffs,
        ansiDifferences: ansiDiffs,
        accuracyPercentage: this.calculateAccuracy(reference, actual, differences)
      }
    };
  }
  
  /**
   * Detailed line-by-line comparison with ANSI sequence analysis
   */
  private static compareLines(reference: string, actual: string, lineNum: number): VisualDifference[] {
    const differences: VisualDifference[] = [];
    
    // Extract ANSI sequences for separate comparison
    const refAnsi = this.extractAnsiSequences(reference);
    const actAnsi = this.extractAnsiSequences(actual);
    
    // Compare ANSI sequences
    if (JSON.stringify(refAnsi) !== JSON.stringify(actAnsi)) {
      differences.push({
        type: 'ansi',
        position: { line: lineNum, column: 0 },
        expected: JSON.stringify(refAnsi),
        actual: JSON.stringify(actAnsi),
        context: `Line ${lineNum + 1}: ANSI sequence mismatch`,
        severity: 'critical'
      });
    }
    
    // Compare visible text (ANSI stripped)
    const refText = this.stripAnsi(reference);
    const actText = this.stripAnsi(actual);
    
    if (refText !== actText) {
      // Character-by-character comparison
      const charDiffs = this.compareCharacters(refText, actText, lineNum);
      differences.push(...charDiffs);
    }
    
    return differences;
  }
  
  /**
   * Character-level diff analysis with context
   */
  private static compareCharacters(reference: string, actual: string, lineNum: number): VisualDifference[] {
    const differences: VisualDifference[] = [];
    const maxLength = Math.max(reference.length, actual.length);
    
    for (let i = 0; i < maxLength; i++) {
      const refChar = reference[i] || '';
      const actChar = actual[i] || '';
      
      if (refChar !== actChar) {
        differences.push({
          type: 'character',
          position: { line: lineNum, column: i },
          expected: this.formatChar(refChar),
          actual: this.formatChar(actChar),
          context: this.getCharacterContext(reference, actual, i, 5),
          severity: this.getCharacterSeverity(refChar, actChar)
        });
      }
    }
    
    return differences;
  }
  
  /**
   * Extract and parse ANSI escape sequences
   */
  private static extractAnsiSequences(text: string): string[] {
    const ansiRegex = /\x1b\[[0-9;]*m/g;
    return text.match(ansiRegex) || [];
  }
  
  /**
   * Strip ANSI sequences to get visible text only
   */
  private static stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }
  
  /**
   * Normalize output for consistent comparison
   */
  private static normalizeOutput(output: string): string {
    return output
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')    // Handle remaining \r
      .trimEnd();              // Remove trailing whitespace
  }
  
  /**
   * Format character for display in diff output
   */
  private static formatChar(char: string): string {
    if (!char) return '<MISSING>';
    if (char === ' ') return '<SPACE>';
    if (char === '\t') return '<TAB>';
    if (char === '\n') return '<NEWLINE>';
    if (char.charCodeAt(0) < 32) return `<CTRL:${char.charCodeAt(0)}>`;
    return char;
  }
  
  /**
   * Get surrounding context for character differences
   */
  private static getCharacterContext(ref: string, act: string, pos: number, radius: number): string {
    const start = Math.max(0, pos - radius);
    const end = Math.min(Math.max(ref.length, act.length), pos + radius + 1);
    
    const refContext = ref.slice(start, end);
    const actContext = act.slice(start, end);
    
    return `Expected: "${refContext}" | Actual: "${actContext}"`;
  }
  
  /**
   * Determine severity of character difference
   */
  private static getCharacterSeverity(expected: string, actual: string): 'critical' | 'major' | 'minor' {
    // Missing characters are critical
    if (!expected || !actual) return 'critical';
    
    // Different visible characters are major
    if (expected.trim() !== actual.trim()) return 'major';
    
    // Whitespace differences are minor
    return 'minor';
  }
  
  /**
   * Calculate overall accuracy percentage
   */
  private static calculateAccuracy(reference: string, actual: string, differences: VisualDifference[]): number {
    const totalChars = Math.max(reference.length, actual.length);
    const errorChars = differences.filter(d => d.type === 'character').length;
    
    return totalChars > 0 ? ((totalChars - errorChars) / totalChars) * 100 : 100;
  }
}

export type { DiffResult, VisualDifference, DiffStats };