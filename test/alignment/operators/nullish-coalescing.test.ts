import nullishCoalescing from '@babel/plugin-transform-nullish-coalescing-operator';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test.each([false, true])('aligns nullish coalescing with Babel (loose=%s)', async loose => {
  await expect(
    alignBabelBehavior({
      source: `let calls = 0; const read = value => { calls++; return value; };
globalThis.__result = [read(null) ?? 42, read(0) ?? 1, calls];`,
      filename: 'input.js',
      plugins: [[nullishCoalescing, { loose }]],
      noxcturnal: { transforms: { nullishCoalescingOperator: { loose } } },
      output: { mustNotMatch: [/\?\?/] },
    }),
  ).resolves.toEqual([42, 0, 2]);
});

test('preserves non-JSON primitive observations', async () => {
  await expect(
    alignBabelBehavior({
      source: `const absent = null ?? undefined;
globalThis.__result = [absent, 0 / 0, -0, 42n];`,
      filename: 'input.js',
      plugins: [[nullishCoalescing, { loose: false }]],
      noxcturnal: { transforms: { nullishCoalescingOperator: { loose: false } } },
      output: { mustNotMatch: [/\?\?/] },
    }),
  ).resolves.toEqual([undefined, NaN, -0, 42n]);
});

test.each([false, true])(
  'aligns computed super references without coercing operands (loose=%s)',
  async loose => {
    await expect(
      alignBabelBehavior({
        source: `const calls = [];
const nonNullish = { valueOf() { calls.push('coerce'); return null; } };
class Base {
  get value() { calls.push(['get', this.current]); return this.current; }
}
class Child extends Base {
  current = null;
  read() {
    const key = () => (calls.push('key'), 'value');
    const first = super[key()] ?? 42;
    this.current = 0;
    const second = super[key()] ?? 43;
    return [first, second, nonNullish ?? 44];
  }
}
const values = new Child().read();
globalThis.__result = [[values[0], values[1], values[2] === nonNullish], calls];`,
        filename: 'input.js',
        plugins: [[nullishCoalescing, { loose }]],
        noxcturnal: { transforms: { nullishCoalescingOperator: { loose } } },
        output: { mustNotMatch: [/\?\?/] },
      }),
    ).resolves.toEqual([
      [42, 0, true],
      ['key', ['get', null], 'key', ['get', 0]],
    ]);
  },
);
