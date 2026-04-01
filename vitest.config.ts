import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import { configDefaults } from 'vitest/config';

/**
 * Vite's module runner does not support `import.meta.resolve`.
 * This plugin replaces every `import.meta.resolve('specifier')` call with the
 * statically-resolved `file:` URL string so that the module runner never sees
 * the unsupported expression.
 *
 * The regex matches only simple string-literal arguments (single quotes, double
 * quotes, or backticks without embedded expressions), which covers all usages
 * within this project.
 */
function importMetaResolvePlugin(): Plugin {
  return {
    name: 'import-meta-resolve',
    enforce: 'pre',
    transform(code, id) {
      if (!code.includes('import.meta.resolve(')) return null;
      const localRequire = createRequire(id);
      const newCode = code.replace(/import\.meta\.resolve\((['"`])([^'"`]+)\1\)/g, (_match, _quote, specifier) => {
        try {
          return JSON.stringify(pathToFileURL(localRequire.resolve(specifier)).href);
        } catch {
          return _match;
        }
      });
      return code !== newCode ? { code: newCode, map: null } : null;
    },
  };
}

export default defineConfig({
  plugins: [importMetaResolvePlugin()],
  test: {
    exclude: [...configDefaults.exclude, 'e2e/*'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
});
