import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const dep = 'data:text/javascript,export const value=3';
const cases = [
  ['export declaration', 'export const value=3;', { value: 3 }, true],
  ['export shorthand', 'const value=3;export {value};', { value: 3 }, true],
  [
    'import shorthand',
    `import {value} from '${dep}';export const result=value;`,
    { result: 3 },
    true,
  ],
  [
    'destructure default',
    'const {value=9}={value:3};export const result=value;',
    { result: 3 },
    true,
  ],
  [
    'destructure shorthand',
    'const {value}={value:3};export const result=value;',
    { result: 3 },
    true,
  ],
  ['object shorthand', 'const value=3;export const result={value}.value;', { result: 3 }, false],
] as const;
async function run(code: string) {
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`
  );
}
describe.each(cases)('%s', (_name, source, expected, fails) => {
  let code: string, babel: string;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'rename-interface',
      visitors: [
        defineVisitor('Program', { scope: true }, path => {
          path.scope.rename('value', 'renamed');
        }),
      ],
    });
    const result = transform(
      source,
      'input.mjs',
      defineNativePipeline({ phases: [{ name: 'rename', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    code = result.code;
    expect(code).not.toBe(source);
    babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            Program(path: NodePath) {
              path.scope.rename('value', 'renamed');
            },
          },
        }),
      ],
    })!.code!;
  });
  test('original module control', async () => expect({ ...(await run(source)) }).toEqual(expected));
  test('Babel scope rename control', async () =>
    expect({ ...(await run(babel)) }).toEqual(expected));
  (fails ? test.fails : test)('scope rename preserves property and module interfaces', async () =>
    expect({ ...(await run(code)) }).toEqual(expected),
  );
});
