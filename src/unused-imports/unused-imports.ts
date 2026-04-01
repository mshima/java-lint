import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { Language, Parser } from 'web-tree-sitter';

import { findUnusedImports } from './analysis.js';

export { findUnusedImports } from './analysis.js';

const require = createRequire(import.meta.url);

/**
 * The resolved tree-sitter Java parser instance once the WebAssembly has been
 * initialised, or `null` if initialisation is still in progress.
 * Consumers that need synchronous access (e.g. the ESLint rule) can check this
 * value; async consumers should await {@link parserReady} instead.
 */
export let resolvedParser: Parser | null = null;

let parserPromise: Promise<Parser> | null = null;

/**
 * Returns a singleton promise that initialises and caches the tree-sitter Java parser.
 * The WebAssembly binaries are loaded lazily on the first call.
 *
 * @returns a promise resolving to the configured tree-sitter {@link Parser}
 */
const getParser = (): Promise<Parser> => {
  if (!parserPromise) {
    parserPromise = (async () => {
      const treeSitterWasmPath = require.resolve('web-tree-sitter/web-tree-sitter.wasm');
      await Parser.init({ locateFile: () => treeSitterWasmPath });

      const javaGrammarWasmPath = require.resolve('tree-sitter-java-orchard/tree-sitter-java_orchard.wasm');
      const javaWasmBytes = readFileSync(javaGrammarWasmPath);
      const Java = await Language.load(javaWasmBytes);

      const parser = new Parser();
      parser.setLanguage(Java);
      resolvedParser = parser;
      return parser;
    })();
  }
  return parserPromise;
};

/**
 * A promise that resolves to the initialised tree-sitter Java parser.
 * Awaiting this guarantees the parser is ready for synchronous use.
 */
export const parserReady: Promise<Parser> = getParser();

/**
 * Removes unused import declarations from Java source code.
 * Wildcard imports are always kept. A non-wildcard import is considered unused when its
 * last identifier is not referenced elsewhere in the file, or when its package matches
 * the file's own package declaration.
 *
 * @param content the Java source file content
 * @returns the source content with unused imports removed
 */
export const removeUnusedImports = async (content: string): Promise<string> => {
  const parser = await getParser();

  const unusedImports = findUnusedImports(content, parser);
  if (unusedImports.length === 0) return content;

  // Results are sorted in reverse order – apply fixes without index shifting
  for (const { fixStartIndex, fixEndIndex } of unusedImports) {
    content = `${content.slice(0, fixStartIndex)}${content.slice(fixEndIndex)}`;
  }

  return content;
};
