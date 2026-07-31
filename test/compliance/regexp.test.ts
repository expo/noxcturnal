import { expect, test } from 'vitest';
import type { PreflightTransforms } from '../../js';
import { execute } from './runtime';

function match(regexp: string, transforms: PreflightTransforms, inputs: string[]): unknown[] {
  return execute<{ result: unknown[] }>(
    `
      const expression = ${regexp};
      globalThis.result = ${JSON.stringify(inputs)}.map(input => {
        expression.lastIndex = 0;
        const result = expression.exec(input);
        return result && [result[0], result.index];
      });
    `,
    { transforms },
  ).result;
}

test('dot-all matches line terminators but not unrelated prefixes', () => {
  expect(match('/^a.b$/s', { regexpDotAll: true }, ['a\nb', 'acb', 'xa\nb'])).toEqual([
    ['a\nb', 0],
    ['acb', 0],
    null,
  ]);
});

test('sticky expressions only match at lastIndex', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /a/y;
      expression.lastIndex = 1;
      const found = expression.exec('ba');
      expression.lastIndex = 0;
      const missed = expression.exec('ba');
      globalThis.result = [found && found[0], found && found.index, missed];
    `,
    { transforms: { regexpSticky: true } },
  );
  expect(result.result).toEqual(['a', 1, null]);
});

test('Unicode code-point escapes match astral characters as one value', () => {
  expect(match(String.raw`/^\u{1F600}$/u`, { regexpUnicode: true }, ['😀', 'x'])).toEqual([
    ['😀', 0],
    null,
  ]);
});

test('Unicode property escapes recognize letters across scripts', () => {
  expect(
    match(String.raw`/^\p{Letter}+$/u`, { regexpUnicodePropertyEscapes: true }, [
      'hello',
      'λ',
      '1',
    ]),
  ).toEqual([['hello', 0], ['λ', 0], null]);
});

test('named capture groups expose groups and preserve backreferences', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /(?<word>[a-z]+)-\\k<word>/;
      const found = expression.exec('test-test');
      globalThis.result = [found && found[0], found && found.groups.word, expression.test('test-other')];
    `,
    { transforms: { regexpNamedCaptureGroups: true } },
  );
  expect(result.result).toEqual(['test-test', 'test', false]);
});

test('named captures work with replacement strings', () => {
  const result = execute<{ result: string }>(
    `globalThis.result = 'first-last'.replace(/(?<first>\\w+)-(?<last>\\w+)/, '$<last>, $<first>');`,
    { transforms: { regexpNamedCaptureGroups: true } },
  );
  expect(result.result).toBe('last, first');
});

test('global transformed expressions update and reset lastIndex', () => {
  const result = execute<{ result: unknown[] }>(
    `
      const expression = /a.b/gs;
      const first = expression.exec('a\\nb a-b');
      const second = expression.exec('a\\nb a-b');
      const missed = expression.exec('a\\nb a-b');
      globalThis.result = [first.index, second.index, missed, expression.lastIndex];
    `,
    { transforms: { regexpDotAll: true } },
  );
  expect(result.result).toEqual([0, 4, null, 0]);
});

test('Unicode matching keeps lone surrogates distinct from astral code points', () => {
  const result = execute<{ result: unknown[] }>(
    `
      globalThis.result = [
        /^.$/u.test('😀'),
        /^.$/u.test('\\ud83d'),
        /^..$/u.test('😀'),
      ];
    `,
    { transforms: { regexpUnicode: true } },
  );
  expect(result.result).toEqual([true, true, false]);
});

test('Unicode property escapes support negation and case-insensitive matching', () => {
  expect(
    match(String.raw`/^\P{Number}+$/iu`, { regexpUnicodePropertyEscapes: true }, [
      'Text',
      'λ',
      '2',
    ]),
  ).toEqual([['Text', 0], ['λ', 0], null]);
});
