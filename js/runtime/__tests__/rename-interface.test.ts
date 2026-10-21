import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const dep = 'data:text/javascript,export const value=3';
const cases = [
  { name: 'export declaration', source: 'export const value=3;', expected: { value: 3 } },
  { name: 'export shorthand', source: 'const value=3;export {value};', expected: { value: 3 } },
  {
    name: 'import shorthand',
    source: `import {value} from '${dep}';export const result=value;`,
    expected: { result: 3 },
  },
  {
    name: 'destructure default',
    source: 'const {value=9}={value:3};export const result=value;',
    expected: { result: 3 },
  },
  {
    name: 'destructure shorthand',
    source: 'const {value}={value:3};export const result=value;',
    expected: { result: 3 },
  },
  {
    name: 'object shorthand',
    source: 'const value=3;export const result={value}.value;',
    expected: { result: 3 },
  },
];
async function run(code: string) {
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}#${crypto.randomUUID()}`
  );
}
test.each(cases)('rename preserves $name interface', async ({ source, expected }) => {
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
  const code = result.code;
  expect(code).not.toBe(source);
  expect({ ...(await run(code)) }, 'native rename').toEqual(expected);
});
