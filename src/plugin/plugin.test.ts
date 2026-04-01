import { RuleTester } from 'eslint';
import { beforeAll, describe, it } from 'vitest';

import { parse as javaParser } from '../java-parser.js';
import { parserReady } from '../unused-imports/unused-imports.js';
import { noUnusedImports } from './rules/no-unused-imports.js';

// Ensure the tree-sitter WASM parser is ready before any rule tests run.
beforeAll(async () => {
  await parserReady;
});

const ruleTester = new RuleTester({
  // Use the java-lint parser so that ESLint can load .java-like source.
  languageOptions: { parser: { parse: javaParser } },
});

describe('java-lint ESLint plugin', () => {
  describe('no-unused-imports rule', () => {
    it('reports and fixes unused imports', () => {
      ruleTester.run('no-unused-imports', noUnusedImports, {
        valid: [
          // Wildcard imports are always kept
          {
            code: `package com.example;
import java.util.*;
public class Foo {}`,
          },
          // Used import
          {
            code: `package com.example;
import java.util.List;
public class Foo {
    List<String> items;
}`,
          },
          // No imports at all
          {
            code: `package com.example;
public class Foo {}`,
          },
        ],
        invalid: [
          // Single unused import
          {
            code: `package com.example;\nimport java.util.List;\npublic class Foo {}`,
            errors: [{ messageId: 'unusedImport', data: { name: 'List' } }],
            output: `package com.example;\npublic class Foo {}`,
          },
          // Same-package import
          {
            code: `package com.example;\nimport com.example.Bar;\npublic class Foo { Bar b; }`,
            errors: [{ messageId: 'unusedImport', data: { name: 'Bar' } }],
            output: `package com.example;\npublic class Foo { Bar b; }`,
          },
        ],
      });
    });
  });
});
