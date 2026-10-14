import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'paired escape before code-point escape',
    members: String.raw`\uD83D\uDE00|\u{1F600}a`,
  },
  {
    name: 'paired escape before literal string',
    members: String.raw`\uD83D\uDE00|😀a`,
  },
  { name: 'code-point escape ordering', members: String.raw`\u{1F600}|😀a` },
  { name: 'literal ordering', members: '😀|😀a' },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases) {
  describe(entry.name, () => {
    let actual: unknown;
    beforeAll(() => {
      const source = `globalThis.result=/[a-z&&[^x]][\\q{${entry.members}}]/v.exec('a😀a')[0];`;
      const standard = source.replace('[a-z&&', '[[a-z]&&');
      // Direct range operands are an explicit Babel compatibility extension.
      expect(() => new Function(source)).toThrow(SyntaxError);
      expect(run(standard)).toBe('a😀a');
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-sets-regex')],
      })!.code!;
      expect(run(reference)).toBe('a😀a');
      const options = { transforms: { regexpUnicodeSets: true } } as const;
      const standardCode = compile(standard, options);
      expect(standardCode).not.toMatch(/\/v\b/);
      expect(run(standardCode)).toBe('a😀a');
      const code = compile(source, options);
      expect(code).not.toMatch(/\/v\b/);
      expect(code).not.toContain('\\q{');
      actual = run(code);
    });
    test('preserves longest string alternative', () => {
      expect(actual).toBe('a😀a');
    });
  });
}
