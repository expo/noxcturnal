import { expect, test } from 'vitest';
import { codeFactory } from '../fragments';

test.each([
  { name: 'negative zero', value: -0 },
  { name: 'NaN with a shadowed name', value: NaN },
  { name: 'infinity with a shadowed name', value: Infinity },
  { name: 'negative infinity with a shadowed name', value: -Infinity },
  { name: 'finite number', value: 3.25 },
  { name: 'negative BigInt', value: -3n },
])('literal factory preserves $name under shadowed globals', ({ value }) => {
  const fragment = codeFactory.literal(value);
  expect(fragment.mapping).toBe('sourceless');
  const actual = new Function('NaN', 'Infinity', `return (${fragment.code});`)(7, 9);
  expect(Object.is(actual, value)).toBe(true);
});

test.each([-0, NaN, Infinity, -Infinity])(
  'special number %s is an atomic member receiver',
  value => {
    const code = codeFactory.literal(value).code;
    const actual = new Function('NaN', 'Infinity', `return ${code}.valueOf();`)(7, 9);
    expect(Object.is(actual, value)).toBe(true);
  },
);
