import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { Language, Parser } from 'web-tree-sitter';

const treeSitterWasmPath = fileURLToPath(import.meta.resolve('web-tree-sitter/web-tree-sitter.wasm'));
await Parser.init({ locateFile: () => treeSitterWasmPath });

const javaGrammarWasmPath = fileURLToPath(new URL('../wasm/tree-sitter-java_orchard.wasm', import.meta.url));
const javaWasmBytes = readFileSync(javaGrammarWasmPath);
const Java = await Language.load(javaWasmBytes);

/**
 * Shared tree-sitter Java parser instance, fully initialised at module-load time
 * via top-level `await`. Both the ESLint rule and other plugin components import
 * this directly – no null-checks or promise-unwrapping needed.
 */
export const parser = new Parser();
parser.setLanguage(Java);
