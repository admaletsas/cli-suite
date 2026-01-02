import { isNumber, isNumberInRange } from '@lib/validators/number';

describe('Number Validators', () => {
  describe('isNumber', () => {
    const validator = isNumber();

    test('validates valid numbers', () => {
      expect(validator.validate('123')).toBe(true);
      expect(validator.validate('  45.67  ')).toBe(true);
      expect(validator.validate('-10')).toBe(true);
      expect(validator.validate('0')).toBe(true);
      expect(validator.validate(['123', '  45.67  ', '-10', '0'])).toBe(true);
    });

    test('rejects invalid inputs', () => {
      expect(validator.validate('')).toBe(false);
      expect(validator.validate('abc')).toBe(false);
      expect(validator.validate('12a')).toBe(false);
      expect(validator.validate(' ')).toBe(false);
      expect(validator.validate(['10', '', 'abc', '12a', ' '])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('Please enter a valid number.');
    });

    test('allows custom message', () => {
      const custom = isNumber({ message: 'Custom number message' });
      expect(custom.message).toBe('Custom number message');
    });
  });

  describe('isNumberInRange', () => {
    const min = 10;
    const max = 20;
    const validator = isNumberInRange({ min, max });

    test('validates numbers within range inclusive', () => {
      expect(validator.validate('10')).toBe(true);
      expect(validator.validate('15')).toBe(true);
      expect(validator.validate('20')).toBe(true);
      expect(validator.validate(' 12.5 ')).toBe(true);
      expect(validator.validate(['10', '15', '20', ' 12.5 '])).toBe(true);
    });

    test('rejects numbers outside range', () => {
      expect(validator.validate('9')).toBe(false);
      expect(validator.validate('21')).toBe(false);
      expect(validator.validate('-5')).toBe(false);
      expect(validator.validate(['10', '9', '21', '-5'])).toBe(false);
    });

    test('rejects invalid inputs', () => {
      expect(validator.validate('abc')).toBe(false);
      expect(validator.validate('')).toBe(false);
      expect(validator.validate(' ')).toBe(false);
      expect(validator.validate(['abc', '', ' '])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter a number between ${min} and ${max}.`);
    });

    test('allows custom message', () => {
      const custom = isNumberInRange({
        min,
        max,
        message: 'Custom range message',
      });
      expect(custom.message).toBe('Custom range message');
    });
  });
});
