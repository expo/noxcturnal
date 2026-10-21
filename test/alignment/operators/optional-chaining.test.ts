import optionalChaining from '@babel/plugin-transform-optional-chaining';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

function alignOptionalChainingBehavior(
  source: string,
  loose: boolean,
  mustNotMatch: RegExp,
): Promise<unknown> {
  return alignBabelBehavior({
    source,
    filename: 'input.js',
    plugins: [[optionalChaining, { loose }]],
    noxcturnal: { transforms: { optionalChaining: { loose } } },
    output: { mustNotMatch: [mustNotMatch] },
  });
}

test.each([false, true])('aligns optional calls with Babel (loose=%s)', async loose => {
  await expect(
    alignOptionalChainingBehavior(
      `let reads = 0; const object = { value: 42, read() { return this.value; } };
const key = () => { reads++; return 'read'; };
globalThis.__result = [object?.[key()]?.(), null?.[key()], reads];`,
      loose,
      /\?\./,
    ),
  ).resolves.toEqual([42, undefined, 1]);
});

test('aligns chain boundaries, indirect eval, and undeclared roots with Babel', async () => {
  await expect(
    alignOptionalChainingBehavior(
      `function inspect(value) {
  const local = 42;
  let groupedThrows = false;
  let rootThrows = false;
  try { (value?.nested).answer; } catch (error) { groupedThrows = error instanceof TypeError; }
  try { undeclaredRoot?.answer; } catch (error) { rootThrows = error instanceof ReferenceError; }
  return [value?.nested.answer, groupedThrows, eval('local'), eval?.('typeof local'), rootThrows];
}
globalThis.__result = inspect(null);`,
      false,
      /\?\./,
    ),
  ).resolves.toEqual([undefined, true, 42, 'undefined', true]);
});

test('aligns thrown outcomes with Babel', async () => {
  await expect(
    alignOptionalChainingBehavior(
      `const object = { get value() { throw new TypeError('read failed'); } };
globalThis.__result = object?.value;`,
      false,
      /\?\./,
    ),
  ).resolves.toEqual({ throws: { name: 'TypeError', message: 'read failed' } });
});
