import { expect, test } from 'vitest';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

// Match the retained-query setup in lifecycle.test.ts.
const retainedCapabilities = (1 << 6) - 1;
test.each([
  { name: 'negative-zero literal', expression: '-0', expected: -0 },
  { name: 'lone high surrogate', expression: String.raw`"\uD800"`, expected: '\uD800' },
  { name: 'lone low surrogate', expression: String.raw`"\uDC00"`, expected: '\uDC00' },
  { name: 'negative-zero arithmetic', expression: '0 / -1', expected: -0 },
  {
    name: 'number stringification',
    expression: '"" + 1000000000000000.25',
    expected: '1000000000000000.2',
  },
  { name: 'leading NUL string', expression: String.raw`"\u0000"`, expected: '\0' },
  {
    name: 'replacement plus surrogate',
    expression: String.raw`"\uFFFD\uD800"`,
    expected: '\uFFFD\uD800',
  },
])('constant query preserves $name', ({ expression, expected }) => {
  let actual: unknown;
  const source = `const value = ${expression};`;
  const session = new NativeTransformSession(
    source,
    'input.js',
    {},
    packRouteManifest([], false, false, retainedCapabilities),
  );
  try {
    const node = session
      .nodes(['UnaryExpression', 'BinaryExpression', 'StringLiteral'])
      .find(node => source.slice(node.start, node.end) === expression);
    expect(node).toBeDefined();
    actual = session.query({ constants: [node!.id] }).constants[node!.id];
  } finally {
    session.close();
  }
  expect(Object.is(actual, expected)).toBe(true);
});
