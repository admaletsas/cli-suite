import { ParserResult } from 'types';

/**
 * Processes command-line arguments.
 * It extracts positional commands, options in both short and long forms,
 * and detects any parsing errors encountered.
 *
 * Supported features include:
 * - Positional commands (commands with subcommands and values before any option).
 * - Long options prefixed with `--`, supporting:
 *   - Flags without values (e.g. `--verbose`).
 *   - Key-value pairs using `=` (e.g. `--output=file.txt`).
 *   - Key followed by one or more values (e.g. `--include src tests`).
 * - Short options prefixed with `-`, supporting:
 *   - Single flags (e.g. `-f`).
 *   - Flags with values (e.g. `-f filename`).
 *   - Combined flags (e.g. `-abc` equivalent to `-a -b -c`).
 */
export class Parser {
  // Array of command-line arguments to be parsed
  private args: string[];

  // Object storing parsed options (short or long) as key-value pairs
  private parsedOptions: Record<string, string | string[] | boolean> = {};

  // Array of positional commands extracted from the arguments
  private parsedCommands: string[] = [];

  // Array of strings representing arguments that failed parsing or validation
  private parsingErrors: string[] = [];

  /**
   * Constructs a Parser instance.
   * Initializes the argument list by slicing off the first 2 elements of the provided
   * argument array, which correspond to the Node.js executable and the script file path.
   * Immediately invokes the parsing process on the remaining arguments.
   *
   * @param argv - Optional array of command-line arguments to parse. Defaults to `process.argv`.
   */
  constructor(argv: string[] = process.argv) {
    this.args = argv.slice(2);
    this.parse();
  }

  /**
   * Main parsing method that processes the command-line arguments.
   * It first collects all positional commands.
   * Then it parses the remaining arguments as either long options or short options.
   * Invalid or malformed arguments are recorded as parsing errors.
   */
  private parse(): void {
    let i = 0;

    // Parse commands and positional arguments first
    while (i < this.args.length && !this.args[i].startsWith('-')) {
      this.parsedCommands.push(this.args[i++]);
    }

    // Parse the rest as short or long options
    for (; i < this.args.length; i++) {
      if (this.args[i].startsWith('--')) {
        const key = this.args[i].slice(2).split('=')[0];

        if (key.length > 1 && this.isValidName(key)) {
          i = this.parseLongArg(this.args[i], i);
        } else {
          this.parsingErrors.push(this.args[i]);
        }

        continue;
      }

      if (this.args[i].startsWith('-')) {
        if (this.args[i].length > 1 && this.isValidName(this.args[i].slice(1))) {
          i = this.parseShortArg(this.args[i], i);
        } else {
          this.parsingErrors.push(this.args[i]);
        }

        continue;
      }

      this.parsingErrors.push(this.args[i]);
    }
  }

  /**
   * Parses a long option argument.
   * Advances the current index to skip over any consumed values.
   * Supports the following formats:
   * - `--key=value` sets the option `key` to the string `value`.
   * - `--key value1 value2 ...` collects subsequent non-option arguments as values for `key`.
   * - `--key` alone sets the option `key` as a boolean flag `true`.
   *
   * @param arg - The long option argument string (e.g. '--output=file.txt')
   * @param currentIndex - Current index in the argument array
   * @returns Updated index after parsing this argument and its values
   */
  private parseLongArg(arg: string, currentIndex: number): number {
    const argBody = arg.slice(2);
    const equalIndex = argBody.indexOf('=');

    if (equalIndex !== -1) {
      const key = argBody.slice(0, equalIndex);
      const value = argBody.slice(equalIndex + 1);
      this.parsedOptions[key] = value;
    } else {
      const key = argBody;
      let values: string[] = [];
      let nextIndex = currentIndex + 1;

      while (nextIndex < this.args.length && !this.args[nextIndex].startsWith('-')) {
        values.push(this.args[nextIndex]);
        nextIndex++;
      }

      if (values.length === 0) {
        this.parsedOptions[key] = true;
      } else if (values.length === 1) {
        this.parsedOptions[key] = values[0];
      } else {
        this.parsedOptions[key] = values;
      }

      currentIndex = nextIndex - 1;
    }

    return currentIndex;
  }

  /**
   * Parses a short option argument.
   * Advances the current index to skip over any consumed values.
   * Supports the following formats:
   * - `-f` alone sets the single flag `f` as a boolean flag `true`.
   * - `-f value` sets the single flag `f` to the string `value`.
   * - `-abc` sets the flags `a`, `b`, and `c` as boolean flags `true`.
   * - `-abc value` sets the flags `a`, `b` as booleans flag `true, and `c` to the string `value`.
   *
   * @param arg - The short option argument string (e.g. '-abc' or '-f')
   * @param currentIndex - Current index in the argument array
   * @returns Updated index after parsing this argument and its values
   */
  private parseShortArg(arg: string, currentIndex: number): number {
    const flags = arg.slice(1);

    if (flags.length > 1) {
      for (let i = 0; i < flags.length - 1; i++) {
        this.parsedOptions[flags[i]] = true;
      }

      const lastFlag = flags[flags.length - 1];
      let values: string[] = [];
      let nextIndex = currentIndex + 1;

      while (nextIndex < this.args.length && !this.args[nextIndex].startsWith('-')) {
        values.push(this.args[nextIndex]);
        nextIndex++;
      }

      if (values.length === 0) {
        this.parsedOptions[lastFlag] = true;
      } else if (values.length === 1) {
        this.parsedOptions[lastFlag] = values[0];
      } else {
        this.parsedOptions[lastFlag] = values;
      }

      currentIndex = nextIndex - 1;
    } else {
      const flag = flags;
      let values: string[] = [];
      let nextIndex = currentIndex + 1;

      while (nextIndex < this.args.length && !this.args[nextIndex].startsWith('-')) {
        values.push(this.args[nextIndex]);
        nextIndex++;
      }

      if (values.length === 0) {
        this.parsedOptions[flag] = true;
      } else if (values.length === 1) {
        this.parsedOptions[flag] = values[0];
      } else {
        this.parsedOptions[flag] = values;
      }

      currentIndex = nextIndex - 1;
    }

    return currentIndex;
  }

  /**
   * Validates an option name.
   * Only allows case insensitive alphanumeric characters, hyphens, and underscores.
   * This ensures option names are safe and conform to expected patterns.
   *
   * @param input - The option name string to validate
   * @returns `true` if the name is valid, otherwise `false`
   */
  private isValidName(input: string): boolean {
    return /^[a-z0-9][a-z0-9-_]*$/i.test(input);
  }

  /**
   * Returns the result of parsing as a structured object.
   *
   * The result includes:
   * - `options`: an object mapping option names to their values or flags.
   * - `commands`: an array of positional commands before any option.
   * - `errors`: an array of arguments that failed parsing or validation.
   *
   * @returns A `ParserResult` object summarising the parsed data
   */
  public getResult(): ParserResult {
    return {
      options: this.parsedOptions,
      commands: this.parsedCommands,
      errors: this.parsingErrors,
    };
  }
}
