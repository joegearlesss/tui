#!/usr/bin/env bun

/**
 * TypeScript Output Generator
 * 
 * Generates output from TypeScript examples for visual comparison
 * with Go Lipgloss reference implementation
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const EXAMPLES = [
  'color/standalone',
  'list/simple',
  'list/grocery',
  'table/chess',
  'table/languages',
  'layout',
  'tree/simple'
];

const OUTPUT_DIR = 'test-outputs';

async function generateOutputs() {
  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('🚀 Generating TypeScript outputs for visual comparison...\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const example of EXAMPLES) {
    console.log(`📝 Generating output for ${example}...`);
    
    try {
      // Check if example exists
      const examplePath = `examples/${example}/main.ts`;
      if (!existsSync(examplePath)) {
        console.log(`⚠️  Example not found: ${examplePath}`);
        continue;
      }
      
      // Execute the example and capture output
      const output = execSync(`bun run ${examplePath}`, {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Save output to file
      const filename = example.replace('/', '-') + '-typescript.txt';
      const outputPath = join(OUTPUT_DIR, filename);
      writeFileSync(outputPath, output);
      
      console.log(`✅ Generated ${filename} (${output.length} chars)`);
      successCount++;
      
    } catch (error: any) {
      console.error(`❌ Failed to generate ${example}:`);
      console.error(`   Error: ${error.message}`);
      failureCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 Generation Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📁 Output directory: ${OUTPUT_DIR}`);
  
  if (failureCount > 0) {
    console.log('\n⚠️  Some examples failed to generate. Check error messages above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All TypeScript outputs generated successfully!');
  }
}

// Handle command line execution
if (import.meta.main) {
  generateOutputs().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { generateOutputs };