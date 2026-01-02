import {
  AnimationOptions,
  AnimationType,
  ProgressBarOptions,
  SpinnerOptions,
  TextOptions,
} from 'types';
import { Ansi } from '../ansi';

/**
 * Provides console animations such as spinners and progress bars
 * to visually indicate progress of asynchronous tasks.
 */
export class Animator {
  // Index to track the current frame of the animation
  private animationIndex: number = 0;

  /**
   * Constructs an Animator instance with an optional Ansi instance.
   * Defaults to a new Ansi instance if none provided.
   *
   * @param ansi - Ansi instance to use for text styling
   */
  constructor(private ansi: Ansi = new Ansi()) {}

  /**
   * Runs an asynchronous task while displaying a console animation (spinner or progress bar).
   * The task receives a callback to update progress (0-100).
   *
   * @param task - Async function that accepts a progress update callback
   * @param animationType - Type of animation to display, 'spinner' or 'progressBar'
   * @param options - Optional animation configuration options
   */
  public async runTaskWithAnimation(
    task: (update: (progress: number) => void) => Promise<unknown>,
    animationType: AnimationType,
    options?: AnimationOptions
  ): Promise<void> {
    this.animationIndex = 0;

    await task((progress: number) => {
      process.stdout.write('\r'); // Move cursor to start of line to overwrite previous output
      let output = '';

      if (animationType === 'spinner') {
        const spinnerOptions = options as SpinnerOptions | undefined;
        const spinnerChar = this.spinner(this.animationIndex, spinnerOptions?.text);
        const progressText = spinnerOptions?.showProgress ? `${progress}% -` : '';
        output = `${spinnerChar} ${progressText} ${spinnerOptions?.description ?? ''}`;
        this.animationIndex++; // Advance spinner frame index for next update
      }

      if (animationType === 'progressBar') {
        const progressBarOptions = options as ProgressBarOptions | undefined;
        const bar = this.progressBar(progress, progressBarOptions);
        const progressText = progressBarOptions?.showProgress ? `${progress}%` : '';
        output = `${bar} ${progressText}`;
      }

      process.stdout.write(output);
    });

    // Clean up the console line after task completes
    this.cleanUp();
  }

  /**
   * Clears the current line in the terminal by overwriting it with spaces
   * and resetting the cursor to the start of the line.
   */
  private cleanUp(): void {
    process.stdout.write('\r'); // Move cursor to start of line
    process.stdout.write(' '.repeat(process.stdout.columns || 80)); // Overwrite line with spaces
    process.stdout.write('\r'); // Move cursor back to start of line
  }

  /**
   * Returns a colored spinner character for the given frame index.
   *
   * @param frameIndex - Current frame index for animation cycling
   * @param options - Text styling options for the spinner character
   * @returns Colored spinner character string
   */
  private spinner(frameIndex: number, options?: TextOptions): string {
    options ??= {
      style: 'bold',
      color: { basic: { fg: 'cyan' } },
    };

    const spinnerFrames = ['|', '/', '-', '\\'];
    const currentFrame = spinnerFrames[frameIndex % spinnerFrames.length];

    return this.ansi.applyCodes(currentFrame, options);
  }

  /**
   * Generates a colored progress bar string representing the progress percentage.
   *
   * @param progress - Progress percentage (0 to 100)
   * @param options - ProgressBarOptions including length, fill and empty styles
   * @returns Colored progress bar string
   */
  private progressBar(progress: number, options?: ProgressBarOptions): string {
    options = {
      length: options?.length ?? 30,
      fill: options?.fill ?? {
        color: { basic: { fg: 'green' } },
        style: 'bold',
      },
      empty: options?.empty ?? {
        color: { basic: { fg: 'brightBlack' } },
      },
    };

    const fillChar = '█'; // Character used for filled portion
    const emptyChar = '░'; // Character used for empty portion
    const fillLength = Math.round(options.length! * (progress / 100));
    const emptyLength = options.length! - fillLength;
    const fillBar = this.ansi.applyCodes(fillChar.repeat(fillLength), options.fill!);
    const emptyBar = this.ansi.applyCodes(emptyChar.repeat(emptyLength), options.empty!);

    return fillBar + emptyBar;
  }
}
