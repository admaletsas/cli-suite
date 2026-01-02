import { minLength, maxLength, isLengthInRange } from '@lib/validators/string';

describe('String Validators', () => {
  describe('minLength', () => {
    const length = 3;
    const validator = minLength({ length });

    test('validates input with length >= min', () => {
      expect(validator.validate('abc')).toBe(true);
      expect(validator.validate('  abcd  ')).toBe(true);
      expect(validator.validate('abcd')).toBe(true);
      expect(validator.validate(['abc', 'def', ' xyz '])).toBe(true);
    });

    test('rejects input with length < min', () => {
      expect(validator.validate('')).toBe(false);
      expect(validator.validate('  ')).toBe(false);
      expect(validator.validate('ab')).toBe(false);
      expect(validator.validate(['ab', 'cd', ' xy ', 'abc'])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter at least ${length} characters.`);
    });

    test('allows custom message', () => {
      const custom = minLength({
        length,
        message: 'Custom min length message',
      });
      expect(custom.message).toBe('Custom min length message');
    });
  });

  describe('maxLength', () => {
    const length = 5;
    const validator = maxLength({ length });

    test('validates input with length <= max', () => {
      expect(validator.validate('')).toBe(true);
      expect(validator.validate('abc')).toBe(true);
      expect(validator.validate('  abcd  ')).toBe(true);
      expect(validator.validate('abcde')).toBe(true);
      expect(validator.validate(['abc', 'abcde', ' xyz '])).toBe(true);
    });

    test('rejects input with length > max', () => {
      expect(validator.validate('abcdef')).toBe(false);
      expect(validator.validate('  abcdef  ')).toBe(false);
      expect(validator.validate(['abcdef', '  abcdef  ', 'abc'])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter no more than ${length} characters.`);
    });

    test('allows custom message', () => {
      const custom = maxLength({
        length,
        message: 'Custom max length message',
      });
      expect(custom.message).toBe('Custom max length message');
    });
  });

  describe('isLengthInRange', () => {
    const min = 2;
    const max = 4;
    const validator = isLengthInRange({ min, max });

    test('validates input with length within range inclusive', () => {
      expect(validator.validate('ab')).toBe(true);
      expect(validator.validate('abc')).toBe(true);
      expect(validator.validate('abcd')).toBe(true);
      expect(validator.validate('  abc  ')).toBe(true);
      expect(validator.validate(['ab', 'def', 'wxyz'])).toBe(true);
    });

    test('rejects input with length outside range', () => {
      expect(validator.validate('a')).toBe(false);
      expect(validator.validate('abcde')).toBe(false);
      expect(validator.validate('')).toBe(false);
      expect(validator.validate('   ')).toBe(false);
      expect(validator.validate(['ab', 'vwxyz', ' '])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter between ${min} and ${max} characters.`);
    });

    test('allows custom message', () => {
      const custom = isLengthInRange({
        min,
        max,
        message: 'Custom length range message',
      });
      expect(custom.message).toBe('Custom length range message');
    });
  });
});
