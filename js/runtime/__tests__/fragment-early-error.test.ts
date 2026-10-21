import { parseSync } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { codeFactory } from '../fragments';
const cases = [
  {
    name: 'duplicate strict parameters',
    source: 'function f(value,value){"use strict";}',
    valid: false,
  },
  { name: 'duplicate private field', source: 'class C{#x;#x;}', valid: false },
  { name: 'missing const initializer', source: 'const value;', valid: false },
  {
    name: 'valid closed declaration',
    source: 'function f(value){"use strict";return value}',
    valid: true,
  },
];
function syntaxAccepted(parse: () => unknown) {
  try {
    parse();
    return true;
  } catch (error) {
    expect(error).toBeInstanceOf(SyntaxError);
    return false;
  }
}
describe.each(cases)('$name', entry => {
  let accepted: boolean;
  beforeAll(() => {
    try {
      codeFactory.parseStatements(entry.source);
      accepted = true;
    } catch (error) {
      expect((error as Error).message).toMatch(/invalid statement fragment/);
      accepted = false;
    }
  });
  test('native syntax control', () =>
    expect(syntaxAccepted(() => new Function(entry.source))).toBe(entry.valid));
  test('Babel parser control', () =>
    expect(
      syntaxAccepted(() => parseSync(entry.source, { configFile: false, babelrc: false })),
    ).toBe(entry.valid));
  test('statement validation rejects internal early errors', () =>
    expect(accepted).toBe(entry.valid));
});
