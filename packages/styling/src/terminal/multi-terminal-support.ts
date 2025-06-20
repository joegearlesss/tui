import { GhosttyDetection, type GhosttyCapabilities } from './ghostty-detection';
import type { TerminalCapabilities, ColorProfile } from './types';
import { Result } from '@tui/styling/utils/result';

/**
 * Multi-Terminal Compatibility System
 * 
 * Implements the tiered terminal support strategy with Ghostty-first approach
 * as specified in the roadmap.
 */

export interface TerminalProfile {
  readonly name: string;
  readonly tier: 1 | 2 | 3;
  readonly colorSupport: ColorProfile;
  readonly unicodeSupport: 'full' | 'good' | 'basic' | 'limited';
  readonly features: TerminalFeatures;
  readonly optimizations: TerminalOptimizations;
  readonly priority: 'primary' | 'high' | 'medium' | 'low';
}

export interface TerminalFeatures {
  readonly ligatures?: boolean;
  readonly images?: boolean;
  readonly hyperlinks?: boolean;
  readonly notifications?: boolean;
  readonly smoothScrolling?: boolean;
  readonly gpuAcceleration?: boolean;
  readonly advancedTextShaping?: boolean;
  readonly customProtocols?: boolean;
  readonly fastRendering?: boolean;
  readonly lowLatency?: boolean;
  readonly acrylic?: boolean;
  readonly tabs?: boolean;
}

export interface TerminalOptimizations {
  readonly batchAnsiSequences?: boolean;
  readonly useOptimizedUnicode?: boolean;
  readonly enablePerformanceMode?: boolean;
  readonly useBuiltinColorProfiles?: boolean;
  readonly optimizeForRetina?: boolean;
  readonly minimizeAnsiSequences?: boolean;
  readonly batchUpdates?: boolean;
  readonly useKittyGraphics?: boolean;
  readonly enableKittyKeyboard?: boolean;
  readonly optimizeForWindows?: boolean;
  readonly useConptyApi?: boolean;
  readonly useGpuAcceleration?: boolean;
  readonly enableLigatures?: boolean;
  readonly optimizeForSpeed?: boolean;
  readonly useAdvancedUnicode?: boolean;
}

export interface DetectionResult {
  readonly terminal: TerminalProfile;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly detectionMethod: 'environment' | 'heuristic' | 'fallback';
  readonly capabilities: TerminalCapabilities | GhosttyCapabilities;
}

/**
 * Multi-Terminal Support namespace providing comprehensive terminal detection
 */
export namespace MultiTerminalSupport {

  /**
   * Terminal profiles organized by tier according to roadmap specifications
   */
  const TERMINAL_PROFILES: Record<string, TerminalProfile> = {
    // Tier 1 - Critical Compatibility (Primary Development and High Priority)
    ghostty: {
      name: 'Ghostty',
      tier: 1,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'primary',
      features: {
        ligatures: true,
        smoothScrolling: true,
        gpuAcceleration: true,
        advancedTextShaping: true,
        fastRendering: true
      },
      optimizations: {
        batchAnsiSequences: true,
        useOptimizedUnicode: true,
        enablePerformanceMode: true,
        useGpuAcceleration: true,
        enableLigatures: true,
        optimizeForSpeed: true,
        useAdvancedUnicode: true
      }
    },
    
    iterm2: {
      name: 'iTerm2',
      tier: 1,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'high',
      features: {
        ligatures: true,
        images: true,
        hyperlinks: true,
        notifications: true
      },
      optimizations: {
        useBuiltinColorProfiles: true,
        optimizeForRetina: true
      }
    },
    
    alacritty: {
      name: 'Alacritty',
      tier: 1,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'high',
      features: {
        ligatures: false,
        fastRendering: true,
        lowLatency: true
      },
      optimizations: {
        minimizeAnsiSequences: true,
        batchUpdates: true
      }
    },
    
    kitty: {
      name: 'Kitty',
      tier: 1,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'high',
      features: {
        ligatures: true,
        images: true,
        hyperlinks: true,
        customProtocols: true
      },
      optimizations: {
        useKittyGraphics: true,
        enableKittyKeyboard: true
      }
    },
    
    'windows-terminal': {
      name: 'Windows Terminal',
      tier: 1,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'high',
      features: {
        ligatures: true,
        acrylic: true,
        tabs: true
      },
      optimizations: {
        optimizeForWindows: true,
        useConptyApi: true
      }
    },
    
    // Tier 2 - Important Compatibility
    'terminal-app': {
      name: 'Terminal.app',
      tier: 2,
      colorSupport: 'ansi256',
      unicodeSupport: 'good',
      priority: 'medium',
      features: {},
      optimizations: {}
    },
    
    hyper: {
      name: 'Hyper',
      tier: 2,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'medium',
      features: {
        ligatures: true
      },
      optimizations: {}
    },
    
    warp: {
      name: 'Warp',
      tier: 2,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'medium',
      features: {
        ligatures: true
      },
      optimizations: {}
    },
    
    konsole: {
      name: 'Konsole',
      tier: 2,
      colorSupport: 'trueColor',
      unicodeSupport: 'full',
      priority: 'medium',
      features: {
        ligatures: true
      },
      optimizations: {}
    },
    
    // Tier 3 - Basic Compatibility
    'gnome-terminal': {
      name: 'GNOME Terminal',
      tier: 3,
      colorSupport: 'ansi256',
      unicodeSupport: 'good',
      priority: 'low',
      features: {},
      optimizations: {}
    },
    
    xterm: {
      name: 'xterm',
      tier: 3,
      colorSupport: 'ansi256',
      unicodeSupport: 'basic',
      priority: 'low',
      features: {},
      optimizations: {}
    },
    
    'cmd-exe': {
      name: 'cmd.exe',
      tier: 3,
      colorSupport: 'ansi',
      unicodeSupport: 'basic',
      priority: 'low',
      features: {},
      optimizations: {}
    }
  };

  /**
   * Detects the current terminal with Ghostty-first approach
   * @returns Detection result with terminal profile and capabilities
   */
  export const detectTerminal = (): DetectionResult => {
    // Primary: Ghostty detection (highest priority)
    if (GhosttyDetection.isGhostty()) {
      return {
        terminal: TERMINAL_PROFILES.ghostty,
        confidence: 'high',
        detectionMethod: 'environment',
        capabilities: GhosttyDetection.getCapabilities()
      };
    }

    // Secondary: Other Tier 1 terminals
    const tier1Result = detectTier1Terminal();
    if (tier1Result) {
      return tier1Result;
    }

    // Tertiary: Tier 2 terminals
    const tier2Result = detectTier2Terminal();
    if (tier2Result) {
      return tier2Result;
    }

    // Fallback: Tier 3 terminals
    const tier3Result = detectTier3Terminal();
    if (tier3Result) {
      return tier3Result;
    }

    // Ultimate fallback
    return {
      terminal: TERMINAL_PROFILES.xterm,
      confidence: 'low',
      detectionMethod: 'fallback',
      capabilities: getBasicCapabilities()
    };
  };

  /**
   * Gets optimized configuration for the detected terminal
   * @param baseConfig - Base configuration to optimize
   * @returns Optimized configuration for current terminal
   */
  export const getOptimizedConfig = <T extends Record<string, any>>(
    baseConfig: T
  ): T & { terminalOptimizations: TerminalOptimizations } => {
    const detection = detectTerminal();
    const { terminal } = detection;

    // Apply Ghostty-first optimizations
    if (terminal.name === 'Ghostty') {
      return GhosttyDetection.optimizeForGhostty(baseConfig);
    }

    // Apply terminal-specific optimizations
    return {
      ...baseConfig,
      terminalOptimizations: terminal.optimizations
    };
  };

  /**
   * Gets terminal capabilities with fallback handling
   * @returns Terminal capabilities for current environment
   */
  export const getCapabilities = (): TerminalCapabilities | GhosttyCapabilities => {
    const detection = detectTerminal();
    return detection.capabilities;
  };

  /**
   * Gets all supported terminals organized by tier
   * @returns Terminal profiles organized by priority tiers
   */
  export const getSupportedTerminals = (): {
    tier1: TerminalProfile[];
    tier2: TerminalProfile[];
    tier3: TerminalProfile[];
  } => {
    const allProfiles = Object.values(TERMINAL_PROFILES);
    
    return {
      tier1: allProfiles.filter(p => p.tier === 1).sort((a, b) => {
        // Ensure Ghostty is first (primary)
        if (a.name === 'Ghostty') return -1;
        if (b.name === 'Ghostty') return 1;
        return a.name.localeCompare(b.name);
      }),
      tier2: allProfiles.filter(p => p.tier === 2),
      tier3: allProfiles.filter(p => p.tier === 3)
    };
  };

  /**
   * Validates terminal compatibility for specific features
   * @param requiredFeatures - Features that must be supported
   * @returns Compatibility assessment
   */
  export const validateCompatibility = (
    requiredFeatures: (keyof TerminalFeatures)[]
  ): Result<{
    compatible: boolean;
    supportedFeatures: (keyof TerminalFeatures)[];
    unsupportedFeatures: (keyof TerminalFeatures)[];
    recommendedAlternatives: string[];
  }, string> => {
    try {
      const detection = detectTerminal();
      const { terminal } = detection;
      
      const supportedFeatures: (keyof TerminalFeatures)[] = [];
      const unsupportedFeatures: (keyof TerminalFeatures)[] = [];
      
      for (const feature of requiredFeatures) {
        if (terminal.features[feature]) {
          supportedFeatures.push(feature);
        } else {
          unsupportedFeatures.push(feature);
        }
      }
      
      const compatible = unsupportedFeatures.length === 0;
      const recommendedAlternatives = getAlternativeTerminals(requiredFeatures);
      
      return Result.ok({
        compatible,
        supportedFeatures,
        unsupportedFeatures,
        recommendedAlternatives
      });
    } catch (error) {
      return Result.err(`Failed to validate compatibility: ${error}`);
    }
  };

  // Private helper functions

  /**
   * Detects Tier 1 terminals (Critical Compatibility)
   */
  const detectTier1Terminal = (): DetectionResult | null => {
    const env = process.env;
    const termProgram = env.TERM_PROGRAM?.toLowerCase();
    const term = env.TERM?.toLowerCase();

    // iTerm2
    if (termProgram?.includes('iterm') || term?.includes('iterm')) {
      return {
        terminal: TERMINAL_PROFILES.iterm2,
        confidence: 'high',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.iterm2)
      };
    }

    // Alacritty
    if (termProgram?.includes('alacritty') || term?.includes('alacritty')) {
      return {
        terminal: TERMINAL_PROFILES.alacritty,
        confidence: 'high',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.alacritty)
      };
    }

    // Kitty
    if (termProgram?.includes('kitty') || term?.includes('kitty')) {
      return {
        terminal: TERMINAL_PROFILES.kitty,
        confidence: 'high',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.kitty)
      };
    }

    // Windows Terminal
    if (termProgram?.includes('windows') || env.WT_SESSION) {
      return {
        terminal: TERMINAL_PROFILES['windows-terminal'],
        confidence: 'high',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES['windows-terminal'])
      };
    }

    return null;
  };

  /**
   * Detects Tier 2 terminals (Important Compatibility)
   */
  const detectTier2Terminal = (): DetectionResult | null => {
    const env = process.env;
    const termProgram = env.TERM_PROGRAM?.toLowerCase();

    // Terminal.app (macOS default)
    if (termProgram?.includes('apple_terminal') || termProgram?.includes('terminal')) {
      return {
        terminal: TERMINAL_PROFILES['terminal-app'],
        confidence: 'medium',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES['terminal-app'])
      };
    }

    // Hyper
    if (termProgram?.includes('hyper')) {
      return {
        terminal: TERMINAL_PROFILES.hyper,
        confidence: 'medium',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.hyper)
      };
    }

    // Warp
    if (termProgram?.includes('warp')) {
      return {
        terminal: TERMINAL_PROFILES.warp,
        confidence: 'medium',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.warp)
      };
    }

    // Konsole
    if (termProgram?.includes('konsole') || env.TERM?.includes('konsole')) {
      return {
        terminal: TERMINAL_PROFILES.konsole,
        confidence: 'medium',
        detectionMethod: 'environment',
        capabilities: createCapabilities(TERMINAL_PROFILES.konsole)
      };
    }

    return null;
  };

  /**
   * Detects Tier 3 terminals (Basic Compatibility)
   */
  const detectTier3Terminal = (): DetectionResult | null => {
    const env = process.env;

    // GNOME Terminal
    if (env.TERM?.includes('gnome') || env.COLORTERM?.includes('gnome-terminal')) {
      return {
        terminal: TERMINAL_PROFILES['gnome-terminal'],
        confidence: 'low',
        detectionMethod: 'heuristic',
        capabilities: createCapabilities(TERMINAL_PROFILES['gnome-terminal'])
      };
    }

    // xterm
    if (env.TERM?.includes('xterm')) {
      return {
        terminal: TERMINAL_PROFILES.xterm,
        confidence: 'low',
        detectionMethod: 'heuristic',
        capabilities: createCapabilities(TERMINAL_PROFILES.xterm)
      };
    }

    // Windows cmd.exe
    if (process.platform === 'win32' && !env.WT_SESSION) {
      return {
        terminal: TERMINAL_PROFILES['cmd-exe'],
        confidence: 'low',
        detectionMethod: 'heuristic',
        capabilities: createCapabilities(TERMINAL_PROFILES['cmd-exe'])
      };
    }

    return null;
  };

  /**
   * Creates terminal capabilities from profile
   */
  const createCapabilities = (profile: TerminalProfile): TerminalCapabilities => {
    return {
      colorProfile: profile.colorSupport,
      hasColorSupport: profile.colorSupport !== 'noColor',
      hasTrueColorSupport: profile.colorSupport === 'trueColor',
      hasUnicodeSupport: ['full', 'good'].includes(profile.unicodeSupport),
      width: process.stdout.columns,
      height: process.stdout.rows,
      platform: process.platform === 'win32' ? 'windows' : 'unix'
    };
  };

  /**
   * Gets basic fallback capabilities
   */
  const getBasicCapabilities = (): TerminalCapabilities => {
    return {
      colorProfile: 'ansi',
      hasColorSupport: true,
      hasTrueColorSupport: false,
      hasUnicodeSupport: false,
      width: process.stdout.columns,
      height: process.stdout.rows,
      platform: process.platform === 'win32' ? 'windows' : 'unix'
    };
  };

  /**
   * Gets alternative terminal recommendations
   */
  const getAlternativeTerminals = (
    requiredFeatures: (keyof TerminalFeatures)[]
  ): string[] => {
    const alternatives: string[] = [];
    
    // Always recommend Ghostty first for advanced features
    if (requiredFeatures.some(f => ['ligatures', 'gpuAcceleration', 'smoothScrolling'].includes(f))) {
      alternatives.push('Ghostty (recommended)');
    }
    
    // Add other compatible terminals
    for (const [key, profile] of Object.entries(TERMINAL_PROFILES)) {
      if (profile.tier <= 2) {
        const supportsAll = requiredFeatures.every(feature => profile.features[feature]);
        if (supportsAll && !alternatives.find(alt => alt.includes(profile.name))) {
          alternatives.push(profile.name);
        }
      }
    }
    
    return alternatives;
  };
}