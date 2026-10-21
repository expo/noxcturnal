import { createRequire } from 'node:module';
import { describe, expect, test } from 'vitest';
import { compile } from './runtime';

const require = createRequire(import.meta.url);
function run(code: string): unknown {
  const context: Record<string, unknown> = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}

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
      const retained = compile(source, { transforms: { regexpUnicodePropertyEscapes: true } });
      expect(retained).not.toMatch(/\\p\{/);
      expect(run(retained)).toEqual(entry.native);
      const lowered = compile(source, {
        transforms: { regexpUnicode: true, regexpUnicodePropertyEscapes: true },
      });
      expect(lowered).not.toMatch(/\\p\{|\/u\b/);
      expect(run(lowered)).toEqual(entry.adopted);
    });
  }
});

describe('unicode', () => {
  // Removing Unicode mode selects these explicit UTF-16 matching boundaries.
  const unicodeCases = [
    {
      name: 'empty matchAll advances by UTF-16 unit after Unicode lowering',
      source: `globalThis.result = Array.from('😀'.matchAll(/(?:)/gu), match => match.index);`,
      expected: [0, 1, 2],
    },
    {
      name: 'exec from inside a surrogate pair misses after Unicode lowering',
      source: `const regexp = /./gu; regexp.lastIndex = 1; const match = regexp.exec('😀'); globalThis.result = [match && match[0], match && match.index, regexp.lastIndex];`,
      expected: [null, null, 0],
    },
    {
      name: 'Unicode-only word characters lose boundary behavior',
      source: String.raw`globalThis.result = [/\bſ\b/iu.test('ſ'), /\bK\b/iu.test('K')];`,
      expected: [false, false],
    },
    {
      name: 'Unicode-only folds are lost in backreferences',
      source: String.raw`globalThis.result = [/^(k)\1$/iu.test('kK'), /^(K)\1$/iu.test('Kk'), /^(s)\1$/iu.test('sſ'), /^(ſ)\1$/iu.test('ſs')];`,
      expected: [false, false, false, false],
    },
  ];
  for (const entry of unicodeCases) {
    test(entry.name, () => {
      const code = compile(entry.source, { transforms: { regexpUnicode: true } });
      expect(code).not.toMatch(/\/[dgimsuvy]*u[dgimsuvy]*\s*[;),.]/);
      expect(run(code)).toEqual(entry.expected);
    });
  }

  test('sticky constructors resolve the lexical RegExp binding', () => {
    const source = `function read(RegExp) { try { return /a/y.test('a'); } catch (error) { return error.name; } } globalThis.result = read(null);`;
    const code = compile(source, { transforms: { regexpSticky: true } });
    expect(code).not.toMatch(/\/a\/y/);
    expect(run(code)).toBe('TypeError');
  });

  test('named backreference adjacent to a digit preserves the token boundary', () => {
    const source = String.raw`globalThis.result = [/^(?<x>a)\k<x>2$/.test('aa2'), /^(?<x>a)\k<x>2$/.test('a\n')];`;
    const code = compile(source, { transforms: { regexpNamedCaptureGroups: true } });
    expect(code).not.toMatch(/\(\?<x>|\\k<x>/);
    expect(run(code)).toEqual([true, false]);
  });
});
