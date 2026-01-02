import { Ansi } from '@lib/ansi';
import { TextOptions, StyleOptions, ColorOptions } from 'types';

describe('Ansi', () => {
  let ansi: Ansi;

  beforeEach(() => {
    ansi = new Ansi();
  });

  describe('detectColorSupport', () => {
    const originalEnv = process.env;
    const originalIsTTY = process.stdout.isTTY;

    afterEach(() => {
      process.env = { ...originalEnv };
      process.stdout.isTTY = originalIsTTY;
    });

    function setEnv({ term = '', colorterm = '', termProgram = '', isTTY = true }) {
      process.env.TERM = term;
      process.env.COLORTERM = colorterm;
      process.env.TERM_PROGRAM = termProgram;
      process.stdout.isTTY = isTTY;
    }

    test('detects basic color support', () => {
      setEnv({ term: 'xterm-color' });
      expect(ansi['detectColorSupport']().hasBasic).toBe(true);

      setEnv({ term: 'hello-world' });
      expect(ansi['detectColorSupport']().hasBasic).toBe(false);

      setEnv({ colorterm: 'truecolor' });
      expect(ansi['detectColorSupport']().hasBasic).toBe(true);

      setEnv({ isTTY: false });
      expect(ansi['detectColorSupport']().hasBasic).toBe(false);
    });

    test('detects 256 color support', () => {
      setEnv({ term: 'xterm-256color' });
      expect(ansi['detectColorSupport']().has256).toBe(true);

      setEnv({ term: 'xterm-color' });
      expect(ansi['detectColorSupport']().has256).toBe(false);

      setEnv({ term: 'xterm-256color', isTTY: false });
      expect(ansi['detectColorSupport']().has256).toBe(false);
    });

    test('detects true color support', () => {
      setEnv({ colorterm: 'truecolor' });
      expect(ansi['detectColorSupport']().hasTrue).toBe(true);

      setEnv({ colorterm: '24bit' });
      expect(ansi['detectColorSupport']().hasTrue).toBe(true);

      setEnv({ termProgram: 'iTerm.app' });
      expect(ansi['detectColorSupport']().hasTrue).toBe(true);

      setEnv({ termProgram: 'Apple_Terminal' });
      expect(ansi['detectColorSupport']().hasTrue).toBe(true);

      setEnv({});
      expect(ansi['detectColorSupport']().hasTrue).toBe(false);

      setEnv({ colorterm: 'truecolor', isTTY: false });
      expect(ansi['detectColorSupport']().hasTrue).toBe(false);
    });
  });

  describe('selectStyleCode', () => {
    test('returns empty array if no style', () => {
      expect(ansi['selectStyleCode']()).toEqual([]);
      expect(ansi['selectStyleCode']([])).toEqual([]);
    });

    test('returns correct ANSI codes for single style', () => {
      expect(ansi['selectStyleCode']('bold')).toEqual([Ansi.Codes.STYLES.bold]);
      expect(ansi['selectStyleCode']('underline')).toEqual([Ansi.Codes.STYLES.underline]);
    });

    test('returns correct ANSI codes for multiple styles', () => {
      const styles: StyleOptions[] = ['bold', 'italic', 'underline'];
      const codes = ansi['selectStyleCode'](styles);

      expect(codes).toEqual([
        Ansi.Codes.STYLES.bold,
        Ansi.Codes.STYLES.italic,
        Ansi.Codes.STYLES.underline,
      ]);
    });

    test('ignores invalid styles', () => {
      // @ts-expect-error test invalid style
      expect(ansi['selectStyleCode']('invalid')).toEqual([]);
      // @ts-expect-error test invalid style
      expect(ansi['selectStyleCode'](['bold', 'invalid'])).toEqual([Ansi.Codes.STYLES.bold]);
    });
  });

  describe('selectColorCode', () => {
    beforeEach(() => {
      // Force color support for tests
      ansi['colorSupport'] = { hasBasic: true, has256: true, hasTrue: true };
    });

    test('returns true color code if supported and specified', () => {
      const color: ColorOptions = {
        true: { fg: [10, 20, 30], bg: [40, 50, 60] },
      };

      expect(ansi['selectColorCode'](color, 'fg')).toBe('\x1b[38;2;10;20;30m');
      expect(ansi['selectColorCode'](color, 'bg')).toBe('\x1b[48;2;40;50;60m');
    });

    test('returns 256 color code if true color not specified but 256 supported', () => {
      ansi['colorSupport'].hasTrue = false;
      const color: ColorOptions = {
        mode256: { fg: 123, bg: 234 },
      };

      expect(ansi['selectColorCode'](color, 'fg')).toBe('\x1b[38;5;123m');
      expect(ansi['selectColorCode'](color, 'bg')).toBe('\x1b[48;5;234m');
    });

    test('returns basic color code if neither true color nor 256 color used', () => {
      ansi['colorSupport'].hasTrue = false;
      ansi['colorSupport'].has256 = false;
      const color: ColorOptions = {
        basic: { fg: 'red', bg: 'blue' },
      };

      expect(ansi['selectColorCode'](color, 'fg')).toBe(Ansi.Codes.BASIC_COLORS.fg.red);
      expect(ansi['selectColorCode'](color, 'bg')).toBe(Ansi.Codes.BASIC_COLORS.bg.blue);
    });

    test('returns empty string if no color specified', () => {
      expect(ansi['selectColorCode']({}, 'fg')).toBe('');
      expect(ansi['selectColorCode']({}, 'bg')).toBe('');
    });
  });

  describe('applyCodes', () => {
    test('returns input unmodified if no basic color support', () => {
      ansi['colorSupport'] = { hasBasic: false, has256: false, hasTrue: false };
      const text = 'Hello';
      const result = ansi.applyCodes(text, {});
      expect(result).toBe(text);
    });

    test('applies style and color codes correctly', () => {
      ansi['colorSupport'] = { hasBasic: true, has256: true, hasTrue: true };
      const text = 'Test';
      const options: TextOptions = {
        style: ['bold', 'underline'],
        color: {
          basic: { fg: 'red', bg: 'blue' },
          mode256: { fg: 123, bg: 234 },
          true: { fg: [10, 20, 30], bg: [40, 50, 60] },
        },
      };
      // True color takes precedence
      const expected =
        Ansi.Codes.STYLES.bold +
        Ansi.Codes.STYLES.underline +
        '\x1b[38;2;10;20;30m' +
        '\x1b[48;2;40;50;60m' +
        text +
        Ansi.Codes.RESET;

      const result = ansi.applyCodes(text, options);
      expect(result).toBe(expected);
    });

    test('applies only styles if no colors specified', () => {
      ansi['colorSupport'] = { hasBasic: true, has256: false, hasTrue: false };
      const text = 'Styled';
      const options: TextOptions = {
        style: 'italic',
      };
      const expected = Ansi.Codes.STYLES.italic + text + Ansi.Codes.RESET;
      const result = ansi.applyCodes(text, options);
      expect(result).toBe(expected);
    });

    test('applies only colors if no styles specified', () => {
      ansi['colorSupport'] = { hasBasic: true, has256: false, hasTrue: false };
      const text = 'Colored';
      const options: TextOptions = {
        color: {
          basic: { fg: 'green' },
        },
      };
      const expected = Ansi.Codes.BASIC_COLORS.fg.green + text + Ansi.Codes.RESET;
      const result = ansi.applyCodes(text, options);
      expect(result).toBe(expected);
    });
  });
});
