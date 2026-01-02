import { matchesRegex } from '@lib/validators/regex';

describe('Regex Validators', () => {
  describe('matchesRegex', () => {
    const regex = /^[a-z]+$/i; // Letters only
    const validator = matchesRegex({ regex });

    test('validates input matching regex', () => {
      expect(validator.validate('abc')).toBe(true);
      expect(validator.validate('ABC')).toBe(true);
      expect(validator.validate('aBcDe')).toBe(true);
      expect(validator.validate(['abc', 'ABC', 'aBcDe'])).toBe(true);
    });

    test('rejects input not matching regex', () => {
      expect(validator.validate('abc123')).toBe(false);
      expect(validator.validate('123')).toBe(false);
      expect(validator.validate('abc!')).toBe(false);
      expect(validator.validate(['abc123', '123', 'abc!'])).toBe(false);
    });

    test('trims input before testing', () => {
      expect(validator.validate('  abc  ')).toBe(true);
      expect(validator.validate('  abc123  ')).toBe(false);
      expect(validator.validate(['  abc  ', '  abc123  '])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('Input format is invalid.');
    });

    test('allows custom message', () => {
      const custom = matchesRegex({ regex, message: 'Custom regex message' });
      expect(custom.message).toBe('Custom regex message');
    });
  });
});
