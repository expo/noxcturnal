import { spawnSync } from 'node:child_process';
import { runRegExpCode as run, regexpRequire as require } from './regexp-helpers';
import { transformSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';
import { alignBabelBehavior } from './transform';
import unicodeRegex from '@babel/plugin-transform-unicode-regex';
import stickyRegex from '@babel/plugin-transform-sticky-regex';
import namedGroups from '@babel/plugin-transform-named-capturing-groups-regex';

describe('helper initialization', () => {
  const source = `const a = /(?<a>a)/; const b = /(?<b>b)/; globalThis.result = a[Symbol.replace].call(b, 'b', '$<b>!');`;
  const outcomes = new Map<string, unknown>();
  function runFresh(code: string): unknown {
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
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(0);
    return JSON.parse(child.stdout);
  }
  beforeAll(() => {
    outcomes.set('native', runFresh(source));
    for (const mode of ['inline', 'runtime'] as const) {
      const code = compile(source, {
        transforms: { regexpNamedCaptureGroups: true },
        helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
      });
      expect(code).not.toMatch(/\(\?<\w/);
      outcomes.set('nox-' + mode, runFresh(code));
      const reference = transformSync(source, {
        configFile: false,
        babelrc: false,
        sourceType: 'script',
        plugins: [
          require('@babel/plugin-transform-named-capturing-groups-regex'),
          ...(mode === 'runtime'
            ? [[require('@babel/plugin-transform-runtime'), { version: '7.29.7' }]]
            : []),
        ],
      });
      expect(reference?.code).toBeTypeOf('string');
      expect(reference!.code!).not.toMatch(/\(\?<\w/);
      for (const output of [code, reference!.code!]) {
        if (mode === 'runtime') expect(output).toContain('@babel/runtime/helpers/wrapRegExp');
        else expect(output).not.toContain('@babel/runtime');
      }
      outcomes.set('babel-' + mode, runFresh(reference!.code!));
    }
  });
  test('native replacement can be borrowed between named regexps', () => {
    expect(outcomes.get('native')).toEqual({ value: 'b!' });
  });
  test('Babel inline replacement can be borrowed between named regexps', () => {
    expect(outcomes.get('babel-inline')).toEqual({ value: 'b!' });
  });
  test('bundled CommonJS helper matches the cold Babel runtime baseline', () => {
    expect(outcomes.get('nox-inline')).toEqual(outcomes.get('babel-runtime'));
  });
  test('cold runtime behavior matches the pinned Babel runtime baseline', () => {
    expect(outcomes.get('nox-runtime')).toEqual(outcomes.get('babel-runtime'));
  });
});

describe('surrogate span', () => {
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
});

describe('unicode', () => {
  // Native differences are retained in compliance; these assert the adopted Babel baseline.
  const unicodeCases = [
    {
      name: 'empty matchAll advances by UTF-16 unit after Unicode lowering',
      source: `globalThis.__result = Array.from('😀'.matchAll(/(?:)/gu), match => match.index);`,
      expected: [0, 1, 2],
    },
    {
      name: 'exec from inside a surrogate pair misses after Unicode lowering',
      source: `const regexp = /./gu; regexp.lastIndex = 1; const match = regexp.exec('😀'); globalThis.__result = [match && match[0], match && match.index, regexp.lastIndex];`,
      expected: [null, null, 0],
    },
    {
      name: 'Unicode-only word characters lose boundary behavior',
      source: String.raw`globalThis.__result = [/\bſ\b/iu.test('ſ'), /\bK\b/iu.test('K')];`,
      expected: [false, false],
    },
    {
      name: 'Unicode-only folds are lost in backreferences',
      source: String.raw`globalThis.__result = [/^(k)\1$/iu.test('kK'), /^(K)\1$/iu.test('Kk'), /^(s)\1$/iu.test('sſ'), /^(ſ)\1$/iu.test('ſs')];`,
      expected: [false, false, false, false],
    },
  ];
  for (const entry of unicodeCases) {
    test(entry.name, async () => {
      await expect(
        alignBabelBehavior({
          source: entry.source,
          filename: 'input.js',
          plugins: [unicodeRegex],
          noxcturnal: { transforms: { regexpUnicode: true } },
          output: { mustNotMatch: [/\/[dgimsuvy]*u[dgimsuvy]*\s*[;),.]/] },
        }),
      ).resolves.toEqual(entry.expected);
    });
  }

  test('sticky constructor references the shadowed RegExp binding like Babel', async () => {
    await expect(
      alignBabelBehavior({
        source: `function read(RegExp) { try { return /a/y.test('a'); } catch (error) { return error.name; } } globalThis.__result = read(null);`,
        filename: 'input.js',
        plugins: [stickyRegex],
        noxcturnal: { transforms: { regexpSticky: true } },
        output: { mustNotMatch: [/\/a\/y/] },
      }),
    ).resolves.toEqual('TypeError');
  });

  test('named backreference adjacent to a digit preserves the token boundary', () => {
    const source = String.raw`globalThis.result = [/^(?<x>a)\k<x>2$/.test('aa2'), /^(?<x>a)\k<x>2$/.test('a\n')];`;
    const code = compile(source, { transforms: { regexpNamedCaptureGroups: true } });
    expect(code).not.toMatch(/\(\?<x>|\\k<x>/);
    expect(run(source)).toEqual([true, false]);
    expect(run(code)).toEqual([true, false]);
    // The local token fix also improves Babel's accepted non-Unicode limitation.
    expect(
      run(
        transformSync(source, { babelrc: false, configFile: false, plugins: [namedGroups] })!.code!,
      ),
    ).toEqual([false, true]);
  });
});
