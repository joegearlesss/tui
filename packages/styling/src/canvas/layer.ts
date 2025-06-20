/**
 * Layer system for compositing multiple text elements at different positions
 * Uses functional programming patterns with immutable layer operations
 */

export interface LayerPosition {
  readonly x?: number;
  readonly y?: number;
}

export interface LayerConfig {
  readonly content: string;
  readonly x: number;
  readonly y: number;
}

/**
 * Functional layer interface for method chaining
 */
export interface Layer {
  readonly config: LayerConfig;

  // Position methods
  x(position: number): Layer;
  y(position: number): Layer;
  position(x: number, y: number): Layer;

  // Getters
  readonly content: string;
  readonly xPos: number;
  readonly yPos: number;

  // Utility methods
  getDimensions(): { width: number; height: number };
  clone(): Layer;
}

/**
 * Functional layer namespace providing method chaining without classes
 */
namespace Layer {
  /**
   * Get display width of a string (accounting for ANSI codes)
   */
  const getDisplayWidth = (text: string): number => {
    // Remove ANSI escape sequences for width calculation
    return text.replace(/\x1b\[[0-9;]*m/g, '').length;
  };

  /**
   * Creates a layer from configuration
   * @param config - Layer configuration
   * @returns Layer interface with method chaining
   */
  export const from = (config: LayerConfig): Layer => {
    return {
      config,

      // Position methods
      x: (position) => from({ ...config, x: position }),
      y: (position) => from({ ...config, y: position }),
      position: (x, y) => from({ ...config, x, y }),

      // Getters
      get content() {
        return config.content;
      },
      get xPos() {
        return config.x;
      },
      get yPos() {
        return config.y;
      },

      // Utility methods
      getDimensions: () => {
        const lines = config.content.split('\n');
        const height = lines.length;
        const width = Math.max(...lines.map((line) => getDisplayWidth(line)));
        return { width, height };
      },
      clone: () => from({ ...config }),
    };
  };

  /**
   * Creates a new layer with content
   * @param content - Layer content
   * @returns New Layer instance
   */
  export const create = (content: string): Layer => from({ content, x: 0, y: 0 });
}

/**
 * Helper function to create a new layer
 */
export function newLayer(content: string): Layer {
  return Layer.create(content);
}

// Export both interface and namespace
export { Layer };
