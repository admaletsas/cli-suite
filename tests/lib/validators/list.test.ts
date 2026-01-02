import { inList } from '@lib/validators/list';

describe('List Validators', () => {
  describe('inList', () => {
    const list = ['apple', 'banana', 'orange'];
    const validator = inList({ list });

    test('validates input included in list', () => {
      expect(validator.validate('apple')).toBe(true);
      expect(validator.validate('banana')).toBe(true);
      expect(validator.validate(['apple', 'banana'])).toBe(true);
    });

    test('rejects input not in list', () => {
      expect(validator.validate('grape')).toBe(false);
      expect(validator.validate('')).toBe(false);
      expect(validator.validate(['apple', 'grape'])).toBe(false);
    });

    test('trims input before checking', () => {
      expect(validator.validate('  apple  ')).toBe(true);
      expect(validator.validate('  grape  ')).toBe(false);
      expect(validator.validate(['  apple  ', '  grape  '])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('Input is not allowed.');
    });

    test('allows custom message', () => {
      const custom = inList({ list, message: 'Custom list message' });
      expect(custom.message).toBe('Custom list message');
    });
  });
});
