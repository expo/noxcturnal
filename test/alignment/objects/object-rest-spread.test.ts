import objectRestSpread from '@babel/plugin-transform-object-rest-spread';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

function alignObjectRestSpreadBehavior(
  source: string,
  loose: boolean,
  useBuiltIns: boolean,
  mustNotMatch: RegExp[],
): Promise<unknown> {
  return alignBabelBehavior({
    source,
    filename: 'input.js',
    plugins: [[objectRestSpread, { loose, useBuiltIns }]],
    noxcturnal: {
      helpers: { mode: 'inline' },
      transforms: { objectRestSpread: { loose, useBuiltIns } },
    },
    output: { mustNotMatch },
  });
}

test.each([
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
])('aligns object rest/spread with Babel ($loose, $useBuiltIns)', async options => {
  const { loose, useBuiltIns } = options;
  await expect(
    alignObjectRestSpreadBehavior(
      `const symbol = Symbol('symbol');
const source = { a: 20, b: 22, [symbol]: 1 }; const { a, ...rest } = source;
function pick({ a, ...parameterRest }) { return [a, parameterRest[symbol]]; }
globalThis.__result = [{ zero: 0, ...rest }.b + a, Object.keys(rest), rest[symbol], pick(source)];`,
      loose,
      useBuiltIns,
      [/\.\.\.rest/],
    ),
  ).resolves.toEqual([42, ['b'], loose ? undefined : 1, [20, loose ? undefined : 1]]);
});

test.each([false, true])('aligns proxy trap ordering with Babel (loose=%s)', async loose => {
  await expect(
    alignObjectRestSpreadBehavior(
      `const calls = [];
const target = { a: 1, b: 2 };
const proxy = new Proxy(target, {
  ownKeys(value) { calls.push('ownKeys'); return Reflect.ownKeys(value); },
  getOwnPropertyDescriptor(value, key) {
    calls.push('descriptor:' + String(key));
    return Reflect.getOwnPropertyDescriptor(value, key);
  },
  get(value, key, receiver) {
    calls.push('get:' + String(key));
    return Reflect.get(value, key, receiver);
  },
});
const spread = { ...proxy };
const { a, ...rest } = proxy;
globalThis.__result = [spread, rest, a, calls];`,
      loose,
      false,
      [/\.\.\.proxy/],
    ),
  ).resolves.toEqual([
    { a: 1, b: 2 },
    { b: 2 },
    1,
    loose
      ? [
          'ownKeys',
          'descriptor:a',
          'get:a',
          'descriptor:b',
          'get:b',
          'get:a',
          'ownKeys',
          'descriptor:a',
          'descriptor:a',
          'descriptor:b',
          'descriptor:b',
          'get:b',
        ]
      : [
          'ownKeys',
          'descriptor:a',
          'descriptor:b',
          'ownKeys',
          'get:a',
          'get:b',
          'get:a',
          'ownKeys',
          'descriptor:a',
          'descriptor:a',
          'descriptor:b',
          'descriptor:b',
          'get:b',
          'ownKeys',
        ],
  ]);
});
