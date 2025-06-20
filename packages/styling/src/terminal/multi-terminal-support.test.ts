import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { MultiTerminalSupport } from './multi-terminal-support';
import { Result } from '@tui/styling/utils/result';

describe('MultiTerminalSupport', () => {
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
    delete process.env.COLORTERM;
    delete process.env.WT_SESSION;
    
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('detectTerminal', () => {
    test('detects Ghostty as primary terminal', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      process.env.TERM_PROGRAM_VERSION = '1.0.0';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Ghostty');
      expect(detection.terminal.tier).toBe(1);
      expect(detection.terminal.priority).toBe('primary');
      expect(detection.confidence).toBe('high');
      expect(detection.detectionMethod).toBe('environment');
      expect(detection.capabilities.colorProfile).toBe('trueColor');
    });

    test('detects iTerm2 as Tier 1 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set iTerm2 terminal
      process.env.TERM_PROGRAM = 'iTerm.app';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('iTerm2');
      expect(detection.terminal.tier).toBe(1);
      expect(detection.terminal.priority).toBe('high');
      expect(detection.confidence).toBe('high');
      expect(detection.terminal.features.ligatures).toBe(true);
      expect(detection.terminal.features.images).toBe(true);
    });

    test('detects Alacritty as Tier 1 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Alacritty terminal
      process.env.TERM_PROGRAM = 'alacritty';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Alacritty');
      expect(detection.terminal.tier).toBe(1);
      expect(detection.terminal.features.fastRendering).toBe(true);
      expect(detection.terminal.features.ligatures).toBe(false);
      expect(detection.terminal.optimizations.minimizeAnsiSequences).toBe(true);
    });

    test('detects Kitty as Tier 1 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Kitty terminal
      process.env.TERM_PROGRAM = 'kitty';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Kitty');
      expect(detection.terminal.tier).toBe(1);
      expect(detection.terminal.features.customProtocols).toBe(true);
      expect(detection.terminal.optimizations.useKittyGraphics).toBe(true);
    });

    test('detects Windows Terminal as Tier 1 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Windows Terminal
      process.env.WT_SESSION = 'abc123';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Windows Terminal');
      expect(detection.terminal.tier).toBe(1);
      expect(detection.terminal.features.acrylic).toBe(true);
      expect(detection.terminal.optimizations.useConptyApi).toBe(true);
    });

    test('detects Terminal.app as Tier 2 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Terminal.app
      process.env.TERM_PROGRAM = 'Apple_Terminal';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Terminal.app');
      expect(detection.terminal.tier).toBe(2);
      expect(detection.terminal.priority).toBe('medium');
      expect(detection.confidence).toBe('medium');
    });

    test('detects Hyper as Tier 2 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Hyper terminal
      process.env.TERM_PROGRAM = 'Hyper';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('Hyper');
      expect(detection.terminal.tier).toBe(2);
      expect(detection.terminal.colorSupport).toBe('trueColor');
    });

    test('detects GNOME Terminal as Tier 3 terminal', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set GNOME Terminal
      process.env.COLORTERM = 'gnome-terminal';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('GNOME Terminal');
      expect(detection.terminal.tier).toBe(3);
      expect(detection.terminal.priority).toBe('low');
      expect(detection.confidence).toBe('low');
    });

    test('falls back to xterm for unknown terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      delete process.env.WT_SESSION;
      delete process.env.COLORTERM;
      
      // Set unknown terminal
      process.env.TERM = 'unknown-terminal';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      expect(detection.terminal.name).toBe('xterm');
      expect(detection.terminal.tier).toBe(3);
      expect(detection.confidence).toBe('low');
      expect(detection.detectionMethod).toBe('fallback');
    });

    test('prioritizes Ghostty over other detections', () => {
      // Set up environment that could match multiple terminals
      process.env.TERM_PROGRAM = 'ghostty';
      process.env.TERM = 'xterm-256color';
      process.env.COLORTERM = 'truecolor';
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      // Should detect Ghostty first
      expect(detection.terminal.name).toBe('Ghostty');
      expect(detection.terminal.priority).toBe('primary');
    });
  });

  describe('getOptimizedConfig', () => {
    test('applies Ghostty optimizations', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const baseConfig = {
        colors: true,
        animations: false
      };
      
      const optimized = MultiTerminalSupport.getOptimizedConfig(baseConfig);
      
      expect(optimized.colors).toBe(true);
      expect(optimized.animations).toBe(false);
      expect(optimized.ghosttyOptimizations).toBeDefined();
      expect(optimized.ghosttyOptimizations.useGpuAcceleration).toBe(true);
    });

    test('applies terminal-specific optimizations for other terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Alacritty terminal
      process.env.TERM_PROGRAM = 'alacritty';
      
      const baseConfig = {
        rendering: 'standard'
      };
      
      const optimized = MultiTerminalSupport.getOptimizedConfig(baseConfig);
      
      expect(optimized.rendering).toBe('standard');
      expect(optimized.terminalOptimizations).toBeDefined();
      expect(optimized.terminalOptimizations.minimizeAnsiSequences).toBe(true);
      expect(optimized.terminalOptimizations.batchUpdates).toBe(true);
    });
  });

  describe('getCapabilities', () => {
    test('returns enhanced capabilities for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const capabilities = MultiTerminalSupport.getCapabilities();
      
      expect(capabilities.colorProfile).toBe('trueColor');
      expect(capabilities.hasTrueColorSupport).toBe(true);
      
      // Should have Ghostty-specific capabilities
      if ('gpuAcceleration' in capabilities) {
        expect(capabilities.gpuAcceleration).toBe(true);
      }
    });

    test('returns appropriate capabilities for other terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Alacritty terminal
      process.env.TERM_PROGRAM = 'alacritty';
      
      const capabilities = MultiTerminalSupport.getCapabilities();
      
      expect(capabilities.colorProfile).toBe('trueColor');
      expect(capabilities.hasTrueColorSupport).toBe(true);
      expect(capabilities.hasUnicodeSupport).toBe(true);
    });
  });

  describe('getSupportedTerminals', () => {
    test('organizes terminals by tier with Ghostty first', () => {
      const terminals = MultiTerminalSupport.getSupportedTerminals();
      
      expect(terminals.tier1).toBeDefined();
      expect(terminals.tier2).toBeDefined();
      expect(terminals.tier3).toBeDefined();
      
      // Ghostty should be first in Tier 1
      expect(terminals.tier1[0].name).toBe('Ghostty');
      expect(terminals.tier1[0].priority).toBe('primary');
      
      // All Tier 1 terminals should be high priority or primary
      terminals.tier1.forEach(terminal => {
        expect(['primary', 'high']).toContain(terminal.priority);
      });
      
      // Tier 2 should be medium priority
      terminals.tier2.forEach(terminal => {
        expect(terminal.priority).toBe('medium');
      });
      
      // Tier 3 should be low priority
      terminals.tier3.forEach(terminal => {
        expect(terminal.priority).toBe('low');
      });
    });

    test('includes all expected terminals in correct tiers', () => {
      const terminals = MultiTerminalSupport.getSupportedTerminals();
      
      const tier1Names = terminals.tier1.map(t => t.name);
      expect(tier1Names).toContain('Ghostty');
      expect(tier1Names).toContain('iTerm2');
      expect(tier1Names).toContain('Alacritty');
      expect(tier1Names).toContain('Kitty');
      expect(tier1Names).toContain('Windows Terminal');
      
      const tier2Names = terminals.tier2.map(t => t.name);
      expect(tier2Names).toContain('Terminal.app');
      expect(tier2Names).toContain('Hyper');
      
      const tier3Names = terminals.tier3.map(t => t.name);
      expect(tier3Names).toContain('xterm');
      expect(tier3Names).toContain('GNOME Terminal');
    });
  });

  describe('validateCompatibility', () => {
    test('validates feature compatibility for Ghostty', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const requiredFeatures = ['ligatures', 'gpuAcceleration', 'smoothScrolling'];
      const result = MultiTerminalSupport.validateCompatibility(requiredFeatures);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.compatible).toBe(true);
        expect(result.value.supportedFeatures).toEqual(requiredFeatures);
        expect(result.value.unsupportedFeatures).toEqual([]);
      }
    });

    test('identifies missing features for limited terminals', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set Alacritty terminal
      process.env.TERM_PROGRAM = 'alacritty';
      
      const requiredFeatures = ['ligatures', 'fastRendering'];
      const result = MultiTerminalSupport.validateCompatibility(requiredFeatures);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.compatible).toBe(false);
        expect(result.value.supportedFeatures).toContain('fastRendering');
        expect(result.value.unsupportedFeatures).toContain('ligatures');
        expect(result.value.recommendedAlternatives.length).toBeGreaterThan(0);
      }
    });

    test('recommends Ghostty for advanced features', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set xterm terminal
      process.env.TERM = 'xterm';
      
      const requiredFeatures = ['gpuAcceleration'];
      const result = MultiTerminalSupport.validateCompatibility(requiredFeatures);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.recommendedAlternatives[0]).toBe('Ghostty (recommended)');
      }
    });

    test('handles empty feature requirements', () => {
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      
      // Set xterm terminal
      process.env.TERM_PROGRAM = 'xterm';
      
      const result = MultiTerminalSupport.validateCompatibility([]);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.compatible).toBe(true);
        expect(result.value.supportedFeatures).toEqual([]);
        expect(result.value.unsupportedFeatures).toEqual([]);
      }
    });
  });

  describe('platform-specific detection', () => {
    test('detects Windows Terminal on Windows platform', () => {
      // Mock Windows platform
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      // Clear all Ghostty-related environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      delete process.env.WT_SESSION;
      
      const detection = MultiTerminalSupport.detectTerminal();
      
      // Should detect cmd.exe on Windows without WT_SESSION
      expect(detection.terminal.name).toBe('cmd.exe');
      expect(detection.terminal.tier).toBe(3);
      
      // Restore platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    test('handles Unix-like platforms correctly', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      
      process.env.TERM_PROGRAM = 'ghostty';
      
      const capabilities = MultiTerminalSupport.getCapabilities();
      
      expect(capabilities.platform).toBe('unix');
      
      // Restore platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('edge cases and error handling', () => {
    test('handles missing environment variables gracefully', () => {
      // Clear all environment variables
      delete process.env.TERM_PROGRAM;
      delete process.env.GHOSTTY_RESOURCES_DIR;
      delete process.env.GHOSTTY_CONFIG_DIR;
      delete process.env.GHOSTTY_VERSION;
      delete process.env.TERM_PROGRAM_VERSION;
      delete process.env.TERM;
      delete process.env.COLORTERM;
      delete process.env.WT_SESSION;
      
      expect(() => MultiTerminalSupport.detectTerminal()).not.toThrow();
      expect(() => MultiTerminalSupport.getCapabilities()).not.toThrow();
      expect(() => MultiTerminalSupport.getSupportedTerminals()).not.toThrow();
    });

    test('validates compatibility with invalid features', () => {
      process.env.TERM_PROGRAM = 'ghostty';
      
      const result = MultiTerminalSupport.validateCompatibility(['nonExistentFeature'] as any);
      
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.compatible).toBe(false);
        expect(result.value.unsupportedFeatures).toContain('nonExistentFeature');
      }
    });

    test('maintains tier ordering and priorities', () => {
      const terminals = MultiTerminalSupport.getSupportedTerminals();
      
      // Verify Tier 1 includes all critical terminals
      expect(terminals.tier1.length).toBeGreaterThanOrEqual(5);
      
      // Verify tiers are properly separated
      expect(terminals.tier1.every(t => t.tier === 1)).toBe(true);
      expect(terminals.tier2.every(t => t.tier === 2)).toBe(true);
      expect(terminals.tier3.every(t => t.tier === 3)).toBe(true);
    });
  });
});