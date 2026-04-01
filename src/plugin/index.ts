import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Linter } from 'eslint';

import { parse as javaParser } from '../java-parser.js';
import { javaProcessor } from './processor.js';
import { noUnusedImports } from './rules/no-unused-imports/index.js';

const name = 'eslint-plugin-java-lang';
const packageJsonPath = fileURLToPath(import.meta.resolve('../../package.json'));
const version: string = (JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string }).version;

const rules = {
  'no-unused-imports': noUnusedImports,
} satisfies Record<string, import('eslint').Rule.RuleModule>;

/**
 * The eslint-plugin-java-lang ESLint plugin.
 *
 * @example
 * ```js
 * // eslint.config.js
 * import javaPlugin from 'eslint-plugin-java-lang/plugin';
 *
 * export default [
 *   javaPlugin.configs.recommended,
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

  /** Processors exported by this plugin. */
  processors: {
    java: javaProcessor,
  },

  rules,

  configs: {} as Record<string, Linter.Config>,
};

/**
 * Recommended flat-config configuration.
 * Applies the eslint-plugin-java-lang plugin, its custom parser, the java processor, and the
 * `no-unused-imports` rule to all `.java` files.
 */
const recommended: Linter.Config = {
  name: 'eslint-plugin-java-lang/recommended',
  files: ['**/*.java'],
  plugins: { 'eslint-plugin-java-lang': plugin },
  languageOptions: {
    parser: { parse: javaParser },
  },
  processor: javaProcessor,
  rules: {
    'eslint-plugin-java-lang/no-unused-imports': 'warn',
  },
};

plugin.configs.recommended = recommended;

export default plugin;
