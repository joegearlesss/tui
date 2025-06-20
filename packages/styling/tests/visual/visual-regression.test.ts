/**
 * Visual Regression Test Suite
 * 
 * Comprehensive testing for visual parity with Go Lipgloss reference implementation
 * Ensures character-perfect output matching across all examples
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { VisualDiffAnalyzer, type DiffResult } from '../../tools/visual-diff-analyzer';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const REFERENCE_DIR = 'test-references';
const OUTPUT_DIR = 'test-outputs';

describe('Visual Regression Tests', () => {
  
  const EXAMPLES = [
    'color-standalone',
    'list-simple', 
    'list-grocery'
  ];
  
  beforeAll(() => {
    // Ensure output directory exists
    try {
      execSync(`mkdir -p ${OUTPUT_DIR}`, { stdio: 'ignore' });
    } catch {
      // Directory might already exist
    }
  });
  
  describe('Example Visual Parity', () => {
    test.each(EXAMPLES)('Visual parity: %s', async (example) => {
      const referencePath = join(REFERENCE_DIR, `${example}-reference.txt`);
      const outputPath = join(OUTPUT_DIR, `${example}-typescript.txt`);
      
      // Skip test if reference file doesn't exist yet
      if (!existsSync(referencePath)) {
        console.warn(`⚠️  Reference file not found: ${referencePath}`);
        console.warn(`   Run ./scripts/generate-reference.sh to create reference files`);
        return;
      }
      
      // Generate TypeScript output if it doesn't exist
      if (!existsSync(outputPath)) {
        console.log(`📝 Generating TypeScript output for ${example}...`);
        try {
          const exampleFile = example.replace('-', '/');
          const output = execSync(`bun run examples/${exampleFile}/main.ts`, {
            encoding: 'utf8',
            cwd: process.cwd()
          });
          writeFileSync(outputPath, output);
        } catch (error: any) {
          throw new Error(`Failed to generate output for ${example}: ${error.message}`);
        }
      }
      
      // Read reference and actual outputs
      const reference = readFileSync(referencePath, 'utf8');
      const actual = readFileSync(outputPath, 'utf8');
      
      // Perform comprehensive comparison
      const result = VisualDiffAnalyzer.compare(reference, actual);
      
      // Generate detailed error message if different
      if (!result.isIdentical) {
        const errorMsg = generateDetailedErrorMessage(example, result);
        console.error(errorMsg);
        
        // Save diff report for debugging
        const diffReport = generateDiffReport(result);
        writeFileSync(join(OUTPUT_DIR, `${example}-diff-report.json`), 
                     JSON.stringify(diffReport, null, 2));
      }
      
      // Assert perfect visual match
      expect(result.isIdentical).toBe(true);
      expect(result.stats.accuracyPercentage).toBe(100);
    });
  });
  
  describe('Component-Specific Visual Tests', () => {
    test('Color standalone output accuracy', async () => {
      const example = 'color-standalone';
      
      // Skip if files don't exist
      const referencePath = join(REFERENCE_DIR, `${example}-reference.txt`);
      if (!existsSync(referencePath)) return;
      
      const result = await performVisualComparison(example);
      
      // Color-specific validation
      expect(result.stats.ansiDifferences).toBe(0);
      expect(result.isIdentical).toBe(true);
    });
    
    test('List component visual accuracy', async () => {
      const examples = ['list-simple', 'list-grocery'];
      
      for (const example of examples) {
        const referencePath = join(REFERENCE_DIR, `${example}-reference.txt`);
        if (!existsSync(referencePath)) continue;
        
        const result = await performVisualComparison(example);
        
        // List-specific validation
        expect(result.stats.characterDifferences).toBe(0);
        expect(result.isIdentical).toBe(true);
      }
    });
  });
  
  describe('Accuracy Thresholds', () => {
    test('All examples meet minimum accuracy threshold', async () => {
      const MIN_ACCURACY = 95; // 95% minimum accuracy
      const results: Array<{ example: string; accuracy: number }> = [];
      
      for (const example of EXAMPLES) {
        const referencePath = join(REFERENCE_DIR, `${example}-reference.txt`);
        if (!existsSync(referencePath)) continue;
        
        const result = await performVisualComparison(example);
        results.push({
          example,
          accuracy: result.stats.accuracyPercentage
        });
        
        expect(result.stats.accuracyPercentage).toBeGreaterThanOrEqual(MIN_ACCURACY);
      }
      
      // Log overall accuracy summary
      if (results.length > 0) {
        const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
        console.log(`📊 Average accuracy across ${results.length} examples: ${avgAccuracy.toFixed(2)}%`);
      }
    });
  });
});

/**
 * Perform visual comparison for a given example
 */
async function performVisualComparison(example: string): Promise<DiffResult> {
  const referencePath = join(REFERENCE_DIR, `${example}-reference.txt`);
  const outputPath = join(OUTPUT_DIR, `${example}-typescript.txt`);
  
  const reference = readFileSync(referencePath, 'utf8');
  const actual = readFileSync(outputPath, 'utf8');
  
  return VisualDiffAnalyzer.compare(reference, actual);
}

/**
 * Generate detailed error message for visual regressions
 */
function generateDetailedErrorMessage(testName: string, result: DiffResult): string {
  let message = `\n❌ Visual regression detected in: ${testName}\n`;
  message += `📊 Accuracy: ${result.stats.accuracyPercentage.toFixed(2)}%\n`;
  message += `📝 Total differences: ${result.differences.length}\n\n`;
  
  // Group differences by type
  const criticalDiffs = result.differences.filter(d => d.severity === 'critical');
  const majorDiffs = result.differences.filter(d => d.severity === 'major');
  const minorDiffs = result.differences.filter(d => d.severity === 'minor');
  
  if (criticalDiffs.length > 0) {
    message += `🚨 CRITICAL ISSUES (${criticalDiffs.length}):\n`;
    criticalDiffs.slice(0, 5).forEach(diff => {
      message += `  Line ${diff.position.line + 1}, Col ${diff.position.column + 1}: `;
      message += `Expected "${diff.expected}" → Got "${diff.actual}"\n`;
      message += `  Context: ${diff.context}\n\n`;
    });
  }
  
  if (majorDiffs.length > 0) {
    message += `⚠️  MAJOR ISSUES (${majorDiffs.length}):\n`;
    majorDiffs.slice(0, 3).forEach(diff => {
      message += `  Line ${diff.position.line + 1}: ${diff.context}\n`;
    });
  }
  
  if (minorDiffs.length > 0) {
    message += `ℹ️  MINOR ISSUES: ${minorDiffs.length} whitespace differences\n`;
  }
  
  return message;
}

/**
 * Generate comprehensive diff report for debugging
 */
function generateDiffReport(result: DiffResult) {
  return {
    timestamp: new Date().toISOString(),
    stats: result.stats,
    criticalIssues: result.differences.filter(d => d.severity === 'critical'),
    majorIssues: result.differences.filter(d => d.severity === 'major'),
    minorIssues: result.differences.filter(d => d.severity === 'minor'),
    recommendations: generateRecommendations(result.differences)
  };
}

/**
 * Generate actionable recommendations based on difference patterns
 */
function generateRecommendations(differences: VisualDifference[]): string[] {
  const recommendations: string[] = [];
  
  const ansiIssues = differences.filter(d => d.type === 'ansi');
  if (ansiIssues.length > 0) {
    recommendations.push('Check ANSI escape sequence generation in color and style modules');
  }
  
  const characterIssues = differences.filter(d => d.type === 'character');
  if (characterIssues.length > 0) {
    recommendations.push('Verify text rendering and layout positioning logic');
  }
  
  const spacingIssues = differences.filter(d => d.type === 'spacing');
  if (spacingIssues.length > 0) {
    recommendations.push('Review padding, margin, and alignment calculations');
  }
  
  return recommendations;
}