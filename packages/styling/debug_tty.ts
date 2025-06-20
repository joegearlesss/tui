import { debug } from './src/debug';
import { output } from './src/output';

debug.info('isOutputTTY():', output.isTerminal());
debug.info('process.stdout.isTTY:', process.stdout.isTTY);
debug.info('process.stdout.isTTY type:', typeof process.stdout.isTTY);
