import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers explicit resource management', async () => {
  const source = `export function read() { using value = acquire(); return value; }`;
  expect(
    await transformSource(source, 'input.js', {
      helpers: runtimeHelpers,
      transforms: { explicitResourceManagement: true },
    }),
  ).toMatchInlineSnapshot(`
    "import _usingCtx2 from '@babel/runtime/helpers/usingCtx';
    export function read() {
      try {
        var _usingCtx = _usingCtx2();
        const value = _usingCtx.u(acquire());
        return value;
      } catch (_) {
        _usingCtx.e = _;
      } finally {
        _usingCtx.d();
      }
    }"
  `);
});
