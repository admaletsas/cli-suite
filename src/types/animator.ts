import { TextOptions } from './ansi';

/**
 * Options for configuring a spinner animation.
 *
 * Properties:
 * - `description`: Optional description text displayed alongside spinner.
 * - `showProgress`: Optional boolean to show progress percentage next to spinner.
 * - `text`: Optional text styling options for the spinner character.
 */
export type SpinnerOptions = {
  description?: string;
  showProgress?: boolean;
  text?: TextOptions;
};

/**
 * Options for configuring a progress bar animation.
 *
 * Properties:
 * - `showProgress`: Optional boolean to show progress percentage next to progress bar.
 * - `length`: Optional length of the progress bar in characters.
 * - `fill`: Optional text styling options for the filled portion of the bar.
 * - `empty`: Optional text styling options for the empty portion of the bar.
 */
export type ProgressBarOptions = {
  showProgress?: boolean;
  length?: number;
  fill?: TextOptions;
  empty?: TextOptions;
};

/**
 * Supported animation types.
 */
export type AnimationType = 'spinner' | 'progressBar';

/**
 * Union type for animation options, depending on the animation type.
 */
export type AnimationOptions = SpinnerOptions | ProgressBarOptions;
