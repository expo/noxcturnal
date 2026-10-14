import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'static length',
    source: 'class C{/*PRIVATE*/static length=3}globalThis.result=C.length;',
    strict: 3,
    loose: 3,
    readonly: true,
  },
  {
    name: 'computed static length',
    source: 'class C{/*PRIVATE*/static ["length"]=3}globalThis.result=C.length;',
    strict: 3,
    loose: 3,
    readonly: true,
  },
  {
    name: 'static name',
    source: 'class C{/*PRIVATE*/static name="custom"}globalThis.result=C.name;',
    strict: 'custom',
    loose: 'custom',
    readonly: true,
  },
  {
    name: 'uninitialized instance field',
    source:
      'const trace=[];class B{set x(v){trace.push(v===undefined)}}class C extends B{/*PRIVATE*/x;}const c=new C;globalThis.result=[Object.hasOwn(c,"x"),trace];',
    strict: [true, []],
    loose: [false, [true]],
    readonly: false,
  },
  {
    name: 'uninitialized static field',
    source:
      'const trace=[];class B{static set x(v){trace.push(v===undefined)}}class C extends B{/*PRIVATE*/static x;}globalThis.result=[Object.hasOwn(C,"x"),trace];',
    strict: [true, []],
    loose: [false, [true]],
    readonly: false,
  },
  {
    name: 'computed prototype field',
    source:
      'class C{/*PRIVATE*/["__proto__"]={tag:3};static ["__proto__"]={tag:4}}const c=new C;globalThis.result=[Object.hasOwn(c,"__proto__"),Object.getPrototypeOf(c)===C.prototype,Object.hasOwn(C,"__proto__"),Object.getPrototypeOf(C)===Function.prototype];',
    strict: [true, true, true, true],
    loose: [false, false, false, false],
    readonly: false,
  },
];
function observe(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

for (const selection of ['standalone', 'classes', 'private'] as const) {
  for (const loose of [false, true]) {
    for (const mode of ['inline', 'runtime'] as const) {
      test(`field/static-block order: ${selection}, loose=${loose}, helpers=${mode}`, () => {
        const method = selection === 'standalone' ? 'method' : '#method';
        const source = `const trace=[];class C{static first=(trace.push('first'),1);${method}(){trace.push('method');return 7}field=(trace.push('field'),7);read(){return this.${method}()}static{trace.push('block')}static last=(trace.push('last'),2)}const c=new C;c.read();globalThis.result=[trace,c.field];`;
        const expected = [['first', 'block', 'last', 'field', 'method'], 7];
        expect(observe(source)).toEqual(expected);
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          sourceType: 'script',
          plugins: [
            require('@babel/plugin-transform-class-static-block'),
            [require('@babel/plugin-transform-class-properties'), { loose }],
            ...(selection !== 'standalone'
              ? [[require('@babel/plugin-transform-private-methods'), { loose }]]
              : []),
            ...(selection === 'classes'
              ? [[require('@babel/plugin-transform-classes'), { loose: false }]]
              : []),
            ...(mode === 'runtime'
              ? [
                  [
                    require('@babel/plugin-transform-runtime'),
                    { version: '7.29.7', useESModules: false },
                  ],
                ]
              : []),
          ],
        })!.code!;
        expect(observe(reference)).toEqual(expected);
        const code = compile(
          source,
          {
            transforms: {
              classProperties: { loose },
              classStaticBlock: true,
              ...(selection !== 'standalone' ? { privateMethods: true } : {}),
              ...(selection === 'classes' ? { classes: true } : {}),
            },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          },
          'input.cjs',
        );
        expect(code).not.toMatch(/static\s*\{|#method/);
        if (selection === 'standalone') expect(code).toMatch(/\bclass C\b/);
        else expect(code).not.toMatch(/\bclass C\b/);
        expect(observe(code)).toEqual(expected);
      });
      describe.each(cases)(`${selection}, loose=${loose}, helpers=${mode}: $name`, entry => {
        const expected = loose ? entry.loose : entry.strict;
        const fails = loose && selection !== 'standalone' && entry.readonly;
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          const source = entry.source.replace(
            '/*PRIVATE*/',
            selection === 'private'
              ? '#secret(){return 7}readPrivate(){return this.#secret()}'
              : '',
          );
          expect(observe(source)).toEqual(entry.strict);
          const reference = transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            plugins: [
              [require('@babel/plugin-transform-class-properties'), { loose }],
              ...(selection === 'private'
                ? [[require('@babel/plugin-transform-private-methods'), { loose }]]
                : []),
              ...(selection === 'classes'
                ? [[require('@babel/plugin-transform-classes'), { loose: false }]]
                : []),
              ...(mode === 'runtime'
                ? [
                    [
                      require('@babel/plugin-transform-runtime'),
                      { version: '7.29.7', useESModules: false },
                    ],
                  ]
                : []),
            ],
          })!.code!;
          expect(observe(reference)).toEqual(expected);
          const code = compile(
            source,
            {
              transforms: {
                classProperties: { loose },
                ...(selection === 'classes' ? { classes: true } : {}),
                ...(selection === 'private' ? { privateMethods: true } : {}),
              },
              helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
            },
            'input.cjs',
          );
          if (selection === 'standalone') expect(code).toMatch(/\bclass C\b/);
          else expect(code).not.toMatch(/\bclass C\b/);
          expect(code).not.toContain('#secret');
          try {
            actual = observe(code);
          } catch (error) {
            expect(error).toBeInstanceOf(TypeError);
            expect((error as Error).message).toMatch(/read only property '(?:name|length)'/);
            actual = { error: 'TypeError' };
          }
          expect(actual).toEqual(fails ? { error: 'TypeError' } : expected);
        });
        (fails ? test.fails : test)('preserves the selected field definition semantics', () =>
          expect(actual).toEqual(expected),
        );
      });
    }
  }
}
