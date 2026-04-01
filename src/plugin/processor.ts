import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { Linter } from 'eslint';
import { Language, Parser } from 'web-tree-sitter';

const treeSitterWasmPath = fileURLToPath(new URL('../../wasm/web-tree-sitter.wasm', import.meta.url));
await Parser.init({ locateFile: () => treeSitterWasmPath });

const javaGrammarWasmPath = fileURLToPath(new URL('../../wasm/tree-sitter-java_orchard.wasm', import.meta.url));
const javaWasmBytes = readFileSync(javaGrammarWasmPath);
const Java = await Language.load(javaWasmBytes);

/**
 * Shared tree-sitter Java parser instance, fully initialised at module-load time
 * via top-level `await`. Both the ESLint rule and other plugin components import
 * this directly – no null-checks or promise-unwrapping needed.
 */
export const parser = new Parser();
parser.setLanguage(Java);

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
