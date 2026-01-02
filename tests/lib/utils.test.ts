import { runValidators } from '@lib/utils';
import { Validator } from 'types';

describe('runValidators', () => {
  test('returns empty array when no validators', async () => {
    const result = await runValidators('input', []);
    expect(result).toEqual([]);
  });

  test('returns empty array when all synchronous validators pass', async () => {
    const validators: Validator[] = [
      { validate: () => true, message: 'Error 1' },
      { validate: () => true, message: 'Error 2' },
    ];
    const result = await runValidators('test', validators);
    expect(result).toEqual([]);
  });

  test('returns error messages for synchronous validators that fail', async () => {
    const validators: Validator[] = [
      { validate: () => false, message: 'Error 1' },
      { validate: () => true, message: 'Error 2' },
      { validate: () => false, message: 'Error 3' },
    ];
    const result = await runValidators('test', validators);
    expect(result).toEqual(['Error 1', 'Error 3']);
  });

  test('returns empty array when all async validators pass', async () => {
    const validators: Validator[] = [
      { validate: async () => true, message: 'Error 1' },
      { validate: async () => Promise.resolve(true), message: 'Error 2' },
    ];
    const result = await runValidators('test', validators);
    expect(result).toEqual([]);
  });

  test('returns error messages for async validators that fail', async () => {
    const validators: Validator[] = [
      { validate: async () => false, message: 'Error 1' },
      { validate: async () => true, message: 'Error 2' },
      { validate: async () => Promise.resolve(false), message: 'Error 3' },
    ];
    const result = await runValidators('test', validators);
    expect(result).toEqual(['Error 1', 'Error 3']);
  });

  test('handles mixed sync and async validators', async () => {
    const validators: Validator[] = [
      { validate: () => true, message: 'Error 1' },
      { validate: () => false, message: 'Error 2' },
      { validate: async () => true, message: 'Error 3' },
      { validate: async () => false, message: 'Error 4' },
    ];
    const result = await runValidators('test', validators);
    expect(result).toEqual(['Error 2', 'Error 4']);
  });

  test('handles input as array of strings', async () => {
    const validators: Validator[] = [
      { validate: (input) => Array.isArray(input) && input.length > 0, message: 'Empty input' },
      { validate: async (input) => input.includes('valid'), message: 'Missing valid' },
    ];
    const result = await runValidators(['valid', 'test'], validators);
    expect(result).toEqual([]);
  });

  test('returns errors when array input fails validation', async () => {
    const validators: Validator[] = [
      { validate: (input) => Array.isArray(input) && input.length > 0, message: 'Empty input' },
      { validate: async (input) => input.includes('valid'), message: 'Missing valid' },
    ];
    const result = await runValidators(['test'], validators);
    expect(result).toEqual(['Missing valid']);
  });

  test('does not add error if validator has no message', async () => {
    const validators: Validator[] = [{ validate: () => false, message: '' }];
    const result = await runValidators('test', validators);
    expect(result).toEqual([]);
  });
});
