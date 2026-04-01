# eslint-plugin-java

## Unused imports

Current implementation has a lazy implemented global identifiers collectors.
False negatives may happen.

````js
import { removeUnusedImports } from 'eslint-plugin-java';

const dirtySource = ```package my.project;

import my.project.pack.Unused;

class Foo {}
```;

removeUnusedImports(dirtySource);

expect(dirtySource).toMatch(
  ```package my.project;


class Foo {}
```,
);
````
