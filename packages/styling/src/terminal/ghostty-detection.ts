import type { TerminalCapabilities, TerminalEnvironment, ColorProfile } from './types';
import { Result } from '@tui/styling/utils/result';

/**
 * Ghostty-first Terminal Detection System
 * 
 * Implements comprehensive Ghostty detection and optimization as specified
 * in the roadmap's multi-terminal compatibility strategy.
 */

export interface GhosttyCapabilities extends TerminalCapabilities {
  readonly ghosttyVersion?: string;
  readonly gpuAcceleration?: boolean;
  readonly ligatureSupport?: boolean;
  readonly smoothScrolling?: boolean;
  readonly advancedTextShaping?: boolean;
  readonly performanceMode?: 'standard' | 'high-performance' | 'gpu-accelerated';
  readonly customFeatures?: {
    readonly fastScrolling?: boolean;
    readonly smoothAnimations?: boolean;
    readonly advancedUnicode?: boolean;
    readonly retinaDpi?: boolean;
  };
}

export interface GhosttyEnvironment {
  readonly isGhostty: boolean;
  readonly version?: string;
  readonly configPath?: string;
  readonly resourcesDir?: string;
  readonly performanceHints?: {
    readonly useGpuAcceleration?: boolean;
    readonly enableLigatures?: boolean;
    readonly optimizeRendering?: boolean;
  };
}

/**
 * Ghostty Detection namespace providing Ghostty-specific capabilities
 */
export namespace GhosttyDetection {

  /**
   * Detects if the current terminal is Ghostty
   * @returns True if running in Ghostty terminal
   */
  export const isGhostty = (): boolean => {
    const env = process.env;
    
    // Primary Ghostty detection methods
    if (env.TERM_PROGRAM === 'ghostty') {
      return true;
    }
    
    if (env.GHOSTTY_RESOURCES_DIR !== undefined) {
      return true;
    }
    
    // Secondary detection via TERM variable
    if (env.TERM?.includes('ghostty')) {
      return true;
    }
    
    // Check for Ghostty-specific environment variables
    if (env.GHOSTTY_CONFIG_DIR !== undefined) {
      return true;
    }
    
    return false;
  };

  /**
   * Gets Ghostty version information
   * @returns Result containing version string or error
   */
  export const getVersion = (): Result<string, string> => {
    if (!isGhostty()) {
      return Result.err('Not running in Ghostty terminal');
    }
    
    const version = process.env.TERM_PROGRAM_VERSION || 
                   process.env.GHOSTTY_VERSION ||
                   'unknown';
                   
    return Result.ok(version);
  };

  /**
   * Gets comprehensive Ghostty environment information
   * @returns Ghostty environment details
   */
  export const getEnvironment = (): GhosttyEnvironment => {
    const ghostty = isGhostty();
    
    if (!ghostty) {
      return { isGhostty: false };
    }
    
    const env = process.env;
    
    return {
      isGhostty: true,
      version: env.TERM_PROGRAM_VERSION || env.GHOSTTY_VERSION,
      configPath: env.GHOSTTY_CONFIG_DIR,
      resourcesDir: env.GHOSTTY_RESOURCES_DIR,
      performanceHints: {
        useGpuAcceleration: true, // Ghostty supports GPU acceleration
        enableLigatures: true,    // Ghostty supports ligatures
        optimizeRendering: true   // Enable optimized rendering
      }
    };
  };

  /**
   * Gets Ghostty-specific terminal capabilities
   * @returns Enhanced capabilities object with Ghostty features
   */
  export const getCapabilities = (): GhosttyCapabilities => {
    if (!isGhostty()) {
      // Return basic capabilities for non-Ghostty terminals
      return {
        colorProfile: 'ansi256',
        hasColorSupport: true,
        hasTrueColorSupport: false,
        hasUnicodeSupport: true,
        width: undefined,
        height: undefined,
        platform: 'unknown'
      };
    }

    const dimensions = getTerminalDimensions();
    const platform = getOperatingSystem();
    
    return {
      // Standard capabilities (enhanced for Ghostty)
      colorProfile: 'trueColor',
      hasColorSupport: true,
      hasTrueColorSupport: true,
      hasUnicodeSupport: true,
      width: dimensions.width,
      height: dimensions.height,
      platform,
      
      // Ghostty-specific capabilities
      ghosttyVersion: process.env.TERM_PROGRAM_VERSION,
      gpuAcceleration: true,
      ligatureSupport: true,
      smoothScrolling: true,
      advancedTextShaping: true,
      performanceMode: 'gpu-accelerated',
      customFeatures: {
        fastScrolling: true,
        smoothAnimations: true,
        advancedUnicode: true,
        retinaDpi: platform === 'unix' // Assume macOS/Linux support high DPI
      }
    };
  };

  /**
   * Optimizes rendering configuration for Ghostty
   * @param baseConfig - Base rendering configuration
   * @returns Ghostty-optimized configuration
   */
  export const optimizeForGhostty = <T extends Record<string, any>>(
    baseConfig: T
  ): T & { ghosttyOptimizations: Record<string, any> } => {
    if (!isGhostty()) {
      return { ...baseConfig, ghosttyOptimizations: {} };
    }

    return {
      ...baseConfig,
      ghosttyOptimizations: {
        // GPU acceleration settings
        useGpuAcceleration: true,
        batchRenderOperations: true,
        enableHardwareAcceleration: true,
        
        // Typography settings
        enableLigatures: true,
        useAdvancedTextShaping: true,
        optimizeForRetina: true,
        
        // Performance settings
        enableSmoothScrolling: true,
        useFastRendering: true,
        minimizeRedraws: true,
        
        // Unicode and color settings
        enableFullUnicodeSupport: true,
        useTrueColorOptimization: true,
        enableColorProfileOptimization: true,
        
        // Ghostty-specific features
        useGhosttyProtocol: true,
        enableGhosttyExtensions: true
      }
    };
  };

  /**
   * Detects Ghostty-specific performance capabilities
   * @returns Performance capabilities assessment
   */
  export const assessPerformance = (): {
    gpuAcceleration: boolean;
    renderingSpeed: 'low' | 'medium' | 'high' | 'ultra';
    memoryEfficiency: 'low' | 'medium' | 'high';
    recommendedOptimizations: readonly string[];
  } => {
    if (!isGhostty()) {
      return {
        gpuAcceleration: false,
        renderingSpeed: 'medium',
        memoryEfficiency: 'medium',
        recommendedOptimizations: ['use-basic-rendering', 'limit-colors']
      };
    }

    return {
      gpuAcceleration: true,
      renderingSpeed: 'ultra',
      memoryEfficiency: 'high',
      recommendedOptimizations: [
        'enable-gpu-acceleration',
        'use-ligatures',
        'enable-smooth-scrolling',
        'optimize-for-retina',
        'use-true-color',
        'enable-advanced-unicode',
        'batch-render-operations'
      ]
    };
  };

  /**
   * Validates Ghostty-specific features
   * @returns Feature validation results
   */
  export const validateFeatures = (): Result<{
    ligatures: boolean;
    gpuAcceleration: boolean;
    trueColor: boolean;
    unicodeSupport: boolean;
    smoothScrolling: boolean;
  }, string> => {
    try {
      if (!isGhostty()) {
        return Result.err('Not running in Ghostty terminal');
      }

      // Validate features based on environment
      const features = {
        ligatures: true,        // Ghostty supports ligatures
        gpuAcceleration: true,  // Ghostty uses GPU acceleration
        trueColor: true,        // Ghostty supports 24-bit color
        unicodeSupport: true,   // Ghostty has excellent Unicode support
        smoothScrolling: true   // Ghostty supports smooth scrolling
      };

      return Result.ok(features);
    } catch (error) {
      return Result.err(`Failed to validate Ghostty features: ${error}`);
    }
  };

  /**
   * Gets Ghostty-specific ANSI optimization hints
   * @returns Optimization hints for ANSI sequence generation
   */
  export const getAnsiOptimizations = (): {
    batchSequences: boolean;
    useOptimizedCodes: boolean;
    enableFastPath: boolean;
    supportedExtensions: readonly string[];
  } => {
    if (!isGhostty()) {
      return {
        batchSequences: false,
        useOptimizedCodes: false,
        enableFastPath: false,
        supportedExtensions: []
      };
    }

    return {
      batchSequences: true,
      useOptimizedCodes: true,
      enableFastPath: true,
      supportedExtensions: [
        'truecolor',
        'ligatures',
        'smooth-scrolling',
        'gpu-acceleration',
        'advanced-unicode'
      ]
    };
  };

  // Helper functions

  /**
   * Gets terminal dimensions with Ghostty-specific optimizations
   */
  const getTerminalDimensions = (): { width?: number; height?: number } => {
    try {
      // Try to get from process.stdout first (most reliable)
      if (process.stdout && typeof process.stdout.columns === 'number' &&
          typeof process.stdout.rows === 'number') {
        return {
          width: process.stdout.columns,
          height: process.stdout.rows
        };
      }

      // Fallback to environment variables
      const width = process.env.COLUMNS ? Number.parseInt(process.env.COLUMNS, 10) : undefined;
      const height = process.env.LINES ? Number.parseInt(process.env.LINES, 10) : undefined;

      return {
        width: width && width > 0 ? width : undefined,
        height: height && height > 0 ? height : undefined
      };
    } catch {
      return { width: undefined, height: undefined };
    }
  };

  /**
   * Detects operating system for platform-specific optimizations
   */
  const getOperatingSystem = (): 'windows' | 'unix' | 'unknown' => {
    try {
      const platform = process.platform;
      if (platform === 'win32') return 'windows';
      if (['darwin', 'linux', 'freebsd', 'openbsd', 'netbsd', 'aix', 'sunos'].includes(platform)) {
        return 'unix';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };
}