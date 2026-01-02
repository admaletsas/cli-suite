import * as validators from '@lib/validators/index';
import * as dateValidators from '@lib/validators/date';
import * as fsValidators from '@lib/validators/filesystem';
import * as listValidators from '@lib/validators/list';
import * as numberValidators from '@lib/validators/number';
import * as regexValidators from '@lib/validators/regex';
import * as stringValidators from '@lib/validators/string';

describe('validators module exports', () => {
  type ValidatorKey = keyof typeof validators;
  type DateValidatorKey = keyof typeof dateValidators;
  type FsValidatorKey = keyof typeof fsValidators;
  type ListValidatorKey = keyof typeof listValidators;
  type NumberValidatorKey = keyof typeof numberValidators;
  type RegexValidatorKey = keyof typeof regexValidators;
  type StringValidatorKey = keyof typeof stringValidators;

  test('exports date validators correctly', () => {
    for (const key of Object.keys(dateValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(dateValidators[key as DateValidatorKey]);
    }
  });

  test('exports filesystem validators correctly', () => {
    for (const key of Object.keys(fsValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(fsValidators[key as FsValidatorKey]);
    }
  });

  test('exports list validators correctly', () => {
    for (const key of Object.keys(listValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(listValidators[key as ListValidatorKey]);
    }
  });

  test('exports number validators correctly', () => {
    for (const key of Object.keys(numberValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(numberValidators[key as NumberValidatorKey]);
    }
  });

  test('exports regex validators correctly', () => {
    for (const key of Object.keys(regexValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(regexValidators[key as RegexValidatorKey]);
    }
  });

  test('exports string validators correctly', () => {
    for (const key of Object.keys(stringValidators) as ValidatorKey[]) {
      expect(validators).toHaveProperty(key);
      expect(validators[key]).toBe(stringValidators[key as StringValidatorKey]);
    }
  });
});
