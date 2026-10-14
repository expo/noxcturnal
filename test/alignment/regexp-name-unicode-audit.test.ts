import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function run(fn: Function): unknown {
  const context: Record<string, unknown> = {};
  fn(context);
  return context.result;
}
for (const [name, pattern] of [
  ['literal supplementary name', String.raw`/(?<𐐀>a)\k<𐐀>/u`],
  ['braced escape supplementary name', String.raw`/(?<\u{10400}>a)\k<\u{10400}>/u`],
]) {
  describe(name, () => {
    const source = `globalThis.result=${pattern}.exec('aa').groups['𐐀'];`;
    let parseError: unknown;
    let actual: unknown;
    beforeAll(() => {
      expect(run(new Function('globalThis', source))).toBe('a');
      const reference = transformSync(source, {
        sourceType: 'script',
        babelrc: false,
        configFile: false,
        plugins: [require('@babel/plugin-transform-unicode-regex')],
      })!.code!;
      expect(run(new Function('globalThis', reference))).toBe('a');
      const code = compile(source, { transforms: { regexpUnicode: true } });
      expect(code).not.toMatch(/\/u\b/);
      let fn: Function | undefined;
      try {
        fn = new Function('globalThis', code);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        parseError = error;
      }
      if (fn) actual = run(fn);
    });
    test.fails('Unicode-only lowering preserves valid capture names', () => {
      expect(parseError).toBeUndefined();
      expect(actual).toBe('a');
    });
    test('explicit named-group lowering removes identifier context before Unicode lowering', () => {
      const code = compile(source, {
        transforms: { regexpUnicode: true, regexpNamedCaptureGroups: true },
      });
      expect(code).not.toMatch(/\(\?<|\\k<|\/u\b/);
      expect(run(new Function('globalThis', code))).toBe('a');
    });
  });
}
