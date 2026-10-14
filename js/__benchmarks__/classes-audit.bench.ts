import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { bench, describe } from 'vitest';
import { native } from '../native/binding';

// Supply an independently built baseline addon to compare the same native ABI.
const baselinePath = process.env.NOXCTURNAL_CLASS_BASELINE;
const implementations: [string, typeof native][] = [['fixed', native]];
if (baselinePath)
  implementations.unshift(['baseline', createRequire(import.meta.url)(baselinePath)]);
const cases = [
  ['public fields', 'class C { x=1; y=2; read(){return this.x+this.y} }', 'new C().read()', 3],
  [
    'private methods',
    'class C { #read(){return 3} read(){return this.#read()} }',
    'new C().read()',
    3,
  ],
  [
    'super assignment',
    'class B {set x(v){this.value=v}} class C extends B {write(){return super.x=3}}',
    'new C().write()',
    3,
  ],
  [
    'super compound',
    'class B {get x(){return 1}set x(v){this.value=v}} class C extends B {write(){return super.x+=2}}',
    'new C().write()',
    3,
  ],
] as const;
const options = { classes: true, helpersMode: 'inline', compact: true } as const;
for (const [name, classes, operation, expected] of cases) {
  const source = `${classes} function run(){let value;for(let i=0;i<1000;i++)value=${operation};return value}`;
  describe(name, () => {
    for (const [label, implementation] of implementations) {
      const output = implementation.nativePreflightTransform(source, 'bench.js', options);
      assert.equal(output.status, 'complete');
      assert.ok(output.code);
      const run = new Function(`${output.code};return run`)() as () => number;
      assert.equal(run(), expected);
      console.log(`${name}/${label}: input=${source.length} output=${output.code.length} bytes`);
      bench(
        `${label}: compile`,
        () => {
          implementation.nativePreflightTransform(source, 'bench.js', options);
        },
        { time: 250, warmupTime: 100 },
      );
      bench(`${label}: 1000 constructions/operations`, () => run(), { time: 250, warmupTime: 100 });
    }
  });
}
