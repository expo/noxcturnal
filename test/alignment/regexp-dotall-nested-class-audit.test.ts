import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'dot after nested class remains literal',
    pattern: String.raw`/^[[a].]$/sv`,
    inputs: ['a', '.', 'b', '\n'],
    expected: [true, true, false, false],
    broken: true,
  },
  {
    name: 'escaped dot after nested class remains literal',
    pattern: String.raw`/^[[a]\.]$/sv`,
    inputs: ['a', '.', 'b', '\n'],
    expected: [true, true, false, false],
    broken: false,
  },
  {
    name: 'class dot differs from following wildcard',
    pattern: String.raw`/^[[a].].$/sv`,
    inputs: ['a\n', '.\n', 'b\n'],
    expected: [true, true, false],
    broken: true,
  },
];
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases)
  describe(entry.name, () => {
    const outcomes = new Map<boolean, unknown>();
    beforeAll(() => {
      const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.test(value));`;
      expect(run(source)).toEqual(entry.expected);
      for (const unicodeSets of [false, true]) {
        const reference = transformSync(source, {
          sourceType: 'script',
          babelrc: false,
          configFile: false,
          plugins: [
            require('@babel/plugin-transform-dotall-regex'),
            ...(unicodeSets ? [require('@babel/plugin-transform-unicode-sets-regex')] : []),
          ],
        })!.code!;
        expect(run(reference)).toEqual(entry.expected);
        const code = compile(source, {
          transforms: { regexpDotAll: true, regexpUnicodeSets: unicodeSets },
        });
        expect(code).not.toMatch(/\/[dgimsuvy]*s[dgimsuvy]*\.test/);
        outcomes.set(unicodeSets, run(code));
      }
    });
    for (const unicodeSets of [false, true])
      (entry.broken && !unicodeSets ? test.fails : test)(
        `preserves class membership, Unicode sets=${unicodeSets}`,
        () => {
          expect(outcomes.get(unicodeSets)).toEqual(entry.expected);
        },
      );
  });
