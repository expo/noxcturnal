import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
describe.each(['decorate', 'decorateParam'])('user babelHelpers.%s references', property => {
  const source = `
    const babelHelpers = { ${property}() { return 'user'; } };
    function dec(value) { return value; }
    @dec class Value {}
    globalThis.result = babelHelpers.${property}();
  `;
  const codes = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { legacyDecorators: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toContain('@dec');
      codes.set(mode, code);
    }
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [[require('@babel/plugin-proposal-decorators'), { legacy: true }]],
    });
    expect(reference?.code).toBeTypeOf('string');
    codes.set('babel', reference!.code!);
  });
  function run(code: string): unknown {
    const context: Record<string, unknown> = {};
    new Function('require', 'globalThis', code)(require, context);
    return context.result;
  }
  test('identity-decorator-free native control preserves the user property', () => {
    expect(run(source.replace('@dec ', ''))).toBe('user');
  });
  test('Babel legacy decoration preserves the user property', () => {
    expect(run(codes.get('babel')!)).toBe('user');
  });
  test.each(['inline', 'runtime'])('%s decoration preserves the user property', mode => {
    expect(run(codes.get(mode)!)).toBe('user');
  });
});
