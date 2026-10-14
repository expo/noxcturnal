import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import type { PreflightPlan } from '../../js';
import { compile, importCode } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases: {
  name: string;
  source: string;
  plugin: string;
  transforms: PreflightPlan['transforms'];
  native: unknown;
  expected: unknown;
  syntax: RegExp;
}[] = [
  {
    name: 'function name',
    source: 'function Object(){};const x={...{a:1}};globalThis.result=Object.name;',
    plugin: 'object-rest-spread',
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
    native: 'Object',
    expected: '_Object',
    syntax: /\.\.\./,
  },
  {
    name: 'class name',
    source: 'class Promise{};async function f(){return 1}globalThis.result=Promise.name;',
    plugin: 'async-to-generator',
    transforms: { asyncFunctions: true },
    native: 'Promise',
    expected: '_Promise',
    syntax: /async function/,
  },
  {
    name: 'script global property',
    source: 'var Object="source";const x={...{a:1}};globalThis.result=globalThis.Object===Object;',
    plugin: 'object-rest-spread',
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
    native: true,
    expected: false,
    syntax: /\.\.\./,
  },
];
function babel(source: string, plugin: string, sourceType: 'script' | 'module') {
  return transformSync(source, {
    configFile: false,
    babelrc: false,
    sourceType,
    plugins: [require('@babel/plugin-transform-' + plugin)],
  })!.code!;
}
function run(source: string) {
  const context = { result: undefined };
  runInNewContext(source, context);
  return context.result;
}
// Babel isolates inline helper globals by renaming colliding source bindings.
// Its effect on reflection and script global-property names is an adopted
// compatibility boundary, not a promise of native metadata/global fidelity.
test.each(cases)('Babel source-binding isolation boundary: $name', entry => {
  expect(run(entry.source)).toEqual(entry.native);
  const reference = babel(entry.source, entry.plugin, 'script');
  const code = compile(entry.source, { transforms: entry.transforms, helpers: { mode: 'inline' } });
  for (const output of [reference, code]) {
    expect(output).not.toMatch(entry.syntax);
    expect(run(output)).toEqual(entry.expected);
  }
});
test.each([
  {
    name: 'Object',
    declaration: 'function Object(){}',
    body: 'export const value={...{a:1}};',
    plugin: 'object-rest-spread',
    transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
    syntax: /\.\.\./,
  },
  {
    name: 'Promise',
    declaration: 'class Promise{}',
    body: 'async function f(){return 1}',
    plugin: 'async-to-generator',
    transforms: { asyncFunctions: true },
    syntax: /async function/,
  },
])('default named export preserves Babel isolation: $name', async entry => {
  const source = `export default ${entry.declaration};${entry.body}`;
  expect(((await importCode(source)).default as Function).name).toBe(entry.name);
  const reference = babel(source, entry.plugin, 'module');
  const code = compile(
    source,
    { transforms: entry.transforms, helpers: { mode: 'inline' } },
    'input.mjs',
  );
  for (const output of [reference, code]) {
    expect(output).not.toMatch(entry.syntax);
    expect(((await importCode(output)).default as Function).name).toBe('_' + entry.name);
  }
});
