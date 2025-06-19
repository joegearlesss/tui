export {
  type ColorProfile,
  type TerminalCapabilities,
  type TerminalEnvironment,
  type BackgroundDetection,
  ColorProfileSchema,
  TerminalCapabilitiesSchema,
  TerminalEnvironmentSchema,
  BackgroundDetectionSchema,
} from './types';

export { Terminal } from './detection';
export { AnsiEscape, Unicode, Compatibility } from './ansi';
