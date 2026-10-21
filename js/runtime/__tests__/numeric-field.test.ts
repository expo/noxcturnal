import { expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
for (const retained of [false, true])
  test.each([
    { source: '1e400;', expected: Infinity },
    { source: '1e308;', expected: 1e308 },
    { source: '0;', expected: 0 },
  ])(`numeric value retained=${retained}: $source`, entry => {
    let values: unknown[] = [];
    const visitor = defineVisitor('NumericLiteral', { scope: retained, fields: ['value'] }, p =>
      values.push(p.node.value),
    );
    const result = transform(
      entry.source,
      'input.js',
      defineNativePipeline({
        phases: [
          {
            name: 'read',
            plugins: [defineNativePlugin({ name: 'numeric-reader', visitors: [visitor] })],
          },
        ],
      }),
    );
    expect(result.status).toBe('complete');
    expect(values).toHaveLength(1);
    expect(Object.is(values[0], entry.expected)).toBe(true);
  });
