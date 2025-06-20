import type {
  BackgroundDetection,
  ColorProfile,
  TerminalCapabilities,
  TerminalEnvironment,
} from './types';

/**
 * Terminal capability detection namespace
 * Provides functions to detect terminal features and capabilities
 */
namespace Terminal {
  /**
   * Gets the current terminal's color profile
   * @returns Color profile indicating supported color capabilities
   */
  export const getColorProfile = (): ColorProfile => {
    const env = getEnvironment();

    // Check for explicit NO_COLOR
    if (env.noColor !== undefined) {
      return 'noColor';
    }

    // Check for explicit FORCE_COLOR
    if (env.forceColor !== undefined) {
      const forceLevel = Number.parseInt(env.forceColor, 10);
      if (forceLevel >= 3) return 'trueColor';
      if (forceLevel >= 2) return 'ansi256';
      if (forceLevel >= 1) return 'ansi';
    }

    // Check if output is a TTY - this is critical for matching Go Lipgloss behavior
    // Must come before COLORTERM check to ensure redirected output has no colors
    if (process.stdout.isTTY !== true) {
      return 'noColor';
    }

    // Check COLORTERM for true color support
    if (env.colorTerm === 'truecolor' || env.colorTerm === '24bit') {
      return 'trueColor';
    }

    // Check specific terminal programs with Ghostty-first approach
    if (env.termProgram) {
      const program = env.termProgram.toLowerCase();

      // Ghostty gets highest priority (Primary Development Terminal)
      if (program.includes('ghostty')) {
        return 'trueColor';
      }

      // Known true color terminals
      if (
        program.includes('iterm') ||
        program.includes('vscode') ||
        program.includes('hyper') ||
        program.includes('wezterm') ||
        program.includes('alacritty') ||
        program.includes('kitty')
      ) {
        return 'trueColor';
      }

      // Known 256 color terminals
      if (program.includes('terminal') || program.includes('konsole')) {
        return 'ansi256';
      }
    }

    // Check TERM variable
    if (env.term) {
      const term = env.term.toLowerCase();

      // True color capable terminals
      if (term.includes('truecolor') || term.includes('24bit')) {
        return 'trueColor';
      }

      // 256 color terminals
      if (term.includes('256') || term.includes('xterm-256')) {
        return 'ansi256';
      }

      // Basic color terminals (but not xterm which supports 256)
      if (term.includes('color') && !term.includes('xterm')) {
        return 'ansi';
      }
    }

    // Check if we're in a CI environment
    if (env.ciEnvironment !== undefined) {
      return 'ansi'; // Most CI environments support basic colors
    }

    // Default fallback
    return 'ansi';
  };

  /**
   * Checks if terminal supports any color output
   * @returns True if terminal supports colors
   */
  export const hasColorSupport = (): boolean => {
    return getColorProfile() !== 'noColor';
  };

  /**
   * Checks if terminal supports 24-bit true color
   * @returns True if terminal supports true color
   */
  export const hasTrueColorSupport = (): boolean => {
    return getColorProfile() === 'trueColor';
  };

  /**
   * Checks if terminal supports Unicode characters
   * @returns True if terminal supports Unicode
   */
  export const hasUnicodeSupport = (): boolean => {
    const env = getEnvironment();

    // Check for UTF-8 locale
    const locale = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
    if (locale?.toLowerCase().includes('utf')) {
      return true;
    }

    // Known Unicode-capable terminals
    if (env.termProgram) {
      const program = env.termProgram.toLowerCase();
      if (
        program.includes('iterm') ||
        program.includes('vscode') ||
        program.includes('hyper') ||
        program.includes('wezterm') ||
        program.includes('alacritty') ||
        program.includes('terminal')
      ) {
        return true;
      }
    }

    // Modern terminals generally support Unicode
    return true;
  };

  /**
   * Gets terminal dimensions
   * @returns Terminal width and height, or undefined if not detectable
   */
  export const getDimensions = (): { width: number | undefined; height: number | undefined } => {
    try {
      // Try to get from process.stdout
      if (
        process.stdout &&
        typeof process.stdout.columns === 'number' &&
        typeof process.stdout.rows === 'number'
      ) {
        return {
          width: process.stdout.columns,
          height: process.stdout.rows,
        };
      }

      // Try environment variables
      const width = process.env.COLUMNS ? Number.parseInt(process.env.COLUMNS, 10) : undefined;
      const height = process.env.LINES ? Number.parseInt(process.env.LINES, 10) : undefined;

      return {
        width: width && width > 0 ? width : undefined,
        height: height && height > 0 ? height : undefined,
      };
    } catch {
      return { width: undefined, height: undefined };
    }
  };

  /**
   * Detects the operating system platform
   * @returns Platform type
   */
  export const getPlatform = (): 'windows' | 'unix' | 'unknown' => {
    try {
      const platform = process.platform;
      if (platform === 'win32') return 'windows';
      if (
        platform === 'darwin' ||
        platform === 'linux' ||
        platform === 'freebsd' ||
        platform === 'openbsd' ||
        platform === 'netbsd' ||
        platform === 'aix' ||
        platform === 'sunos'
      ) {
        return 'unix';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  /**
   * Gets complete terminal capabilities
   * @returns Full terminal capabilities object
   */
  export const getCapabilities = (): TerminalCapabilities => {
    const colorProfile = getColorProfile();
    const dimensions = getDimensions();

    return {
      colorProfile,
      hasColorSupport: colorProfile !== 'noColor',
      hasTrueColorSupport: colorProfile === 'trueColor',
      hasUnicodeSupport: hasUnicodeSupport(),
      width: dimensions.width,
      height: dimensions.height,
      platform: getPlatform(),
    };
  };

  /**
   * Gets terminal environment variables
   * @returns Terminal environment information
   */
  export const getEnvironment = (): TerminalEnvironment => {
    return {
      term: process.env.TERM,
      colorTerm: process.env.COLORTERM,
      termProgram: process.env.TERM_PROGRAM,
      termProgramVersion: process.env.TERM_PROGRAM_VERSION,
      ciEnvironment: process.env.CI || process.env.CONTINUOUS_INTEGRATION,
      forceColor: process.env.FORCE_COLOR,
      noColor: process.env.NO_COLOR,
      lcAll: process.env.LC_ALL,
      lcCtype: process.env.LC_CTYPE,
      lang: process.env.LANG,
      sshConnection: process.env.SSH_CONNECTION,
      sshClient: process.env.SSH_CLIENT,
      msysystem: process.env.MSYSTEM,
      ci: process.env.CI,
      tmux: process.env.TMUX,
    };
  };

  /**
   * Detects terminal background (dark/light)
   * Note: This is a best-effort detection and may not be 100% accurate
   * @returns Background detection result with confidence level
   */
  export const detectBackground = async (): Promise<BackgroundDetection> => {
    // Try environment-based detection first
    const envResult = detectBackgroundFromEnvironment();
    if (envResult.confidence !== 'unknown') {
      return envResult;
    }

    // Try heuristic detection
    const heuristicResult = detectBackgroundFromHeuristics();
    if (heuristicResult.confidence !== 'unknown') {
      return heuristicResult;
    }

    // Fallback to dark theme assumption (most common for developers)
    return {
      isDark: true,
      confidence: 'low',
      method: 'fallback',
    };
  };

  /**
   * Synchronous version of background detection (less accurate)
   * @returns Background detection result
   */
  export const detectBackgroundSync = (): BackgroundDetection => {
    // Try environment-based detection
    const envResult = detectBackgroundFromEnvironment();
    if (envResult.confidence !== 'unknown') {
      return envResult;
    }

    // Try heuristic detection
    const heuristicResult = detectBackgroundFromHeuristics();
    if (heuristicResult.confidence !== 'unknown') {
      return heuristicResult;
    }

    // Fallback
    return {
      isDark: true,
      confidence: 'low',
      method: 'fallback',
    };
  };
}

/**
 * Detects background from environment variables and terminal settings
 */
const detectBackgroundFromEnvironment = (): BackgroundDetection => {
  const env = Terminal.getEnvironment();

  // Check for explicit theme settings
  const theme = process.env.THEME || process.env.TERMINAL_THEME;
  if (theme) {
    const themeValue = theme.toLowerCase();
    if (themeValue.includes('dark')) {
      return { isDark: true, confidence: 'high', method: 'environment' };
    }
    if (themeValue.includes('light')) {
      return { isDark: false, confidence: 'high', method: 'environment' };
    }
  }

  // Check terminal program defaults
  if (env.termProgram) {
    const program = env.termProgram.toLowerCase();

    // VS Code typically uses dark theme
    if (program.includes('vscode')) {
      return { isDark: true, confidence: 'medium', method: 'environment' };
    }

    // macOS Terminal.app defaults to light
    if (program.includes('apple_terminal')) {
      return { isDark: false, confidence: 'medium', method: 'environment' };
    }
  }

  return { isDark: undefined, confidence: 'unknown', method: 'environment' };
};

/**
 * Detects background using heuristics
 */
const detectBackgroundFromHeuristics = (): BackgroundDetection => {
  const env = Terminal.getEnvironment();

  // Developer environments tend to use dark themes
  if (env.ciEnvironment !== undefined) {
    return { isDark: true, confidence: 'medium', method: 'heuristic' };
  }

  // SSH sessions often use dark terminals
  if (process.env.SSH_CLIENT || process.env.SSH_TTY) {
    return { isDark: true, confidence: 'medium', method: 'heuristic' };
  }

  return { isDark: undefined, confidence: 'unknown', method: 'heuristic' };
};

export { Terminal };
