# cli-suite

![cli-suite logo](./docs/logo.svg)

[![npm version](https://img.shields.io/npm/v/cli-suite?style=flat-square)](https://www.npmjs.com/package/cli-suite)
[![Bundle Size](https://img.shields.io/bundlejs/size/cli-suite?style=flat-square)](https://www.npmjs.com/package/cli-suite)
[![Issues](https://img.shields.io/github/issues/admaletsas/cli-suite?style=flat-square)](https://github.com/admaletsas/cli-suite/issues)
[![Downloads](https://img.shields.io/npm/dm/cli-suite?style=flat-square)](https://www.npmjs.com/package/cli-suite)
[![License](https://img.shields.io/github/license/admaletsas/cli-suite?style=flat-square)](LICENSE)

A modular, extensible TypeScript library for building interactive CLI applications featuring advanced command and argument parsing, input prompts, validation, text styling, data formatting, and animated console visuals.

<br/>

## Table of Contents

- [Features](#features)
- [Future Planning](#future-planning)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

<br />

## Features

- **Commands**
  - Define and register commands with names and descriptions
  - Nested subcommands for complex CLI structures
  - Combine commands with options and arguments

- **Command-line Argument Parsing**
  - Supports short (`-f`) and long (`--flag`) options
  - Handles combined short flags (`-abc`)
  - Supports default values and validation
  - Callback execution on parsed arguments
  - Parsing and validation error reporting

- **User Input Prompts**
  - Static prompts with validation and default values
  - Confirmation prompts (`yes/no`)
  - Interactive single and multiple selection menus with keyboard navigation
  - Customizable styling and colors for prompts

- **Validation**
  - Built-in validators for common use cases
  - Support for synchronous and asynchronous validation
  - Integration with user input prompts and argument parsing
  - Validation error reporting with user-friendly messages and retry options

- **Text Styling and Coloring**
  - ANSI escape code based text styling
  - Supports basic 16 colors, 256-color mode, and 24-bit RGB true color
  - Multiple text styles (bold, italic, underline, etc.)
  - Automatic detection of terminal color support

- **Console Animations**
  - Spinner animation with optional progress and description
  - Progress bar with configurable length and styling
  - Easy integration with async tasks reporting progress

- **Data Formatting**
  - **Table**: Display tabular data in the CLI with configurable columns, alignment, padding, and optional borders. Supports Unicode and dynamic column widths.
  - **List**: Render ordered or unordered lists with configurable bullet characters, indentation, and optional styling for bullets/numbers and list items.

---

<br />

## Future Planning

- Integration of ANSI styling across all classes/modules
- Support for global and per-component theming to maintain consistent appearance
- Support for plugin architecture to extend the library

---

<br />

## Installation

```bash
npm install cli-suite
```

---

<br />

## API Reference

For detailed API documentation and usage examples, please see the [API_REFERENCE.md](./docs/API_REFERENCE.md).

---

<br />

## Contributing

Contributions are welcome! See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details.

---

<br/>

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---
