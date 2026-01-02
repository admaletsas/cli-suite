import { TableAlign, TableColumn, TableOptions } from 'types';
import { stringWidth } from '../utils';

/**
 * Creates a formatted table for CLI output.
 * Generic type parameter `T` represents the shape of each data row object.
 */
export class Table<T = Record<string, unknown>> {
  // Array of column configurations defining headers, keys, alignment, width, and styles
  private columns: TableColumn[];

  // Array of data objects representing table rows
  private data: T[];

  // Whether to render borders around the table and cells (default: true)
  private border: boolean;

  // Number of spaces to pad on left and right inside each cell (default: 1)
  private padding: number;

  /**
   * Creates a new Table instance.
   *
   * @param options - Configuration options for columns, data, border, and padding.
   */
  constructor(options: TableOptions<T>) {
    this.columns = options.columns;
    this.data = options.data;
    this.border = options.border ?? true;
    this.padding = options.padding ?? 1;
  }

  /**
   * Pads a string to a specified width according to alignment.
   * Supports Unicode characters by using spread operator to count characters.
   *
   * @param text - The text to pad.
   * @param width - The target width in characters.
   * @param align - Alignment: 'left', 'right', or 'center'.
   * @returns The padded string.
   */
  private pad(text: string, width: number, align: TableAlign): string {
    const len = stringWidth(text); // Support unicode chars
    if (len >= width) return text;

    const space = ' '.repeat(width - len);

    switch (align) {
      case 'right':
        return space + text;
      case 'center':
        const left = Math.floor((width - len) / 2);
        const right = width - len - left;
        return ' '.repeat(left) + text + ' '.repeat(right);
      case 'left':
      default:
        return text + space;
    }
  }

  /**
   * Calculates the width of each column based on header and data content.
   * If a fixed width is specified in the column, it is used directly.
   * Otherwise, the width is the max length of header or any cell in that column,
   * plus padding on both sides.
   *
   * @returns An array of widths corresponding to each column.
   */
  private getColumnWidths(): number[] {
    return this.columns.map((col) => {
      if (col.width !== undefined) return col.width;

      const headerLen = [...col.header].length;

      // Find max length of the column's data cells
      const maxDataLen = this.data.reduce((max, row) => {
        const cell = String(row[col.key as keyof typeof row] ?? '');
        return Math.max(max, [...cell].length);
      }, 0);

      // Add padding on both sides
      return Math.max(headerLen, maxDataLen) + this.padding * 2;
    });
  }

  /**
   * Builds the top border line of the table using Unicode box-drawing characters.
   *
   * @param widths - Array of column widths.
   * @returns The formatted top border line string.
   */
  private buildBorderLine(widths: number[]): string {
    if (!this.border) return '';

    const parts = widths.map((w) => '─'.repeat(w));
    return '┌' + parts.join('┬') + '┐\n';
  }

  /**
   * Builds the separator line between header and data rows.
   *
   * @param widths - Array of column widths.
   * @returns The formatted separator line string.
   */
  private buildSeparatorLine(widths: number[]): string {
    if (!this.border) return '';

    const parts = widths.map((w) => '─'.repeat(w));
    return '├' + parts.join('┼') + '┤\n';
  }

  /**
   * Builds the bottom border line of the table.
   *
   * @param widths - Array of column widths.
   * @returns The formatted bottom border line string.
   */
  private buildBottomLine(widths: number[]): string {
    if (!this.border) return '';

    const parts = widths.map((w) => '─'.repeat(w));
    return '└' + parts.join('┴') + '┘\n';
  }

  /**
   * Builds a single row of the table.
   *
   * @param cells - Array of cell strings for the row.
   * @param widths - Array of column widths.
   * @param styles - Optional array of styling functions for each cell.
   * @returns The formatted row string.
   */
  private buildRow(cells: string[], widths: number[]): string {
    const paddedCells = cells.map((cell, i) => {
      const align = this.columns[i].align ?? 'left';
      const padded = this.pad(cell, widths[i], align);
      return padded;
    });

    if (this.border) return '│' + paddedCells.join('│') + '│\n';
    return paddedCells.join(' ') + '\n';
  }

  /**
   * Renders the entire table as a formatted string.
   *
   * This includes optional borders, header row with styles, separator line,
   * and all data rows.
   *
   * @returns The complete formatted table string.
   */
  private render(): string {
    const widths = this.getColumnWidths();
    let output = '';

    if (this.border) {
      output += this.buildBorderLine(widths);
    }

    // Build header row with optional styles
    const headers = this.columns.map((col) => col.header);
    output += this.buildRow(headers, widths);

    if (this.border) {
      output += this.buildSeparatorLine(widths);
    }

    // Build each data row
    for (const row of this.data) {
      const cells = this.columns.map((col) => String(row[col.key as keyof typeof row] ?? ''));
      output += this.buildRow(cells, widths);
    }

    if (this.border) {
      output += this.buildBottomLine(widths);
    }

    return output;
  }

  /**
   * Prints the rendered table directly to the standard output.
   */
  public print(): void {
    process.stdout.write(this.render());
  }
}
