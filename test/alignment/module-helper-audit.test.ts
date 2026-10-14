import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'array conversion adapter',
    source: `function source() { return [1]; }
const [value] = source();
export default value;`,
  },
  {
    name: 'object null-check adapter',
    source: `function source() { return { value: 1 }; }
const { value } = source();
export default value;`,
  },
];

// Resolve genuine import specifiers for data-URL execution. Do not inject require:
// native ESM must receive module-aware helper imports from the transform.
function resolveHelperImports(code: string): string {
  return code.replace(
    /from\s+(["'])(@babel\/runtime\/[^"']+)\1/g,
    (_match, _quote, specifier) =>
      'from ' + JSON.stringify(pathToFileURL(require.resolve(specifier)).href),
  );
}

describe.each(cases)('$name preserves native module loading', ({ name, source }) => {
  let inline: string;
  let runtime: string;
  let babel: string;
  beforeAll(() => {
    inline = compile(
      source,
      {
        transforms: { destructuring: true },
        helpers: { mode: 'inline' },
      },
      'input.mjs',
    );
    runtime = compile(
      source,
      {
        transforms: { destructuring: true },
        helpers: { mode: 'runtime', moduleName: '@babel/runtime', version: '7.29.7' },
      },
      'input.mjs',
    );
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'module',
      plugins: [
        require('@babel/plugin-transform-destructuring'),
        [require('@babel/plugin-transform-runtime'), { version: '7.29.7', useESModules: false }],
      ],
    });
    expect(reference?.code).toBeTypeOf('string');
    babel = reference!.code!;
    if (name === 'array conversion adapter') {
      expect(babel).toMatch(/import .* from ["']@babel\/runtime\/helpers\/slicedToArray["']/);
    }
    expect(inline).not.toMatch(/const\s*[\[{]\s*value/);
    expect(runtime).not.toMatch(/const\s*[\[{]\s*value/);
    expect(runtime).toContain('@babel/runtime/helpers/');
  });
  test('native module control', async () => {
    expect((await importCode(source)).default).toBe(1);
  });
  test('canonical Babel runtime module control', async () => {
    expect((await importCode(resolveHelperImports(babel))).default).toBe(1);
  });
  test('inline adapter executes as a native module', async () => {
    expect((await importCode(inline)).default).toBe(1);
  });
  test.fails('runtime adapter executes as a native module', async () => {
    expect((await importCode(resolveHelperImports(runtime))).default).toBe(1);
  });
});
