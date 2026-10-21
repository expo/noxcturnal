import { expect, test } from 'vitest';
import { codeFactory } from '../fragments';
const cases = [
  { name: 'trailing line comment', source: '3 // note', valid: true },
  { name: 'ordinary expression', source: '3 + 4', valid: true },
  { name: 'incomplete expression', source: '3 +', valid: false },
];
test.each(cases)('expression factory: $name', ({ source, valid }) => {
  const parse = () => codeFactory.parseExpression(source);
  if (valid) expect(parse).not.toThrow();
  else expect(parse).toThrow(/invalid expression fragment/);
});
