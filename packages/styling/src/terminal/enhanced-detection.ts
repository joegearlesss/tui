/**
 * Enhanced Terminal Detection System
 * 
 * Provides comprehensive terminal capability detection for cross-platform compatibility
 * Extends the basic detection with advanced feature detection and fallback handling
 */

import type { 
  TerminalCapabilities, 
  ColorProfile, 
  TerminalEnvironment,
  BackgroundDetection 
} from './types';

interface ExtendedTerminalCapabilities extends TerminalCapabilities {
  /** Unicode support level */
  readonly unicodeLevel: 'none' | 'basic' | 'full';
  
  /** Cursor positioning support */
  readonly cursorPositioning: boolean;
  
  /** Mouse support */
  readonly mouseSupport: boolean;
  
  /** Alternate screen buffer support */
  readonly alternateScreen: boolean;
  
  /** Synchronized output support */
  readonly synchronizedOutput: boolean;
  
  /** Hyperlink support */
  readonly hyperlinkSupport: boolean;
  
  /** Kitty graphics protocol */
  readonly kittyGraphics: boolean;
  
  /** Sixel graphics support */
  readonly sixelGraphics: boolean;
}

interface TerminalProfile {
  readonly name: string;
  readonly version?: string;
  readonly capabilities: ExtendedTerminalCapabilities;
  readonly quirks: readonly string[];
  readonly recommendations: readonly string[];
}

/**
 * Enhanced terminal detection with comprehensive capability analysis
 */
export namespace EnhancedTerminal {
  
  /**
   * Detect comprehensive terminal capabilities
   */
  export const detectCapabilities = (): ExtendedTerminalCapabilities => {
    const env = getEnvironment();
    const colorProfile = detectColorProfile();
    const unicodeLevel = detectUnicodeSupport();
    const features = detectAdvancedFeatures(env);
    
    return {
      colorSupport: colorProfile !== 'noColor',
      colorProfile,
      backgroundDetection: detectBackground(),
      unicodeLevel,
      cursorPositioning: features.cursorPositioning,
      mouseSupport: features.mouseSupport,
      alternateScreen: features.alternateScreen,
      synchronizedOutput: features.synchronizedOutput,
      hyperlinkSupport: features.hyperlinkSupport,
      kittyGraphics: features.kittyGraphics,
      sixelGraphics: features.sixelGraphics
    };
  };
  
  /**
   * Generate comprehensive terminal profile
   */
  export const getTerminalProfile = (): TerminalProfile => {
    const env = getEnvironment();
    const capabilities = detectCapabilities();
    const { name, version } = detectTerminalIdentity(env);
    const quirks = detectKnownQuirks(name, env);
    const recommendations = generateRecommendations(name, capabilities);
    
    return {
      name,
      version,
      capabilities,
      quirks,
      recommendations
    };
  };
  
  /**
   * Enhanced color profile detection with fallback strategies
   */
  export const detectColorProfile = (): ColorProfile => {
    const env = getEnvironment();
    
    // Explicit NO_COLOR takes precedence
    if (env.noColor !== undefined || env.noColor === '1') {
      return 'noColor';
    }
    
    // FORCE_COLOR override
    if (env.forceColor !== undefined) {
      const level = Number.parseInt(env.forceColor, 10);
      if (level >= 3) return 'trueColor';
      if (level >= 2) return 'ansi256';
      if (level >= 1) return 'ansi';
      return 'noColor';
    }
    
    // COLORTERM detection
    if (env.colorTerm) {
      const colorTerm = env.colorTerm.toLowerCase();
      if (colorTerm === 'truecolor' || colorTerm === '24bit') {
        return 'trueColor';
      }
    }
    
    // Terminal program detection
    const termProgram = env.termProgram?.toLowerCase();
    if (termProgram) {
      // True color terminals
      if ([
        'iterm.app',
        'vscode',
        'hyper',
        'wezterm',
        'alacritty',
        'kitty',
        'ghostty',
        'rio'
      ].some(term => termProgram.includes(term))) {
        return 'trueColor';
      }
      
      // 256 color terminals
      if ([
        'apple_terminal',
        'terminal.app',
        'gnome-terminal',
        'konsole',
        'xfce4-terminal'
      ].some(term => termProgram.includes(term))) {
        return 'ansi256';
      }
    }
    
    // TERM environment variable analysis
    const term = env.term?.toLowerCase();
    if (term) {
      if (term.includes('truecolor') || term.includes('24bit')) {
        return 'trueColor';
      }
      if (term.includes('256color') || term.includes('256')) {
        return 'ansi256';
      }
      if (term.includes('color')) {
        return 'ansi';
      }
    }
    
    // CI/CD environment detection
    if (isCI(env)) {
      // Most CI environments support ANSI colors
      return 'ansi';
    }
    
    // TTY detection fallback
    if (process.stdout.isTTY) {
      return 'ansi'; // Conservative fallback
    }
    
    return 'noColor';
  };
  
  /**
   * Detect Unicode support level
   */
  export const detectUnicodeSupport = (): 'none' | 'basic' | 'full' => {
    const env = getEnvironment();
    
    // Check explicit LC_ALL, LC_CTYPE, LANG
    const locale = env.lcAll || env.lcCtype || env.lang || '';
    const localeLower = locale.toLowerCase();
    
    // ASCII-only environments (check first)
    if (localeLower === 'c' || localeLower === 'posix' || localeLower.includes('ascii')) {
      return 'none';
    }
    
    if (localeLower.includes('utf-8') || localeLower.includes('utf8')) {
      // Check if terminal supports full Unicode
      const termProgram = env.termProgram?.toLowerCase();
      if (termProgram && [
        'iterm.app',
        'kitty',
        'wezterm',
        'alacritty',
        'ghostty'
      ].some(term => termProgram.includes(term))) {
        return 'full';
      }
      return 'basic';
    }
    
    // If no locale specified or unknown, default to basic for modern systems
    // unless it's clearly an ASCII environment
    if (!locale || locale === '') {
      return 'basic';
    }
    
    // Conservative fallback for unknown locales
    return 'basic';
  };
  
  /**
   * Detect advanced terminal features
   */
  const detectAdvancedFeatures = (env: TerminalEnvironment) => {
    const termProgram = env.termProgram?.toLowerCase() || '';
    const term = env.term?.toLowerCase() || '';
    
    return {
      cursorPositioning: !isMinimalTerminal(termProgram, term),
      mouseSupport: supportsMouseInput(termProgram, term),
      alternateScreen: supportsAlternateScreen(termProgram, term),
      synchronizedOutput: supportsSynchronizedOutput(termProgram, term),
      hyperlinkSupport: supportsHyperlinks(termProgram, term),
      kittyGraphics: termProgram.includes('kitty'),
      sixelGraphics: supportsSixel(termProgram, term)
    };
  };
  
  /**
   * Detect terminal identity and version
   */
  const detectTerminalIdentity = (env: TerminalEnvironment): { name: string; version?: string } => {
    // Terminal program detection
    if (env.termProgram) {
      const version = env.termProgramVersion;
      return { name: env.termProgram, version };
    }
    
    // SSH detection
    if (env.sshConnection || env.sshClient) {
      return { name: 'ssh', version: undefined };
    }
    
    // CI detection
    if (isCI(env)) {
      const ciName = detectCIProvider(env);
      return { name: `ci-${ciName}`, version: undefined };
    }
    
    // Fallback to TERM
    return { name: env.term || 'unknown', version: undefined };
  };
  
  /**
   * Detect known terminal quirks
   */
  const detectKnownQuirks = (terminalName: string, env: TerminalEnvironment): readonly string[] => {
    const quirks: string[] = [];
    const name = terminalName.toLowerCase();
    
    // Windows Terminal quirks
    if (name.includes('windows terminal')) {
      quirks.push('windows-terminal-cursor-shape');
    }
    
    // Git Bash quirks
    if (env.msysystem || name.includes('mingw')) {
      quirks.push('git-bash-ansi-issues', 'windows-path-handling');
    }
    
    // Tmux quirks
    if (env.tmux) {
      quirks.push('tmux-color-passthrough', 'tmux-escape-sequences');
    }
    
    // Screen quirks
    if (env.term?.includes('screen')) {
      quirks.push('screen-limited-colors', 'screen-title-issues');
    }
    
    // Apple Terminal quirks
    if (name.includes('apple_terminal') || name.includes('terminal.app')) {
      quirks.push('apple-terminal-bold-colors');
    }
    
    // VSCode integrated terminal
    if (name.includes('vscode')) {
      quirks.push('vscode-integrated-terminal');
    }
    
    return quirks;
  };
  
  /**
   * Generate optimization recommendations
   */
  const generateRecommendations = (
    terminalName: string, 
    capabilities: ExtendedTerminalCapabilities
  ): readonly string[] => {
    const recommendations: string[] = [];
    const name = terminalName.toLowerCase();
    
    // Color recommendations
    if (capabilities.colorProfile === 'trueColor') {
      recommendations.push('Use full RGB color palette for best visual experience');
    } else if (capabilities.colorProfile === 'ansi256') {
      recommendations.push('Use 256-color palette for good color support');
    } else if (capabilities.colorProfile === 'ansi') {
      recommendations.push('Use basic ANSI colors for compatibility');
    } else {
      recommendations.push('Consider monochrome styling for accessibility');
    }
    
    // Unicode recommendations
    if (capabilities.unicodeLevel === 'full') {
      recommendations.push('Use full Unicode character set including box drawing');
    } else if (capabilities.unicodeLevel === 'basic') {
      recommendations.push('Use basic Unicode with ASCII fallbacks');
    } else {
      recommendations.push('Use ASCII-only characters for maximum compatibility');
    }
    
    // Feature recommendations
    if (!capabilities.cursorPositioning) {
      recommendations.push('Avoid complex layouts that require cursor positioning');
    }
    
    if (capabilities.synchronizedOutput) {
      recommendations.push('Use synchronized output for flicker-free updates');
    }
    
    if (capabilities.hyperlinkSupport) {
      recommendations.push('Consider using terminal hyperlinks for better UX');
    }
    
    // Terminal-specific recommendations
    if (name.includes('ci')) {
      recommendations.push('Use simple output formatting for CI environments');
    }
    
    if (name.includes('ssh')) {
      recommendations.push('Consider reduced complexity for SSH sessions');
    }
    
    return recommendations;
  };
  
  /**
   * Get terminal environment variables
   */
  const getEnvironment = (): TerminalEnvironment => ({
    term: process.env.TERM,
    colorTerm: process.env.COLORTERM,
    termProgram: process.env.TERM_PROGRAM,
    termProgramVersion: process.env.TERM_PROGRAM_VERSION,
    noColor: process.env.NO_COLOR,
    forceColor: process.env.FORCE_COLOR,
    ci: process.env.CI,
    tmux: process.env.TMUX,
    sshConnection: process.env.SSH_CONNECTION,
    sshClient: process.env.SSH_CLIENT,
    lcAll: process.env.LC_ALL,
    lcCtype: process.env.LC_CTYPE,
    lang: process.env.LANG,
    msysystem: process.env.MSYSTEM
  });
  
  /**
   * Detect background color preference
   */
  const detectBackground = (): BackgroundDetection => {
    // This would typically involve terminal queries or heuristics
    // For now, return a sensible default
    return 'unknown';
  };
  
  // Helper functions
  const isCI = (env: TerminalEnvironment): boolean => {
    return !!(env.ci || 
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.BUILDKITE ||
      process.env.CIRCLECI);
  };
  
  const detectCIProvider = (env: TerminalEnvironment): string => {
    if (process.env.GITHUB_ACTIONS) return 'github';
    if (process.env.GITLAB_CI) return 'gitlab';
    if (process.env.BUILDKITE) return 'buildkite';
    if (process.env.CIRCLECI) return 'circle';
    return 'unknown';
  };
  
  const isMinimalTerminal = (termProgram: string, term: string): boolean => {
    return term.includes('dumb') || 
           term.includes('unknown') ||
           termProgram.includes('basic');
  };
  
  const supportsMouseInput = (termProgram: string, term: string): boolean => {
    return !isMinimalTerminal(termProgram, term) &&
           !term.includes('dumb');
  };
  
  const supportsAlternateScreen = (termProgram: string, term: string): boolean => {
    return !isMinimalTerminal(termProgram, term) &&
           !term.includes('dumb');
  };
  
  const supportsSynchronizedOutput = (termProgram: string, term: string): boolean => {
    return termProgram.includes('kitty') ||
           termProgram.includes('wezterm') ||
           termProgram.includes('iterm') ||
           termProgram.includes('alacritty');
  };
  
  const supportsHyperlinks = (termProgram: string, term: string): boolean => {
    return termProgram.includes('kitty') ||
           termProgram.includes('wezterm') ||
           termProgram.includes('iterm') ||
           termProgram.includes('vscode') ||
           termProgram.includes('gnome-terminal');
  };
  
  const supportsSixel = (termProgram: string, term: string): boolean => {
    return termProgram.includes('xterm') ||
           termProgram.includes('mlterm') ||
           term.includes('sixel');
  };
}

export type { ExtendedTerminalCapabilities, TerminalProfile };