import type { Node, Parser } from 'web-tree-sitter';

export interface UnusedImportInfo {
  /** Character index to start the fix removal (may include preceding newline) */
  fixStartIndex: number;
  /** Character index to end the fix removal (end of import statement) */
  fixEndIndex: number;
  /** Start of the import node itself */
  nodeStartIndex: number;
  /** End of the import node itself */
  nodeEndIndex: number;
  /** The class name being imported */
  name: string;
}

const getLastIdentifier = (node: Node): string | null => {
  if (node.type === 'identifier') return node.text;
  let lastId: string | null = null;
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)!;
    if (child.type === 'identifier') {
      lastId = child.text;
    } else if (child.type === 'scoped_identifier') {
      lastId = getLastIdentifier(child);
    }
  }
  return lastId;
};

const getAllIdentifiers = (node: Node): string[] => {
  if (node.type === 'identifier') return [node.text];
  const ids: string[] = [];
  for (let i = 0; i < node.childCount; i++) {
    ids.push(...getAllIdentifiers(node.child(i)!));
  }
  return ids;
};

const getPackageName = (root: Node): string | null => {
  for (let i = 0; i < root.childCount; i++) {
    const child = root.child(i)!;
    if (child.type === 'package_declaration') {
      for (let j = 0; j < child.childCount; j++) {
        const c = child.child(j)!;
        if (c.type === 'scoped_identifier' || c.type === 'identifier') {
          return c.text;
        }
      }
    }
  }
  return null;
};

const collectUsedIdentifiers = (node: Node): Set<string> => {
  const ids = new Set<string>();
  if (node.type === 'import_declaration' || node.type === 'package_declaration') {
    return ids;
  }
  if (node.type === 'identifier' || node.type === 'type_identifier') {
    ids.add(node.text);
  }
  for (let i = 0; i < node.childCount; i++) {
    for (const id of collectUsedIdentifiers(node.child(i)!)) {
      ids.add(id);
    }
  }
  return ids;
};

/**
 * Analyses the given Java source code and returns information about each unused import.
 * The results are sorted in reverse source order (highest start index first) so that
 * callers applying fixes via string-slicing can do so without index shifting.
 *
 * @param content Java source code to analyse
 * @param parser  An initialised tree-sitter {@link Parser} configured with the Java grammar
 * @returns An array of {@link UnusedImportInfo} objects, sorted by descending start index
 */
export const findUnusedImports = (content: string, parser: Parser): UnusedImportInfo[] => {
  const tree = parser.parse(content);
  if (!tree) return [];

  const root = tree.rootNode;

  const importNodes: Node[] = [];
  for (let i = 0; i < root.childCount; i++) {
    const child = root.child(i)!;
    if (child.type === 'import_declaration') {
      importNodes.push(child);
    }
  }

  if (importNodes.length === 0) return [];

  const filePackage = getPackageName(root);
  const usedIdentifiers = collectUsedIdentifiers(root);

  const result: UnusedImportInfo[] = [];

  for (const importNode of importNodes) {
    let isWildcard = false;
    let scopedId: Node | null = null;

    for (let i = 0; i < importNode.childCount; i++) {
      const child = importNode.child(i)!;
      if (child.type === 'asterisk') {
        isWildcard = true;
      } else if (child.type === 'scoped_identifier' || child.type === 'identifier') {
        scopedId = child;
      }
    }

    if (isWildcard || !scopedId) continue;

    const lastIdentifier = getLastIdentifier(scopedId);
    if (!lastIdentifier) continue;

    const importPackage = getAllIdentifiers(scopedId).slice(0, -1).join('.');

    if (!usedIdentifiers.has(lastIdentifier) || importPackage === filePackage) {
      let fixStartIndex = importNode.startIndex;
      if (fixStartIndex > 0 && content.charAt(fixStartIndex - 1) === '\n') {
        fixStartIndex--;
      }

      result.push({
        fixStartIndex,
        fixEndIndex: importNode.endIndex,
        nodeStartIndex: importNode.startIndex,
        nodeEndIndex: importNode.endIndex,
        name: lastIdentifier,
      });
    }
  }

  // Sort in reverse order so string-slicing fixes can be applied without index shifting
  result.sort((a, b) => b.nodeStartIndex - a.nodeStartIndex);

  return result;
};
