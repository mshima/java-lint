import type { Linter } from 'eslint';
import { createRequire } from 'node:module';

import { parse as javaParser } from '../java-parser.js';
import { parserReady } from '../unused-imports/unused-imports.js';
import { noUnusedImports } from './rules/no-unused-imports.js';

export { parserReady };

const require = createRequire(import.meta.url);

const name = 'java-lint';
const version: string = (require('../../package.json') as { version: string }).version;

const rules = {
  'no-unused-imports': noUnusedImports,
} satisfies Record<string, import('eslint').Rule.RuleModule>;

/**
 * The java-lint ESLint plugin.
 *
 * @example
 * ```js
 * // eslint.config.js
 * import javaLint from 'java-lint/plugin';
 *
 * export default [
 *   javaLint.configs.recommended,
 * ];
 * ```
 */
const plugin = {
  meta: { name, version },

  /**
   * Custom parser that allows ESLint to process `.java` files without a parse error.
   * Use it in your flat config via `languageOptions.parser`.
   */
  parsers: {
    java: { parse: javaParser },
  },

  rules,

  configs: {} as Record<string, Linter.Config>,
};

/**
 * Recommended flat-config configuration.
 * Applies the java-lint plugin and its `no-unused-imports` rule to all `.java` files.
 */
const recommended: Linter.Config = {
  name: 'java-lint/recommended',
  files: ['**/*.java'],
  plugins: { 'java-lint': plugin },
  languageOptions: {
    parser: { parse: javaParser },
  },
  rules: {
    'java-lint/no-unused-imports': 'warn',
  },
};

plugin.configs.recommended = recommended;

export default plugin;
