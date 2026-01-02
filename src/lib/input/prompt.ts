import readline from 'node:readline';
import { InputOptions, InteractivePromptChoice, InteractivePromptMode, TextOptions } from 'types';
import { Ansi } from '../ansi';
import { runValidators } from '../utils';
import { Writable } from 'node:stream';

/**
 * Provides methods to prompt user input synchronously in the console.
 * Supports input with validation, default values, and confirmation prompts.
 * Offers methods to display interactive prompts,
 * allowing single or multiple selections using arrow keys and keyboard input.
 *
 * Supported features include:
 * - Text input with optional validation and default values.
 * - Confirmation prompts accepting 'y'/'yes' or 'n'/'no' responses.
 * - Pause prompts that halt program execution until the user presses Enter.
 * - Password prompts that masks input characters with '*' instead of echoing them.
 * - Single-choice selection from a list of options with keyboard navigation.
 * - Multiple-choice selection with toggleable options and keyboard navigation.
 * - Customizable prompt messages and styling for active selections.
 * - Repeated prompting until valid input is provided or user cancels.
 */
export class Prompt {
  /**
   * Constructs a Prompt instance with an optional Ansi instance.
   * Defaults to a new Ansi instance if none provided.
   *
   * @param ansi - Ansi instance to use for text styling
   */
  constructor(private ansi: Ansi = new Ansi()) {}

  /**
   * Prompts the user for input with optional validation and default value.
   * Repeats prompt until valid input is provided.
   *
   * @param message - The prompt message to display
   * @param options - Optional InputOptions including validators and defaultValue
   * @returns Promise resolving to the validated user input string
   */
  public async input(message: string, options?: InputOptions): Promise<string> {
    const { validators = [], defaultValue = '', validateDefault = false } = options ?? {};
    let inputValue = '';

    do {
      // Prompt user and wait for input
      inputValue = await this.staticPrompt(message);

      if (inputValue === '') {
        if (defaultValue === '') continue; // Re-prompt

        // Accept defaultValue immediately without validation
        inputValue = defaultValue;
        if (!validateDefault) break;
      }

      if (validators.length === 0) break;

      const errors = await runValidators(inputValue, validators);
      if (errors.length === 0) break;

      process.stderr.write(errors.join('\n'));

      // Otherwise loop continues to re-prompt
    } while (true);

    return inputValue;
  }

  /**
   * Prompts the user for a yes/no confirmation.
   * Accepts 'y' or 'yes' (case-insensitive) as confirmation.
   * Re-prompts on invalid input.
   *
   * @param message - The confirmation message to display
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  public async confirm(message: string): Promise<boolean> {
    while (true) {
      const answer = await this.staticPrompt(`${message} ([y]es/[n]o): `);
      const normalized = answer.toLowerCase();

      if (['y', 'yes'].includes(normalized)) return true;
      if (['n', 'no'].includes(normalized)) return false;

      process.stderr.write("Please enter 'y' or 'n'.");
    }
  }

  /**
   * Prompts the user to press Enter to continue.
   *
   * @param message - Optional message to display before waiting
   */
  public async pause(message?: string): Promise<void> {
    await this.staticPrompt(message ?? 'Press Enter to continue...');
  }

  /**
   * Prompts the user to input a password with masked input.
   * Supports optional validation and default value.
   *
   * @param message - The prompt message to display
   * @param options - Optional InputOptions including validators and defaultValue
   * @returns Promise resolving to the validated password string
   */
  public async password(message: string, options?: InputOptions): Promise<string> {
    const { validators = [], defaultValue = '', validateDefault = false } = options ?? {};
    let inputValue = '';

    // Custom writable stream that ignores output (to suppress default echo)
    const mutableStdout = new Writable({
      write(_chunk, _encoding, callback) {
        // Do nothing to suppress output
        callback();
      },
    });

    const readPassword = (): Promise<string> => {
      return new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: mutableStdout,
          terminal: true,
        });

        // Show prompt message manually
        process.stdout.write(message);

        let password = '';

        const onKeypress = (_str: string, key: readline.Key) => {
          if (key.name === 'return' || key.name === 'enter') {
            process.stdout.write('\n');
            cleanup();
            resolve(password);
          } else if (key.name === 'backspace') {
            if (password.length > 0) {
              password = password.slice(0, -1);
              // Move cursor back, overwrite with space, move cursor back again
              process.stdout.write('\b \b');
            }
          } else if (key.sequence && !key.ctrl && !key.meta && key.name !== 'escape') {
            password += key.sequence;
            process.stdout.write('*');
          }
          // Ignore other keys
        };

        const cleanup = () => {
          process.stdin.removeListener('keypress', onKeypress);
          rl.close();
        };

        readline.emitKeypressEvents(process.stdin, rl);
        if (process.stdin.isTTY && !process.stdin.isRaw) process.stdin.setRawMode(true);
        process.stdin.on('keypress', onKeypress);
      });
    };

    do {
      inputValue = await readPassword();

      if (inputValue === '') {
        if (defaultValue === '') continue; // Re-prompt
        inputValue = defaultValue;
        if (!validateDefault) break;
      }

      if (validators.length === 0) break;

      const errors = await runValidators(inputValue, validators);
      if (errors.length === 0) break;

      process.stderr.write(errors.join('\n'));
    } while (true);

    return inputValue;
  }

  /**
   * Prompts the user to select a single option from a list.
   *
   * @param message - The prompt message to display
   * @param choices - Array of choice objects with label and value
   * @param isRequired - If true, user cannot exit without selecting
   * @param activeOption - Optional text styling options for active choice
   * @returns Promise resolving to the selected choice's value
   */
  public async select(
    message: string,
    choices: InteractivePromptChoice[],
    isRequired?: boolean,
    activeOption?: TextOptions
  ): Promise<string> {
    return this.interactivePrompt(
      message,
      choices,
      'single',
      isRequired,
      activeOption
    ) as Promise<string>;
  }

  /**
   * Prompts the user to select multiple options from a list.
   *
   * @param message - The prompt message to display
   * @param choices - Array of choice objects with label and value
   * @param isRequired - If true, user cannot exit without selecting at least one option
   * @param activeOption - Optional text styling options for active choice
   * @returns Promise resolving to an array of selected choice values
   */
  public async selectMultiple(
    message: string,
    choices: InteractivePromptChoice[],
    isRequired?: boolean,
    activeOption?: TextOptions
  ): Promise<string[]> {
    return this.interactivePrompt(
      message,
      choices,
      'multiple',
      isRequired,
      activeOption
    ) as Promise<string[]>;
  }

  /**
   * Helper method to prompt the user and read input from stdin.
   *
   * @param message - The prompt message to display
   * @returns Promise resolving to the trimmed user input string
   */
  private staticPrompt(message: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Show message and wait for user input
      rl.question(message, (input: string) => {
        resolve(input.trim()); // Trim whitespace and resolve promise
        rl.close(); // Close readline interface to free resources
      });
    });
  }

  /**
   * Helper method to handle rendering and input for both single and multiple selection modes.
   *
   * @param message - The prompt message to display
   * @param choices - Array of choice objects with label and value
   * @param mode - "single" or "multiple" selection mode
   * @param isRequired - If true, user cannot exit without selecting
   * @param activeOption - Optional text styling options for active choice
   * @returns Promise resolving to selected values
   */
  private interactivePrompt(
    message: string,
    choices: InteractivePromptChoice[],
    mode: InteractivePromptMode,
    isRequired?: boolean,
    activeOption?: TextOptions
  ): Promise<string | string[]> {
    isRequired ??= false;
    activeOption ??= { color: { basic: { fg: 'green' } } };

    return new Promise((resolve) => {
      if (choices.length === 0) {
        resolve(mode === 'single' ? '' : []);
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Index of currently highlighted option
      let activeIdx = 0;

      // Set of selected indices, used only in multiple selection mode
      const selected = new Set<number>();

      /**
       * Cleanup function to reset terminal state and close readline interface.
       */
      const cleanup = (): void => {
        if (process.stdin.isRaw) process.stdin.setRawMode(false);
        process.stdin.removeListener('keypress', onKeypress);
        rl.close();
      };

      /**
       * Renders the prompt UI to the console.
       * Clears the screen and prints the message and choices with highlighting.
       */
      const render = (): void => {
        process.stdout.write('\x1B[2J\x1B[0f'); // Clear screen and move cursor to top-left
        process.stdout.write(message + '\n');

        choices.forEach((option: InteractivePromptChoice, idx: number) => {
          const isActive = idx === activeIdx;
          const isSelected = mode === 'multiple' && selected.has(idx);

          // Prefix arrow for highlighted option
          const prefix = isActive ? '➤ ' : '  ';

          // Checkbox for multiple selection mode
          const checkbox = mode === 'multiple' ? (isSelected ? '[X] ' : '[ ] ') : '';

          // Construct the line to display
          const line = `${prefix}${checkbox}${option.label}\n`;

          // Apply color/style if active
          const output = isActive ? this.ansi.applyCodes(line, activeOption) : line;

          process.stdout.write(output);
        });

        // Instructions based on mode
        const instructions =
          mode === 'single'
            ? `\n(Use Arrow keys to move, Enter to select${!isRequired ? ', Esc to skip' : ''})\n`
            : `\n(Use Arrow keys to move, Space to toggle, Enter to confirm${!isRequired ? ', Esc to skip' : ''})\n`;

        process.stdout.write(instructions);
      };

      /**
       * Handles keypress events for navigation and selection.
       *
       * @param key - The key pressed event object from readline
       * @returns A boolean indicating whether to stop further processing (`true`) or continue (`false`)
       */
      const handleKeypress = (key: readline.Key): boolean => {
        switch (key.name) {
          case 'up':
            // Move active index up, wrapping around
            activeIdx = (activeIdx - 1 + choices.length) % choices.length;
            break;
          case 'down':
            // Move active index down, wrapping around
            activeIdx = (activeIdx + 1) % choices.length;
            break;
          case 'space':
            // Toggle selection in multiple mode
            if (mode === 'multiple') {
              if (!selected.delete(activeIdx)) {
                selected.add(activeIdx);
              }
            }
            break;
          case 'escape':
            // If not required, allow exit with empty selection
            if (isRequired) break;
            cleanup();
            resolve(mode === 'single' ? '' : []);
            return true;
          case 'return':
            if (isRequired && mode === 'multiple' && selected.size === 0) break;
            // Confirm selection and resolve promise
            cleanup();
            resolve(
              mode === 'single'
                ? choices[activeIdx].value
                : [...selected].map((i) => choices[i].value)
            );
            return true;
        }

        return false; // Continue processing keypresses
      };

      /**
       * Event handler for keypress events.
       */
      const onKeypress = (_str: string, key: readline.Key) => {
        // If handleKeypress returns false, re-render the UI
        if (!handleKeypress(key)) render();
      };

      // Enable keypress events on stdin
      readline.emitKeypressEvents(process.stdin, rl);

      // Set raw mode to true to capture individual key presses
      if (!process.stdin.isRaw) process.stdin.setRawMode(true);

      // Attach keypress event listener
      process.stdin.on('keypress', onKeypress);

      // Initial render of the prompt UI
      render();
    });
  }
}
