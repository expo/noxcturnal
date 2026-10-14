import { beforeAll, describe, expect, test } from 'vitest';
import { codeFactory } from '../fragments';

describe.each([
  { name: 'negative zero', value: -0, fails: true },
  { name: 'NaN with a shadowed name', value: NaN, fails: true },
  { name: 'infinity with a shadowed name', value: Infinity, fails: true },
  { name: 'negative infinity with a shadowed name', value: -Infinity, fails: true },
  { name: 'finite number', value: 3.25, fails: false },
  { name: 'negative BigInt', value: -3n, fails: false },
])('literal factory: $name', entry => {
  let actual: unknown;
  beforeAll(() => {
    const fragment = codeFactory.literal(entry.value);
    expect(fragment.mapping).toBe('sourceless');
    // Compile and execute before expected-failure value assertions.
    actual = new Function('NaN', 'Infinity', `return (${fragment.code});`)(7, 9);
  });
  (entry.fails ? test.fails : test)('generated expression preserves the supplied value', () => {
    expect(Object.is(actual, entry.value)).toBe(true);
  });
});
