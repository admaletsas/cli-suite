import { Parser } from '@lib/input/parser';

describe('Parser', () => {
  function parseArgs(args: string[]) {
    const parser = new Parser(['node', 'script.js', ...args]);
    return parser.getResult();
  }

  test('parses multiple positional commands correctly', () => {
    const result = parseArgs(['run', 'build']);
    expect(result.commands).toEqual(['run', 'build']);
    expect(result.options).toEqual({});
    expect(result.errors).toEqual([]);
  });

  test('parses multiple long boolean options without values', () => {
    const result = parseArgs(['--verbose', '--debug']);
    expect(result.options).toEqual({ verbose: true, debug: true });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses multiple long options with inline values using equals sign', () => {
    const result = parseArgs(['--output=file.txt', '--mode=production']);
    expect(result.options).toEqual({ output: 'file.txt', mode: 'production' });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses long options with separate value arguments', () => {
    const result = parseArgs(['--output', 'file.txt']);
    expect(result.options).toEqual({ output: 'file.txt' });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses long options followed by multiple values as array', () => {
    const result = parseArgs(['--include', 'src', 'tests']);
    expect(result.options).toEqual({ include: ['src', 'tests'] });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses multiple short boolean flags correctly', () => {
    const result = parseArgs(['-f', '-v']);
    expect(result.options).toEqual({ f: true, v: true });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses short options with separate single values', () => {
    const result = parseArgs(['-f', 'file.txt', '-o', 'output.log']);
    expect(result.options).toEqual({ f: 'file.txt', o: 'output.log' });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses short options followed by multiple values as array', () => {
    const result = parseArgs(['-f', 'val1', 'val2']);
    expect(result.options).toEqual({ f: ['val1', 'val2'] });
    expect(result.errors).toEqual([]);
  });

  test('parses combined short flags as individual boolean options', () => {
    const result = parseArgs(['-abc']);
    expect(result.options).toEqual({ a: true, b: true, c: true });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses combined short flags with last flag having a value', () => {
    const result = parseArgs(['-abc', 'value']);
    expect(result.options).toEqual({ a: true, b: true, c: 'value' });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses mixed positional commands and options correctly', () => {
    const result = parseArgs(['run', 'build', '--verbose', '-o', 'file.txt']);
    expect(result.commands).toEqual(['run', 'build']);
    expect(result.options).toEqual({ verbose: true, o: 'file.txt' });
    expect(result.errors).toEqual([]);
  });

  test('detects invalid long and short option names as errors', () => {
    const result = parseArgs(['--invalid*name', '--a', '-@']);
    expect(result.errors).toEqual(['--invalid*name', '--a', '-@']);
    expect(result.commands).toEqual([]);
    expect(result.options).toEqual({});
  });

  test('detects invalid long option consisting of only double dash', () => {
    const result = parseArgs(['--']);
    expect(result.errors).toEqual(['--']);
    expect(result.commands).toEqual([]);
    expect(result.options).toEqual({});
  });

  test('detects invalid short option consisting of only single dash', () => {
    const result = parseArgs(['-']);
    expect(result.errors).toEqual(['-']);
    expect(result.commands).toEqual([]);
    expect(result.options).toEqual({});
  });

  test('detects invalid options with triple dash prefix', () => {
    const result = parseArgs(['---triple-dash']);
    expect(result.errors).toEqual(['---triple-dash']);
    expect(result.commands).toEqual([]);
    expect(result.options).toEqual({});
  });

  test('handles empty input with no commands or options', () => {
    const result = parseArgs([]);
    expect(result.commands).toEqual([]);
    expect(result.options).toEqual({});
    expect(result.errors).toEqual([]);
  });

  test('parses long option with empty string value', () => {
    const result = parseArgs(['--key=']);
    expect(result.options).toEqual({ key: '' });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses long option with multiple values followed by another option', () => {
    const result = parseArgs(['--files', 'file1.txt', 'file2.txt', '--verbose']);
    expect(result.options).toEqual({ files: ['file1.txt', 'file2.txt'], verbose: true });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses combined short flags followed by multiple values for last flag', () => {
    const result = parseArgs(['-xyz', 'val1', 'val2']);
    expect(result.options).toEqual({ x: true, y: true, z: ['val1', 'val2'] });
    expect(result.commands).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test('parses long option names containing underscores and hyphens', () => {
    const result = parseArgs(['--my_option-name', 'value']);
    expect(result.options).toEqual({ 'my_option-name': 'value' });
    expect(result.errors).toEqual([]);
  });

  test('parses positional commands and reports invalid option errors', () => {
    const result = parseArgs(['run', 'build', '--a']);
    expect(result.commands).toEqual(['run', 'build']);
    expect(result.errors).toEqual(['--a']);
  });
});
