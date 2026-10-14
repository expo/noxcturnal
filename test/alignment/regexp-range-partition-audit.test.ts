import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

const require = createRequire(import.meta.url);
const cases = [
  { name: 'BMP to supplementary boundary', start: 0xffff, end: 0x10001 },
  { name: 'adjacent lead-surrogate partitions', start: 0x103ff, end: 0x10401 },
  { name: 'interior complete lead-surrogate partition', start: 0x103ff, end: 0x10c01 },
  { name: 'maximum Unicode code point', start: 0x10fbff, end: 0x10ffff },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases) {
  test(entry.name, () => {
    const points = [entry.start - 1, entry.start, entry.start + 1, entry.end - 1, entry.end];
    if (entry.end < 0x10ffff) points.push(entry.end + 1);
    const inputs = points.map(point => String.fromCodePoint(point).repeat(2));
    inputs.push(String.fromCodePoint(entry.start, entry.end));
    const expected = points.map(point => point >= entry.start && point <= entry.end);
    expected.push(true);
    const source = `globalThis.result=${JSON.stringify(inputs)}.map(value=>/^[\\u{${entry.start.toString(16)}}-\\u{${entry.end.toString(16)}}]+$/u.test(value));`;
    expect(run(source)).toEqual(expected);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-unicode-regex')],
    })!.code!;
    expect(run(reference)).toEqual(expected);
    const code = compile(source, { transforms: { regexpUnicode: true } });
    expect(code).not.toMatch(/\/u\b/);
    expect(run(code)).toEqual(expected);
  });
}
