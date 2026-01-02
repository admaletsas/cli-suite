import { Table } from '@lib/output/table';

describe('Table', () => {
  const data = [
    { id: 1, name: 'Alice', score: 85 },
    { id: 2, name: 'Bob', score: 92 },
    { id: 3, name: 'Charlie', score: 78 },
  ];
  const columns = [
    { header: 'ID', key: 'id', align: 'right' as const },
    { header: 'Name', key: 'name', align: 'left' as const },
    { header: 'Score', key: 'score', align: 'center' as const },
  ];

  test('renders table with borders and default padding', () => {
    const table = new Table({ columns, data });
    const output = table['render']();

    // Check header presence
    expect(output).toContain('ID');
    expect(output).toContain('Name');
    expect(output).toContain('Score');

    // Check borders characters
    expect(output).toContain('┌');
    expect(output).toContain('┐');
    expect(output).toContain('├');
    expect(output).toContain('┤');
    expect(output).toContain('└');
    expect(output).toContain('┘');

    // Check data presence
    expect(output).toContain('Alice');
    expect(output).toContain('Bob');
    expect(output).toContain('Charlie');
  });

  test('renders table correctly with Unicode characters', () => {
    const unicodeData = [
      { emoji: '😀', name: 'Grinning Face', desc: 'A happy face emoji' },
      { emoji: '🌍', name: 'Earth Globe', desc: 'Represents the world' },
      { emoji: '🍕', name: 'Pizza', desc: 'Delicious food' },
      { emoji: '汉字', name: 'Chinese Characters', desc: 'Multi-byte characters' },
      { emoji: '👍🏽', name: 'Thumbs Up', desc: 'Emoji with skin tone' },
    ];

    const unicodeColumns = [
      { header: 'Emoji', key: 'emoji', align: 'left' as const, width: 10 },
      { header: 'Name', key: 'name', align: 'right' as const, width: 20 },
      { header: 'Description', key: 'desc', align: 'center' as const, width: 30 },
    ];

    const borderCount = unicodeColumns.length + 1; // 4 borders for 3 columns
    const expectedMinLength = unicodeColumns.reduce((sum, col) => sum + col.width, 0) + borderCount;

    const table = new Table({
      columns: unicodeColumns,
      data: unicodeData,
      border: true,
      padding: 2,
    });

    const output = table['render']();

    // Check presence of Unicode characters
    expect(output).toContain('😀');
    expect(output).toContain('🌍');
    expect(output).toContain('🍕');
    expect(output).toContain('汉字');
    expect(output).toContain('👍🏽');

    // Check headers
    expect(output).toContain('Emoji');
    expect(output).toContain('Name');
    expect(output).toContain('Description');

    // Check border characters
    expect(output).toContain('┌');
    expect(output).toContain('┐');
    expect(output).toContain('├');
    expect(output).toContain('┤');
    expect(output).toContain('└');
    expect(output).toContain('┘');

    // Check line lengths with tolerance
    const lines = output.split('\n').filter(Boolean);
    lines.forEach((line) => {
      // console.log(`Line length: ${line.length} | Expected min: ${expectedMinLength}`);
      expect(line.length).toBeGreaterThanOrEqual(expectedMinLength - 2);
    });
  });

  test('renders table without borders', () => {
    const table = new Table({ columns, data, border: false });
    const output = table['render']();

    // Should not contain border characters
    expect(output).not.toContain('┌');
    expect(output).not.toContain('│');
    expect(output).not.toContain('┘');

    // Data and headers should still be present
    expect(output).toContain('ID');
    expect(output).toContain('Alice');
  });

  test('respects fixed column widths', () => {
    const fixedColumns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'Name', key: 'name', width: 10 },
      { header: 'Score', key: 'score', width: 7 },
    ];
    const table = new Table({ columns: fixedColumns, data });
    const output = table['render']();

    // Check that each line has expected minimum length (sum of widths + borders)
    const lines = output.split('\n').filter(Boolean);
    lines.forEach((line: string) => {
      expect(line.length).toBeGreaterThanOrEqual(5 + 10 + 7 + 4); // 4 for 3 borders + ends
    });
  });

  test('pads cells correctly according to alignment', () => {
    const table = new Table({ columns, data });
    const output = table['render']();

    // Extract a data row line (skip header and borders)
    const lines = output.split('\n').filter((line: string) => line.includes('Alice'));
    expect(lines.length).toBeGreaterThan(0);
    const row = lines[0];

    // ID column is right aligned, so '1' should be right padded
    const idIndex = row.indexOf('1');
    expect(row[idIndex - 1]).toBe(' '); // space before '1' for right align

    // Name column is left aligned, so 'Alice' should be left padded (no space before)
    const nameIndex = row.indexOf('Alice');
    expect(row[nameIndex - 1]).not.toBe(' ');

    // Score column is center aligned, so spaces should be balanced around '85'
    const scoreIndex = row.indexOf('85');
    const before = row[scoreIndex - 1];
    const after = row[scoreIndex + 2];
    expect(before).toBe(' ');
    expect(after).toBe(' ');
  });

  test('print() outputs to stdout', () => {
    const table = new Table({ columns, data });
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    table.print();

    expect(stdoutSpy).toHaveBeenCalled();
    stdoutSpy.mockRestore();
  });
});
