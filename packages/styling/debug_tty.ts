import { isOutputTTY } from './src/output.js';

console.log('isOutputTTY():', isOutputTTY());
console.log('process.stdout.isTTY:', process.stdout.isTTY);
console.log('process.stdout.isTTY type:', typeof process.stdout.isTTY);