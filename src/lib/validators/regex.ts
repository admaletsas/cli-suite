import { Validator } from 'types';

/**
 * Validator to check if input matches a given regular expression pattern.
 *
 * @param params.regex - Regular expression to test against input
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const matchesRegex = (params: { regex: RegExp; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    return params.regex.test(value.trim());
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? 'Input format is invalid.',
  };
};
