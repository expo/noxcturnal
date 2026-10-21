import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import destructuring from '@babel/plugin-transform-destructuring';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
describe.each(['function', 'concise', 'parameter', 'field', 'for-of'])(
  'static-block assignment, factory=%s',
  kind => {
    describe.each(['inline', 'runtime'] as const)('helpers=%s', mode => {
      let actual: unknown;
      beforeAll(() => {
        const definition =
          kind === 'for-of'
            ? 'class { static { const original=source; for ({ a, b } of [source]) { this.result=original; } } }'
            : 'class { static { this.result = ({ a, b } = source); } }';
        const factory =
          kind === 'parameter' || kind === 'for-of'
            ? `function make(value = ${definition}) { return value; }`
            : kind === 'field'
              ? `class Holder { value = ${definition}; } const make = () => new Holder().value;`
              : `const make = () => ${kind === 'concise' ? definition : `{ return ${definition}; }`};`;
        const source = `
        let a, b, source;
        ${factory}
        const inner = { a: 10, b: 20 };
        const outer = { get a() { source=inner; make(); return 1; }, b: 2 };
        source=outer;
        const value=make();
        globalThis.result=[value.result===outer,b];
      `;
        expect(observe(source)).toEqual([true, 2]);
        const reference = transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [destructuring],
        })!.code!;
        expect(observe(reference)).toEqual([true, 2]);
        const code = compile(source, {
          transforms: { destructuring: true },
          helpers: { mode, version: '7.29.7' },
        });
        expect(code).not.toMatch(/\{\s*a\s*,\s*b\s*\}\s*=/);
        if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
        else expect(code).not.toContain('@babel/runtime');
        expect(code).not.toMatch(/for\s*\(\s*\{/);
        actual = observe(code);
      });
      test('keeps assignment temporaries within the activation', () => {
        expect(actual).toEqual([true, 2]);
      });
    });
  },
);
