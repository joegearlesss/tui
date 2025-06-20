export { AnsiEscape, Compatibility, Unicode } from './ansi';

export { Terminal } from './detection';
export { GhosttyDetection } from './ghostty-detection';
export { MultiTerminalSupport } from './multi-terminal-support';

export {
  type BackgroundDetection,
  BackgroundDetectionSchema,
  type ColorProfile,
  ColorProfileSchema,
  type TerminalCapabilities,
  TerminalCapabilitiesSchema,
  type TerminalEnvironment,
  TerminalEnvironmentSchema,
} from './types';

export type {
  GhosttyCapabilities,
  GhosttyEnvironment
} from './ghostty-detection';

export type {
  TerminalProfile,
  TerminalFeatures,
  TerminalOptimizations,
  DetectionResult
} from './multi-terminal-support';
