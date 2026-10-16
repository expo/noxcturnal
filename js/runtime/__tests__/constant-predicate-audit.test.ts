import { beforeAll, describe, expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';
import type { ScalarValue } from '../../types';

const cases: {
  name: string;
  route: 'NullLiteral' | 'StringLiteral' | 'NumericLiteral' | 'BooleanLiteral';
  source: string;
  value: ScalarValue;
  expected: number;
}[] = [
  {
    name: 'null matches null',
    route: 'NullLiteral',
    source: 'null;',
    value: null,
    expected: 1,
  },
  {
    name: 'null does not match empty string',
    route: 'NullLiteral',
    source: 'null;',
    value: '',
    expected: 0,
  },
  {
    name: 'boolean-looking string matches string',
    route: 'StringLiteral',
    source: '"true";',
    value: 'true',
    expected: 1,
  },
  {
    name: 'boolean-looking string does not match boolean',
    route: 'StringLiteral',
    source: '"true";',
    value: true,
    expected: 0,
  },
  {
    name: 'numeric-looking string matches string',
    route: 'StringLiteral',
    source: '"3";',
    value: '3',
    expected: 1,
  },
  {
    name: 'numeric-looking string does not match number',
    route: 'StringLiteral',
    source: '"3";',
    value: 3,
    expected: 0,
  },
  {
    name: 'ordinary string',
    route: 'StringLiteral',
    source: '"word";',
    value: 'word',
    expected: 1,
  },
  {
    name: 'lone surrogate string',
    route: 'StringLiteral',
    source: '"\\uD800";',
    value: '\uD800',
    expected: 1,
  },
  {
    name: 'empty string',
    route: 'StringLiteral',
    source: '"";',
    value: '',
    expected: 1,
  },
  ...['\uD800', '\0'].flatMap(prefix =>
    ['\u2028', '\u2029'].map(separator => ({
      name: `exceptional string ${JSON.stringify(prefix + separator)}`,
      route: 'StringLiteral' as const,
      source: `${JSON.stringify(prefix + separator)};`,
      value: prefix + separator,
      expected: 1,
    })),
  ),
  { name: 'number', route: 'NumericLiteral', source: '3;', value: 3, expected: 1 },
  {
    name: 'boolean',
    route: 'BooleanLiteral',
    source: 'true;',
    value: true,
    expected: 1,
  },
];
for (const retained of [false, true]) {
  for (const operation of ['equals', 'oneOf'] as const) {
    describe.each(cases)(`${retained ? 'retained' : 'routed'} ${operation}: $name`, entry => {
      let visits = 0;
      beforeAll(() => {
        const predicate =
          operation === 'equals' ? { equals: entry.value } : { oneOf: [entry.value] };
        const visitor = defineVisitor(
          entry.route,
          { scope: retained, where: { constantValue: predicate } },
          () => {
            visits++;
          },
        );
        const retainedCalls = vi.spyOn(NativeTransformSession.prototype, 'nextRoutedPacked');
        try {
          const result = transform(
            entry.source,
            'input.js',
            defineNativePipeline({
              phases: [
                {
                  name: 'scan',
                  plugins: [defineNativePlugin({ name: 'constant-filter', visitors: [visitor] })],
                },
              ],
            }),
          );
          expect(result.status).toBe('complete');
          if (retained) expect(retainedCalls).toHaveBeenCalled();
          else expect(retainedCalls).not.toHaveBeenCalled();
        } finally {
          retainedCalls.mockRestore();
        }
      });
      test('matches the typed constant, not its text encoding', () => {
        expect(visits).toBe(entry.expected);
      });
    });
  }
}
