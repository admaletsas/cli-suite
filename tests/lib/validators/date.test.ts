import { isDate, isDateBefore, isDateAfter, isDateInRange } from '@lib/validators/date';

describe('Date Validators', () => {
  describe('isDate', () => {
    const validator = isDate();

    test('validates correct date strings', () => {
      expect(validator.validate('2025-06-01')).toBe(true);
      expect(validator.validate('2025-01-06')).toBe(true);
      expect(validator.validate('06-01-2025')).toBe(true);
      expect(validator.validate('01-06-2025')).toBe(true);
      expect(validator.validate('06-01-25')).toBe(true);
      expect(validator.validate('01-06-25')).toBe(true);
      expect(validator.validate('6-1-25')).toBe(true);
      expect(validator.validate('1-6-25')).toBe(true);
      expect(validator.validate('2025/06/01')).toBe(true);
      expect(validator.validate('2025/01/06')).toBe(true);
      expect(validator.validate('06/01/2025')).toBe(true);
      expect(validator.validate('01/06/2025')).toBe(true);
      expect(validator.validate('06/01/25')).toBe(true);
      expect(validator.validate('01/06/25')).toBe(true);
      expect(validator.validate('6/1/25')).toBe(true);
      expect(validator.validate('1/6/25')).toBe(true);
      expect(validator.validate(' June 1, 2025 ')).toBe(true);
      expect(validator.validate(['06/01/25', '1/6/25', ' June 1, 2025 '])).toBe(true);
    });

    test('rejects invalid date strings', () => {
      expect(validator.validate('')).toBe(false);
      expect(validator.validate('invalid-date')).toBe(false);
      expect(validator.validate('2025-13-01')).toBe(false);
      expect(validator.validate(['06/01/2025', '', 'invalid-date', '2025-13-01'])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe('Please enter a valid date.');
    });

    test('allows custom message', () => {
      const custom = isDate({ message: 'Custom message' });
      expect(custom.message).toBe('Custom message');
    });
  });

  describe('isDateBefore', () => {
    const compareDate = new Date('2025-06-15');
    const validator = isDateBefore({ compareDate });

    test('validates dates before compareDate', () => {
      expect(validator.validate('2025-06-14')).toBe(true);
      expect(validator.validate('June 1, 2025')).toBe(true);
      expect(validator.validate(['2025-06-14', 'June 1, 2025'])).toBe(true);
    });

    test('rejects dates on or after compareDate', () => {
      expect(validator.validate('2025-06-15')).toBe(false);
      expect(validator.validate('2025-06-16')).toBe(false);
      expect(validator.validate(['2025-06-14', '2025-06-15', '2025-06-16'])).toBe(false);
    });

    test('rejects invalid dates', () => {
      expect(validator.validate('invalid')).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter a date before ${compareDate.toDateString()}.`);
    });

    test('allows custom message', () => {
      const custom = isDateBefore({
        compareDate,
        message: 'Custom before message',
      });
      expect(custom.message).toBe('Custom before message');
    });
  });

  describe('isDateAfter', () => {
    const compareDate = new Date('2025-06-15');
    const validator = isDateAfter({ compareDate });

    test('validates dates after compareDate', () => {
      expect(validator.validate('2025-06-16')).toBe(true);
      expect(validator.validate('June 20, 2025')).toBe(true);
      expect(validator.validate(['2025-06-16', 'June 20, 2025'])).toBe(true);
    });

    test('rejects dates on or before compareDate', () => {
      expect(validator.validate('2025-06-15')).toBe(false);
      expect(validator.validate('2025-06-14')).toBe(false);
      expect(validator.validate(['2025-06-16', '2025-06-15', '2025-06-14'])).toBe(false);
    });

    test('rejects invalid dates', () => {
      expect(validator.validate('invalid')).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(`Please enter a date after ${compareDate.toDateString()}.`);
    });

    test('allows custom message', () => {
      const custom = isDateAfter({
        compareDate,
        message: 'Custom after message',
      });
      expect(custom.message).toBe('Custom after message');
    });
  });

  describe('isDateInRange', () => {
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-06-30');
    const validator = isDateInRange({ startDate, endDate });

    test('validates dates within range inclusive', () => {
      expect(validator.validate('2025-06-01')).toBe(true);
      expect(validator.validate('2025-06-15')).toBe(true);
      expect(validator.validate('2025-06-30')).toBe(true);
      expect(validator.validate(['2025-06-01', '2025-06-15', '2025-06-30'])).toBe(true);
    });

    test('rejects dates outside range', () => {
      expect(validator.validate('2025-05-31')).toBe(false);
      expect(validator.validate('2025-07-01')).toBe(false);
      expect(validator.validate(['2025-06-01', '2025-05-31', '2025-07-01'])).toBe(false);
    });

    test('rejects invalid dates', () => {
      expect(validator.validate('invalid')).toBe(false);
      expect(validator.validate(['invalid'])).toBe(false);
    });

    test('has default message', () => {
      expect(validator.message).toBe(
        `Please enter a date between ${startDate.toDateString()} and ${endDate.toDateString()}.`
      );
    });

    test('allows custom message', () => {
      const custom = isDateInRange({
        startDate,
        endDate,
        message: 'Custom range message',
      });
      expect(custom.message).toBe('Custom range message');
    });
  });
});
