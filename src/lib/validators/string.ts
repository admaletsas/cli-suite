import { Validator } from 'types';

/**
 * Validator to check if input length is at least a minimum number of characters.
 *
 * @param params.length - Minimum required length
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const minLength = (params: { length: number; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    return value.trim().length >= params.length;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter at least ${params.length} characters.`,
  };
};

/**
 * Validator to check if input length does not exceed a maximum number of characters.
 *
 * @param params.length - Maximum allowed length
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const maxLength = (params: { length: number; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    return value.trim().length <= params.length;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter no more than ${params.length} characters.`,
  };
};

/**
 * Validator to check if input length is within a specified range (inclusive).
 *
 * @param params.min - Minimum allowed length
 * @param params.max - Maximum allowed length
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isLengthInRange = (params: {
  min: number;
  max: number;
  message?: string;
}): Validator => {
  const validateSingle = (value: string): boolean => {
    const length = value.trim().length;
    return length >= params.min && length <= params.max;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter between ${params.min} and ${params.max} characters.`,
  };
};
