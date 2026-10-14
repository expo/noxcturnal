import { beforeAll, describe, expect, test } from 'vitest';
import { packRouteManifest } from '../../protocol/manifest';
import { NativeTransformSession } from '../session';

// Match the retained-query setup in lifecycle.test.ts.
const retainedCapabilities = (1 << 6) - 1;
describe.each([
  ['negative-zero literal', '-0', -0],
  ['lone high surrogate', String.raw`"\uD800"`, '\uD800'],
  ['lone low surrogate', String.raw`"\uDC00"`, '\uDC00'],
  ['negative-zero arithmetic', '0 / -1', -0],
  ['number stringification', '"" + 1000000000000000.25', '1000000000000000.2'],
])('constant query: %s', (_name, expression, expected) => {
  let actual: unknown;
  beforeAll(() => {
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
      expect(typeof actual).toBe(typeof expected);
    } finally {
      session.close();
    }
  });
  test('native expression control', () => {
    expect(Object.is(new Function(`return (${expression});`)(), expected)).toBe(true);
  });
  test.fails('query preserves the evaluated value', () =>
    expect(Object.is(actual, expected)).toBe(true));
});
