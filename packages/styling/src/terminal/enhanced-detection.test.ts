import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { EnhancedTerminal, type ExtendedTerminalCapabilities, type TerminalProfile } from './enhanced-detection';

describe('Enhanced Terminal Detection', () => {
  let originalEnv: Record<string, string | undefined>;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });
  
  afterEach(() => {
    // Clear all environment variables that might affect detection
    const envVarsToClean = [
      'TERM', 'COLORTERM', 'TERM_PROGRAM', 'TERM_PROGRAM_VERSION',
      'NO_COLOR', 'FORCE_COLOR', 'CI', 'TMUX', 'SSH_CONNECTION', 'SSH_CLIENT',
      'LC_ALL', 'LC_CTYPE', 'LANG', 'MSYSTEM', 'GITHUB_ACTIONS', 'GITLAB_CI'
    ];
    
    envVarsToClean.forEach(key => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  });
  
  describe('Color Profile Detection', () => {
    test('detects NO_COLOR override', () => {
      process.env.NO_COLOR = '1';
      const profile = EnhancedTerminal.detectColorProfile();
      expect(profile).toBe('noColor');
    });
    
    test('detects FORCE_COLOR levels', () => {
      process.env.FORCE_COLOR = '3';
      expect(EnhancedTerminal.detectColorProfile()).toBe('trueColor');
      
      process.env.FORCE_COLOR = '2';
      expect(EnhancedTerminal.detectColorProfile()).toBe('ansi256');
      
      process.env.FORCE_COLOR = '1';
      expect(EnhancedTerminal.detectColorProfile()).toBe('ansi');
      
      process.env.FORCE_COLOR = '0';
      expect(EnhancedTerminal.detectColorProfile()).toBe('noColor');
    });
    
    test('detects COLORTERM true color support', () => {
      process.env.COLORTERM = 'truecolor';
      expect(EnhancedTerminal.detectColorProfile()).toBe('trueColor');
      
      process.env.COLORTERM = '24bit';
      expect(EnhancedTerminal.detectColorProfile()).toBe('trueColor');
    });
    
    test('detects terminal programs', () => {
      // Clear environment first
      delete process.env.COLORTERM;
      delete process.env.TERM;
      
      const trueColorTerminals = [
        'iTerm.app',
        'vscode',
        'Hyper',
        'WezTerm',
        'Alacritty',
        'kitty',
        'Ghostty'
      ];
      
      for (const terminal of trueColorTerminals) {
        delete process.env.COLORTERM;
        delete process.env.TERM;
        process.env.TERM_PROGRAM = terminal;
        expect(EnhancedTerminal.detectColorProfile()).toBe('trueColor');
      }
      
      const ansi256Terminals = [
        'Apple_Terminal',
        'Terminal.app',
        'gnome-terminal'
      ];
      
      for (const terminal of ansi256Terminals) {
        delete process.env.COLORTERM;
        delete process.env.TERM;
        process.env.TERM_PROGRAM = terminal;
        expect(EnhancedTerminal.detectColorProfile()).toBe('ansi256');
      }
    });
    
    test('analyzes TERM environment variable', () => {
      // Clear other color-related env vars
      delete process.env.COLORTERM;
      delete process.env.TERM_PROGRAM;
      
      process.env.TERM = 'xterm-256color';
      expect(EnhancedTerminal.detectColorProfile()).toBe('ansi256');
      
      process.env.TERM = 'screen-256color';
      expect(EnhancedTerminal.detectColorProfile()).toBe('ansi256');
      
      process.env.TERM = 'xterm-color';
      expect(EnhancedTerminal.detectColorProfile()).toBe('ansi');
    });
  });
  
  describe('Unicode Support Detection', () => {
    test('detects UTF-8 support from locale', () => {
      // Clear terminal program to avoid full Unicode detection
      delete process.env.TERM_PROGRAM;
      
      process.env.LC_ALL = 'en_US.UTF-8';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('basic');
      
      delete process.env.LC_ALL;
      process.env.LANG = 'C.UTF-8';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('basic');
    });
    
    test('detects full Unicode support in advanced terminals', () => {
      process.env.LC_ALL = 'en_US.UTF-8';
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('full');
      
      process.env.TERM_PROGRAM = 'kitty';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('full');
    });
    
    test('detects ASCII-only environments', () => {
      delete process.env.TERM_PROGRAM;
      delete process.env.LC_ALL;
      delete process.env.LC_CTYPE;
      
      process.env.LANG = 'C';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('none');
      
      process.env.LANG = 'POSIX';
      expect(EnhancedTerminal.detectUnicodeSupport()).toBe('none');
    });
  });
  
  describe('Comprehensive Capability Detection', () => {
    test('detects modern terminal capabilities', () => {
      process.env.TERM_PROGRAM = 'kitty';
      process.env.COLORTERM = 'truecolor';
      process.env.LC_ALL = 'en_US.UTF-8';
      
      const capabilities = EnhancedTerminal.detectCapabilities();
      
      expect(capabilities.colorSupport).toBe(true);
      expect(capabilities.colorProfile).toBe('trueColor');
      expect(capabilities.unicodeLevel).toBe('full');
      expect(capabilities.cursorPositioning).toBe(true);
      expect(capabilities.synchronizedOutput).toBe(true);
      expect(capabilities.hyperlinkSupport).toBe(true);
      expect(capabilities.kittyGraphics).toBe(true);
    });
    
    test('detects limited terminal capabilities', () => {
      process.env.TERM = 'dumb';
      process.env.NO_COLOR = '1';
      
      const capabilities = EnhancedTerminal.detectCapabilities();
      
      expect(capabilities.colorSupport).toBe(false);
      expect(capabilities.colorProfile).toBe('noColor');
      expect(capabilities.cursorPositioning).toBe(false);
      expect(capabilities.mouseSupport).toBe(false);
      expect(capabilities.synchronizedOutput).toBe(false);
    });
  });
  
  describe('Terminal Profile Generation', () => {
    test('generates comprehensive iTerm profile', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      process.env.TERM_PROGRAM_VERSION = '3.4.0';
      process.env.COLORTERM = 'truecolor';
      process.env.LC_ALL = 'en_US.UTF-8';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      
      expect(profile.name).toBe('iTerm.app');
      expect(profile.version).toBe('3.4.0');
      expect(profile.capabilities.colorProfile).toBe('trueColor');
      expect(profile.capabilities.unicodeLevel).toBe('full');
      expect(profile.quirks).toEqual([]);
      expect(profile.recommendations).toContain('Use full RGB color palette for best visual experience');
    });
    
    test('generates Windows Terminal profile with quirks', () => {
      process.env.TERM_PROGRAM = 'Windows Terminal';
      process.env.COLORTERM = 'truecolor';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      
      expect(profile.name).toBe('Windows Terminal');
      expect(profile.quirks).toContain('windows-terminal-cursor-shape');
    });
    
    test('generates CI environment profile', () => {
      // Clear terminal program to ensure CI detection works
      delete process.env.TERM_PROGRAM;
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      
      expect(profile.name).toBe('ci-github');
      expect(profile.recommendations).toContain('Use simple output formatting for CI environments');
    });
    
    test('generates Git Bash profile with quirks', () => {
      process.env.MSYSTEM = 'MINGW64';
      process.env.TERM = 'xterm';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      
      expect(profile.quirks).toContain('git-bash-ansi-issues');
      expect(profile.quirks).toContain('windows-path-handling');
    });
    
    test('generates tmux profile with quirks', () => {
      process.env.TMUX = '/tmp/tmux-1000/default,12345,0';
      process.env.TERM = 'screen-256color';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      
      expect(profile.quirks).toContain('tmux-color-passthrough');
      expect(profile.quirks).toContain('tmux-escape-sequences');
    });
  });
  
  describe('Advanced Feature Detection', () => {
    test('detects hyperlink support', () => {
      const hyperlinkTerminals = ['kitty', 'WezTerm', 'iTerm.app', 'vscode', 'gnome-terminal'];
      
      for (const terminal of hyperlinkTerminals) {
        process.env.TERM_PROGRAM = terminal;
        const capabilities = EnhancedTerminal.detectCapabilities();
        expect(capabilities.hyperlinkSupport).toBe(true);
      }
    });
    
    test('detects synchronized output support', () => {
      const syncTerminals = ['kitty', 'WezTerm', 'iTerm.app', 'Alacritty'];
      
      for (const terminal of syncTerminals) {
        process.env.TERM_PROGRAM = terminal;
        const capabilities = EnhancedTerminal.detectCapabilities();
        expect(capabilities.synchronizedOutput).toBe(true);
      }
    });
    
    test('detects graphics protocol support', () => {
      process.env.TERM_PROGRAM = 'kitty';
      const capabilities = EnhancedTerminal.detectCapabilities();
      expect(capabilities.kittyGraphics).toBe(true);
      
      process.env.TERM_PROGRAM = 'xterm';
      const capabilities2 = EnhancedTerminal.detectCapabilities();
      expect(capabilities2.sixelGraphics).toBe(true);
    });
  });
  
  describe('Recommendation Generation', () => {
    test('provides appropriate color recommendations', () => {
      // True color terminal
      process.env.TERM_PROGRAM = 'kitty';
      process.env.COLORTERM = 'truecolor';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      expect(profile.recommendations).toContain('Use full RGB color palette for best visual experience');
      
      // No color terminal
      process.env.NO_COLOR = '1';
      const profile2 = EnhancedTerminal.getTerminalProfile();
      expect(profile2.recommendations).toContain('Consider monochrome styling for accessibility');
    });
    
    test('provides Unicode recommendations', () => {
      process.env.LC_ALL = 'en_US.UTF-8';
      process.env.TERM_PROGRAM = 'kitty';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      expect(profile.recommendations).toContain('Use full Unicode character set including box drawing');
    });
    
    test('provides feature-specific recommendations', () => {
      process.env.TERM_PROGRAM = 'kitty';
      process.env.COLORTERM = 'truecolor';
      
      const profile = EnhancedTerminal.getTerminalProfile();
      expect(profile.recommendations).toContain('Use synchronized output for flicker-free updates');
      expect(profile.recommendations).toContain('Consider using terminal hyperlinks for better UX');
    });
  });
});