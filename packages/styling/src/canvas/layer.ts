/**
 * Layer system for compositing multiple text elements at different positions
 */

export interface LayerPosition {
  readonly x?: number;
  readonly y?: number;
}

export class Layer {
  private _content: string;
  private _x: number = 0;
  private _y: number = 0;

  constructor(content: string) {
    this._content = content;
  }

  /**
   * Set the X position of this layer
   */
  x(position: number): Layer {
    const newLayer = new Layer(this._content);
    newLayer._x = position;
    newLayer._y = this._y;
    return newLayer;
  }

  /**
   * Set the Y position of this layer
   */
  y(position: number): Layer {
    const newLayer = new Layer(this._content);
    newLayer._x = this._x;
    newLayer._y = position;
    return newLayer;
  }

  /**
   * Get the content of this layer
   */
  get content(): string {
    return this._content;
  }

  /**
   * Get the X position of this layer
   */
  get xPos(): number {
    return this._x;
  }

  /**
   * Get the Y position of this layer
   */
  get yPos(): number {
    return this._y;
  }

  /**
   * Get the dimensions of this layer's content
   */
  getDimensions(): { width: number; height: number } {
    const lines = this._content.split('\n');
    const height = lines.length;
    const width = Math.max(...lines.map(line => this.getDisplayWidth(line)));
    return { width, height };
  }

  /**
   * Get display width of a string (accounting for ANSI codes)
   */
  private getDisplayWidth(text: string): number {
    // Remove ANSI escape sequences for width calculation
    return text.replace(/\x1b\[[0-9;]*m/g, '').length;
  }
}

/**
 * Helper function to create a new layer
 */
export function newLayer(content: string): Layer {
  return new Layer(content);
}