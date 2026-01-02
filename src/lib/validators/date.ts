import { Validator } from 'types';

/**
 * Validator to check if input is a valid date string.
 *
 * @param message - Optional custom error message
 * @returns Validator object
 */
export const isDate = (params: { message?: string } = {}): Validator => {
  const validateSingle = (value: string): boolean => {
    const trimmed = value.trim();
    const date = new Date(trimmed);
    return !isNaN(date.getTime());
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? 'Please enter a valid date.',
  };
};

/**
 * Validator to check if input date is before a specific date.
 *
 * @param params.compareDate - Date to compare against
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isDateBefore = (params: { compareDate: Date; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    const date = new Date(value.trim());
    return !isNaN(date.getTime()) && date < params.compareDate;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter a date before ${params.compareDate.toDateString()}.`,
  };
};

/**
 * Validator to check if input date is after a specific date.
 *
 * @param params.compareDate - Date to compare against
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isDateAfter = (params: { compareDate: Date; message?: string }): Validator => {
  const validateSingle = (value: string): boolean => {
    const date = new Date(value.trim());
    return !isNaN(date.getTime()) && date > params.compareDate;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message: params.message ?? `Please enter a date after ${params.compareDate.toDateString()}.`,
  };
};

/**
 * Validator to check if input date is within a specified date range (inclusive).
 *
 * @param params.startDate - Start of date range
 * @param params.endDate - End of date range
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isDateInRange = (params: {
  startDate: Date;
  endDate: Date;
  message?: string;
}): Validator => {
  const validateSingle = (value: string): boolean => {
    const date = new Date(value.trim());
    return !isNaN(date.getTime()) && date >= params.startDate && date <= params.endDate;
  };

  return {
    validate: (input: string | string[]): boolean => {
      if (Array.isArray(input)) {
        return input.every(validateSingle);
      }

      return validateSingle(input);
    },
    message:
      params.message ??
      `Please enter a date between ${params.startDate.toDateString()} and ${params.endDate.toDateString()}.`,
  };
};
