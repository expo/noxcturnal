import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

for (const isStatic of [false, true]) {
  const prefix = isStatic ? 'static ' : '';
  const read = isStatic ? 'Child.value' : 'new Child().value';
  const source = `class Base{${prefix}get seed(){return 3}}class Child extends Base{${prefix}accessor value=super.seed;}globalThis.result=${read};`;
  const native = `class Base{${prefix}get seed(){return 3}}class Child extends Base{${prefix}#storage=super.seed;${prefix}get value(){return this.#storage}${prefix}set value(v){this.#storage=v}}globalThis.result=${read};`;
  for (const loose of [false, true]) {
    for (const mode of ['inline', 'runtime'] as const) {
      describe(`auto-accessor super: static=${isStatic}, loose=${loose}, helpers=${mode}`, () => {
        let actual: unknown;
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          expect(observe(native)).toBe(3);
          const reference = transformSync(source, {
            configFile: false,
            babelrc: false,
            sourceType: 'script',
            plugins: [
              [require('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
              [require('@babel/plugin-transform-class-properties'), { loose }],
              [require('@babel/plugin-transform-classes'), { loose: false }],
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
          expect(observe(reference)).toBe(3);
          const code = compile(source, {
            transforms: { classes: true, classProperties: { loose } },
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
          });
          expect(code).not.toMatch(/\baccessor\s+value|\bclass\s+(?:Base|Child)/);
          try {
            actual = observe(code);
          } catch (error) {
            expect(error).toBeInstanceOf(SyntaxError);
            expect((error as Error).message).toMatch(/super.*unexpected/i);
            actual = { error: 'SyntaxError' };
          }
          expect(actual).toEqual({ error: 'SyntaxError' });
        });
        test.fails('preserves super access in the lowered initializer', () =>
          expect(actual).toBe(3));
      });
    }
  }
}
