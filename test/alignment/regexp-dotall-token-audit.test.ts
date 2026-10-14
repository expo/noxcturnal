import { createRequire } from 'node:module';
import { transformSync } from '@babel/core';
import { expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
const require = createRequire(import.meta.url);
const cases = [
  {
    name: 'escaped opening bracket leaves dot outside class',
    pattern: String.raw`/^\[.$/s`,
    inputs: ['[\n', '[x', '[', 'xx'],
  },
  {
    name: 'escaped closing bracket keeps literal dot inside class',
    pattern: String.raw`/^[\].]$/s`,
    inputs: [']', '.', '\n', 'x'],
  },
  {
    name: 'escaped backslash leaves dot active',
    pattern: String.raw`/^\\.$/s`,
    inputs: ['\\\n', '\\x', '\\', 'xx'],
  },
  {
    name: 'legacy opening bracket is not a nested class',
    pattern: String.raw`/^[[]..$/s`,
    inputs: ['[\nx', '[xx', '[[', 'xxx'],
  },
];
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('globalThis', code)(context);
  return context.result;
}
for (const entry of cases) {
  test(entry.name, () => {
    const source = `globalThis.result=${JSON.stringify(entry.inputs)}.map(value=>${entry.pattern}.test(value));`;
    const expected = [true, true, false, false];
    expect(run(source)).toEqual(expected);
    const reference = transformSync(source, {
      sourceType: 'script',
      babelrc: false,
      configFile: false,
      plugins: [require('@babel/plugin-transform-dotall-regex')],
    })!.code!;
    expect(run(reference)).toEqual(expected);
    const code = compile(source, { transforms: { regexpDotAll: true } });
    expect(code).not.toMatch(/\/s\b/);
    expect(run(code)).toEqual(expected);
  });
}
