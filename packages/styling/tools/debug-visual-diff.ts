#!/usr/bin/env bun

/**
 * Debug Visual Diff Tool
 * 
 * Interactive debugging tool for visual output differences
 * Provides detailed analysis and highlighting of differences
 */

import { readFileSync, existsSync } from 'fs';
import { VisualDiffAnalyzer, type DiffResult } from './visual-diff-analyzer';

const DEBUG_MODE = true;

class DebugVisualTester {
  
  /**
   * Compare outputs with detailed debugging information
   */
  static async compareWithDebug(example: string): Promise<DiffResult> {
    console.log('🔍 Debug Visual Comparison:', example);
    console.log('=====================================\n');
    
    // Check if files exist
    const referencePath = `test-references/${example}-reference.txt`;
    const outputPath = `test-outputs/${example}-typescript.txt`;
    
    if (!existsSync(referencePath)) {
      console.error(`❌ Reference file not found: ${referencePath}`);
      console.log('💡 Run: ./scripts/generate-reference.sh to create reference files');
      process.exit(1);
    }
    
    if (!existsSync(outputPath)) {
      console.error(`❌ TypeScript output file not found: ${outputPath}`);
      console.log('💡 Run: bun run scripts/generate-typescript-output.ts');
      process.exit(1);
    }
    
    // Read files
    const reference = readFileSync(referencePath, 'utf8');
    const actual = readFileSync(outputPath, 'utf8');
    
    console.log(`📁 Files:`);
    console.log(`   Reference: ${referencePath} (${reference.length} chars)`);
    console.log(`   Actual:    ${outputPath} (${actual.length} chars)\n`);
    
    if (DEBUG_MODE) {
      console.log('📋 Reference Output:');
      console.log(this.highlightInvisibles(reference));
      console.log('\n📋 Actual Output:');
      console.log(this.highlightInvisibles(actual));
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    // Perform comparison
    const result = VisualDiffAnalyzer.compare(reference, actual);
    
    // Display results
    console.log(`📊 Comparison Results:`);
    console.log(`   Identical: ${result.isIdentical ? '✅ YES' : '❌ NO'}`);
    console.log(`   Accuracy: ${result.stats.accuracyPercentage.toFixed(2)}%`);
    console.log(`   Total Lines: ${result.stats.totalLines}`);
    console.log(`   Different Lines: ${result.stats.differentLines}`);
    console.log(`   Character Differences: ${result.stats.characterDifferences}`);
    console.log(`   ANSI Differences: ${result.stats.ansiDifferences}`);
    console.log(`   Total Differences: ${result.differences.length}\n`);
    
    if (!result.isIdentical) {
      this.displayDifferences(result);
    }
    
    return result;
  }
  
  /**
   * Display detailed difference analysis
   */
  private static displayDifferences(result: DiffResult): void {
    // Group differences by severity
    const critical = result.differences.filter(d => d.severity === 'critical');
    const major = result.differences.filter(d => d.severity === 'major');
    const minor = result.differences.filter(d => d.severity === 'minor');
    
    if (critical.length > 0) {
      console.log(`🚨 CRITICAL DIFFERENCES (${critical.length}):`);
      critical.slice(0, 5).forEach((diff, i) => {
        console.log(`  ${i + 1}. Line ${diff.position.line + 1}, Col ${diff.position.column + 1}`);
        console.log(`     Type: ${diff.type}`);
        console.log(`     Expected: "${diff.expected}"`);
        console.log(`     Actual: "${diff.actual}"`);
        console.log(`     Context: ${diff.context}\n`);
      });
      
      if (critical.length > 5) {
        console.log(`     ... and ${critical.length - 5} more critical differences\n`);
      }
    }
    
    if (major.length > 0) {
      console.log(`⚠️  MAJOR DIFFERENCES (${major.length}):`);
      major.slice(0, 3).forEach((diff, i) => {
        console.log(`  ${i + 1}. Line ${diff.position.line + 1}: ${diff.context}`);
      });
      
      if (major.length > 3) {
        console.log(`     ... and ${major.length - 3} more major differences\n`);
      } else {
        console.log('');
      }
    }
    
    if (minor.length > 0) {
      console.log(`ℹ️  MINOR DIFFERENCES: ${minor.length} whitespace/spacing issues\n`);
    }
    
    // Provide recommendations
    this.displayRecommendations(result.differences);
  }
  
  /**
   * Display actionable recommendations based on difference types
   */
  private static displayRecommendations(differences: VisualDifference[]): void {
    console.log('💡 RECOMMENDATIONS:');
    
    const ansiIssues = differences.filter(d => d.type === 'ansi');
    if (ansiIssues.length > 0) {
      console.log('   • Check ANSI escape sequence generation in color and style modules');
    }
    
    const characterIssues = differences.filter(d => d.type === 'character');
    if (characterIssues.length > 0) {
      console.log('   • Verify text rendering and layout positioning logic');
    }
    
    const spacingIssues = differences.filter(d => d.type === 'spacing');
    if (spacingIssues.length > 0) {
      console.log('   • Review padding, margin, and alignment calculations');
    }
    
    console.log('   • Run specific component tests to isolate the issue');
    console.log('   • Check Unicode character usage and encoding');
    console.log('   • Verify border character mappings\n');
  }
  
  /**
   * Highlight invisible characters for debugging
   */
  private static highlightInvisibles(text: string): string {
    return text
      .replace(/ /g, '·')           // Visible spaces
      .replace(/\t/g, '→')          // Visible tabs  
      .replace(/\n/g, '↵\n')        // Visible newlines
      .replace(/\x1b/g, '␛');       // Visible ANSI escapes
  }
}

// Command line usage
async function main() {
  const example = process.argv[2];
  
  if (!example) {
    console.log('Usage: bun run tools/debug-visual-diff.ts <example-name>');
    console.log('');
    console.log('Examples:');
    console.log('  bun run tools/debug-visual-diff.ts color-standalone');
    console.log('  bun run tools/debug-visual-diff.ts list-simple');
    console.log('  bun run tools/debug-visual-diff.ts list-grocery');
    process.exit(1);
  }
  
  try {
    const result = await DebugVisualTester.compareWithDebug(example);
    
    if (result.isIdentical) {
      console.log('🎉 Perfect visual match! No differences found.');
      process.exit(0);
    } else {
      console.log('🔧 Visual differences detected. See analysis above.');
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.main) {
  main();
}

export { DebugVisualTester };