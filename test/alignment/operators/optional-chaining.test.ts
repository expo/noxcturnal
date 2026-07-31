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

test('aligns optional private access, branding, and method receivers with Babel', async () => {
  await expect(
    alignOptionalChainingBehavior(
      `class Value {
  #value = 4;
  #read(extra) { return this.#value + extra; }
  inspect(input) { return [input?.#value, input?.#read(3)]; }
}
const value = new Value();
let fakeError = false;
try { value.inspect({}); } catch (error) { fakeError = error instanceof TypeError; }
globalThis.__result = [value.inspect(null), value.inspect(value), fakeError];`,
      false,
      /\?\./,
    ),
  ).resolves.toEqual([[undefined, undefined], [4, 7], true]);
});

test('aligns optional super calls and receivers with Babel', async () => {
  await expect(
    alignOptionalChainingBehavior(
      `const calls = [];
class Base {
  method(extra) { return this.value + extra; }
  get callable() {
    calls.push(['get', this.value]);
    return function (extra) { calls.push(['call', this.value]); return this.value + extra; };
  }
}
class Child extends Base {
  value = 40;
  read() {
    const key = (calls.push('key'), 'method');
    return [super.method?.(1), super[key]?.(2), super.callable?.(3), super.missing?.()];
  }
}
globalThis.__result = [new Child().read(), calls];`,
      false,
      /\?\./,
    ),
  ).resolves.toEqual([
    [41, 42, 43, undefined],
    ['key', ['get', 40], ['call', 40]],
  ]);
});
