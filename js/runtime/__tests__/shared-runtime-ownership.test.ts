import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test('nested traversals retain each plugin owner when runtime helpers are shared', () => {
  const visits: string[] = [];
  const plugins = ['first', 'second'].map((key, index) => {
    const nested = [
      defineVisitor(
        'NumericLiteral',
        { fields: ['value'], where: { value: { equals: index + 1 } } },
        (path, state: string) => {
          expect(state).toBe(key);
          path.context.metadata.set(key, state);
          visits.push(state);
          path.replaceWith(String((index + 1) * 11));
        },
      ),
    ];
    return defineNativePlugin({
      name: 'same-name',
      contract: { metadata: { writes: [key] } },
      visitors: [
        defineVisitor('Program', { controlFlow: ['nested-traverse'], nested }, path => {
          path.traverse(nested, key);
        }),
      ],
    });
  });
  const pipeline = defineNativePipeline({ phases: [{ name: 'edit', plugins }] });
  for (const filename of ['first.js', 'second.js']) {
    visits.length = 0;
    const result = transform('1;2;', filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(result.code).toBe('11;22;');
    expect(result.metadata).toEqual({ first: 'first', second: 'second' });
    expect(visits).toEqual(['first', 'second']);
  }
});
