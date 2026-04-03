# eslint-plugin-java-lang

ESLint plugin for Java files.

## Installation

```bash
npm i -D eslint eslint-plugin-java-lang
```

## Usage (Flat Config)

Use the recommended config to enable Java parsing/processing and the default rule set.

```js
// eslint.config.js
import java from 'eslint-plugin-java-lang';

export default [java.configs.recommended];
```

## Custom Configuration

```js
// eslint.config.js
import java from 'eslint-plugin-java-lang';

export default [
  {
    files: ['**/*.java'],
    plugins: {
      'eslint-plugin-java-lang': java,
    },
    languageOptions: {
      parser: java.parsers.java,
    },
    processor: java.processors.java,
    rules: {
      'eslint-plugin-java-lang/no-unused-imports': 'warn',
    },
  },
];
```

## Available Rules

- `eslint-plugin-java-lang/no-unused-imports`

## Notes

Current implementation has a lazy global identifier collector.
False negatives may happen.

## Example

Input:

```java
package my.project;

import my.project.pack.Unused;

class Foo {}
```

After running ESLint with `--fix`:

```java
package my.project;

class Foo {}
```
