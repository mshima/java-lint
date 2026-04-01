import type { Rule } from 'eslint';

import { findUnusedImports, resolvedParser } from '../../unused-imports/unused-imports.js';

/**
 * ESLint rule that reports (and auto-fixes) unused Java import declarations.
 *
 * Because the underlying tree-sitter WebAssembly is initialised asynchronously
 * at module-load time, the rule silently skips analysis when the parser is not
 * yet ready (which should only happen in the rare case where ESLint begins
 * linting before the WASM has been fully loaded).
 */
export const noUnusedImports: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Disallow unused Java import declarations',
      recommended: true,
      url: 'https://github.com/mshima/java-lint',
    },
    messages: {
      unusedImport: "Unused import '{{name}}'.",
    },
    schema: [],
  },

  create(context) {
    return {
      'Program:exit'() {
        if (!resolvedParser) {
          // Parser not yet ready – skip silently.
          return;
        }

        const source = context.sourceCode.getText();
        const unusedImports = findUnusedImports(source, resolvedParser);

        for (const { fixStartIndex, fixEndIndex, nodeStartIndex, nodeEndIndex, name } of unusedImports) {
          context.report({
            loc: {
              start: context.sourceCode.getLocFromIndex(nodeStartIndex),
              end: context.sourceCode.getLocFromIndex(nodeEndIndex),
            },
            messageId: 'unusedImport',
            data: { name },
            fix(fixer) {
              return fixer.removeRange([fixStartIndex, fixEndIndex]);
            },
          });
        }
      },
    };
  },
};
