import { Validator } from './validator';

/**
 * Configuration object for command-line options.
 *
 * Properties:
 * - At least one of `short` or `long` names must be defined.
 * - `description`: Optional string describing the option.
 * - `validators`: Optional array of Validator objects to validate the option's value.
 * - `defaultValue`: Optional default value to use if the option is not provided.
 * - `action`: Callback function executed when the option is parsed.
 *   Receives the option value, which can be a string, array of strings, or boolean:
 *     - string: single option value.
 *     - string[]: multiple values for options that accept multiple arguments.
 *     - boolean: flag option, true if present.
 */
export type ArgOptions = ({ short?: string; long: string } | { short: string; long?: string }) & {
  description?: string;
  validators?: Validator[];
  defaultValue?: string;
  action: (value: string | string[] | boolean) => void;
};

/**
 * Configuration object for commands.
 *
 * Properties:
 * - `name`: The command name.
 * - `description`: Optional string describing the command.
 * - `action`: Callback function executed when the command is invoked.
 *   Receives an array of strings representing subcommands and/or arguments.
 */
export type CommandOptions = {
  name: string;
  description?: string;
  action: (value: string[]) => void;
};
