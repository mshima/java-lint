import { CstNode, parse } from 'java-parser';

const skippedTypes = ['packageDeclaration', 'importDeclaration'];

/**
 * Lazy implementation of used global identifiers collector.
 * @param cstNode
 * @returns
 */
export const collectGlobalIdentifiersNodes = (cstNode: CstNode) => {
  const nodes = [cstNode];
  const identifiers: any[] = [];

  for (let node; (node = nodes.shift()); ) {
    for (const identifier of Object.keys(node.children)) {
      node.children[identifier]
        .filter((element: any) => !element.name || !skippedTypes.includes(element.name))
        .forEach((element) => {
          if ('image' in element) {
            if (element.tokenType.name === 'Identifier' && element.tokenType.isParent) {
              identifiers.push(element);
            }
          } else {
            nodes.push(element);
          }
        });
    }
  }
  return identifiers;
};

export const removeUnusedImports = (content: string) => {
  const cstNode = parse(content);
  const importDeclarationNodes: any[] = (cstNode.children.ordinaryCompilationUnit[0] as any).children.importDeclaration;
  if (!importDeclarationNodes) {
    return content;
  }
  const identifiers = [...new Set(collectGlobalIdentifiersNodes(cstNode).map((el) => el.image))];
  const unusedImportNodes: any[] = importDeclarationNodes
    .filter((importDec) => !importDec.children.Star)
    .map((imp) => {
      const packageOrTypeName = imp.children.packageOrTypeName[0];
      return [packageOrTypeName.children.Identifier[packageOrTypeName.children.Identifier.length - 1].image, imp];
    })
    .filter(([identifier]) => !identifiers.includes(identifier))
    .map(([_identifier, impNode]) => impNode);

  // Reverse
  unusedImportNodes.sort((a, b) => b.location.startOffset - a.location.startOffset);

  for (const unusedImport of unusedImportNodes) {
    content = `${content.slice(0, unusedImport.location.startOffset)}${content.slice(
      unusedImport.location.endOffset + 1,
    )}`;
  }
  return content;
};
