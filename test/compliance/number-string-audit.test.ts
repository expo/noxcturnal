import { beforeAll, describe, expect, test } from 'vitest';
import { compile } from './runtime';

function run(code: string) {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each([
  ['positive', '1000000000000000.25', '1000000000000000.2'],
  ['negative', '-1000000000000000.25', '-1000000000000000.2'],
])('number-to-string folding: %s', (_name, literal, expected) => {
  const source = `globalThis.result = "" + (${literal});`;
  let code: string;
  beforeAll(() => {
    code = compile(source, { optimize: { constantFolding: true } });
    expect(code).not.toContain(' + ');
  });
  test('native decimal string control', () => expect(run(source)).toBe(expected));
  test.fails('folding uses JavaScript number formatting', () => expect(run(code)).toBe(expected));
});
