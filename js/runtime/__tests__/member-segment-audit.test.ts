import { transformSync, type NodePath } from '@babel/core';
import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
const pattern = 'process.env.NODE_ENV';
function run(code: string) {
  const context: Record<string, unknown> = {};
  new Function('process', 'globalThis', code)({ 'env.NODE_ENV': 9, env: { NODE_ENV: 3 } }, context);
  return context.result;
}
describe.each([
  {
    name: 'dot inside one property',
    source: `globalThis.result=process['env.NODE_ENV'];`,
    original: 9,
    expected: 9,
    fails: true,
  },
  {
    name: 'separate properties',
    source: 'globalThis.result=process.env.NODE_ENV;',
    original: 3,
    expected: 42,
    fails: false,
  },
])('$name', entry => {
  let babel: string;
  const codes = new Map<string, string>();
  beforeAll(() => {
    babel = transformSync(entry.source, {
      configFile: false,
      babelrc: false,
      plugins: [
        () => ({
          visitor: {
            MemberExpression(path: NodePath) {
              if (path.matchesPattern(pattern)) path.replaceWithSourceString('42');
            },
          },
        }),
      ],
    })!.code!;
    for (const route of ['retained match', 'native predicate']) {
      const plugin = defineNativePlugin({
        name: 'segment-audit',
        visitors: [
          defineVisitor(
            entry.fails ? 'ComputedMemberExpression' : 'StaticMemberExpression',
            {
              fields: ['memberPath'],
              ...(route === 'native predicate'
                ? { where: { memberPath: { oneOf: [pattern] } } }
                : {}),
            },
            path => {
              if (route === 'native predicate' || path.matchesPattern(pattern))
                path.replaceWith('42');
            },
          ),
        ],
      });
      const result = transform(
        entry.source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'replace-match', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      if (result.status !== 'complete') throw new Error(result.reason);
      codes.set(route, result.code);
    }
  });
  test('original property control', () => expect(run(entry.source)).toBe(entry.original));
  test('Babel matching preserves property boundaries', () =>
    expect(run(babel)).toBe(entry.expected));
  test.each(['retained match', 'native predicate'])('%s preserves property boundaries', route => {
    expect(run(codes.get(route)!)).toBe(entry.expected);
  });
});
