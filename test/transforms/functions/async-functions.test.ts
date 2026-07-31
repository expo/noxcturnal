import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers async functions', async () => {
  const source = `export async function read(value) { return await value; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
    export function read(_x) {
      return _read.apply(this, arguments);
    }
    function _read() {
      _read = _asyncToGenerator(function* (value) {
        return yield value;
      });
      return _read.apply(this, arguments);
    }"
  `);
});
