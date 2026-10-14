import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const source = `globalThis.result = /(?<𝒜>a)/u.exec('a').groups['𝒜'];`;
const codes = new Map<string, string>();
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
beforeAll(() => {
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(source, {
      transforms: { regexpUnicode: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toContain('/u');
    codes.set(mode, code);
  }
  const reference = transformSync(source, {
    configFile: false,
    babelrc: false,
    sourceType: 'script',
    plugins: [require('@babel/plugin-transform-unicode-regex')],
  });
  expect(reference?.code).toBeTypeOf('string');
  expect(reference!.code!).not.toContain('/u');
  codes.set('babel', reference!.code!);
});
test('native preserves a supplementary capture identifier', () => {
  expect(run(source)).toBe('a');
});
test('Babel Unicode lowering preserves a supplementary capture identifier', () => {
  expect(run(codes.get('babel')!)).toBe('a');
});
test.fails.each(['inline', 'runtime'])(
  '%s Unicode lowering preserves a supplementary capture identifier',
  mode => {
    expect(run(codes.get(mode)!)).toBe('a');
  },
);
test('Unicode lowering preserves a BMP escaped capture identifier', () => {
  const control = String.raw`globalThis.result = /(?<\u0061>a)/u.exec('a').groups.a;`;
  expect(run(control)).toBe('a');
  const reference = transformSync(control, {
    configFile: false,
    babelrc: false,
    sourceType: 'script',
    plugins: [require('@babel/plugin-transform-unicode-regex')],
  });
  expect(reference?.code).toBeTypeOf('string');
  expect(reference!.code!).not.toContain('/u');
  expect(run(reference!.code!)).toBe('a');
  for (const mode of ['inline', 'runtime'] as const) {
    const code = compile(control, {
      transforms: { regexpUnicode: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toContain('/u');
    expect(run(code)).toBe('a');
  }
});
