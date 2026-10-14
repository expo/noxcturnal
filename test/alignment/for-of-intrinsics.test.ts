import { runInNewContext } from 'node:vm';
import { transformSync } from '@babel/core';
import forOf from '@babel/plugin-transform-for-of';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const cases = [
  {
    name: 'shadowed Symbol and direct eval on a generic iterable',
    source: `const iterable=new Set([1,2]);function read(Symbol){const out=[];for(const value of iterable)out.push([value,eval('Symbol')]);return out;}globalThis.result=read('parameter');`,
    expected: [
      [1, 'parameter'],
      [2, 'parameter'],
    ],
  },
  {
    name: 'Symbol restored after module initialization but before acquisition',
    source: `const original=Symbol;const iterable=new Set([1,2]);globalThis.Symbol=undefined;
      function read(Symbol){const out=[];for(const value of iterable)out.push(value);return out;}
      globalThis.Symbol=original;globalThis.result=read(null);`,
    expected: [1, 2],
  },
  {
    name: 'Symbol restored during iterable evaluation',
    source: `const original=Symbol;const iterable=new Set([1,2]);globalThis.Symbol=undefined;
      function read(Symbol){const out=[];for(const value of (globalThis.Symbol=original,iterable))out.push(value);return out;}
      globalThis.result=read(null);`,
    expected: [1, 2],
  },
  {
    name: 'unrelated Symbol scopes do not affect a generic iterable',
    source: `function unrelated(Symbol){return Symbol;}const out=[];for(const value of new Set([1,2]))out.push(value);globalThis.result=out;`,
    expected: [1, 2],
  },
];

describe.each(cases)('$name', ({ source, expected }) => {
  const observe = (code: string) => runInNewContext(code + ';globalThis.result');
  test('native and pinned Babel controls', () => {
    expect(observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [forOf],
    })!.code!;
    expect(observe(babel)).toEqual(expected);
  });
  test.each(['inline', 'runtime'] as const)('%s lowering', mode => {
    const code = compile(source, { transforms: { forOf: true }, helpers: { mode } });
    expect(code).not.toMatch(/for\s*\([^;]*\bof\b/);
    expect(observe(code)).toEqual(expected);
  });
});
