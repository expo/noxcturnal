import { transformSync } from '@babel/core';
import parameters from '@babel/plugin-transform-parameters';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

async function observe(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return await context.result;
}

const cases = [
  {
    name: 'async wrapper retains awaited return, receiver and arguments',
    source: `async function read(value = 2) {
      var value;
      await Promise.resolve();
      return [value, this.tag, arguments[0], arguments.length];
    }
    globalThis.result = read.call({tag:'owner'}, undefined, 4);`,
    expected: [2, 'owner', undefined, 2],
    generator: false,
  },
  {
    name: 'async-generator wrapper delegates yielded and returned values',
    source: `async function* read(value = 2) {
      var value;
      yield await Promise.resolve([value, this.tag, arguments[0], arguments.length]);
      return await Promise.resolve(value + 3);
    }
    globalThis.result = (async () => {
      const iterator = read.call({tag:'owner'}, undefined, 4);
      return [await iterator.next(), await iterator.next()];
    })();`,
    expected: [
      { value: [2, 'owner', undefined, 2], done: false },
      { value: 5, done: true },
    ],
    generator: true,
  },
];

describe.each(cases)('$name', ({ source, expected, generator }) => {
  test('preserves native and Babel observations with parameter lowering alone', async () => {
    expect(await observe(source)).toEqual(expected);
    const babel = transformSync(source, {
      configFile: false,
      babelrc: false,
      plugins: [parameters],
    })!.code!;
    expect(await observe(babel)).toEqual(expected);
    const code = compile(source, { transforms: { parameters: true } });
    expect(code).not.toMatch(/read\(value\s*=/);
    if (generator) expect(code).toMatch(/\.call\(this/);
    expect(code).toContain('async');
    if (generator) expect(code).toMatch(/async function\*/);
    expect(code).not.toContain('@babel/runtime');
    expect(await observe(code)).toEqual(expected);
  });
});
