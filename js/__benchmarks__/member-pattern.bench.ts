import { existsSync } from 'node:fs';
import { bench, describe } from 'vitest';
import { staticMemberPath } from '../runtime/member-pattern';

const baselineRoot = process.env.NOXCTURNAL_BASELINE_ROOT;
const implementations: [string, typeof staticMemberPath][] = [['fixed', staticMemberPath]];
// This scanner was introduced on this branch; origin/main has no module to time.
if (baselineRoot && existsSync(`${baselineRoot}/js/runtime/member-pattern.ts`))
  implementations.unshift([
    'baseline',
    (await import(`${baselineRoot}/js/runtime/member-pattern.ts`)).staticMemberPath,
  ]);
if (process.env.NOXCTURNAL_BENCH_REVERSE) implementations.reverse();

for (const [label, parse] of implementations) {
  if (process.env.NOXCTURNAL_BENCH_ONLY && process.env.NOXCTURNAL_BENCH_ONLY !== label) continue;
  describe(label, () => {
    for (const size of [64, 256, 1024]) {
      for (const [name, source, expected] of [
        [
          'escaped identifiers',
          String.raw`\u0072oot` + String.raw`.\u0076alue`.repeat(size),
          'root' + '.value'.repeat(size),
        ],
        [
          'computed strings',
          'root' + String.raw`["a\u002eb"]`.repeat(size),
          'root' + String.raw`.a\.b`.repeat(size),
        ],
        ['parentheses', '('.repeat(size) + 'root["value"]' + ')'.repeat(size), 'root.value'],
        ['late dynamic suffix', 'root' + '["value"]'.repeat(size) + '[dynamic]', null],
        ['long comment', 'root/*' + '* comment '.repeat(size) + '*/["value"]', 'root.value'],
      ] as const) {
        if (parse(source) !== expected)
          throw new Error(`${label}: incorrect ${name} benchmark result`);
        bench(`${name} / ${size}`, () => parse(source), { time: 500, warmupTime: 200 });
      }
    }
  });
}
