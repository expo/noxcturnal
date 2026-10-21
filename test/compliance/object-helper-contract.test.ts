import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);

const cases = [
  {
    name: 'spread method home object',
    source: `const result = {
  ...{},
  read() {
    return super.value;
  },
};
Object.setPrototypeOf(result, { value: 3 });
globalThis.result = result.read();`,
    expected: undefined,
  },
  {
    name: 'spread late prototype setter',
    source: `const proto = { value: 3 };
const result = { ...{}, __proto__: proto };
globalThis.result = [Object.getPrototypeOf(result) === proto, result.value];`,
    expected: [false, undefined],
  },
  {
    name: 'spread accessor halves',
    source: `const events = [];
const result = {
  get value() {
    return 3;
  },
  ...{},
  set value(next) {
    events.push(next);
  },
};
result.value = 4;
globalThis.result = [result.value, events];`,
    expected: [undefined, [4]],
  },
  {
    name: 'spread proxy key order',
    source: `const events = [],
  symbol = Symbol();
const source = new Proxy(
  {
    get a() {
      events.push('a');
      return 1;
    },
    get [symbol]() {
      events.push('symbol');
      return 2;
    },
  },
  {
    ownKeys() {
      events.push('keys');
      return [symbol, 'a'];
    },
  },
);
const result = { ...source };
globalThis.result = [result.a, result[symbol], events];`,
    expected: [1, 2, ['keys', 'keys', 'a', 'symbol']],
  },
  {
    name: 'spread descriptor changes during getters',
    source: `const source = {
  get a() {
    Object.defineProperty(source, 'b', { enumerable: false });
    return 1;
  },
  b: 2,
};
const result = { ...source };
globalThis.result = [result.a, Object.hasOwn(result, 'b')];`,
    expected: [1, true],
  },
  {
    name: 'rest own proto data property',
    source: `const source = JSON.parse('{"__proto__":{"marker":1},"omit":2,"keep":3}');
const { omit, ...rest } = source;
globalThis.result = [
  Object.hasOwn(rest, '__proto__'),
  Object.getPrototypeOf(rest) === Object.prototype,
  rest.marker,
  rest.__proto__.marker,
  rest.keep,
];`,
    expected: [false, false, 1, 1, 3],
  },
  {
    name: 'rest single ownKeys snapshot',
    source: `let calls = 0;
const source = new Proxy(
  { a: 1 },
  {
    ownKeys(target) {
      calls++;
      return Reflect.ownKeys(target);
    },
  },
);
const { missing, ...rest } = source;
globalThis.result = [calls, rest.a];`,
    expected: [2, 1],
  },
  {
    name: 'rest descriptor changes during getters',
    source: `const source = {
  get a() {
    Object.defineProperty(source, 'b', { enumerable: false });
    return 1;
  },
  b: 2,
};
const { missing, ...rest } = source;
globalThis.result = [rest.a, Object.hasOwn(rest, 'b')];`,
    expected: [1, true],
  },
];

async function observe(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  expect(Object.hasOwn(context, 'result'), 'fixture must assign its observation').toBe(true);
  return await context.result;
}

describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)(
    '%s strict object-rest/spread helper behavior',
    async mode => {
      const code = compile(entry.source, {
        transforms: { objectRestSpread: { loose: false, useBuiltIns: false } },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('...');
      if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('require(');
      expect(await observe(code)).toEqual(entry.expected);
    },
  );
});
