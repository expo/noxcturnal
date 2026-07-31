import decorators from '@babel/plugin-proposal-decorators';
import { expect, test } from 'vitest';

import { alignBabelBehavior } from '../transform';

test('aligns legacy class and method decorator behavior with Babel', async () => {
  await expect(
    alignBabelBehavior({
      source: `
const calls = [];
function replace(Class) {
  calls.push('class');
  return class extends Class { replaced = true; };
}
function double(target, key, descriptor) {
  calls.push(key);
  const original = descriptor.value;
  descriptor.value = function () { return original.call(this) * 2; };
}
@replace
class Example {
  @double read() { return 21; }
}
const value = new Example();
globalThis.__result = [calls, value.read(), value.replaced, value instanceof Example];`,
      filename: 'input.js',
      plugins: [[decorators, { legacy: true }]],
      noxcturnal: { transforms: { legacyDecorators: true } },
      output: { mustMatch: [/_decorate/], mustNotMatch: [/@(?:replace|double)/] },
    }),
  ).resolves.toEqual([['read', 'class'], 42, true, true]);
});
