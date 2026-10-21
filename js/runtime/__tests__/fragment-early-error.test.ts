import { expect, test } from 'vitest';
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
test.each(cases)('statement fragment validation: $name', ({ source, valid }) => {
  const parse = () => codeFactory.parseStatements(source);
  if (valid) expect(parse).not.toThrow();
  else expect(parse).toThrow(/invalid statement fragment/);
});
