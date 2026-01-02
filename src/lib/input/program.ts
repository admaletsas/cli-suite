import { ArgOptions, CommandOptions, ParserResult } from 'types';
import { Parser } from './parser';
import { runValidators } from '../utils';

/**
 * Manages commands, options, and their execution logic.
 * It uses a Parser instance to parse command-line arguments, then matches
 * parsed commands and options against registered definitions.
 *
 * Supported features include:
 * - Registering commands with associated actions.
 * - Registering options with short and/or long names, validators, default values, and actions.
 * - Parsing arguments and executing corresponding command and option actions.
 * - Collecting parsing, unexpected, and validation errors.
 */
export class Program {
  // Map of option keys (short or long) to their configuration and handlers
  private options: Map<string, ArgOptions> = new Map();

  // Map of command names to their configuration and handlers
  private commands: Map<string, CommandOptions> = new Map();

  // List of errors encountered during parsing
  private parsingErrors: string[] = [];

  // List of unexpected errors such as unknown commands or options
  private unexpectedErrors: string[] = [];

  // Map of option names to validation error messages
  private validationErrors: Record<string, string> = {};

  /**
   * Constructs a Program instance with an optional Parser.
   * Defaults to a new Parser instance if none provided.
   *
   * @param parser - Parser instance to use for argument parsing
   */
  constructor(private parser: Parser = new Parser()) {}

  /**
   * Registers a command with its options and action callback.
   *
   * @param options - CommandOptions object defining the command
   * @returns The Program instance for chaining
   */
  public command(options: CommandOptions): Program {
    this.commands.set(options.name, options);
    return this;
  }

  /**
   * Registers an option with its configuration.
   * Supports both short and long option keys.
   *
   * @param options - ArgOptions object defining the option
   * @returns The Program instance for chaining
   */
  public option(options: ArgOptions): Program {
    if (options.short) this.options.set(options.short, options);
    if (options.long) this.options.set(options.long, options);
    return this;
  }

  /**
   * Parses the command-line arguments using the internal Parser,
   * then executes the matched command and option actions.
   *
   * The method:
   * - Retrieves parsed commands, options, and errors from the parser.
   * - Executes the command's action with subcommands/values as arguments.
   * - Validates option values using registered validators.
   * - Executes option actions with their values.
   * - Applies default values for options not provided.
   *
   * @returns A Promise resolving to `true` if there were validation errors, otherwise `false`
   */
  public async parse(): Promise<boolean> {
    const { options, commands, errors } = this.parser.getResult();

    // Record parsing errors from the parser
    this.parsingErrors.push(...errors);

    const command = this.commands.get(commands[0]);
    if (!command) {
      // Unknown command, record as unexpected error
      this.unexpectedErrors.push(commands.join(' '));
    } else {
      // Execute the command's action with subcommands/values
      command.action(commands.slice(1));
    }

    // Store each processed option to avoid processing it again
    const processedOptions: ArgOptions[] = [];

    // Process each parsed option
    for (const [key, value] of Object.entries(options as ParserResult['options'])) {
      const option = this.options.get(key);
      if (!option) {
        // Unknown option, record as unexpected error
        this.unexpectedErrors.push(key);
        continue;
      }

      if (processedOptions.includes(option)) continue;
      processedOptions.push(option);

      // Validate option value if validators are defined
      if (option.validators) {
        const errors = await runValidators(
          typeof value === 'boolean' ? '' : value,
          option.validators
        );

        if (errors.length > 0) {
          this.validationErrors[key] = errors.join('\n');
          break;
        }
      }

      // Execute the option's action callback with the value
      option.action(value);
    }

    // Apply default values for options not provided
    for (const option of this.options.values()) {
      const hasShort = option.short && options.hasOwnProperty(option.short);
      const hasLong = option.long && options.hasOwnProperty(option.long);

      if (!hasShort && !hasLong && option.defaultValue !== undefined) {
        if (processedOptions.includes(option)) continue;
        processedOptions.push(option);
        option.action(option.defaultValue);
      }
    }

    // Return true if there were validation errors, otherwise false
    return Object.keys(this.validationErrors).length > 0;
  }

  /**
   * Retrieves the list of parsing errors encountered during argument parsing.
   *
   * @returns Array of parsing error strings
   */
  public getParsingErrors(): string[] {
    return this.parsingErrors;
  }

  /**
   * Retrieves the list of unexpected errors such as unknown commands or options.
   *
   * @returns Array of unexpected error strings
   */
  public getUnexpectedErrors(): string[] {
    return this.unexpectedErrors;
  }

  /**
   * Retrieves the validation errors for options that failed validation.
   *
   * @returns Object mapping option names to validation error messages
   */
  public getValidationErrors(): Record<string, string> {
    return this.validationErrors;
  }

  /**
   * Retrieves all registered commands.
   *
   * @returns Array of CommandOptions
   */
  public getRegisteredCommands(): CommandOptions[] {
    return [...this.commands.values()];
  }

  /**
   * Retrieves all registered options.
   *
   * @returns Array of ArgOptions
   */
  public getRegisteredOptions(): ArgOptions[] {
    return [...new Set(this.options.values())];
  }
}
