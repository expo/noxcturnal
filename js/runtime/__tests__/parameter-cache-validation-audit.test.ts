import { beforeAll, describe, expect, test } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  parameter,
  transform,
} from '../../index';

describe.each([NaN, Infinity, -Infinity])('predicate parameter %s', value => {
  for (const warmed of [false, true]) {
    describe(`cache warmed with null=${warmed}`, () => {
      let rejected: boolean;
      beforeAll(() => {
        const plugin = defineNativePlugin({
          name: 'parameter-cache',
          visitors: [
            defineVisitor(
              'NullLiteral',
              {
                fields: ['constantValue'],
                where: { constantValue: { equals: parameter('value') } },
              },
              () => {},
            ),
          ],
        });
        if (warmed) plugin.withParameters({ value: null });
        try {
          const bound = plugin.withParameters({ value });
          const result = transform(
            'null;',
            'input.js',
            defineNativePipeline({ phases: [{ name: 'scan', plugins: [bound] }] }),
          );
          expect(result.status).toBe('complete');
          rejected = false;
        } catch (error) {
          expect((error as Error).message).toMatch(/invalid scalar value/);
          rejected = true;
        }
      });
      test('rejects nonfinite predicates regardless of prior bindings', () => {
        expect(rejected).toBe(true);
      });
    });
  }
});

describe.each([false, true])('sparse predicate list, warmed=%s', warmed => {
  let rejected: boolean;
  beforeAll(() => {
    const plugin = defineNativePlugin({
      name: 'list-cache',
      visitors: [
        defineVisitor(
          'NumericLiteral',
          { where: { value: { oneOf: parameter('values') } } },
          () => {},
        ),
      ],
    });
    if (warmed) plugin.withParameters({ values: [] });
    try {
      const bound = plugin.withParameters({ values: new Array<number>(1) });
      const result = transform(
        '3;',
        'input.js',
        defineNativePipeline({ phases: [{ name: 'scan', plugins: [bound] }] }),
      );
      expect(result.status).toBe('complete');
      rejected = false;
    } catch (error) {
      expect((error as Error).message).toMatch(/invalid scalar value/);
      rejected = true;
    }
  });
  test('rejects missing list entries regardless of earlier bindings', () =>
    expect(rejected).toBe(true));
});
