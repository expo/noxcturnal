import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'capture contents and match index',
    expression: String.raw`(()=>{const m=/(\p{Surrogate})/u.exec('a\uDC00');return [m[0],m[1],m.index]})()`,
    native: ['\uDC00', '\uDC00', 1],
    adopted: ['a\uDC00', 'a\uDC00', 0],
  },
  {
    name: 'replacement consumes prefix',
    expression: String.raw`'a\uDC00'.replace(/\p{Surrogate}/u,'X')`,
    native: 'aX',
    adopted: 'X',
  },
  {
    name: 'native lookbehind with lowered property',
    expression: String.raw`/(?<=a)\p{Surrogate}/u.test('a\uDC00')`,
    native: true,
    adopted: false,
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases) {
  test(entry.name, () => {
    const source = `globalThis.result=${entry.expression};`;
    expect(run(source)).toEqual(entry.native);
    const retained = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
    expect(retained).not.toMatch(/\\p\{/);
    expect(run(retained)).toEqual(entry.native);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: ['unicode-property-regex', 'unicode-regex'].map(name =>
        require('@babel/plugin-transform-' + name),
      ),
    })!.code!;
    expect(run(reference)).toEqual(entry.adopted);
    const lowered = compile(source, {
      transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
    });
    expect(lowered).not.toMatch(/\\p\{|\/u\b/);
    expect(run(lowered)).toEqual(entry.adopted);
  });
}
