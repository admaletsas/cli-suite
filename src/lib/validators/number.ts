import { Validator } from 'types';

/**
 * Validator to check if input is a valid number.
 *
 * @param message - Optional custom error message
 * @returns Validator object
 */
export const isNumber = (params: { message?: string } = {}): Validator => {
  const validateSingle = (value: string): boolean => {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }
      return validateSingle(input);
    },
    message: params.message ?? 'Please enter a valid number.',
  };
};

/**
 * Validator to check if input is a number within a specified range (inclusive).
 *
 * @param params.min - Minimum allowed number
 * @param params.max - Maximum allowed number
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isNumberInRange = (params: {
  min: number;
  max: number;
  message?: string;
}): Validator => {
  const validateSingle = (value: string): boolean => {
    const trimmed = value.trim();
    const num = Number(trimmed);
    return trimmed !== '' && !isNaN(num) && num >= params.min && num <= params.max;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter a number between ${params.min} and ${params.max}.`,
  };
};
