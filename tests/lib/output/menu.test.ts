import { Menu } from '@lib/output/menu';
import { ArgOptions, CommandOptions, MenuOptions } from 'types';

describe('Menu', () => {
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  function getWriteCalls() {
    return writeSpy.mock.calls.map((args) => args[0]).join('');
  }

  const sampleArgOptions: ArgOptions[] = [
    {
      short: 'h',
      long: 'help',
      description: 'Show help',
      defaultValue: undefined,
      action: () => {},
    },
    {
      short: 'v',
      long: 'verbose',
      description: 'Verbose output',
      defaultValue: 'false',
      action: () => {},
    },
    {
      short: undefined,
      long: 'config',
      description: 'Config file',
      defaultValue: 'config.json',
      action: () => {},
    },
  ];

  const sampleCommandOptions: CommandOptions[] = [
    { name: 'start', description: 'Start the app', action: jest.fn() },
    { name: 'stop', description: 'Stop the app', action: jest.fn() },
    { name: 'restart', description: undefined, action: jest.fn() },
  ];

  test('prints full menu with all sections', () => {
    const options: MenuOptions = {
      appName: 'MyApp',
      appVersion: '1.0.0',
      appDescription: 'This is a sample app',
      usageText: 'myapp [options] <command>',
      headerText: '=== HEADER ===',
      footerText: '=== FOOTER ===',
      argOptions: sampleArgOptions,
      commandOptions: sampleCommandOptions,
      indentSpaces: 4,
      optionsLabel: 'Available Options:',
      commandsLabel: 'Available Commands:',
    };

    const printer = new Menu(options);
    printer.print();

    const output = getWriteCalls();

    // Check header
    expect(output).toContain('=== HEADER ===');
    // Check app name and version
    expect(output).toContain('MyApp 1.0.0');
    // Check app description
    expect(output).toContain('This is a sample app');
    // Check usage with indentation (4 spaces)
    expect(output).toMatch(new RegExp(`Usage:\\n {4}myapp \\[options\\] \\<command\\>`));
    // Check options label
    expect(output).toContain('Available Options:');
    // Check options flags and descriptions aligned
    expect(output).toMatch(new RegExp(` {4}-h, --help {4,}Show help`));
    expect(output).toMatch(new RegExp(` {4}-v, --verbose {4,}Verbose output \\(default: false\\)`));
    expect(output).toMatch(new RegExp(` {4}--config {4,}Config file \\(default: config\\.json\\)`));
    // Check commands label
    expect(output).toContain('Available Commands:');
    // Check commands aligned
    expect(output).toMatch(new RegExp(` {4}start {4,}Start the app`));
    expect(output).toMatch(new RegExp(` {4}stop {4,}Stop the app`));
    expect(output).toMatch(new RegExp(` {4}restart {4,}\\(no description\\)`));
    // Check footer
    expect(output).toContain('=== FOOTER ===');
    // Check final newline
    expect(output.endsWith('\n')).toBe(true);
  });

  test('prints fallback messages when no options or commands', () => {
    const options: MenuOptions = {
      appName: 'App',
      appVersion: '0.1',
      usageText: 'app',
      argOptions: [],
      commandOptions: [],
    };

    const printer = new Menu(options);
    printer.print();

    const output = getWriteCalls();

    expect(output).toContain('(no options available)');
    expect(output).toContain('(no commands available)');
  });

  test('uses default indentSpaces and labels if not provided', () => {
    const options: MenuOptions = {
      appName: 'App',
      appVersion: '0.1',
      usageText: 'app',
      argOptions: sampleArgOptions,
      commandOptions: sampleCommandOptions,
    };

    const printer = new Menu(options);
    printer.print();

    const output = getWriteCalls();

    // Default indentSpaces is 2, so check indentation accordingly
    expect(output).toMatch(new RegExp(` {2}-h, --help`));
    expect(output).toMatch(new RegExp(` {2}start`));
    expect(output).toContain('Options:');
    expect(output).toContain('Commands:');
  });

  test('printArgsList aligns flags correctly with varying lengths', () => {
    const options: MenuOptions = {
      appName: 'App',
      appVersion: '0.1',
      usageText: 'app',
      argOptions: [
        { short: 'a', long: 'alpha', description: 'Alpha option', action: () => {} },
        { short: 'b', long: 'beta-longer', description: 'Beta option', action: () => {} },
        { short: undefined, long: 'gamma', description: 'Gamma option', action: () => {} },
      ],
      commandOptions: [],
    };

    const printer = new Menu(options);
    printer.print();

    const output = getWriteCalls();

    // The longest flag string is '-b, --beta-longer' (length 16)
    // So shorter flags should be padded to align descriptions
    const lines = output
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('--'));

    // Check that all flag parts have same length before description
    const flagLengths = lines.map((line) =>
      line.indexOf('Alpha option') !== -1
        ? line.indexOf('Alpha option')
        : line.indexOf('Beta option') !== -1
          ? line.indexOf('Beta option')
          : line.indexOf('Gamma option') !== -1
            ? line.indexOf('Gamma option')
            : -1
    );

    // All flagLengths should be equal
    expect(new Set(flagLengths).size).toBe(1);
  });

  test('printCommandsList aligns command names correctly', () => {
    const options: MenuOptions = {
      appName: 'App',
      appVersion: '0.1',
      usageText: 'app',
      argOptions: [],
      commandOptions: [
        { name: 'short', description: 'Short command', action: jest.fn() },
        { name: 'longercommand', description: 'Longer command', action: jest.fn() },
        { name: 'mid', description: undefined, action: jest.fn() },
      ],
    };

    const printer = new Menu(options);
    printer.print();

    const output = getWriteCalls();

    const lines = output
      .split('\n')
      .filter(
        (line) =>
          line.trim().startsWith('short') ||
          line.trim().startsWith('longercommand') ||
          line.trim().startsWith('mid')
      );

    // Check padding aligns descriptions
    const descPositions = lines.map((line) =>
      line.indexOf('Short command') !== -1
        ? line.indexOf('Short command')
        : line.indexOf('Longer command') !== -1
          ? line.indexOf('Longer command')
          : line.indexOf('(no description)') !== -1
            ? line.indexOf('(no description)')
            : -1
    );

    expect(new Set(descPositions).size).toBe(1);
  });
});
