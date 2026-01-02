/**
 * A function that takes a string and returns a styled string.
 */
export type StyleFunction = (text: string) => string;

/**
 * Configuration options for rendering a list in the CLI.
 *
 * Properties:
 * - `items`: An array of strings representing the list items to display.
 * - `ordered`: If `true`, renders an ordered (numbered) list. Defaults to `false` (unordered).
 * - `bulletChar`: The character used as a bullet for unordered lists. Defaults to `'•'`.
 * - `indent`: Number of spaces to indent before the bullet or number. Defaults to `2`.
 * - `style`: A `StyleFunction` applied to the bullet or number prefix for styling.
 * - `itemStyle`: A `StyleFunction` applied to the list item text for styling.
 */
export type ListOptions = {
  items: string[];
  ordered?: boolean;
  bulletChar?: string;
  indent?: number;
  style?: StyleFunction;
  itemStyle?: StyleFunction;
};
