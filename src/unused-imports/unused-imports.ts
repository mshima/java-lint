import { parser } from '../tree-sitter-java.js';
import { findUnusedImports } from './analysis.js';

export { findUnusedImports } from './analysis.js';

/**
 * Removes unused import declarations from Java source code.
 * Wildcard imports are always kept. A non-wildcard import is considered unused when its
 * last identifier is not referenced elsewhere in the file, or when its package matches
 * the file's own package declaration.
 *
 * @param content the Java source file content
 * @returns the source content with unused imports removed
 */
export const removeUnusedImports = (content: string): string => {
  const unusedImports = findUnusedImports(content, parser);
  if (unusedImports.length === 0) return content;

  // Results are sorted in reverse order – apply fixes without index shifting
  for (const { fixStartIndex, fixEndIndex } of unusedImports) {
    content = `${content.slice(0, fixStartIndex)}${content.slice(fixEndIndex)}`;
  }

  return content;
};
