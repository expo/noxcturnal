import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';
import { codeFactory } from '../fragments';
const require = createRequire(import.meta.url);
const babelRequire = createRequire(require.resolve('@babel/core'));
const { parseExpression } = babelRequire('@babel/parser') as {
  parseExpression(source: string): unknown;
};
const cases = [
  {
    name: 'extra statements through wrapper boundary',
    source: '0); extra(); (0',
    valid: false,
    fails: true,
  },
  { name: 'trailing line comment', source: '3 // note', valid: true, fails: true },
  { name: 'ordinary expression', source: '3 + 4', valid: true, fails: false },
  { name: 'incomplete expression', source: '3 +', valid: false, fails: false },
];
function accepts(parse: () => unknown, native = false) {
  try {
    parse();
    return true;
  } catch (error) {
    if (native) expect((error as Error).message).toMatch(/invalid expression fragment/);
    else expect(error).toBeInstanceOf(SyntaxError);
    return false;
  }
}
describe.each(cases)('$name', entry => {
  let accepted: boolean;
  beforeAll(() => {
    accepted = accepts(() => codeFactory.parseExpression(entry.source), true);
  });
  test('Babel expression parser control', () =>
    expect(accepts(() => parseExpression(entry.source))).toBe(entry.valid));
  (entry.fails ? test.fails : test)('expression factory validates exactly one expression', () =>
    expect(accepted).toBe(entry.valid),
  );
});
