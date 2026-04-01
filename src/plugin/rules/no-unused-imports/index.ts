import type { Rule } from 'eslint';

import { parser } from '../../processor.js';
import { findUnusedImports } from './analysis.js';

/**
 * ESLint rule that reports (and auto-fixes) unused Java import declarations.
 *
 * The tree-sitter parser is initialised at module-load time (via top-level
 * `await` in `processor.ts`), so it is always available by the time any rule
 * visitor runs.
 */
export const noUnusedImports: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Disallow unused Java import declarations',
      recommended: true,
      url: 'https://github.com/mshima/eslint-plugin-java',
    },
    messages: {
      unusedImport: "Unused import '{{name}}'.",
    },
    schema: [],
  },

  create(context) {
    return {
      'Program:exit'() {
        const source = context.sourceCode.getText();
        const unusedImports = findUnusedImports(source, parser);

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
