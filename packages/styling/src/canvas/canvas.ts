/**
 * Canvas system for compositing multiple layers of text content
 * Uses functional programming patterns with immutable canvas operations
 */

import type { Layer } from './layer';

export interface CanvasConfig {
  readonly layers: readonly Layer[];
}

/**
 * Functional canvas interface for compositing layers
 */
export interface Canvas {
  readonly config: CanvasConfig;

  // Layer management methods
  addLayer(layer: Layer): Canvas;
  addLayers(...layers: Layer[]): Canvas;
  removeLayer(index: number): Canvas;
  clearLayers(): Canvas;

  // Rendering methods
  render(): string;
  getDimensions(): { width: number; height: number };

  // Utility methods
  clone(): Canvas;
  isEmpty(): boolean;
  getLayerCount(): number;
}

/**
 * Functional canvas namespace providing compositing operations without classes
 */
namespace Canvas {
  /**
   * Get display width of a string (accounting for ANSI codes)
   */
  const getDisplayWidth = (text: string): number => {
    return text.replace(/\x1b\[[0-9;]*m/g, '').length;
  };

  /**
   * Apply a single layer to the canvas at its specified position
   */
  const applyLayer = (canvas: string[][], layer: Layer): void => {
    const lines = layer.content.split('\n');
    const startY = layer.yPos;
    const startX = layer.xPos;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (!line) continue; // Skip undefined lines

      const y = startY + lineIndex;
      if (y >= canvas.length) continue; // Skip if beyond canvas height

      // Parse the line character by character, handling ANSI codes
      let x = startX;
      let i = 0;

      while (i < line.length) {
        const canvasRow = canvas[y];
        if (!canvasRow || x >= canvasRow.length) break; // Skip if beyond canvas width

        // Check for ANSI escape sequence
        if (line[i] === '\x1b' && i + 1 < line.length && line[i + 1] === '[') {
          // Find the end of the ANSI sequence
          let ansiEnd = i + 2;
          while (ansiEnd < line.length && line[ansiEnd] && !/[a-zA-Z]/.test(line[ansiEnd] ?? '')) {
            ansiEnd++;
          }
          if (ansiEnd < line.length) {
            ansiEnd++; // Include the final letter
          }

          // Copy the ANSI sequence without advancing x position
          const ansiSequence = line.slice(i, ansiEnd);
          canvasRow[x] = (canvasRow[x] === ' ' ? '' : canvasRow[x]) + ansiSequence;
          i = ansiEnd;
        } else {
          // Regular character
          const char = line[i];
          if (char !== undefined) {
            canvasRow[x] = char;
          }
          x++;
          i++;
        }
      }
    }
  };

  /**
   * Creates a canvas from configuration
   * @param config - Canvas configuration
   * @returns Canvas interface with compositing operations
   */
  export const from = (config: CanvasConfig): Canvas => {
    return {
      config,

      // Layer management methods
      addLayer: (layer) => from({ layers: [...config.layers, layer] }),
      addLayers: (...layers) => from({ layers: [...config.layers, ...layers] }),
      removeLayer: (index) =>
        from({
          layers: config.layers.filter((_, i) => i !== index),
        }),
      clearLayers: () => from({ layers: [] }),

      // Rendering methods
      render: () => {
        if (config.layers.length === 0) {
          return '';
        }

        // Calculate the total canvas dimensions needed
        let maxWidth = 0;
        let maxHeight = 0;

        for (const layer of config.layers) {
          const dims = layer.getDimensions();
          const rightEdge = layer.xPos + dims.width;
          const bottomEdge = layer.yPos + dims.height;

          maxWidth = Math.max(maxWidth, rightEdge);
          maxHeight = Math.max(maxHeight, bottomEdge);
        }

        // Create a 2D array to represent the canvas
        const canvas: string[][] = [];
        for (let y = 0; y < maxHeight; y++) {
          canvas[y] = new Array(maxWidth).fill(' ');
        }

        // Apply each layer to the canvas
        for (const layer of config.layers) {
          applyLayer(canvas, layer);
        }

        // Convert canvas to string
        const result: string[] = [];
        for (let y = 0; y < maxHeight; y++) {
          // Trim trailing spaces from each line
          const canvasRow = canvas[y];
          const line = canvasRow ? canvasRow.join('').trimEnd() : '';
          result.push(line);
        }

        // Remove trailing empty lines
        while (result.length > 0 && result[result.length - 1] === '') {
          result.pop();
        }

        return result.join('\n');
      },

      getDimensions: () => {
        if (config.layers.length === 0) {
          return { width: 0, height: 0 };
        }

        let maxWidth = 0;
        let maxHeight = 0;

        for (const layer of config.layers) {
          const dims = layer.getDimensions();
          const rightEdge = layer.xPos + dims.width;
          const bottomEdge = layer.yPos + dims.height;

          maxWidth = Math.max(maxWidth, rightEdge);
          maxHeight = Math.max(maxHeight, bottomEdge);
        }

        return { width: maxWidth, height: maxHeight };
      },

      // Utility methods
      clone: () => from({ layers: [...config.layers] }),
      isEmpty: () => config.layers.length === 0,
      getLayerCount: () => config.layers.length,
    };
  };

  /**
   * Creates a new canvas with layers
   * @param layers - Initial layers
   * @returns New Canvas instance
   */
  export const create = (...layers: Layer[]): Canvas => from({ layers });
}

/**
 * Helper function to create a new canvas
 */
export function newCanvas(...layers: Layer[]): Canvas {
  return Canvas.create(...layers);
}

// Export both interface and namespace
export { Canvas };
