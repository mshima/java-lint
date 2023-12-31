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
  const filePackage = (
    cstNode.children.ordinaryCompilationUnit[0] as any
  ).children.packageDeclaration[0].children.Identifier.map((identifier: any) => identifier.image).join('.');
  const identifiers = [...new Set(collectGlobalIdentifiersNodes(cstNode).map((el) => el.image))];
  const unusedImportNodes: any[] = importDeclarationNodes
    .filter((importDec) => !importDec.children.Star && !importDec.children.emptyStatement)
    .map((imp) => {
      const packageOrTypeName = imp.children.packageOrTypeName[0];
      return [packageOrTypeName.children.Identifier[packageOrTypeName.children.Identifier.length - 1].image, imp];
    })
    .filter(
      ([identifier, importDec]) =>
        !identifiers.includes(identifier) ||
        importDec.children.packageOrTypeName[0].children.Identifier.map((el: any) => el.image)
          .slice(0, -1)
          .join('.') === filePackage,
    )
    .map(([_identifier, impNode]) => impNode);

  // Reverse
  unusedImportNodes.sort((a, b) => b.location.startOffset - a.location.startOffset);

  for (const unusedImport of unusedImportNodes) {
    let { startOffset } = unusedImport.location;
    if (content.charAt(startOffset - 1) === '\n') {
      startOffset--;
    }
    content = `${content.slice(0, startOffset)}${content.slice(unusedImport.location.endOffset + 1)}`;
  }
  return content;
};
