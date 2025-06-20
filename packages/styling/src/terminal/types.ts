import { z } from 'zod';

/**
 * Terminal color profile capabilities
 */
export type ColorProfile = 'noColor' | 'ansi' | 'ansi256' | 'trueColor';

/**
 * Terminal capabilities and features
 */
export interface TerminalCapabilities {
  readonly colorProfile: ColorProfile;
  readonly hasColorSupport: boolean;
  readonly hasTrueColorSupport: boolean;
  readonly hasUnicodeSupport: boolean;
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly platform: 'windows' | 'unix' | 'unknown';
}

/**
 * Terminal environment information
 */
export interface TerminalEnvironment {
  readonly term: string | undefined;
  readonly colorTerm: string | undefined;
  readonly termProgram: string | undefined;
  readonly termProgramVersion: string | undefined;
  readonly ciEnvironment: string | undefined;
  readonly forceColor: string | undefined;
  readonly noColor: string | undefined;
  readonly lcAll: string | undefined;
  readonly lcCtype: string | undefined;
  readonly lang: string | undefined;
  readonly sshConnection: string | undefined;
  readonly sshClient: string | undefined;
  readonly msysystem: string | undefined;
  readonly ci: string | undefined;
  readonly tmux: string | undefined;
}

/**
 * Background detection result
 */
export interface BackgroundDetection {
  readonly isDark: boolean | undefined;
  readonly confidence: 'high' | 'medium' | 'low' | 'unknown';
  readonly method: 'query' | 'heuristic' | 'environment' | 'fallback';
}

// Zod schemas for validation
export const ColorProfileSchema = z
  .enum(['noColor', 'ansi', 'ansi256', 'trueColor'])
  .describe('Terminal color profile indicating supported color capabilities');

export const TerminalCapabilitiesSchema = z
  .object({
    colorProfile: ColorProfileSchema.describe('Color profile supported by the terminal'),
    hasColorSupport: z.boolean().describe('Whether terminal supports any color output'),
    hasTrueColorSupport: z.boolean().describe('Whether terminal supports 24-bit true color'),
    hasUnicodeSupport: z.boolean().describe('Whether terminal supports Unicode characters'),
    width: z
      .number()
      .int('Terminal width must be an integer')
      .positive('Terminal width must be positive')
      .optional()
      .describe('Terminal width in columns - undefined if not detectable'),
    height: z
      .number()
      .int('Terminal height must be an integer')
      .positive('Terminal height must be positive')
      .optional()
      .describe('Terminal height in rows - undefined if not detectable'),
    platform: z.enum(['windows', 'unix', 'unknown']).describe('Operating system platform type'),
  })
  .describe('Complete terminal capabilities and feature detection');

export const TerminalEnvironmentSchema = z
  .object({
    term: z.string().optional().describe('TERM environment variable value'),
    colorTerm: z.string().optional().describe('COLORTERM environment variable value'),
    termProgram: z.string().optional().describe('TERM_PROGRAM environment variable value'),
    termProgramVersion: z
      .string()
      .optional()
      .describe('TERM_PROGRAM_VERSION environment variable value'),
    ciEnvironment: z.string().optional().describe('CI environment variable value'),
    forceColor: z.string().optional().describe('FORCE_COLOR environment variable value'),
    noColor: z.string().optional().describe('NO_COLOR environment variable value'),
  })
  .describe('Terminal environment variables and settings');

export const BackgroundDetectionSchema = z
  .object({
    isDark: z
      .boolean()
      .optional()
      .describe('Whether terminal has dark background - undefined if unknown'),
    confidence: z
      .enum(['high', 'medium', 'low', 'unknown'])
      .describe('Confidence level of background detection'),
    method: z
      .enum(['query', 'heuristic', 'environment', 'fallback'])
      .describe('Method used for background detection'),
  })
  .describe('Terminal background detection result with confidence level');
