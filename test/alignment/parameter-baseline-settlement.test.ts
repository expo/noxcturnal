import { transformSync } from '@babel/core';
import parameters from '@babel/plugin-transform-parameters';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
const cases = [
  {
    name: 'mutable enclosing arguments snapshot',
    source: `function outer(){const read=(value=1)=>arguments[0];arguments=['changed'];return read();}globalThis.result=outer('original');`,
    native: 'changed',
    baseline: 'original',
  },
  {
    name: 'typeof earlier rest binding',
    source: `function read(first=typeof rest,...rest){return first;}try{globalThis.result=read();}catch(error){globalThis.result=error.name;}`,
    native: 'ReferenceError',
    baseline: 'undefined',
  },
  {
    name: 'write to earlier rest binding',
    source: `function read(first=(rest=2),...rest){return first;}try{globalThis.result=read();}catch(error){globalThis.result=error.name;}`,
    native: 'ReferenceError',
    baseline: 2,
  },
  {
    name: 'rest after arguments length mutation',
    source: `function read(first=(arguments.length=1),...rest){return rest;}globalThis.result=read(undefined,2,3);`,
    native: [2, 3],
    baseline: [],
  },
];
test.each(cases)('adopted parameter baseline: $name', ({ source, native, baseline }) => {
  expect(observe(source)).toEqual(native);
  const reference = transformSync(source, {
    sourceType: 'script',
    configFile: false,
    babelrc: false,
    plugins: [parameters],
  })!.code!;
  expect(observe(reference)).toEqual(baseline);
  const code = compile(source, { transforms: { parameters: true } });
  expect(code).not.toMatch(/=>|\.\.\.rest|function read\(first\s*=/);
  expect(code).not.toContain('@babel/runtime');
  expect(observe(code)).toEqual(baseline);
});
