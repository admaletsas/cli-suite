import { Validator } from 'types';

/**
 * Validator to check if input is included in a predefined list of allowed values.
 *
 * @param params.list - Array of allowed string values
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const inList = (params: { list: string[]; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    return params.list.includes(value.trim());
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? 'Input is not allowed.',
  };
};
