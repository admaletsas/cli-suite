import { Validator } from 'types';

/**
 * Helper function that runs all validators against the input string or array of strings.
 * Collects and returns all validator messages for failed validations.
 *
 * @param input - The input string or array of strings to validate
 * @param validators - Array of Validator objects
 * @returns Promise resolving to an array of error messages, or empty array if all pass
 */
export async function runValidators(
  input: string | string[],
  validators: Validator[]
): Promise<string[]> {
  const errors: string[] = [];

  for (const validator of validators) {
    const result = validator.validate(input);
    const isValid = result instanceof Promise ? await result : result;

    if (!isValid && validator.message) {
      errors.push(validator.message);
    }
  }

  return errors;
}

/**
 * Returns the terminal display width of a Unicode string.
 * Accounts for wide characters, combining marks, and emojis.
 *
 * @param input - The input string.
 * @returns The display width in terminal columns.
 */
export function stringWidth(input: string): number {
  let width = 0;

  for (const char of [...input]) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;

    // Control characters (e.g., \n, \r, \t) have zero width
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      continue;
    }

    // Combining marks (zero width)
    // Unicode combining marks ranges
    if (
      (code >= 0x0300 && code <= 0x036f) ||
      (code >= 0x1ab0 && code <= 0x1aff) ||
      (code >= 0x1dc0 && code <= 0x1dff) ||
      (code >= 0x20d0 && code <= 0x20ff) ||
      (code >= 0xfe20 && code <= 0xfe2f)
    ) {
      continue;
    }

    // Wide characters (East Asian Wide or Fullwidth)
    if (
      (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo init. consonants
      (code >= 0x2329 && code <= 0x232a) ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) || // CJK ... Yi
      (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
      (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
      (code >= 0xfe10 && code <= 0xfe19) || // Vertical forms
      (code >= 0xfe30 && code <= 0xfe6f) || // CJK Compatibility Forms
      (code >= 0xff00 && code <= 0xff60) || // Fullwidth Forms
      (code >= 0xffe0 && code <= 0xffe6) ||
      (code >= 0x20000 && code <= 0x2fffd) || // CJK Extension B..E
      (code >= 0x30000 && code <= 0x3fffd)
    ) {
      width += 2;
      continue;
    }

    // Emoji (some emojis are double width)
    if (
      (code >= 0x1f300 && code <= 0x1f64f) || // Emoticons etc.
      (code >= 0x1f900 && code <= 0x1f9ff) || // Supplemental Symbols and Pictographs
      (code >= 0x1fa70 && code <= 0x1faff) // Symbols and Pictographs Extended-A
    ) {
      width += 2;
      continue;
    }

    // Default: width 1
    width += 1;
  }

  return width;
}
