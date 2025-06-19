/**
 * Canvas system for compositing multiple layers of text content
 */

import { Layer } from './layer';

export class Canvas {
  private layers: Layer[];

  constructor(...layers: Layer[]) {
    this.layers = layers;
  }

  /**
   * Render all layers composited together
   */
  render(): string {
    if (this.layers.length === 0) {
      return '';
    }

    // Calculate the total canvas dimensions needed
    let maxWidth = 0;
    let maxHeight = 0;

    for (const layer of this.layers) {
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
    for (const layer of this.layers) {
      this.applyLayer(canvas, layer);
    }

    // Convert canvas to string
    const result: string[] = [];
    for (let y = 0; y < maxHeight; y++) {
      // Trim trailing spaces from each line
      const line = canvas[y].join('').trimEnd();
      result.push(line);
    }

    // Remove trailing empty lines
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }

    return result.join('\n');
  }

  /**
   * Apply a single layer to the canvas at its specified position
   */
  private applyLayer(canvas: string[][], layer: Layer): void {
    const lines = layer.content.split('\n');
    const startY = layer.yPos;
    const startX = layer.xPos;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const y = startY + lineIndex;
      
      if (y >= canvas.length) continue; // Skip if beyond canvas height

      // Parse the line character by character, handling ANSI codes
      let x = startX;
      let i = 0;
      
      while (i < line.length) {
        if (x >= canvas[y].length) break; // Skip if beyond canvas width
        
        // Check for ANSI escape sequence
        if (line[i] === '\x1b' && i + 1 < line.length && line[i + 1] === '[') {
          // Find the end of the ANSI sequence
          let ansiEnd = i + 2;
          while (ansiEnd < line.length && !/[a-zA-Z]/.test(line[ansiEnd])) {
            ansiEnd++;
          }
          if (ansiEnd < line.length) {
            ansiEnd++; // Include the final letter
          }
          
          // Copy the ANSI sequence without advancing x position
          const ansiSequence = line.slice(i, ansiEnd);
          canvas[y][x] = (canvas[y][x] === ' ' ? '' : canvas[y][x]) + ansiSequence;
          i = ansiEnd;
        } else {
          // Regular character
          canvas[y][x] = line[i];
          x++;
          i++;
        }
      }
    }
  }

  /**
   * Get display width of a string (accounting for ANSI codes)
   */
  private getDisplayWidth(text: string): number {
    return text.replace(/\x1b\[[0-9;]*m/g, '').length;
  }
}

/**
 * Helper function to create a new canvas
 */
export function newCanvas(...layers: Layer[]): Canvas {
  return new Canvas(...layers);
}