import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePlugin, defineNativePipeline, defineVisitor, transform } from '../../index';
const cases = [
  { route: 'NullLiteral', source: 'null;', constant: true, omitted: true },
  { route: 'ConditionalExpression', source: 'true ? 3 : 4;', constant: true, omitted: true },
  { route: 'ParenthesizedExpression', source: '(3);', constant: true, omitted: true },
  { route: 'SequenceExpression', source: '1,3;', constant: true, omitted: true },
  { route: 'BinaryExpression', source: '1+2;', constant: true, omitted: false },
  { route: 'BinaryExpression', source: 'value+2;', constant: false, omitted: false },
] as const;
for (const retained of [false, true])
  for (const present of [false, true])
    describe.each(cases)(`retained=${retained} present=${present}: $source`, entry => {
      let visits = 0;
      beforeAll(() => {
        const visitor = defineVisitor(
          entry.route,
          { scope: retained, where: { constantValue: { present } } },
          () => {
            visits++;
          },
        );
        const result = transform(
          entry.source,
          'input.js',
          defineNativePipeline({
            phases: [
              {
                name: 'scan',
                plugins: [defineNativePlugin({ name: 'presence', visitors: [visitor] })],
              },
            ],
          }),
        );
        expect(result.status).toBe('complete');
      });
      test('distinguishes an available constant from an unevaluable expression', () => {
        expect(visits).toBe(Number(entry.constant === present));
      });
    });
