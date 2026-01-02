import { Animator } from '@lib/output/animator';
import { Ansi } from '@lib/ansi';
import { TextOptions, SpinnerOptions, ProgressBarOptions } from 'types';

describe('Animator', () => {
  let animator: Animator;
  let writeSpy: jest.SpyInstance;
  let ansiApplyCodesSpy: jest.SpyInstance;

  beforeEach(() => {
    animator = new Animator(new Ansi());
    writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    ansiApplyCodesSpy = jest.spyOn(animator['ansi'], 'applyCodes');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('spinner', () => {
    test('cycles through spinner frames and applies default styles', () => {
      const frames = ['|', '/', '-', '\\'];
      for (let i = 0; i < frames.length * 2; i++) {
        const frame = animator['spinner'](i);
        expect(ansiApplyCodesSpy).toHaveBeenCalledWith(
          frames[i % frames.length],
          expect.any(Object)
        );
        expect(frame).toBe(ansiApplyCodesSpy.mock.results[i].value);
      }
    });

    test('uses provided TextOptions for styling', () => {
      const options: TextOptions = {
        style: 'underline',
        color: { basic: { fg: 'red' } },
      };
      const frame = animator['spinner'](0, options);
      expect(ansiApplyCodesSpy).toHaveBeenCalledWith('|', options);
      expect(frame).toBe(ansiApplyCodesSpy.mock.results[0].value);
    });
  });

  describe('progressBar', () => {
    test('renders progress bar with default options', () => {
      // Spy on applyCodes to return the input string for simplicity
      ansiApplyCodesSpy.mockImplementation((text) => text);

      const progress = 50;
      const bar = animator['progressBar'](progress);

      // Default length is 30, so half filled = 15 fill chars, 15 empty chars
      const fillChar = '█';
      const emptyChar = '░';

      const expectedFill = fillChar.repeat(15);
      const expectedEmpty = emptyChar.repeat(15);

      expect(bar).toBe(expectedFill + expectedEmpty);
    });

    test('renders progress bar with custom options', () => {
      const options: ProgressBarOptions = {
        length: 20,
        fill: {
          color: { basic: { fg: 'yellow' } },
          style: 'bold',
        },
        empty: {
          color: { basic: { fg: 'brightBlack' } },
          style: 'italic',
        },
      };

      // Mock applyCodes to wrap text for verification
      ansiApplyCodesSpy.mockImplementation((text) => `[${text}]`);

      const progress = 25; // 25% of 20 = 5 fill chars
      const bar = animator['progressBar'](progress, options);

      const expectedFill = `[${'█'.repeat(5)}]`;
      const expectedEmpty = `[${'░'.repeat(15)}]`;

      expect(bar).toBe(expectedFill + expectedEmpty);
    });
  });

  describe('cleanUp', () => {
    test('writes carriage return, spaces, and carriage return to clear line', () => {
      // Mock process.stdout.columns to 10 for test
      process.stdout.columns = 10;

      animator['cleanUp']();

      expect(writeSpy).toHaveBeenCalledWith('\r');
      expect(writeSpy).toHaveBeenCalledWith(' '.repeat(10));
      expect(writeSpy).toHaveBeenCalledWith('\r');
    });

    test('defaults to 80 columns if process.stdout.columns is undefined', () => {
      Object.defineProperty(process.stdout, 'columns', { value: undefined, configurable: true });

      animator['cleanUp']();

      expect(writeSpy).toHaveBeenCalledWith('\r');
      expect(writeSpy).toHaveBeenCalledWith(' '.repeat(80));
      expect(writeSpy).toHaveBeenCalledWith('\r');
    });
  });

  describe('runTaskWithAnimation', () => {
    test('runs spinner animation and updates output with progress and description', async () => {
      const spinnerOptions: SpinnerOptions = {
        text: { style: 'bold' },
        showProgress: true,
        description: 'Loading',
      };

      // Mock spinner to return fixed char
      jest
        .spyOn(
          animator as unknown as { spinner: (frameIndex: number, options?: TextOptions) => string },
          'spinner'
        )
        .mockReturnValue('*');

      const task = jest.fn(async (update: (progress: number) => void) => {
        update(10);
        update(50);
        update(100);
      });

      await animator.runTaskWithAnimation(task, 'spinner', spinnerOptions);

      // Expect task to be called once
      expect(task).toHaveBeenCalledTimes(1);

      // Expect process.stdout.write called multiple times: carriage returns + output + cleanup
      expect(writeSpy).toHaveBeenCalled();

      // Check that spinner frames were used and output contains progress and description
      const calls = writeSpy.mock.calls.flat().join('');
      expect(calls).toContain('*');
      expect(calls).toContain('10% -');
      expect(calls).toContain('Loading');
      expect(calls).toContain('100% -');
    });

    test('runs progressBar animation and updates output with progress', async () => {
      const progressBarOptions: ProgressBarOptions = {
        length: 10,
        showProgress: true,
        fill: { color: { basic: { fg: 'green' } }, style: 'bold' },
        empty: { color: { basic: { fg: 'brightBlack' } } },
      };

      // Mock progressBar to return fixed bar string
      jest
        .spyOn(
          animator as unknown as {
            progressBar: (progress: number, options?: ProgressBarOptions) => string;
          },
          'progressBar'
        )
        .mockReturnValue('[=====>     ]');

      const task = jest.fn(async (update: (progress: number) => void) => {
        update(0);
        update(50);
        update(100);
      });

      await animator.runTaskWithAnimation(task, 'progressBar', progressBarOptions);

      expect(task).toHaveBeenCalledTimes(1);

      const calls = writeSpy.mock.calls.flat().join('');
      expect(calls).toContain('[=====>     ]');
      expect(calls).toContain('0%');
      expect(calls).toContain('50%');
      expect(calls).toContain('100%');
    });
  });
});
