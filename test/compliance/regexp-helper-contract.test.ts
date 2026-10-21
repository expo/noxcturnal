import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);

const cases = [
  {
    name: 'named replacement followed by a decimal digit',
    source: `globalThis.result = 'abcdefghij'.replace(/(?<x>a)(b)(c)(d)(e)(f)(g)(h)(i)(j)/, '$<x>0');`,
    expected: 'j',
  },
  {
    name: 'named replacement with an escaped dollar',
    source: `globalThis.result = 'a'.replace(/(?<x>a)/, '$$<x>');`,
    expected: '$1',
  },
  {
    name: 'named replacement callback own apply',
    source: `function replace() {
  return 'correct';
}
replace.apply = () => 'wrong';
globalThis.result = 'a'.replace(/(?<x>a)/, replace);`,
    expected: 'wrong',
  },
  {
    name: 'custom exec replaces named groups',
    source: `const pattern = /(?<x>a)/;
pattern.exec = function () {
  const match = ['a', 'positional'];
  match.index = 0;
  match.input = 'a';
  match.groups = { x: 'custom' };
  return match;
};
globalThis.result = 'a'.replace(pattern, '$<x>');`,
    expected: 'positional',
  },
  {
    name: 'custom exec omits named groups',
    source: `const pattern = /(?<x>a)/;
pattern.exec = function () {
  const match = ['a', 'positional'];
  match.index = 0;
  match.input = 'a';
  return match;
};
globalThis.result = 'a'.replace(pattern, '$<x>');`,
    expected: 'positional',
  },
  {
    name: 'custom exec callback receives synthesized groups',
    source: `const pattern = /(?<x>a)/;
pattern.exec = function () {
  const match = ['a', 'positional'];
  match.index = 0;
  match.input = 'a';
  return match;
};
globalThis.result = 'a'.replace(
  pattern,
  (...args) => args.length + ':' + typeof args.at(-1),
);`,
    expected: '5:object',
  },
  {
    name: 'native constructor loses named group metadata',
    source: `const pattern = /(?<x>a)/;
globalThis.result = new RegExp(pattern).exec('a').groups?.x;`,
    expected: undefined,
  },
  {
    name: 'native RegExp call copies wrapped pattern',
    source: `const pattern = /(?<x>a)/;
pattern.lastIndex = 2;
globalThis.result = [RegExp(pattern) === pattern, RegExp(pattern).lastIndex];`,
    expected: [false, 0],
  },
];

async function observe(code: string): Promise<unknown> {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  expect(Object.hasOwn(context, 'result'), 'fixture must assign its observation').toBe(true);
  return await context.result;
}

describe.each(cases)('$name', entry => {
  test.each(['inline', 'runtime'] as const)('%s named-capture helper behavior', async mode => {
    const code = compile(entry.source, {
      transforms: { regexpNamedCaptureGroups: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/\(\?<x>/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/wrapRegExp');
    else expect(code).not.toContain('require(');
    expect(await observe(code)).toEqual(entry.expected);
  });
});

// A cold helper initializes its shared prototype on first use. Keep each mode in
// a fresh process so a previous fixture cannot warm that prototype first.
test.each(['inline', 'runtime'] as const)(
  '%s cold named-regexp helper rejects a borrowed replacement',
  mode => {
    const source = `const a = /(?<a>a)/; const b = /(?<b>b)/; globalThis.result = a[Symbol.replace].call(b, 'b', '$<b>!');`;
    const code = compile(source, {
      transforms: { regexpNamedCaptureGroups: true },
      helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
    });
    expect(code).not.toMatch(/\(\?<\w/);
    if (mode === 'runtime') expect(code).toContain('@babel/runtime/helpers/wrapRegExp');
    else expect(code).not.toContain('@babel/runtime');
    const child = spawnSync(process.execPath, [], {
      encoding: 'utf8',
      timeout: 3000,
      input: `try {
      ${code}
      process.stdout.write(JSON.stringify({ value: globalThis.result }));
    } catch (error) {
      process.stdout.write(JSON.stringify({ error: error.name }));
    }`,
    });
    expect(child.error, child.stderr).toBeUndefined();
    expect(child.signal, child.stderr).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    expect(JSON.parse(child.stdout)).toEqual({ error: 'TypeError' });
  },
);
