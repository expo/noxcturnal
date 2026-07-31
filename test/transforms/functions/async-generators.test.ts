import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers async generator functions', async () => {
  const source = `export async function* values() { yield await Promise.resolve(1); }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _awaitAsyncGenerator from '@babel/runtime/helpers/awaitAsyncGenerator';
    import _wrapAsyncGenerator from '@babel/runtime/helpers/wrapAsyncGenerator';
    export function values() {
      return _values.apply(this, arguments);
    }
    function _values() {
      _values = _wrapAsyncGenerator(function* () {
        yield yield _awaitAsyncGenerator(Promise.resolve(1));
      });
      return _values.apply(this, arguments);
    }"
  `);
});

test('validates native async iterator next and return results', async () => {
  const output = await transformSource(
    `export async function inspect(iterable) { for await (const value of iterable) { void value; break; } }`,
    'input.js',
    {
      helpers: runtimeHelpers,
      transforms: { asyncGeneratorFunctions: true },
    },
  );
  expect(output).toContain('function _iteratorResult(value)');
  expect(output).toContain('_iteratorResult(await _iterator.next())');
  expect(output).toContain('_iteratorResult(await _iterator.return())');
});
