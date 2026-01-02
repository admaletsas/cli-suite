import { Program } from '@lib/input/program';
import { Parser } from '@lib/input/parser';
import { runValidators } from '@lib/utils';

// Mock runValidators to control validation behaviour in tests
jest.mock('@lib/utils', () => ({
  runValidators: jest.fn(),
}));

describe('Program', () => {
  let program: Program;
  let mockParser: jest.Mocked<Parser>;

  beforeEach(() => {
    // Create a mocked Parser instance with getResult method
    mockParser = {
      getResult: jest.fn(),
    } as unknown as jest.Mocked<Parser>;

    program = new Program(mockParser);
    (runValidators as jest.Mock).mockReset();
  });

  test('registers commands and options correctly', () => {
    const command = { name: 'start', action: jest.fn() };
    const option = { short: 'v', long: 'verbose', action: jest.fn() };

    program.command(command);
    program.option(option);

    expect(program.getRegisteredCommands()).toContain(command);
    expect(program.getRegisteredOptions()).toContain(option);
  });

  test('parses and executes known command and option actions', async () => {
    const commandAction = jest.fn();
    const optionAction = jest.fn();

    program.command({ name: 'run', action: commandAction });
    program.option({ short: 'f', long: 'file', action: optionAction });

    mockParser.getResult.mockReturnValue({
      commands: ['run', 'subcmd'],
      options: { f: 'test.txt' },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const hasValidationErrors = await program.parse();

    expect(commandAction).toHaveBeenCalledWith(['subcmd']);
    expect(optionAction).toHaveBeenCalledWith('test.txt');
    expect(hasValidationErrors).toBe(false);
    expect(program.getParsingErrors()).toEqual([]);
    expect(program.getUnexpectedErrors()).toEqual([]);
    expect(program.getValidationErrors()).toEqual({});
  });

  test('records parsing errors from parser', async () => {
    mockParser.getResult.mockReturnValue({
      commands: [],
      options: {},
      errors: ['error1', 'error2'],
    });

    const result = await program.parse();

    expect(result).toBe(false);
    expect(program.getParsingErrors()).toEqual(['error1', 'error2']);
  });

  test('records unexpected error for unknown command', async () => {
    mockParser.getResult.mockReturnValue({
      commands: ['unknown'],
      options: {},
      errors: [],
    });

    const result = await program.parse();

    expect(result).toBe(false);
    expect(program.getUnexpectedErrors()).toEqual(['unknown']);
  });

  test('records unexpected error for unknown option', async () => {
    program.command({ name: 'cmd', action: jest.fn() });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: { unknown: true },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const result = await program.parse();

    expect(result).toBe(false);
    expect(program.getUnexpectedErrors()).toEqual(['unknown']);
  });

  test('validates option values and records validation errors', async () => {
    const optionAction = jest.fn();
    program.command({ name: 'cmd', action: jest.fn() });
    program.option({
      short: 'o',
      long: 'opt',
      action: optionAction,
      validators: [{ validate: jest.fn(), message: '' }],
    });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: { o: 'badvalue' },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue(['Invalid value']);

    const result = await program.parse();

    expect(result).toBe(true);
    expect(program.getValidationErrors()).toEqual({ o: 'Invalid value' });
    expect(optionAction).not.toHaveBeenCalled();
  });

  test('does not validate boolean option values', async () => {
    const optionAction = jest.fn();
    program.command({ name: 'cmd', action: jest.fn() });
    program.option({
      short: 'b',
      long: 'bool',
      action: optionAction,
      validators: [{ validate: jest.fn(), message: '' }],
    });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: { b: true },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const result = await program.parse();

    expect(result).toBe(false);
    expect(optionAction).toHaveBeenCalledWith(true);
  });

  test('executes default value actions for options not provided', async () => {
    const optionAction = jest.fn();
    program.command({ name: 'cmd', action: jest.fn() });
    program.option({
      short: 'd',
      long: 'default',
      action: optionAction,
      defaultValue: 'defaultVal',
    });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: {},
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const result = await program.parse();

    expect(result).toBe(false);
    expect(optionAction).toHaveBeenCalledWith('defaultVal');
  });

  test('does not execute default action if option provided', async () => {
    const optionAction = jest.fn();
    program.command({ name: 'cmd', action: jest.fn() });
    program.option({
      short: 'd',
      long: 'default',
      action: optionAction,
      defaultValue: 'defaultVal',
    });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: { d: 'providedVal' },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const result = await program.parse();

    expect(result).toBe(false);
    expect(optionAction).toHaveBeenCalledWith('providedVal');
  });

  test('handles multiple options with shared configuration (short and long)', async () => {
    const optionAction = jest.fn();
    program.command({ name: 'cmd', action: jest.fn() });
    program.option({
      short: 's',
      long: 'long',
      action: optionAction,
    });

    mockParser.getResult.mockReturnValue({
      commands: ['cmd'],
      options: { s: true, long: true },
      errors: [],
    });

    (runValidators as jest.Mock).mockResolvedValue([]);

    const result = await program.parse();

    expect(result).toBe(false);
    expect(optionAction).toHaveBeenCalledTimes(1);
    expect(optionAction).toHaveBeenCalledWith(true);
  });

  test('getRegisteredCommands returns all registered commands', () => {
    const cmd1 = { name: 'cmd1', action: jest.fn() };
    const cmd2 = { name: 'cmd2', action: jest.fn() };
    program.command(cmd1).command(cmd2);

    const commands = program.getRegisteredCommands();
    expect(commands).toContain(cmd1);
    expect(commands).toContain(cmd2);
  });

  test('getRegisteredOptions returns all registered options', () => {
    const opt1 = { short: 'a', action: jest.fn() };
    const opt2 = { long: 'beta', action: jest.fn() };
    program.option(opt1).option(opt2);

    const options = program.getRegisteredOptions();
    expect(options).toContain(opt1);
    expect(options).toContain(opt2);
  });
});
