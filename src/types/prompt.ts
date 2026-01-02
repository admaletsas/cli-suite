import { Validator } from './validator';

/**
 * Configuration object for input options.
 *
 * Properties:
 * - `validators`: Optional array of Validator objects to validate the input.
 * - `defaultValue`: Optional default value if input is not provided.
 * - `validateDefault`: Optional flag indicating whether to validate the default value.
 */
export type InputOptions = {
  validators?: Validator[];
  defaultValue?: string;
  validateDefault?: boolean;
};

/**
 * Defines the mode of an interactive prompt.
 * - 'single': User can select only one choice.
 * - 'multiple': User can select multiple choices.
 */
export type InteractivePromptMode = 'single' | 'multiple';

/**
 * Represents a choice in an interactive prompt.
 *
 * Properties:
 * - `label`: Text displayed to the user for this choice.
 * - `value`: Value returned when this choice is selected.
 */
export type InteractivePromptChoice = {
  readonly label: string;
  readonly value: string;
};
