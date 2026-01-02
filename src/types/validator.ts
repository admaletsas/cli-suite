/**
 * Validator object used to validate option values.
 *
 * Properties:
 * - `validate`: A function that takes a string or array of strings as input,
 *   and returns a boolean or a Promise resolving to a boolean indicating validity.
 * - `message`: Error message string to be used if validation fails.
 */
export type Validator = {
  validate: (input: string | string[]) => boolean | Promise<boolean>;
  message: string;
};
