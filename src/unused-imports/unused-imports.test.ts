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

describe('', () => {
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
  it('removeUnusedImports', () => {
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
});
