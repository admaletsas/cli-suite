import readline from 'node:readline';
import { Ansi } from '@lib/ansi';
import { Prompt } from '@lib/input/prompt';
import { runValidators } from '@lib/utils';

// Mock runValidators for validation control
jest.mock('@lib/utils', () => ({
  runValidators: jest.fn(),
}));

// Mock Ansi to just return the string unmodified for simplicity
jest.mock('@lib/ansi', () => {
  return {
    Ansi: jest.fn().mockImplementation(() => ({
      applyCodes: (str: string) => str,
    })),
  };
});

describe('Prompt', () => {
  describe('static prompts', () => {
    /**
     * Helper to mock readline.Interface.question supporting both overloads:
     * - question(query: string, callback: (answer: string) => void): void
     * - question(query: string, options: Abortable, callback: (answer: string) => void): void
     *
     * @param rl - mocked readline.Interface
     * @param answer - string to simulate user input
     */
    function mockQuestionOnce(rl: jest.Mocked<readline.Interface>, answer: string): void {
      rl.question.mockImplementationOnce(
        (
          _query,
          optionsOrCallback, // Either options object or callback function
          maybeCallback // Callback function if options object is provided
        ) => {
          // Determine which argument is the callback function
          const callback =
            typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback!;
          // Call the callback with the mocked answer to simulate user input
          callback(answer);
        }
      );
    }

    let prompt: Prompt;
    let rlInterface: jest.Mocked<readline.Interface>;

    beforeEach(() => {
      prompt = new Prompt(new Ansi());

      // Mock readline.createInterface to simulate user input
      rlInterface = {
        question: jest.fn(),
        close: jest.fn(),
      } as unknown as jest.Mocked<readline.Interface>;

      jest.spyOn(readline, 'createInterface').mockReturnValue(rlInterface);

      (runValidators as jest.Mock).mockReset();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('input', () => {
      test('returns user input without validation', async () => {
        mockQuestionOnce(rlInterface, 'hello');

        const result = await prompt.input('Enter something:');

        expect(result).toBe('hello');
        expect(rlInterface.question).toHaveBeenCalledTimes(1);
      });

      test('returns default value immediately if input empty and validateDefault false', async () => {
        mockQuestionOnce(rlInterface, '');

        const result = await prompt.input('Enter something:', {
          defaultValue: 'defaultVal',
          validateDefault: false,
        });

        expect(result).toBe('defaultVal');
        expect(rlInterface.question).toHaveBeenCalledTimes(1);
      });

      test('validates input and re-prompts on validation errors', async () => {
        mockQuestionOnce(rlInterface, 'bad');
        mockQuestionOnce(rlInterface, 'good');

        (runValidators as jest.Mock)
          .mockResolvedValueOnce(['Error message'])
          .mockResolvedValueOnce([]);

        const stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

        const result = await prompt.input('Enter something:', {
          validators: [{ validate: jest.fn(), message: '' }],
        });

        expect(result).toBe('good');
        expect(rlInterface.question).toHaveBeenCalledTimes(2);
        expect(stderrWriteSpy).toHaveBeenCalledWith('Error message');

        stderrWriteSpy.mockRestore();
      });

      test('validates default value if validateDefault is true', async () => {
        mockQuestionOnce(rlInterface, '');

        (runValidators as jest.Mock).mockResolvedValueOnce(['Default invalid']);

        const stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

        mockQuestionOnce(rlInterface, 'valid');

        (runValidators as jest.Mock).mockResolvedValueOnce([]);

        const result = await prompt.input('Enter something:', {
          defaultValue: 'defaultVal',
          validateDefault: true,
          validators: [{ validate: jest.fn(), message: '' }],
        });

        expect(result).toBe('valid');
        expect(rlInterface.question).toHaveBeenCalledTimes(2);
        expect(stderrWriteSpy).toHaveBeenCalledWith('Default invalid');

        stderrWriteSpy.mockRestore();
      });

      test('accepts default value without validation if validateDefault is false', async () => {
        mockQuestionOnce(rlInterface, '');
        // runValidators should not be called
        (runValidators as jest.Mock).mockResolvedValue([]);

        const result = await prompt.input('Enter something:', {
          defaultValue: 'defaultVal',
          validateDefault: false,
          validators: [{ validate: jest.fn(), message: '' }],
        });

        expect(result).toBe('defaultVal');
        expect(runValidators).not.toHaveBeenCalled();
        expect(rlInterface.question).toHaveBeenCalledTimes(1);
      });

      test('re-prompts if input is empty and no default value', async () => {
        mockQuestionOnce(rlInterface, '');
        mockQuestionOnce(rlInterface, 'validInput');
        (runValidators as jest.Mock).mockResolvedValue([]);

        const result = await prompt.input('Enter something:');

        expect(result).toBe('validInput');
        expect(rlInterface.question).toHaveBeenCalledTimes(2);
      });
    });

    describe('confirm', () => {
      test('returns true for "y" and "yes" (case insensitive)', async () => {
        mockQuestionOnce(rlInterface, 'y');
        mockQuestionOnce(rlInterface, 'YES');

        const result1 = await prompt.confirm('Confirm?');
        const result2 = await prompt.confirm('Confirm?');

        expect(result1).toBe(true);
        expect(result2).toBe(true);
      });

      test('returns false for "n" and "no" (case insensitive)', async () => {
        mockQuestionOnce(rlInterface, 'n');
        mockQuestionOnce(rlInterface, 'NO');

        const result1 = await prompt.confirm('Confirm?');
        const result2 = await prompt.confirm('Confirm?');

        expect(result1).toBe(false);
        expect(result2).toBe(false);
      });

      test('re-prompts on invalid input and writes error message', async () => {
        mockQuestionOnce(rlInterface, 'maybe');
        mockQuestionOnce(rlInterface, 'y');

        const stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

        const result = await prompt.confirm('Confirm?');

        expect(result).toBe(true);
        expect(rlInterface.question).toHaveBeenCalledTimes(2);
        expect(stderrWriteSpy).toHaveBeenCalledWith("Please enter 'y' or 'n'.");

        stderrWriteSpy.mockRestore();
      });
    });

    describe('pause', () => {
      test('waits for Enter key', async () => {
        mockQuestionOnce(rlInterface, '');

        await expect(prompt.pause('Press Enter')).resolves.toBeUndefined();

        expect(rlInterface.question).toHaveBeenCalledWith('Press Enter', expect.any(Function));
      });

      test('uses default message if none provided', async () => {
        mockQuestionOnce(rlInterface, '');

        await prompt.pause();

        expect(rlInterface.question).toHaveBeenCalledWith(
          'Press Enter to continue...',
          expect.any(Function)
        );
      });
    });

    describe('password', () => {
      /**
       * Simulates a keypress event on process.stdin.
       *
       * @param ch - The character to simulate as input
       * @param keyName - Optional key name (e.g., 'return', 'backspace')
       */
      function simulateKeypress(ch: string, keyName?: string): void {
        const key = {
          name: keyName || ch,
          sequence: ch,
          ctrl: false,
          meta: false,
          shift: false,
        };

        process.stdin.emit('keypress', ch, key);
      }

      /**
       * Helper function to simulate delay.
       *
       * @param ms - Delay in ms
       * @returns Promise that resolves after the defined delay
       */
      async function wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      /**
       * Helper function to simulate typing with delay.
       *
       * @param input - Character sequence to simulate
       */
      async function typeInput(input: string): Promise<void> {
        // Simulate typing each character
        for (const char of input) {
          simulateKeypress(char);
          await wait(10);
        }

        // Simulate Enter key
        simulateKeypress('\r', 'return');
      }

      // Save original createInterface before mocking
      const originalCreateInterface = readline.createInterface;
      let rlInstances: readline.Interface[] = [];

      beforeEach(() => {
        rlInstances = [];

        jest.spyOn(readline, 'createInterface').mockImplementation((options) => {
          // Use original createInterface to avoid recursion
          const rl = originalCreateInterface.call(readline, options);
          rlInstances.push(rl);
          return rl;
        });
      });

      afterEach(() => {
        for (const rl of rlInstances) {
          rl.close();
        }

        rlInstances = [];
        if (process.stdin.isRaw) process.stdin.setRawMode(false);
        jest.restoreAllMocks();
      });

      test('accepts password input and returns it', async () => {
        const input = 'pswd123$$';
        const passwordPromise = prompt.password('Enter password: ');
        typeInput(input);

        const result = await passwordPromise;
        expect(result).toBe(input);
      });

      test('handles backspace correctly', async () => {
        const input = 'pswd123$$';
        const backspaceCount = 3; // Remove last 3 chars
        const finalInput = input.slice(0, input.length - backspaceCount); // 'pswd12'

        const passwordPromise = prompt.password('Enter password: ');

        // Type full input
        for (const char of input) simulateKeypress(char);
        // Press backspace 3 times
        for (let i = 0; i < backspaceCount; i++) simulateKeypress('', 'backspace');
        // Press Enter
        simulateKeypress('\r', 'return');

        const result = await passwordPromise;
        expect(result).toBe(finalInput);
      });

      test('validates input and re-prompts on validation errors', async () => {
        const invalidInput = 'short';
        const validInput = 'pswd123$$';

        (runValidators as jest.Mock).mockImplementation(async (input: string) => {
          if (input === invalidInput) return ['Too short'];
          return [];
        });

        const passwordPromise = prompt.password('Enter password: ', {
          validators: [
            {
              validate: async (input) => input.length < 6,
              message: 'Too short',
            },
          ],
        });

        // Simulate first invalid input
        await typeInput(invalidInput);
        // Wait briefly to ensure prompt is ready
        await wait(50);
        // Simulate second valid input
        await typeInput(validInput);

        const result = await passwordPromise;

        expect(result).toBe(validInput);
        expect(runValidators).toHaveBeenCalledTimes(2);
      });

      test('returns default value immediately if input empty and validateDefault false', async () => {
        const defaultValue = 'defaultPass';

        const passwordPromise = prompt.password('Enter password: ', {
          defaultValue,
          validateDefault: false,
        });

        // Simulate empty input (just Enter)
        simulateKeypress('\r', 'return');

        const result = await passwordPromise;
        expect(result).toBe(defaultValue);
        expect(runValidators).not.toHaveBeenCalled();
      });

      test('validates default value if validateDefault is true', async () => {
        const defaultValue = 'defaultPass';
        const validInput = 'validPass';

        // Mock runValidators to reject default value once, then accept
        let callCount = 0;
        (runValidators as jest.Mock).mockImplementation(async (_input: string) => {
          if (callCount++ === 0) return ['Default invalid'];
          return [];
        });

        const passwordPromise = prompt.password('Enter password: ', {
          validators: [
            {
              validate: (input) => input != defaultValue,
              message: 'Default invalid',
            },
          ],
          defaultValue,
          validateDefault: true,
        });

        // First input is empty, use default, but invalid
        simulateKeypress('\r', 'return');
        // Wait briefly to ensure prompt is ready
        await wait(50);
        // Second input, valid
        typeInput(validInput);

        const result = await passwordPromise;
        expect(result).toBe(validInput);
        expect(runValidators).toHaveBeenCalledTimes(2);
      });

      test('re-prompts if input is empty and no default value', async () => {
        const validInput = 'validPass';
        const passwordPromise = prompt.password('Enter password: ');

        // First input empty
        simulateKeypress('\r', 'return');
        // Wait briefly to ensure prompt is ready
        await wait(50);
        // Second input empty again
        simulateKeypress('\r', 'return');
        // Wait briefly to ensure prompt is ready
        await wait(50);
        // Third input valid
        typeInput(validInput);

        const result = await passwordPromise;
        expect(result).toBe(validInput);
      });
    });
  });

  describe('interactive prompts', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let stdinOnSpy: jest.SpyInstance;
    let keypressHandler: (str: string, key: readline.Key) => void;
    let rl: { close: jest.Mock };
    let prompt: Prompt;

    const choices = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' },
    ];

    beforeEach(() => {
      prompt = new Prompt(new Ansi());

      process.stdin.isRaw = false;
      keypressHandler = () => {};

      stdinOnSpy = jest.spyOn(process.stdin, 'on').mockImplementation(((
        event: string,
        listener: (...args: unknown[]) => void
      ) => {
        if (event === 'keypress') {
          keypressHandler = listener as (str: string, key: readline.Key) => void;
        }
        return process.stdin;
      }) as typeof process.stdin.on);

      if (!process.stdin.setRawMode) {
        process.stdin.setRawMode = jest.fn();
      }

      rl = { close: jest.fn() };
      jest.spyOn(readline, 'createInterface').mockReturnValue(rl as unknown as readline.Interface);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('select resolves with chosen value on Enter', async () => {
      const selectPromise = prompt.select('Choose:', choices);

      // Move down to second option
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Press Enter to select
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectPromise;

      expect(result).toBe('opt2');
      expect(rl.close).toHaveBeenCalled();
    });

    test('select wraps navigation up from first option to last', async () => {
      const selectPromise = prompt.select('Choose:', choices);

      // Initially at index 0, press 'up' to wrap to last option (index 2)
      keypressHandler('', { name: 'up', ctrl: false, meta: false, shift: false });
      // Press Enter to select
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectPromise;
      expect(result).toBe('opt3');
      expect(rl.close).toHaveBeenCalled();
    });

    test('select wraps navigation down from last option to first', async () => {
      const selectPromise = prompt.select('Choose:', choices);

      // Move down twice to last option (index 2)
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Press down again to wrap to first option (index 0)
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Press Enter to select
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectPromise;
      expect(result).toBe('opt1');
      expect(rl.close).toHaveBeenCalled();
    });
    test('select allows skipping if not required and Esc pressed', async () => {
      const selectPromise = prompt.select('Choose:', choices, false);

      // Press Escape to skip
      keypressHandler('', { name: 'escape', ctrl: false, meta: false, shift: false });

      const result = await selectPromise;
      expect(result).toBe('');
      expect(rl.close).toHaveBeenCalled();
    });

    test('select does not allow skipping if required and Esc pressed', async () => {
      const selectPromise = prompt.select('Choose:', choices, true);

      // Press Escape (should not exit)
      keypressHandler('', { name: 'escape', ctrl: false, meta: false, shift: false });
      // Then press Enter to select current option (index 0)
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectPromise;
      expect(result).toBe('opt1');
      expect(rl.close).toHaveBeenCalled();
    });

    test('select with empty choices array resolves to empty string immediately', async () => {
      const result = await prompt.select('Choose:', []);
      expect(result).toBe('');
    });

    test('selectMultiple resolves with chosen values on Enter', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices);

      // Toggle first option (space)
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Move down to second option
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Toggle second option (space)
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter to confirm selection
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt1', 'opt2']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple toggles selections', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices);

      // Toggle first option (space)
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Toggle first option again to deselect
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Toggle second option
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter to confirm
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt2']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple wraps navigation up from first option to last', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices);

      // Initially at index 0, press 'up' to wrap to last option (index 2)
      keypressHandler('', { name: 'up', ctrl: false, meta: false, shift: false });
      // Toggle last option
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter to confirm
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt3']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple wraps navigation down from last option to first', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices);

      // Move down twice to last option (index 2)
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Press down again to wrap to first option (index 0)
      keypressHandler('', { name: 'down', ctrl: false, meta: false, shift: false });
      // Toggle first option
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter to confirm
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt1']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple requires selection if isRequired true', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose:', choices, true);

      // Press Enter immediately without selecting anything (should not exit)
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });
      // Toggle first option
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter again to confirm
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt1']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple allows skipping if not required and Esc pressed', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices, false);

      // Press Escape
      keypressHandler('', { name: 'escape', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual([]);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple does not allow skipping if required and Esc pressed', async () => {
      const selectMultiplePromise = prompt.selectMultiple('Choose multiple:', choices, true);

      // Press Escape (should not exit)
      keypressHandler('', { name: 'escape', ctrl: false, meta: false, shift: false });
      // Then toggle first option
      keypressHandler('', { name: 'space', ctrl: false, meta: false, shift: false });
      // Press Enter to confirm selection
      keypressHandler('', { name: 'return', ctrl: false, meta: false, shift: false });

      const result = await selectMultiplePromise;
      expect(result).toEqual(['opt1']);
      expect(rl.close).toHaveBeenCalled();
    });

    test('selectMultiple with empty choices array resolves to empty array immediately', async () => {
      const result = await prompt.selectMultiple('Choose multiple:', []);
      expect(result).toEqual([]);
    });
  });
});
