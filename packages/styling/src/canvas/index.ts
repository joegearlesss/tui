/**
 * Canvas and Layer system for compositing text content
 */

export { Canvas, newCanvas } from './canvas';
export { Layer, newLayer } from './layer';
export type { LayerPosition } from './layer';
export {
  CanvasValidation,
  LayerConfigSchema,
  CanvasConfigSchema,
  LayerPositionSchema,
  CanvasDimensionsSchema,
  LayerDimensionsSchema
} from './validation';
export type {
  LayerConfigValidated,
  CanvasConfigValidated,
  CanvasDimensions,
  LayerDimensions
} from './validation';
