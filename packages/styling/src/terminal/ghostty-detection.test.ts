import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { GhosttyDetection } from './ghostty-detection';
import { Result } from '@tui/styling/utils/result';

describe('GhosttyDetection', () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Clear all Ghostty-related environment variables first
    delete process.env.TERM_PROGRAM;
    delete process.env.GHOSTTY_RESOURCES_DIR;
    delete process.env.GHOSTTY_CONFIG_DIR;
    delete process.env.GHOSTTY_VERSION;
    delete process.env.TERM_PROGRAM_VERSION;
    delete process.env.TERM;
    
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('isGhostty', () => {
    test('detects Ghostty via TERM_PROGRAM', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      expect(GhosttyDetection.isGhostty()).toBe(true);
    });

    test('detects Ghostty via GHOSTTY_RESOURCES_DIR', () => {
      delete process.env.TERM_PROGRAM;
      process.env.GHOSTTY_RESOURCES_DIR = '/usr/share/ghostty';
      
      expect(GhosttyDetection.isGhostty()).toBe(true);
    });

    test('detects Ghostty via TERM variable', () => {
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      process.env.TERM = 'ghostty-256color';
      
      expect(GhosttyDetection.isGhostty()).toBe(true);
    });

    test('detects Ghostty via GHOSTTY_CONFIG_DIR', () => {
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.TERM;
      process.env.GHOSTTY_CONFIG_DIR = '/home/user/.config/ghostty';
      
      expect(GhosttyDetection.isGhostty()).toBe(true);
    });

    test('returns false for non-Ghostty terminals', () => {
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      process.env.TERM = 'xterm-256color';
      
      expect(GhosttyDetection.isGhostty()).toBe(false);
    });

    test('returns false with no terminal information', () => {
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.TERM;
      
      expect(GhosttyDetection.isGhostty()).toBe(false);
    });
  });

  describe('getVersion', () => {
    test('returns version from TERM_PROGRAM_VERSION', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      process.env.TERM_PROGRAM_VERSION = '1.0.0';
      
      const result = GhosttyDetection.getVersion();
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('1.0.0');
      }
    });

    test('returns version from GHOSTTY_VERSION', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      delete process.env.TERM_PROGRAM_VERSION;
      process.env.GHOSTTY_VERSION = '1.1.0';
      
      const result = GhosttyDetection.getVersion();
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('1.1.0');
      }
    });

    test('returns unknown version when not available', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.GHOSTTY_VERSION;
      
      const result = GhosttyDetection.getVersion();
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('unknown');
      }
    });

    test('returns error for non-Ghostty terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'iterm2';
      
      const result = GhosttyDetection.getVersion();
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error).toBe('Not running in Ghostty terminal');
      }
    });
  });

  describe('getEnvironment', () => {
    test('returns comprehensive Ghostty environment', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      process.env.TERM_PROGRAM_VERSION = '1.0.0';
      process.env.GHOSTTY_CONFIG_DIR = '/home/user/.config/ghostty';
      process.env.GHOSTTY_RESOURCES_DIR = '/usr/share/ghostty';
      
      const env = GhosttyDetection.getEnvironment();
      
      expect(env.isGhostty).toBe(true);
      expect(env.version).toBe('1.0.0');
      expect(env.configPath).toBe('/home/user/.config/ghostty');
      expect(env.resourcesDir).toBe('/usr/share/ghostty');
      expect(env.performanceHints?.useGpuAcceleration).toBe(true);
      expect(env.performanceHints?.enableLigatures).toBe(true);
      expect(env.performanceHints?.optimizeRendering).toBe(true);
    });

    test('returns minimal environment for non-Ghostty', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'iterm2';
      
      const env = GhosttyDetection.getEnvironment();
      
      expect(env.isGhostty).toBe(false);
      expect(env.version).toBeUndefined();
      expect(env.configPath).toBeUndefined();
      expect(env.resourcesDir).toBeUndefined();
      expect(env.performanceHints).toBeUndefined();
    });
  });

  describe('getCapabilities', () => {
    test('returns enhanced capabilities for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      process.env.TERM_PROGRAM_VERSION = '1.0.0';
      
      const capabilities = GhosttyDetection.getCapabilities();
      
      expect(capabilities.colorProfile).toBe('trueColor');
      expect(capabilities.hasColorSupport).toBe(true);
      expect(capabilities.hasTrueColorSupport).toBe(true);
      expect(capabilities.hasUnicodeSupport).toBe(true);
      
      // Ghostty-specific capabilities
      if ('gpuAcceleration' in capabilities) {
        expect(capabilities.gpuAcceleration).toBe(true);
        expect(capabilities.ligatureSupport).toBe(true);
        expect(capabilities.smoothScrolling).toBe(true);
        expect(capabilities.advancedTextShaping).toBe(true);
        expect(capabilities.performanceMode).toBe('gpu-accelerated');
        expect(capabilities.customFeatures?.fastScrolling).toBe(true);
        expect(capabilities.customFeatures?.smoothAnimations).toBe(true);
        expect(capabilities.customFeatures?.advancedUnicode).toBe(true);
      }
    });

    test('returns basic capabilities for non-Ghostty terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'iterm2';
      
      const capabilities = GhosttyDetection.getCapabilities();
      
      expect(capabilities.colorProfile).toBe('ansi256');
      expect(capabilities.hasColorSupport).toBe(true);
      expect(capabilities.hasTrueColorSupport).toBe(false);
      expect(capabilities.hasUnicodeSupport).toBe(true);
      
      // Should not have Ghostty-specific features
      expect('gpuAcceleration' in capabilities).toBe(false);
    });
  });

  describe('optimizeForGhostty', () => {
    test('adds Ghostty optimizations when in Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const baseConfig = { 
        colors: true,
        animations: false 
      };
      
      const optimized = GhosttyDetection.optimizeForGhostty(baseConfig);
      
      expect(optimized.colors).toBe(true);
      expect(optimized.animations).toBe(false);
      expect(optimized.ghosttyOptimizations).toBeDefined();
      expect(optimized.ghosttyOptimizations.useGpuAcceleration).toBe(true);
      expect(optimized.ghosttyOptimizations.enableLigatures).toBe(true);
      expect(optimized.ghosttyOptimizations.useTrueColorOptimization).toBe(true);
    });

    test('returns empty optimizations for non-Ghostty', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'iterm2';
      
      const baseConfig = { colors: true };
      const optimized = GhosttyDetection.optimizeForGhostty(baseConfig);
      
      expect(optimized.colors).toBe(true);
      expect(optimized.ghosttyOptimizations).toEqual({});
    });
  });

  describe('assessPerformance', () => {
    test('returns ultra performance for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const assessment = GhosttyDetection.assessPerformance();
      
      expect(assessment.gpuAcceleration).toBe(true);
      expect(assessment.renderingSpeed).toBe('ultra');
      expect(assessment.memoryEfficiency).toBe('high');
      expect(assessment.recommendedOptimizations).toContain('enable-gpu-acceleration');
      expect(assessment.recommendedOptimizations).toContain('use-ligatures');
      expect(assessment.recommendedOptimizations).toContain('use-true-color');
    });

    test('returns medium performance for non-Ghostty', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'xterm';
      
      const assessment = GhosttyDetection.assessPerformance();
      
      expect(assessment.gpuAcceleration).toBe(false);
      expect(assessment.renderingSpeed).toBe('medium');
      expect(assessment.memoryEfficiency).toBe('medium');
      expect(assessment.recommendedOptimizations).toContain('use-basic-rendering');
      expect(assessment.recommendedOptimizations).toContain('limit-colors');
    });
  });

  describe('validateFeatures', () => {
    test('validates all features for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const result = GhosttyDetection.validateFeatures();
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.ligatures).toBe(true);
        expect(result.value.gpuAcceleration).toBe(true);
        expect(result.value.trueColor).toBe(true);
        expect(result.value.unicodeSupport).toBe(true);
        expect(result.value.smoothScrolling).toBe(true);
      }
    });

    test('returns error for non-Ghostty terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'xterm';
      
      const result = GhosttyDetection.validateFeatures();
      
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error).toBe('Not running in Ghostty terminal');
      }
    });
  });

  describe('getAnsiOptimizations', () => {
    test('returns comprehensive optimizations for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const optimizations = GhosttyDetection.getAnsiOptimizations();
      
      expect(optimizations.batchSequences).toBe(true);
      expect(optimizations.useOptimizedCodes).toBe(true);
      expect(optimizations.enableFastPath).toBe(true);
      expect(optimizations.supportedExtensions).toContain('truecolor');
      expect(optimizations.supportedExtensions).toContain('ligatures');
      expect(optimizations.supportedExtensions).toContain('gpu-acceleration');
    });

    test('returns no optimizations for non-Ghostty', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set non-Ghostty terminal
      process.env.TERM_PROGRAM = 'xterm';
      
      const optimizations = GhosttyDetection.getAnsiOptimizations();
      
      expect(optimizations.batchSequences).toBe(false);
      expect(optimizations.useOptimizedCodes).toBe(false);
      expect(optimizations.enableFastPath).toBe(false);
      expect(optimizations.supportedExtensions).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('handles missing environment variables gracefully', () => {
      // Clear all environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.TERM;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.GHOSTTY_VERSION;
      
      expect(() => GhosttyDetection.isGhostty()).not.toThrow();
      expect(() => GhosttyDetection.getEnvironment()).not.toThrow();
      expect(() => GhosttyDetection.getCapabilities()).not.toThrow();
      expect(() => GhosttyDetection.assessPerformance()).not.toThrow();
      expect(() => GhosttyDetection.getAnsiOptimizations()).not.toThrow();
    });

    test('handles case-insensitive terminal detection', () => {
      process.env.TERM_PROGRAM = 'GHOSTTY';
      
      // Should still detect Ghostty regardless of case
      expect(GhosttyDetection.isGhostty()).toBe(true);
    });

    test('validates terminal dimensions handling', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const capabilities = GhosttyDetection.getCapabilities();
      
      // Should handle undefined dimensions gracefully
      expect(typeof capabilities.width === 'number' || capabilities.width === undefined).toBe(true);
      expect(typeof capabilities.height === 'number' || capabilities.height === undefined).toBe(true);
    });
  });
});