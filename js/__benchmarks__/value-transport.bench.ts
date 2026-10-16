import { bench, describe } from 'vitest';
import * as current from '../index';

const implementations: [string, typeof current][] = [['fixed', current]];
if (process.env.NOXCTURNAL_BASELINE_ROOT)
  implementations.unshift([
    'baseline',
    await import(`${process.env.NOXCTURNAL_BASELINE_ROOT}/js/index.ts`),
  ]);
if (process.env.NOXCTURNAL_BENCH_REVERSE) implementations.reverse();

const ordinary = Array.from(
  { length: 400 },
  (_, index) => `const s${index} = "word${index}";\nconst n${index} = ${index};`,
).join('\n');
const exceptional = Array.from(
  { length: 40 },
  (_, index) => `const value${index} = ${JSON.stringify('\uD800x\uDC00\0')};`,
).join('\n');

for (const [label, api] of implementations) {
  const pipeline = (scope: boolean, fields: string[]) =>
    api.defineNativePipeline({
      phases: [
        {
          name: 'read',
          plugins: [
            api.defineNativePlugin({
              name: 'read',
              visitors: [
                api.defineVisitor('StringLiteral|NumericLiteral', { scope, fields }, () => {}),
              ],
            }),
          ],
        },
      ],
    });
  const directStrings = pipeline(false, ['value']);
  const directConstants = pipeline(false, ['constantKind', 'constantValue']);
  const retainedConstants = pipeline(true, ['constantKind', 'constantValue']);
  const predicate = api.defineNativePipeline({
    phases: [
      {
        name: 'filter',
        plugins: [
          api.defineNativePlugin({
            name: 'filter',
            visitors: [
              api.defineVisitor(
                'StringLiteral|NumericLiteral',
                { where: { constantValue: { equals: 'word0' } } },
                () => {},
              ),
              api.defineVisitor(
                'StringLiteral|NumericLiteral',
                { scope: true, where: { constantValue: { equals: 1 } } },
                () => {},
              ),
            ],
          }),
        ],
      },
    ],
  });
  describe(label, () => {
    for (const [name, input, plan] of [
      ['direct string values / 400 ordinary literals', ordinary, directStrings],
      ['direct constant fields / 400 ordinary literals', ordinary, directConstants],
      ['retained constant fields / 400 ordinary literals', ordinary, retainedConstants],
      ['direct and retained constant predicates / 400 ordinary literals', ordinary, predicate],
      ['direct string values / 40 exceptional strings', exceptional, directStrings],
    ] as const)
      bench(
        name,
        () => {
          api.transform(input, 'input.js', plan);
        },
        { time: 500, warmupTime: 200 },
      );
  });
}
