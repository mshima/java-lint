import { describe, it, expect } from 'vitest';
import { parse } from 'java-parser';
import { removeUnusedImports, collectGlobalIdentifiersNodes } from './unused-imports.js';

const source = `package my.java.project;

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
`;

describe('java-lint', () => {
  it('collectGlobalIdentifiersNodes', () => {
    expect(collectGlobalIdentifiersNodes(parse(source)).map((el) => el.image)).toMatchInlineSnapshot(`
      [
        "HelloWorldExample",
        "main",
        "args",
        "Used1",
        "arguments",
        "List",
        "Used2",
        "System",
        "out",
        "println",
        "System",
        "out",
        "println",
        "java",
        "util",
        "Arrays",
        "asList",
        "arguments",
        "args",
      ]
    `);
  });
  describe('removeUnusedImports', () => {
    it('should remove unused imports', () => {
      expect(removeUnusedImports(source)).toMatchInlineSnapshot(`
      "package my.java.project;

      import java.util.*;

      import project.Used1;

      import project.Used2;


      public class HelloWorldExample {
          public static void main(Used1 args[]) {
              List<Used2> arguments = java.util.Arrays.asList(args);
              System.out.println(\\"Arguments:\\");
              System.out.println(arguments);
          }
      }
      "
    `);
    });

    it('should remove same package imports', () => {
      expect(
        removeUnusedImports(`package my.java.project;

import my.java.project.Used1;
import my.java.project.Used2;

public class HelloWorldExample {
    public static void main(Used1 args[]) {
        List<Used2> arguments = java.util.Arrays.asList(args);
        System.out.println("Arguments:");
        System.out.println(arguments);
    }
}
`),
      ).toMatchInlineSnapshot(`
        "package my.java.project;




        public class HelloWorldExample {
            public static void main(Used1 args[]) {
                List<Used2> arguments = java.util.Arrays.asList(args);
                System.out.println(\\"Arguments:\\");
                System.out.println(arguments);
            }
        }
        "
      `);
    });

    it('should not fail with emptyStatement', () => {
      expect(
        removeUnusedImports(`package my.java.project;

import my.java.project.Used1;;

public class HelloWorldExample {}
`),
      ).toMatchInlineSnapshot(`
        "package my.java.project;

        ;

        public class HelloWorldExample {}
        "
      `);
    });
  });
});
