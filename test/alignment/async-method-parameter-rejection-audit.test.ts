import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const modes = ['inline', 'runtime'] as const;
const cases = [
  {
    name: 'object method destructuring without a default',
    source: `const owner = { async read({ value }) { return value; } };
globalThis.result = observe(() => owner.read(null));`,
  },
  {
    name: 'class method destructuring with a literal null default',
    source: `class C { async read({ value } = null) { return value; } }
globalThis.result = observe(() => new C().read());`,
  },
];

type Observation = readonly [string, string];
async function execute(code: string): Promise<Observation> {
  const context: Record<string, unknown> = {};
  const describeError = (error: unknown) => (error instanceof Error ? error.name : String(error));
  const observe = async (call: () => unknown): Promise<Observation> => {
    let result: unknown;
    try {
      result = call();
    } catch (error) {
      return ['sync', describeError(error)];
    }
    try {
      await result;
      return ['fulfilled', ''];
    } catch (error) {
      return ['rejected', describeError(error)];
    }
  };
  new Function('globalThis', 'require', 'observe', code)(context, require, observe);
  return (await context.result) as Observation;
}

function babel(source: string, mode: 'inline' | 'runtime'): string {
  return transformSync(source, {
    sourceType: 'script',
    babelrc: false,
    configFile: false,
    plugins: [
      require('@babel/plugin-transform-async-to-generator'),
      ...(mode === 'runtime'
        ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7', useESModules: false }]]
        : []),
    ],
  })!.code!;
}

function nox(source: string, mode: 'inline' | 'runtime'): string {
  const code = compile(source, {
    transforms: { asyncFunctions: true },
    helpers: { mode, version: '7.29.7' },
  });
  expect(code).not.toMatch(/async\s+(?:read|function)/);
  expect(code.includes('@babel/runtime/')).toBe(mode === 'runtime');
  return code;
}

describe.each(cases)('$name', ({ source }) => {
  const outcomes = new Map<string, Observation>();
  beforeAll(async () => {
    expect(await execute(source)).toEqual(['rejected', 'TypeError']);
    for (const mode of modes) {
      const reference = babel(source, mode);
      expect(reference.includes('@babel/runtime/')).toBe(mode === 'runtime');
      expect(await execute(reference)).toEqual(['rejected', 'TypeError']);
      const result = await execute(nox(source, mode));
      // Compilation and unrelated runtime errors cannot satisfy test.
      expect(result[1]).toBe('TypeError');
      expect(['sync', 'rejected']).toContain(result[0]);
      outcomes.set(mode, result);
    }
  });
  for (const mode of modes) {
    test(`${mode} returns a rejected promise for binding initialization failure`, () => {
      expect(outcomes.get(mode)).toEqual(['rejected', 'TypeError']);
    });
  }
});

test.each(modes)('%s relocates a method pattern with an effectful default', async mode => {
  const source = `function fail() { throw 'stop'; }
const owner = { async read({ value = fail() } = {}) { return value; } };
globalThis.result = observe(() => owner.read());`;
  expect(await execute(source)).toEqual(['rejected', 'stop']);
  expect(await execute(babel(source, mode))).toEqual(['rejected', 'stop']);
  expect(await execute(nox(source, mode))).toEqual(['rejected', 'stop']);
});

test.each(modes)('%s rejects destructuring failures in an ordinary async function', async mode => {
  const source = `async function read({ value }) { return value; }
globalThis.result = observe(() => read(null));`;
  expect(await execute(source)).toEqual(['rejected', 'TypeError']);
  expect(await execute(babel(source, mode))).toEqual(['rejected', 'TypeError']);
  expect(await execute(nox(source, mode))).toEqual(['rejected', 'TypeError']);
});
