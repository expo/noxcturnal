import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const inputs = ['a', 'A', 'k', 'K', '1', '-'];
const cases = [
  {
    name: 'case folding precedes Unicode-set intersection',
    pattern: String.raw`/^[[a-z]&&[A-Z]]$/iv`,
    expected: [true, true, true, true, false, false],
  },
  {
    name: 'case folding precedes Unicode-set subtraction',
    pattern: String.raw`/^[\p{ASCII}--[a-z]]$/iv`,
    expected: [false, false, false, false, true, true],
  },
  {
    name: 'case folding precedes Unicode-set complement',
    pattern: String.raw`/^[^\p{Lowercase_Letter}]$/iv`,
    expected: [false, false, false, false, true, true],
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}

describe.each(cases)('$name', entry => {
  const source = `globalThis.result = ${JSON.stringify(inputs)}.map(value => ${entry.pattern}.test(value));`;
  const outputs = new Map<string, string>();
  beforeAll(() => {
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { regexpUnicodeSets: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/\/iv\b/);
      outputs.set(mode, code);
    }
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
    });
    expect(reference?.code).toBeTypeOf('string');
    outputs.set('babel', reference!.code!);
  });
  test('native set semantics', () => {
    expect(run(source)).toEqual(entry.expected);
  });
  test('Babel set semantics', () => {
    expect(run(outputs.get('babel')!)).toEqual(entry.expected);
  });
  test.fails.each(['inline', 'runtime'])('%s transform preserves set semantics', mode => {
    expect(run(outputs.get(mode)!)).toEqual(entry.expected);
  });
});
