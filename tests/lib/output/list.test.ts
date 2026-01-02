import { List } from '@lib/output/list';

describe('List', () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  test('renders unordered list with default bullet and indent', () => {
    const list = new List({ items });
    const output = list['render']();

    // Should contain bullet character '•'
    expect(output).toContain('•');

    // Should indent by 2 spaces by default
    expect(output.startsWith('  •')).toBe(true);

    // Should contain all items
    items.forEach((item) => {
      expect(output).toContain(item);
    });
  });

  test('renders ordered list with numbers', () => {
    const list = new List({ items, ordered: true });
    const output = list['render']();

    // Should contain numbers 1., 2., 3.
    expect(output).toContain('1.');
    expect(output).toContain('2.');
    expect(output).toContain('3.');

    // Should contain all items
    items.forEach((item) => {
      expect(output).toContain(item);
    });
  });

  test('uses custom bullet character and indent', () => {
    const list = new List({ items, bulletChar: '*', indent: 4 });
    const output = list['render']();

    // Should contain custom bullet '*'
    expect(output).toContain('*');

    // Each line should start with 4 spaces before bullet
    output.split('\n').forEach((line) => {
      expect(line.startsWith('    *')).toBe(true);
    });
  });

  test('applies style functions to bullet and items', () => {
    const bulletStyle = jest.fn((text) => `B:${text}`);
    const itemStyle = jest.fn((text) => `I:${text}`);

    const list = new List({
      items,
      style: bulletStyle,
      itemStyle: itemStyle,
    });

    const output = list['render']();

    // Bullet style function should be called for each item
    expect(bulletStyle).toHaveBeenCalledTimes(items.length);

    // Item style function should be called for each item
    expect(itemStyle).toHaveBeenCalledTimes(items.length);

    // Output should contain styled bullets and items
    items.forEach((item) => {
      expect(output).toContain(`I:${item}`);
    });
  });

  test('print() outputs to stdout', () => {
    const list = new List({ items });
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    list.print();

    expect(stdoutSpy).toHaveBeenCalled();
    stdoutSpy.mockRestore();
  });
});
