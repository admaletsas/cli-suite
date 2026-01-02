/**
 * Result object returned by the Parser after parsing command-line arguments.
 *
 * Properties:
 * - `options`: An object mapping option names (short or long) to their parsed values.
 *   Values can be:
 *   - string: single option value.
 *   - string[]: multiple values for options that accept multiple arguments.
 *   - boolean: flag options without explicit values (true if present).
 * - `commands`: Array of positional commands extracted from the arguments.
 * - `errors`: Array of strings representing parsing errors encountered.
 */
export type ParserResult = {
  options: Record<string, string | string[] | boolean>;
  commands: string[];
  errors: string[];
};
