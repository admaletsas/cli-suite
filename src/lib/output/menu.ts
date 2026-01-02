import { MenuOptions, ArgOptions, CommandOptions } from 'types';

/**
 * Prints formatted CLI menu information including application details,
 * usage instructions, options, and commands.
 */
export class Menu {
  private options: MenuOptions; // Configuration options for the menu
  private indentSpaces: number; // Number of spaces used for indentation
  private indent: string; // Indentation string (spaces)
  private optionsLabel: string; // Label for the options section
  private commandsLabel: string; // Label for the commands section

  /**
   * Constructs a Menu instance with provided menu options.
   * Sets default values for indentation and section labels if not provided.
   *
   * @param options - MenuOptions object containing menu configuration and content
   */
  constructor(options: MenuOptions) {
    this.options = options;
    this.indentSpaces = options.indentSpaces ?? 2; // Default indent to 2 spaces
    this.indent = ' '.repeat(this.indentSpaces);
    this.optionsLabel = options.optionsLabel ?? 'Options:';
    this.commandsLabel = options.commandsLabel ?? 'Commands:';
  }

  /**
   * Prints the entire menu to the console, including header, app info,
   * usage instructions, options, commands, and footer.
   */
  public print(): void {
    const {
      appName,
      appVersion,
      appDescription,
      usageText,
      headerText,
      footerText,
      argOptions,
      commandOptions,
    } = this.options;

    // Print optional header text if provided
    if (headerText) process.stdout.write(`\n${headerText}\n\n`);

    // Print application name and version
    process.stdout.write(`${appName} ${appVersion}\n\n`);

    // Print optional application description if provided
    if (appDescription) process.stdout.write(`${appDescription}\n\n`);

    // Print usage instructions with indentation
    process.stdout.write(`Usage:\n${this.indent}${usageText}\n\n`);

    // Print options label and list of argument options or fallback message
    process.stdout.write(`${this.optionsLabel}\n`);
    if (argOptions && argOptions.length > 0) {
      this.printArgsList(argOptions);
    } else {
      process.stdout.write(`${this.indent}(no options available)\n`);
    }

    // Print commands label and list of commands or fallback message
    process.stdout.write(`${this.commandsLabel}\n`);
    if (commandOptions && commandOptions.length > 0) {
      this.printCommandsList(commandOptions);
    } else {
      process.stdout.write(`${this.indent}(no commands available)\n`);
    }

    // Print optional footer text if provided
    if (footerText) process.stdout.write(`\n${footerText}\n`);

    // Add a final newline for spacing after menu
    process.stdout.write('\n');
  }

  /**
   * Prints a formatted list of argument options with aligned flags and descriptions.
   *
   * @param argList - Array of argument options to print
   */
  private printArgsList(argList: ArgOptions[]): void {
    if (argList.length === 0) return;

    // Create flag strings like "-s, --long" for each argument option
    const flagStrings = argList.map(({ short, long }) =>
      [short ? `-${short}` : '', long ? `--${long}` : ''].filter(Boolean).join(', ')
    );

    // Calculate max length of flag strings for alignment
    const maxFlagLength = Math.max(...flagStrings.map((f) => f.length));

    // Print each argument option with padded flags and description
    argList.forEach(({ short, long, description, defaultValue }) => {
      const flags = [short ? `-${short}` : '', long ? `--${long}` : ''].filter(Boolean).join(', ');

      // Pad flags to max length plus indentSpaces to align descriptions
      const paddedFlags = flags.padEnd(maxFlagLength + this.indentSpaces, ' ');

      // Build description parts, including default value if provided
      const descParts: string[] = [];
      descParts.push(description ?? '(no description)');

      if (defaultValue !== undefined) {
        descParts.push(`(default: ${defaultValue})`);
      }

      const descText = descParts.join(' ');

      // Write the formatted argument option line with indentation
      process.stdout.write(`${this.indent}${paddedFlags}${descText}\n`);
    });
  }

  /**
   * Prints a formatted list of command options with aligned command names and descriptions.
   *
   * @param commandsList - Array of command options to print
   */
  private printCommandsList(commandsList: CommandOptions[]): void {
    if (commandsList.length === 0) return;

    // Calculate max length of command names for alignment
    const maxCommandLength = Math.max(...commandsList.map((cmd) => cmd.name.length));

    // Print each command with padded name and description
    commandsList.forEach(({ name, description }) => {
      // Pad command name to max length plus indentSpaces to align descriptions
      const paddedName = name.padEnd(maxCommandLength + this.indentSpaces, ' ');

      // Use provided description or fallback text
      const descText = description ?? '(no description)';

      // Write the formatted command line with indentation
      process.stdout.write(`${this.indent}${paddedName}${descText}\n`);
    });
  }
}
