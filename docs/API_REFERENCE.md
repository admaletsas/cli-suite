# API Reference

![cli-suite logo](logo.svg)

This library provides a comprehensive set of tools for building command-line interfaces with features including command parsing, argument parsing, user prompts, validation, text styling, data formatting, and console animations.

<br/>

## Table of Contents

- [Classes](#classes)
  - [Animator](#animator)
  - [Ansi](#ansi)
  - [Menu](#menu)
  - [Parser](#parser)
  - [Program](#program)
  - [Prompt](#prompt)
  - [Table](#table)
  - [List](#list)
  - [Validators](#validators)

- [Types](#types)
  - [Animation Types](#animation-types)
  - [Color and Text Styling Types](#color-and-text-styling-types)
  - [Menu and CLI Argument Types](#menu-and-cli-argument-types)
  - [Command and Option Configuration Types](#command-and-option-configuration-types)
  - [Prompt Types](#prompt-types)
  - [Table Types](#table-types)
  - [List Types](#list-types)
  - [Validator Types](#validator-types)

- [Examples](#examples)
  - [Defining Commands and Options with `Program`](#defining-commands-and-options-with-program)
  - [Parsing Arguments with `Parser`](#parsing-arguments-with-parser)
  - [Displaying a CLI Menu with `Menu`](#displaying-a-cli-menu-with-menu)
  - [Styling Text with `Ansi`](#styling-text-with-ansi)
  - [Running Console Animations with `Animator`](#running-console-animations-with-animator)
  - [Prompting User Input with `Prompt`](#prompting-user-input-with-prompt)
  - [Displaying Data In a `Table`](#displaying-data-in-a-table)
  - [Displaying Data In a `List`](#displaying-data-in-a-list)
  - [Creating Custom Validators](#creating-custom-validators)

---

<br />

## Classes

### `Animator`

Provides console animations such as spinners and progress bars to visually indicate progress of asynchronous tasks.

- **Constructor**: `new Animator(ansi?: Ansi)`
- **Methods**:
  - `runTaskWithAnimation(task, animationType, options?)`: Runs an async task while displaying a spinner or progress bar animation.

---

### `Ansi`

Provides methods to apply ANSI color and style codes to text for terminal output, supporting basic, 256-color, and true color modes.

- **Static Codes**: ANSI escape codes for reset, styles, and colors.
- **Constructor**: Detects terminal color support.
- **Methods**:
  - `applyCodes(text, options)`: Applies color and style codes to text.

---

### `Menu`

Prints formatted CLI menu information including application details, usage instructions, options, and commands.

- **Constructor**: `new Menu(options)`
- **Methods**:
  - `print()`: Prints the entire menu to the console.

---

### `Parser`

Processes command-line arguments, extracting positional commands, options (short and long), and parsing errors.

- **Constructor**: `new Parser(argv?)` (defaults to `process.argv`)
- **Methods**:
  - `getResult()`: Returns parsed options, commands, and errors.

---

### `Program`

Manages commands, options, and their execution logic. Uses `Parser` to parse CLI arguments and matches them against registered commands and options.

- **Constructor**: `new Program(parser?)`
- **Methods**:
  - `command(options)`: Registers a command.
  - `option(options)`: Registers an option.
  - `parse()`: Parses arguments, executes command and option actions, validates inputs.
  - `getParsingErrors()`: Returns parsing errors.
  - `getUnexpectedErrors()`: Returns unknown commands or options.
  - `getValidationErrors()`: Returns validation errors.
  - `getRegisteredCommands()`: Returns all registered commands.
  - `getRegisteredOptions()`: Returns all registered options.

---

### `Prompt`

Provides synchronous and interactive user input prompts in the console, supporting validation, default values, confirmation, and selection menus.

- **Constructor**: `new Prompt(ansi?)`
- **Methods**:
  - `input(message, options?)`: Prompts for text input with optional validation and default value. Repeats until valid input.
  - `confirm(message)`: Prompts for yes/no confirmation; accepts 'y'/'yes' or 'n'/'no'.
  - `pause(message?)`: Prompts user to press Enter to continue.
  - `password(message, options?)`: Prompts for password (masked) input with optional validation and default value. Repeats until valid input.
  - `select(message, choices, isRequired?, activeOption?)`: Interactive single-choice selection menu.
  - `selectMultiple(message, choices, isRequired?, activeOption?)`: Interactive multiple-choice selection menu.

---

### `Table`

Provides a way to display tabular data in the CLI with configurable columns, alignment, padding, and optional borders. It supports Unicode characters and dynamic column width calculation.

- **Constructor**: `new Table(options)`
- **Methods**:
  - `print()`: Prints the formatted table to the standard output.

---

### `List`

Renders ordered or unordered lists in the CLI with configurable bullet characters, indentation, and optional styling for bullets/numbers and list items.

- **Constructor**: `new List(options)`
- **Methods**:
  - `print()`: Prints the formatted list to the standard output.

---

### `Validators`

Collection of reusable validators for validating user input, supporting single strings or arrays of strings, with customizable error messages.

- **Date Validators**
  - `isDate(params?)`: Validates input as a valid date string.
  - `isDateBefore(params)`: Validates input date is before a specified date.
  - `isDateAfter(params)`: Validates input date is after a specified date.
  - `isDateInRange(params)`: Validates input date is within a specified inclusive range.
- **Filesystem Validators**
  - `fileExists(params?)`: Validates input path exists and is a file.
  - `directoryExists(params?)`: Validates input path exists and is a directory.
  - `isReadable(params?)`: Validates input path is readable.
  - `isWritable(params?)`: Validates input path is writable.
- **List Validator**
  - `inList(params)`: Validates input is included in a predefined list of allowed values.
- **Number Validators**
  - `isNumber(params?)`: Validates input as a valid number.
  - `isNumberInRange(params)`: Validates input number is within a specified inclusive range.
- **Regex Validator**
  - `matchesRegex(params)`: Validates input matches a given regular expression pattern.
- **String Length Validators**
  - `minLength(params)`: Validates input length is at least a minimum number of characters.
  - `maxLength(params)`: Validates input length does not exceed a maximum number of characters.
  - `isLengthInRange(params)`: Validates input length is within a specified inclusive range.

---

<br />

## Types

### Animation Types

- **SpinnerOptions**
  - `description?: string`
  - `showProgress?: boolean`
  - `text?: TextOptions`
- **ProgressBarOptions**
  - `showProgress?: boolean`
  - `length?: number`
  - `fill?: TextOptions`
  - `empty?: TextOptions`
- **AnimationType**: `'spinner' | 'progressBar'`
- **AnimationOptions**: `SpinnerOptions | ProgressBarOptions`

---

### Color and Text Styling Types

- **BasicColor**
  - `fg?: keyof typeof Ansi.Codes.BASIC_COLORS.fg`
  - `bg?: keyof typeof Ansi.Codes.BASIC_COLORS.bg`
- **Mode256Color**
  - `fg?: number`
  - `bg?: number`
- **TrueColor**
  - `fg?: [number, number, number]`
  - `bg?: [number, number, number]`
- **Color**
  - `fg?: BasicColor['fg'] | Mode256Color['fg'] | TrueColor['fg']`
  - `bg?: BasicColor['bg'] | Mode256Color['bg'] | TrueColor['bg']`
- **ColorSupport**
  - `hasBasic: boolean`
  - `has256: boolean`
  - `hasTrue: boolean`
- **ColorOptions**
  - `basic?: BasicColor`
  - `mode256?: Mode256Color`
  - `true?: TrueColor`
- **StyleOptions**
  - Keys of available text styles (e.g., `'bold'`, `'italic'`).
- **TextOptions**
  - `style?: StyleOptions | StyleOptions[]`
  - `color?: ColorOptions`

---

### Menu and CLI Argument Types

- **MenuOptions**
  - `appName: string`
  - `appVersion: string`
  - `appDescription?: string`
  - `usageText: string`
  - `headerText?: string`
  - `footerText?: string`
  - `indentSpaces?: number`
  - `optionsLabel?: string`
  - `commandsLabel?: string`
  - `argOptions?: ArgOptions[]`
  - `commandOptions?: CommandOptions[]`
- **ParserResult**
  - `options: Record<string, string | string[] | boolean>`
  - `commands: string[]`
  - `errors: string[]`

---

### Command and Option Configuration Types

- **ArgOptions**
  - `short?: string`
  - `long: string`
  - `description?: string`
  - `validators?: Validator[]`
  - `defaultValue?: string`
  - `action: (value: string | string[] | boolean) => void`
- **CommandOptions**
  - `name: string`
  - `description?: string`
  - `action: (value: string[]) => void`

---

### Prompt Types

- **InputOptions**
  - `validators?: Validator[]`
  - `defaultValue?: string`
  - `validateDefault?: boolean`
- **InteractivePromptMode**: `'single' | 'multiple'`
- **InteractivePromptChoice**
  - `label: string`
  - `value: string`

---

### Table Types

- **TableAlign**: `'left' | 'right' | 'center'`  
- **TableColumn**  
  - `header: string` — Column header text.  
  - `key: string` — Key to extract data from each row object.  
  - `align?: TableAlign` — Text alignment within the column. Defaults to `'left'`.  
  - `width?: number` — Fixed width of the column in characters. Optional.
- **TableOptions<T = Record<string, unknown>>**  
  - `columns: TableColumn[]` — Array of column definitions.  
  - `data: T[]` — Array of data objects representing rows.  
  - `border?: boolean` — Whether to render borders around the table. Defaults to `true`.  
  - `padding?: number` — Number of spaces to pad inside each cell. Defaults to `1`.

---

### List Types

- **StyleFunction**: `(text: string) => string`
- **ListOptions**  
  - `items: string[]` — Array of list item strings.  
  - `ordered?: boolean` — If `true`, renders an ordered (numbered) list. Defaults to `false`.  
  - `bulletChar?: string` — Character used as bullet for unordered lists. Defaults to `'•'`.  
  - `indent?: number` — Number of spaces to indent before bullet/number. Defaults to `2`.  
  - `style?: StyleFunction` — Styling function applied to bullet or number prefix. Optional.  
  - `itemStyle?: StyleFunction` — Styling function applied to list item text. Optional.

### Validator Types

- **Validator**
  - `validate: (input: string | string[]) => boolean | Promise<boolean>`
  - `message: string`

---

<br />

## Examples

### Defining Commands and Options with `Program`

```ts
import { Program, validators } from 'cli-suite';

const program = new Program();

program
  .command({
    name: 'run',
    description: 'Run project commands',
    action: (subcommands: string[]) => {
      const subcommand = subcommands[0];

      switch (subcommand) {
        case 'build':
          console.log('Building project...');
          break;
        case 'start':
          console.log('Running project...');
          break;
        case 'test':
          console.log('Testing project...');
          break;
        default:
          console.log(`Invalid command ${subcommand}`);
      }
    },
  })
  .option({
    short: 'v',
    long: 'verbose',
    description: 'Enable verbose output',
    action: (value) => console.log('Verbose mode:', value),
  })
  .option({
    short: 't',
    long: 'timeout',
    description: 'Timeout in seconds',
    validators: [validators.isNumberInRange({ min: 1, max: 300 })],
    defaultValue: '60',
    action: (value) => console.log('Timeout set to:', value),
  });

const hasValidationErrors = await program.parse();

if (hasValidationErrors) {
  console.error(program.getValidationErrors());
}
```

---

### Parsing Arguments with `Parser`

```ts
import { Parser } from 'cli-suite';

const argv = ['node', 'script.js', 'deploy', '--force', '-abc', '--d', '--timeout=120'];
const parser = new Parser(argv);

const result = parser.getResult();

console.log('Commands:', result.commands); // ['deploy']
console.log('Options:', result.options); // { force: true, a: true, b: true, c: true, timeout: '120' }
console.log('Errors:', result.errors); // ['--d]
```

---

### Displaying a CLI Menu with `Menu`

```ts
import { Program, Menu } from 'cli-suite';

const program = new Program();

// Define options and commands

const menu = new Menu({
  appName: 'MyApp',
  appVersion: '1.0.0',
  appDescription: 'A sample CLI application',
  usageText: 'myapp [command] [options]',
  argOptions: program.getRegisteredOptions(),
  commandOptions: program.getRegisteredCommands(),
});

menu.print();
```

---

### Styling Text with `Ansi`

```ts
import { Ansi } from 'cli-suite';

const ansi = new Ansi();

const styledText = ansi.applyCodes('Hello, World!', {
  style: ['bold', 'underline'],
  color: {
    basic: { fg: 'brightGreen', bg: 'white' },
    true: { fg: [19, 46, 60], bg: [255, 255, 255] },
  },
});

console.log(styledText);
```

---

### Running Console Animations with `Animator`

```ts
import { Animator } from 'cli-suite';

const animator = new Animator();

async function exampleTask(updateProgress: (progress: number) => void) {
  for (let i = 0; i <= 100; i += 10) {
    updateProgress(i);
    await new Promise((r) => setTimeout(r, 200));
  }
}

await animator.runTaskWithAnimation(exampleTask, 'spinner', {
  description: 'Processing',
  showProgress: true,
});

await animator.runTaskWithAnimation(exampleTask, 'progressBar', {
  showProgress: true,
});
```

---

### Prompting User Input with `Prompt`

```ts
import { Prompt, validators } from 'cli-suite';

const prompt = new Prompt();

const name = await prompt.input('Enter your name: ', {
  validators: [validators.minLength({ length: 3 })],
});

const pswd = await prompt.password('Enter your password: ', {
  validators: [
    validators.minLength({ length: 6, message: 'Password must be at least 6 characters\n' }),
  ],
});

console.log(`Hello, ${name}`);
console.log('Password entered:', pswd);

const confirmed = await prompt.confirm('Do you want to continue?');
if (!confirmed) {
  console.log('Exiting...)
  process.exit(0);  
}

const color = await prompt.select('Choose a color:', [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
]);

console.log('Selected color:', color);

await prompt.pause(); // Press Enter to continue

const features = await prompt.selectMultiple('Select features:', [
  { label: 'Feature A', value: 'a' },
  { label: 'Feature B', value: 'b' },
  { label: 'Feature C', value: 'c' },
]);

console.log('Selected features:', features);
```

---

### Displaying Data In a `Table`

```ts
import { Table } from 'cli-suite';

const table = new Table({
  columns: [
    { header: 'ID', key: 'id', align: 'right' },
    { header: 'Name', key: 'name', align: 'left' },
    { header: 'Score', key: 'score', align: 'center' },
  ],
  data: [
    { id: 1, name: 'Alice', score: 85 },
    { id: 2, name: 'Bob', score: 92 },
    { id: 3, name: 'Charlie', score: 78 },
  ],
  border: true,
  padding: 2,
});

table.print();

const unicodeTable = new Table({
  columns: [
    { header: 'Emoji', key: 'emoji', align: 'center' },
    { header: 'Name', key: 'name', align: 'left' },
    { header: 'Description', key: 'desc', align: 'right' },
  ],
  data: [
    { emoji: '😀', name: 'Grinning Face', desc: 'A happy face emoji' },
    { emoji: '🌍', name: 'Earth Globe', desc: 'Represents the world' },
    { emoji: '🍕', name: 'Pizza', desc: 'Delicious food' },
    { emoji: '汉字', name: 'Chinese Characters', desc: 'Multi-byte characters' },
    { emoji: '👍🏽', name: 'Thumbs Up', desc: 'Emoji with skin tone' },
  ],
  border: true,
  padding: 2,
});

unicodeTable.print();
```

---

### Displaying Data In a `List`

```ts
import { Ansi, List } from 'cli-suite';

const ansi = new Ansi();

const list = new List({
  items: ['Apple', 'Banana', 'Cherry'],
  ordered: false,
  indent: 4,
  bulletChar: '*',
  style: (text) => ansi.applyCodes(text, { color: { basic: { fg: 'yellow' } } }),
  itemStyle: (text) => ansi.applyCodes(text, { color: { basic: { fg: 'green' } } }),
});

list.print();
```

---

### Creating Custom Validators

```ts
import { Prompt } from 'cli-suite';

const prompt = new Prompt();

const customValidator = {
  validate: (input: string | string[]) => !Array.isArray(input) && input.length > 0,
  message: 'Error message',
};

function createDynamicValidator(min: number, max: number) {
  return {
    validate: (input: string | string[]) => {
      if (Array.isArray(input)) return false;

      const num = Number(input);
      if (Number.isNaN(num)) return false;

      return num >= min && num <= max;
    },
    message: `Number must be between ${min} and ${max}`,
  };
}

const name = await prompt.input('Enter your name: ', {
  validators: [customValidator, createDynamicValidator(1, 10)],
});
```

---
