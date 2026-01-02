import { Validator } from 'types';
import fs from 'fs/promises';

/**
 * Validator to check if input path exists and is a file.
 *
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const fileExists = (params: { message?: string } = {}): Validator => {
  const validateSingle = async (value: string): Promise<boolean> => {
    try {
      const stat = await fs.stat(value);
      return stat.isFile();
    } catch {
      return false;
    }
  };

  return {
    validate: async (input: string | string[]): Promise<boolean> => {
      if (Array.isArray(input)) {
        for (const val of input) {
          if (!(await validateSingle(val))) return false;
        }

        return true;
      }

      return await validateSingle(input);
    },
    message: params.message ?? 'The specified file does not exist or is not a file.',
  };
};

/**
 * Validator to check if input path exists and is a directory.
 *
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const directoryExists = (params: { message?: string } = {}): Validator => {
  const validateSingle = async (value: string): Promise<boolean> => {
    try {
      const stat = await fs.stat(value);
      return stat.isDirectory();
    } catch {
      return false;
    }
  };

  return {
    validate: async (input: string | string[]): Promise<boolean> => {
      if (Array.isArray(input)) {
        for (const val of input) {
          if (!(await validateSingle(val))) return false;
        }

        return true;
      }

      return await validateSingle(input);
    },
    message: params.message ?? 'The specified directory does not exist or is not a directory.',
  };
};

/**
 * Validator to check if input path is readable.
 *
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isReadable = (params: { message?: string } = {}): Validator => {
  const validateSingle = async (value: string): Promise<boolean> => {
    try {
      await fs.access(value, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  };

  return {
    validate: async (input: string | string[]): Promise<boolean> => {
      if (Array.isArray(input)) {
        for (const val of input) {
          if (!(await validateSingle(val))) return false;
        }

        return true;
      }

      return await validateSingle(input);
    },
    message: params.message ?? 'The specified path is not readable.',
  };
};

/**
 * Validator to check if input path is writable.
 *
 * @param params.message - Optional custom error message
 * @returns Validator object
 */
export const isWritable = (params: { message?: string } = {}): Validator => {
  const validateSingle = async (value: string): Promise<boolean> => {
    try {
      await fs.access(value, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  };

  return {
    validate: async (input: string | string[]): Promise<boolean> => {
      if (Array.isArray(input)) {
        for (const val of input) {
          if (!(await validateSingle(val))) return false;
        }

        return true;
      }

      return await validateSingle(input);
    },
    message: params.message ?? 'The specified path is not writable.',
  };
};
