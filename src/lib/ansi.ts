import { Color, ColorOptions, ColorSupport, StyleOptions, TextOptions } from 'types';

/**
 * Provides methods to apply ANSI color and style codes to text for terminal output,
 * supporting basic, 256-color, and true color modes.
 */
export class Ansi {
  public static readonly Codes = {
    RESET: '\x1b[0m',
    STYLES: {
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      italic: '\x1b[3m',
      underline: '\x1b[4m',
      blink: '\x1b[5m',
      inverse: '\x1b[7m',
      hidden: '\x1b[8m',
      strikethrough: '\x1b[9m',
    },
    BASIC_COLORS: {
      fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        brightBlack: '\x1b[90m',
        brightRed: '\x1b[91m',
        brightGreen: '\x1b[92m',
        brightYellow: '\x1b[93m',
        brightBlue: '\x1b[94m',
        brightMagenta: '\x1b[95m',
        brightCyan: '\x1b[96m',
        brightWhite: '\x1b[97m',
      },
      bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        brightBlack: '\x1b[100m',
        brightRed: '\x1b[101m',
        brightGreen: '\x1b[102m',
        brightYellow: '\x1b[103m',
        brightBlue: '\x1b[104m',
        brightMagenta: '\x1b[105m',
        brightCyan: '\x1b[106m',
        brightWhite: '\x1b[107m',
      },
    },
    MODE256_COLORS: {
      fg: (n: number) => `\x1b[38;5;${n}m`,
      bg: (n: number) => `\x1b[48;5;${n}m`,
    },
    TRUE_COLORS: {
      fg: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`,
      bg: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`,
    },
  };

  // Detected color support capabilities of the current terminal
  private colorSupport: ColorSupport;

  constructor() {
    // Detect terminal color support on instantiation
    this.colorSupport = this.detectColorSupport();
  }

  /**
   * Applies ANSI color and style codes to the given text based on options.
   *
   * @param text - The text to apply colors and styles
   * @param options - TextOptions including style and color specifications
   * @returns The colorized and styled text string
   */
  public applyCodes(input: string, options: TextOptions): string {
    // If basic color support is not available, return text unmodified
    if (!this.colorSupport.hasBasic) return input;

    // Collect ANSI codes for styles, foreground and background colors
    const codes = [
      ...this.selectStyleCode(options?.style ?? []),
      this.selectColorCode(options?.color ?? {}, 'fg'),
      this.selectColorCode(options?.color ?? {}, 'bg'),
    ];

    // Concatenate codes, text, and reset code to apply styling
    return codes.join('') + input + Ansi.Codes.RESET;
  }

  /**
   * Converts style options into corresponding ANSI escape codes.
   * Supports single or multiple styles.
   *
   * @param style - StyleOptions or array of StyleOptions
   * @returns Array of ANSI style codes
   */
  private selectStyleCode(style: StyleOptions | StyleOptions[] = []): string[] {
    // Normalize to array
    const styles = Array.isArray(style) ? style : [style];

    // Map style keys to ANSI codes, filtering out invalid keys
    return styles.map((style) => Ansi.Codes.STYLES[style]).filter(Boolean);
  }

  /**
   * Selects the appropriate ANSI color code based on terminal support and options.
   * Supports true color, 256-color, and basic color modes.
   *
   * @param color - Color options specifying basic, mode256, or true color values
   * @param type - 'fg' for foreground or 'bg' for background color
   * @returns ANSI escape code string or empty string if no color applied
   */
  private selectColorCode(color: ColorOptions, type: keyof Color): string {
    // Use true color if supported and specified
    if (this.colorSupport.hasTrue && color?.true?.[type]) {
      return Ansi.Codes.TRUE_COLORS[type](...(color.true[type] as [number, number, number]));
    }

    // Use 256-color mode if supported and specified
    if (this.colorSupport.has256 && color?.mode256?.[type] !== undefined) {
      return Ansi.Codes.MODE256_COLORS[type](color.mode256[type] as number);
    }

    // Use basic color if specified
    if (color?.basic?.[type]) {
      return Ansi.Codes.BASIC_COLORS[type][
        color.basic[type] as keyof (typeof Ansi.Codes.BASIC_COLORS)[typeof type]
      ];
    }

    // No color applied
    return '';
  }

  /**
   * Detects the color support capabilities of the current terminal environment.
   *
   * @returns ColorSupport object indicating support for basic, 256, and true color
   */
  private detectColorSupport(): ColorSupport {
    const { isTTY } = process.stdout;
    const { TERM = '', COLORTERM = '', TERM_PROGRAM = '' } = process.env;
    const term = TERM.toLowerCase();
    const colorTerm = COLORTERM.toLowerCase();
    const termProgram = TERM_PROGRAM.toLowerCase();

    return {
      // Basic color support if terminal is TTY and TERM or COLORTERM indicate color
      hasBasic: isTTY && (term.includes('color') || colorTerm.length > 0),

      // 256-color support if TERM contains '256color'
      has256: isTTY && /256(color)?/i.test(term),

      // True color support if COLORTERM is 'truecolor' or '24bit', or TERM_PROGRAM is iTerm or Apple Terminal
      hasTrue:
        (isTTY && ['truecolor', '24bit'].includes(colorTerm)) ||
        ['iterm.app', 'apple_terminal'].includes(termProgram),
    };
  }
}
