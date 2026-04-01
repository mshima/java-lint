import type { Linter } from 'eslint';

export { parser } from '../tree-sitter-java.js';

/**
 * ESLint processor for `.java` files.
 *
 * The processor passes the file source through unchanged and aggregates the
 * messages produced by the rules. Its main purpose within this plugin is to
 * serve as the module that owns the tree-sitter parser initialisation so that
 * top-level `await` triggers parser setup when the plugin is first imported.
 */
export const javaProcessor: Linter.Processor = {
  preprocess(text) {
    return [text];
  },
  postprocess(messages) {
    return messages[0] ?? [];
  },
  supportsAutofix: true,
};
