import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
for (const retained of [false, true])
  describe.each([
    { source: '1e400;', expected: Infinity, fails: true },
    { source: '1e308;', expected: 1e308, fails: false },
    { source: '0;', expected: 0, fails: false },
  ])(`numeric value retained=${retained}: $source`, entry => {
    let values: unknown[] = [];
    beforeAll(() => {
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
      expect(new Function(`return ${entry.source}`)()).toBe(entry.expected);
    });
    (entry.fails ? test.fails : test)('preserves the numeric literal value', () => {
      expect(values).toEqual([entry.expected]);
    });
  });
