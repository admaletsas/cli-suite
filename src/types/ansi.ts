import { Ansi } from '../lib/ansi';

/**
 * Basic 16 ANSI colors for foreground and background.
 *
 * Properties:
 * - `fg`: Optional foreground color key from basic ANSI colors.
 * - `bg`: Optional background color key from basic ANSI colors.
 */
export type BasicColor = {
  fg?: keyof typeof Ansi.Codes.BASIC_COLORS.fg;
  bg?: keyof typeof Ansi.Codes.BASIC_COLORS.bg;
};

/**
 * 256-color mode colors for foreground and background.
 *
 * Properties:
 * - `fg`: Optional foreground color code (0-255).
 * - `bg`: Optional background color code (0-255).
 */
export type Mode256Color = {
  fg?: number;
  bg?: number;
};

/**
 * True color (24-bit RGB) colors for foreground and background.
 *
 * Properties:
 * - `fg`: Optional foreground RGB tuple [red, green, blue], each 0-255.
 * - `bg`: Optional background RGB tuple [red, green, blue], each 0-255.
 */
export type TrueColor = {
  fg?: [number, number, number];
  bg?: [number, number, number];
};

/**
 * Represents a color specification for foreground and background.
 *
 * Properties:
 * - `fg`: Optional foreground color, which can be a basic color key, 256-color code, or true color RGB tuple.
 * - `bg`: Optional background color, which can be a basic color key, 256-color code, or true color RGB tuple.
 */
export type Color = {
  fg?: BasicColor['fg'] | Mode256Color['fg'] | TrueColor['fg'];
  bg?: BasicColor['bg'] | Mode256Color['bg'] | TrueColor['bg'];
};

/**
 * Detected color support capabilities of the terminal.
 *
 * Properties:
 * - `hasBasic`: Boolean indicating support for basic 16 colors.
 * - `has256`: Boolean indicating support for 256 colors.
 * - `hasTrue`: Boolean indicating support for true color (24-bit).
 */
export type ColorSupport = {
  hasBasic: boolean;
  has256: boolean;
  hasTrue: boolean;
};

/**
 * Options for specifying colors in different modes.
 *
 * Properties:
 * - `basic`: Optional basic color options.
 * - `mode256`: Optional 256-color mode options.
 * - `true`: Optional true color (24-bit) options.
 */
export type ColorOptions = {
  basic?: BasicColor;
  mode256?: Mode256Color;
  true?: TrueColor;
};

/**
 * Keys of available text styles such as 'bold', 'italic', etc.
 */
export type StyleOptions = keyof typeof Ansi.Codes.STYLES;

/**
 * Options for styling text including styles and colors.
 *
 * Properties:
 * - `style`: Optional single style or array of styles to apply.
 * - `color`: Optional color options for text.
 */
export type TextOptions = {
  style?: StyleOptions | StyleOptions[];
  color?: ColorOptions;
};
