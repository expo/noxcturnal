import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

const cases = [
  {
    name: 'statement and callee share start',
    source: 'call(argument); trailing;',
    parent: 'ExpressionStatement' as const,
  },
  {
    name: 'call and callee share start',
    source: 'call(argument); trailing;',
    parent: 'CallExpression' as const,
  },
  {
    name: 'function descendants start later',
    source: 'function call(argument){} trailing;',
    parent: 'Function' as const,
  },
];
describe.each([false, true])('nested traversal: %s', nested => {
  describe.each(cases)('$name', entry => {
    let visited: string[];
    let exited: string[];
    beforeAll(() => {
      visited = [];
      exited = [];
      let skipped = false;
      const visitors = [
        defineVisitor(entry.parent, { controlFlow: ['skip'] }, path => {
          if (!skipped) {
            skipped = true;
            path.skip();
          }
        }),
        defineVisitor(
          'Identifier',
          { fields: ['name'], controlFlow: ['skip'] },
          {
            enter(path) {
              visited.push(String(path.node.name));
            },
            exit(path) {
              exited.push(String(path.node.name));
            },
          },
        ),
      ];
      const plugin = defineNativePlugin({
        name: 'skip-boundary',
        visitors: nested
          ? [
              defineVisitor(
                'Program',
                { controlFlow: ['nested-traverse'], nested: visitors },
                path => path.traverse(visitors),
              ),
            ]
          : visitors,
      });
      const result = transform(
        entry.source,
        'input.js',
        defineNativePipeline({ phases: [{ name: 'skip', plugins: [plugin] }] }),
      );
      expect(result.status).toBe('complete');
      expect(skipped).toBe(true);
    });
    test('skips all descendants while preserving siblings', () => {
      expect(visited).toEqual(['trailing']);
    });
    test('skips descendant exit handlers while preserving siblings', () => {
      expect(exited).toEqual(['trailing']);
    });
  });
});
