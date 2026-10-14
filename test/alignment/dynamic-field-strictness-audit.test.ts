import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
function observe(code: string) {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

for (const strictScript of [false, true]) {
  for (const loose of [false, true]) {
    for (const fused of [false, true]) {
      for (const mode of ['inline', 'runtime'] as const) {
        test.each(['length', 'custom'])(
          `dynamic field: strict script=${strictScript}, loose=${loose}, fused=${fused}, helpers=${mode}, key=%s`,
          key => {
            const source = `${strictScript ? '"use strict";' : ''}const events=[];const key=${JSON.stringify(key)};try{class C{static [key]=(events.push('value'),3);static after=events.push('after')}events.push(C[key])}catch(e){events.push(e.name)}globalThis.result=events;`;
            const native = ['value', 'after', 3];
            const readonlyAssignment = loose && key === 'length';
            expect(observe(source)).toEqual(native);
            const reference = transformSync(source, {
              configFile: false,
              babelrc: false,
              sourceType: 'script',
              plugins: [
                [require('@babel/plugin-transform-class-properties'), { loose }],
                ...(fused ? [[require('@babel/plugin-transform-classes'), { loose: false }]] : []),
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
            expect(observe(reference)).toEqual(
              !readonlyAssignment
                ? native
                : strictScript
                  ? ['value', 'TypeError']
                  : ['value', 'after', 0],
            );
            const code = compile(
              source,
              {
                transforms: { classProperties: { loose }, ...(fused ? { classes: true } : {}) },
                helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
              },
              'input.cjs',
            );
            expect(code).not.toMatch(/static\s*\[/);
            if (fused) expect(code).not.toMatch(/class C\b/);
            expect(observe(code)).toEqual(
              !readonlyAssignment
                ? native
                : strictScript || fused
                  ? ['value', 'TypeError']
                  : ['value', 'after', 0],
            );
          },
        );
      }
    }
  }
}
