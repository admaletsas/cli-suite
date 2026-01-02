import { ArgOptions, CommandOptions } from './program';

/**
 * Options for displaying a command-line arguments menu or help.
 *
 * Properties:
 * - `appName`: Application name.
 * - `appVersion`: Application version.
 * - `appDescription`: Optional application description.
 * - `usageText`: Usage string, e.g. 'node myapp [options] <file>'.
 * - `headerText`: Optional header text displayed before usage.
 * - `footerText`: Optional footer text displayed after options.
 * - `indentSpaces`: Optional number of spaces to indent flags, commands and descriptions (default 2).
 * - `optionsLabel`: Optional label for the options section header (default 'Options:').
 * - `commandsLabel`: Optional label for the commands section header (default 'Commands:').
 * - `argOptions`: Optional array of ArgOptions to list.
 * - `commandOptions`: Optional array of CommandOptions to list.
 */
export type MenuOptions = {
  appName: string;
  appVersion: string;
  appDescription?: string;
  usageText: string;
  headerText?: string;
  footerText?: string;
  indentSpaces?: number;
  optionsLabel?: string;
  commandsLabel?: string;
  argOptions?: ArgOptions[];
  commandOptions?: CommandOptions[];
};
