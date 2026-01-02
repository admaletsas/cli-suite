import { StyleFunction, ListOptions } from 'types';

/**
 * Creates a formatted list for CLI output.
 * Supports ordered (numbered) and unordered (bulleted) lists,
 * with configurable indentation and optional styling for bullets/numbers and items.
 */
export class List {
  // Array of strings representing the list items
  private items: string[];

  // Whether the list is ordered (numbered). Defaults to false (bulleted list)
  private ordered: boolean;

  // Character used as bullet for unordered lists. Defaults to '•'.
  private bulletChar: string;

  // Number of spaces to indent before bullet/number prefix. Defaults to 2.
  private indent: number;

  // Optional styling function applied to bullet or number prefix
  private style?: StyleFunction;

  // Optional styling function applied to list item text
  private itemStyle?: StyleFunction;

  /**
   * Creates a new List instance.
   *
   * @param options - Configuration options for list items, style, and formatting.
   */
  constructor(options: ListOptions) {
    this.items = options.items;
    this.ordered = options.ordered ?? false;
    this.bulletChar = options.bulletChar ?? '•';
    this.indent = options.indent ?? 2;
    this.style = options.style;
    this.itemStyle = options.itemStyle;
  }

  /**
   * Renders the list as a formatted string.
   *
   * Each item is prefixed with a bullet character or number (for ordered lists),
   * indented by the configured number of spaces, and styled if style functions are provided.
   *
   * @returns The formatted list string with line breaks.
   */
  private render(): string {
    return this.items
      .map((item, index) => {
        // Determine prefix: number for ordered lists, bullet character otherwise
        const prefix = this.ordered ? `${index + 1}.` : this.bulletChar;
        // Apply optional style to prefix (bullet or number)
        const styledPrefix = this.style ? this.style(prefix) : prefix;
        // Apply optional style to item text
        const styledItem = this.itemStyle ? this.itemStyle(item) : item;

        // Construct the line with indentation, prefix, and item text
        return ' '.repeat(this.indent) + styledPrefix + ' ' + styledItem;
      })
      .join('\n');
  }

  /**
   * Prints the rendered list directly to the standard output.
   */
  public print(): void {
    process.stdout.write(this.render());
  }
}
