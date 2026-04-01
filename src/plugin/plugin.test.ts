import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { parse as javaParser } from '../java-parser.js';
import { noUnusedImports } from './rules/no-unused-imports/index.js';

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
          // Static import that is used
          {
            code: `package my.java.project;

import static org.mockito.Mockito.when;

public class HelloWorldExample {
    public static void main() {
        when();
    }
}
`,
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
          // Multiple unused imports mixed with used and wildcard imports
          {
            code: `package my.java.project;

import java.util.*;

import project.Used1;
import project.Unused1;
import project.Used2;
import project.Unused2;

public class HelloWorldExample {
    public static void main(Used1 args[]) {
        List<Used2> arguments = java.util.Arrays.asList(args);
        System.out.println("Arguments:");
        System.out.println(arguments);
    }
}
`,
            errors: [
              { messageId: 'unusedImport', data: { name: 'Unused1' } },
              { messageId: 'unusedImport', data: { name: 'Unused2' } },
            ],
            output: `package my.java.project;

import java.util.*;

import project.Used1;
import project.Used2;

public class HelloWorldExample {
    public static void main(Used1 args[]) {
        List<Used2> arguments = java.util.Arrays.asList(args);
        System.out.println("Arguments:");
        System.out.println(arguments);
    }
}
`,
          },
          // Same-package imports are removed
          {
            code: `package my.java.project;

import my.java.project.Used1;
import my.java.project.Used2;

public class HelloWorldExample {
    public static void main(Used1 args[]) {
        List<Used2> arguments = java.util.Arrays.asList(args);
        System.out.println("Arguments:");
        System.out.println(arguments);
    }
}
`,
            errors: [
              { messageId: 'unusedImport', data: { name: 'Used1' } },
              { messageId: 'unusedImport', data: { name: 'Used2' } },
            ],
            output: `package my.java.project;

import my.java.project.Used2;

public class HelloWorldExample {
    public static void main(Used1 args[]) {
        List<Used2> arguments = java.util.Arrays.asList(args);
        System.out.println("Arguments:");
        System.out.println(arguments);
    }
}
`,
          },
          // emptyStatement after import is not removed
          {
            code: `package my.java.project;

import my.java.project.Used1;;

public class HelloWorldExample {}
`,
            errors: [{ messageId: 'unusedImport', data: { name: 'Used1' } }],
            output: `package my.java.project;
;

public class HelloWorldExample {}
`,
          },
        ],
      });
    });
  });
});
