import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, transform } from '../../js';
import parameters from '@babel/plugin-transform-parameters';
import { compile } from '../compliance/runtime';

describe('parameter class phase', () => {
  const require = createRequire(import.meta.url);
  const source = `class Base {}
class Child extends Base {
  constructor(value = () => this) {
    super();
    this.matches = value() === this;
  }
}
globalThis.result = new Child().matches;`;

  function run(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }

  describe.each(['inline', 'runtime'] as const)(
    'parameters before classes with %s helpers',
    mode => {
      let code: string;
      let babel: string;
      beforeAll(() => {
        const helpers = { mode, version: '7.29.7' };
        const result = transform(
          source,
          'input.js',
          defineNativePipeline({
            phases: [
              { name: 'parameters', native: { transforms: { parameters: true }, helpers } },
              { name: 'classes', native: { transforms: { classes: true }, helpers } },
            ],
          }),
        );
        expect(result.status).toBe('complete');
        if (result.status !== 'complete') throw new Error(result.reason);
        code = result.code;
        babel = source;
        for (const stage of ['parameters', 'classes']) {
          const reference = transformSync(babel, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            plugins: [
              require(`@babel/plugin-transform-${stage}`),
              ...(mode === 'runtime'
                ? [
                    [
                      require('@babel/plugin-transform-runtime'),
                      {
                        version: '7.29.7',
                        useESModules: false,
                      },
                    ],
                  ]
                : []),
            ],
          });
          expect(reference?.code).toBeTypeOf('string');
          babel = reference!.code!;
          if (stage === 'parameters') {
            expect(babel).toMatch(/constructor\s*\(\s*\)/);
            expect(babel).toContain('arguments.length');
          }
        }
        for (const output of [code, babel]) {
          expect(output).not.toMatch(/\bclass\s+(?:Base|Child)\b/);
          expect(output).not.toMatch(/\(\s*value\s*=/);
          expect(output).toContain('arguments.length');
          if (mode === 'runtime') {
            expect(output).toMatch(/require\(["']@babel\/runtime\/helpers\//);
          } else {
            expect(output).not.toContain('@babel/runtime');
            expect(output).toContain('Reflect.construct');
          }
        }
      });
      test('native receiver control', () => {
        expect(run(source)).toBe(true);
      });
      test('Babel separate passes preserve the initialized receiver', () => {
        expect(run(babel)).toBe(true);
      });
      test('Noxcturnal phases preserve the initialized receiver', () => {
        expect(run(code)).toBe(true);
      });
    },
  );
});

describe('parameter async wrapper', () => {
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
});

describe('parameter baseline settlement', () => {
  function observe(code: string): unknown {
    const context: { result?: unknown } = {};
    new Function('globalThis', code)(context);
    return context.result;
  }
  const cases = [
    {
      name: 'mutable enclosing arguments binding',
      source: `function outer(){const read=(value=1)=>arguments[0];arguments=['changed'];return read();}globalThis.result=outer('original');`,
      native: 'changed',
      baseline: 'original',
      repaired: true,
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
  test.each(cases)('adopted parameter baseline: $name', entry => {
    const { source, native, baseline } = entry;
    expect(observe(source)).toEqual(native);
    const reference = transformSync(source, {
      sourceType: 'script',
      configFile: false,
      babelrc: false,
      plugins: [parameters],
    })!.code!;
    expect(observe(reference)).toEqual(baseline);
    const code = compile(source, { transforms: { parameters: true } });
    expect(code).not.toMatch(/\(value\s*=|\.\.\.rest|function read\(first\s*=/);
    expect(code).not.toContain('@babel/runtime');
    expect(observe(code)).toEqual('repaired' in entry ? native : baseline);
  });
});
