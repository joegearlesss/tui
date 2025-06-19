import { z } from 'zod';
import type { ColorValue } from './color';

/**
 * Text formatting options schema
 */
export const TextFormattingSchema = z
  .object({
    bold: z.boolean().optional().describe('Apply bold text formatting'),
    italic: z.boolean().optional().describe('Apply italic text formatting'),
    underline: z.boolean().optional().describe('Apply underline text formatting'),
    strikethrough: z.boolean().optional().describe('Apply strikethrough text formatting'),
    reverse: z.boolean().optional().describe('Reverse foreground and background colors'),
    blink: z.boolean().optional().describe('Apply blinking text effect'),
    faint: z.boolean().optional().describe('Apply faint/dim text effect'),
    underlineSpaces: z.boolean().optional().describe('Extend underline to include spaces'),
    strikethroughSpaces: z.boolean().optional().describe('Extend strikethrough to include spaces'),
    colorWhitespace: z
      .boolean()
      .optional()
      .describe('Apply background color to padding and whitespace'),
  })
  .describe('Text formatting and decoration options');

export type TextFormatting = z.infer<typeof TextFormattingSchema>;

/**
 * Border side definition schema
 */
export const BorderSideSchema = z
  .object({
    character: z
      .string()
      .min(1, 'Border character cannot be empty')
      .max(1, 'Border character must be single character')
      .describe('Single character used for this border side'),
    foreground: z.custom<ColorValue>().optional().describe('Foreground color for this border side'),
    background: z.custom<ColorValue>().optional().describe('Background color for this border side'),
  })
  .describe('Definition for a single border side including character and colors');

export type BorderSide = z.infer<typeof BorderSideSchema>;

/**
 * Complete border definition schema
 */
export const BorderDefinitionSchema = z
  .object({
    top: z.string().describe('Top border character(s)'),
    bottom: z.string().describe('Bottom border character(s)'),
    left: z.string().describe('Left border character(s)'),
    right: z.string().describe('Right border character(s)'),
    topLeft: z.string().describe('Top-left corner character'),
    topRight: z.string().describe('Top-right corner character'),
    bottomLeft: z.string().describe('Bottom-left corner character'),
    bottomRight: z.string().describe('Bottom-right corner character'),
    middleLeft: z
      .string()
      .optional()
      .describe('Middle-left junction character for complex borders'),
    middleRight: z
      .string()
      .optional()
      .describe('Middle-right junction character for complex borders'),
    middle: z.string().optional().describe('Middle intersection character for complex borders'),
    middleTop: z.string().optional().describe('Middle-top junction character for complex borders'),
    middleBottom: z
      .string()
      .optional()
      .describe('Middle-bottom junction character for complex borders'),
  })
  .describe('Complete border character set definition for drawing borders');

export type BorderDefinition = z.infer<typeof BorderDefinitionSchema>;

/**
 * Border visibility control schema
 */
export const BorderVisibilitySchema = z
  .object({
    top: z.boolean().describe('Show top border'),
    right: z.boolean().describe('Show right border'),
    bottom: z.boolean().describe('Show bottom border'),
    left: z.boolean().describe('Show left border'),
  })
  .describe('Control which border sides are visible');

export type BorderVisibility = z.infer<typeof BorderVisibilitySchema>;

/**
 * Text transformation function type
 */
export type TextTransform = (text: string) => string;
