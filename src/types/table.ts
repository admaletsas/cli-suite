/**
 * Alignment options for table columns.
 * - `'left'`: Align text to the left.
 * - `'right'`: Align text to the right.
 * - `'center'`: Center-align text.
 */
export type TableAlign = 'left' | 'right' | 'center';

/**
 * Configuration for a single column in the table.
 *
 * Properties:
 * - `header`: The column header text displayed at the top of the column.
 * - `key`: The key used to extract the corresponding value from each data row.
 * - `align`: Text alignment within the column. Defaults to `'left'` if not specified.
 * - `width`: Fixed width of the column in characters. If omitted, width is auto-calculated.
 */
export type TableColumn = {
  header: string;
  key: string;
  align?: TableAlign;
  width?: number;
};

/**
 * Options for configuring the table output.
 * Generic type parameter `T` represents the shape of each data row object.
 *
 * Properties:
 * - `columns`: An array of `TableColumn` objects defining the table's columns.
 * - `data`: An array of data objects to be displayed as rows in the table.
 * - `border`: Whether to render borders around the table and cells. Defaults to `true`.
 * - `padding`: Number of spaces to pad on the left and right inside each cell. Defaults to `1`.
 */
export type TableOptions<T = Record<string, unknown>> = {
  columns: TableColumn[];
  data: T[];
  border?: boolean;
  padding?: number;
};
