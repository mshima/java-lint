/**
 * Minimal ESLint-compatible parser for Java source files.
 *
 * It returns a bare-bones "Program" AST node so that ESLint can load and
 * process `.java` files without a parse error. The raw Java source remains
 * accessible via {@link https://eslint.org/docs/latest/extend/custom-rules#sourcecodetextstring SourceCode#getText()},
 * which is what the `java-lint` rules use for their analysis.
 */

export interface SourceLocation {
  line: number;
  column: number;
}

export interface ProgramNode {
  type: 'Program';
  body: never[];
  sourceType: 'script';
  range: [number, number];
  loc: {
    start: SourceLocation;
    end: SourceLocation;
  };
  tokens: never[];
  comments: never[];
}

/**
 * Parses Java source code into a minimal ESLint-compatible AST.
 *
 * @param code The Java source code to parse.
 * @returns A minimal `Program` AST node.
 */
export const parse = (code: string): ProgramNode => {
  const lines = code.split('\n');
  const lastLine = lines.at(-1) ?? '';
  return {
    type: 'Program',
    body: [],
    sourceType: 'script',
    range: [0, code.length],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: lines.length, column: lastLine.length },
    },
    tokens: [],
    comments: [],
  };
};
