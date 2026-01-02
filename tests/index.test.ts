import * as reExports from '@src/index';
import * as ansi from '@lib/ansi';
import * as animator from '@lib/output/animator';
import * as menu from '@lib/output/menu';
import * as parser from '@src/lib/input/parser';
import * as program from '@lib/input/program';
import * as prompt from '@lib/input/prompt';
import * as validators from '@lib/validators';

describe('Re-exported modules', () => {
  test('exports ansi module correctly', () => {
    expect(reExports).toHaveProperty('Ansi');
    expect(reExports.Ansi).toBe(ansi.Ansi);
  });

  test('exports animator module correctly', () => {
    expect(reExports).toHaveProperty('Animator');
    expect(reExports.Animator).toBe(animator.Animator);
  });

  test('exports menu module correctly', () => {
    expect(reExports).toHaveProperty('Menu');
    expect(reExports.Menu).toBe(menu.Menu);
  });

  test('exports parser module correctly', () => {
    expect(reExports).toHaveProperty('Parser');
    expect(reExports.Parser).toBe(parser.Parser);
  });

  test('exports program module correctly', () => {
    expect(reExports).toHaveProperty('Program');
    expect(reExports.Program).toBe(program.Program);
  });

  test('exports prompt module correctly', () => {
    expect(reExports).toHaveProperty('Prompt');
    expect(reExports.Prompt).toBe(prompt.Prompt);
  });

  test('exports validators namespace correctly', () => {
    expect(reExports).toHaveProperty('validators');
    expect(reExports.validators).toBe(validators);
  });
});
