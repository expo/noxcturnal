import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  { name: 'two dots', pattern: '/^..$/su', expected: null },
  { name: 'bounded dot repetition', pattern: '/^.{2}$/su', expected: null },
  {
    name: 'greedy capture backtracking',
    pattern: '/^(.*)(.)$/su',
    expected: ['😀', '', '😀'],
  },
  { name: 'non-dot-all control', pattern: '/^..$/u', expected: null },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const dotAll of [false, true]) {
  for (const entry of cases) {
    describe(`${entry.name}, dot-all lowering=${dotAll}`, () => {
      let actual: unknown;
      beforeAll(() => {
        const source = `const match=${entry.pattern}.exec('😀');globalThis.result=match&&Array.from(match);`;
        expect(run(source)).toEqual(entry.expected);
        const plugins = [require('@babel/plugin-transform-unicode-regex')];
        if (dotAll) plugins.push(require('@babel/plugin-transform-dotall-regex'));
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins,
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(source, { transforms: { regexpUnicode: true, regexpDotAll: dotAll } });
        expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*\b/);
        if (dotAll) expect(code).not.toMatch(/\/[dgimsuvy]*s[dgimsuvy]*\b/);
        actual = run(code);
      });
      test('preserves complete Unicode characters during backtracking', () => {
        expect(actual).toEqual(entry.expected);
      });
    });
  }
}
