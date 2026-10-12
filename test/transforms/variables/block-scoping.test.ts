import { expect, test } from 'vitest';
import { runtimeHelpers, transformSource } from '../transform';

test('lowers block-scoped declarations', async () => {
  const source = `export function read(flag) { if (flag) { let value = 1; return value; } }`;
  expect(await transformSource(source, 'input.js', { transforms: { blockScoping: true } }))
    .toMatchInlineSnapshot(`
    "export function read(flag) {
      if (flag) {
        var value = 1;
        return value;
      }
    }"
  `);
});

test.each([
  { name: 'block scoping alone', transforms: { blockScoping: true } },
  { name: 'with for-of lowering', transforms: { blockScoping: true, forOf: true } },
])('terminates for an iterable arrow with a local declaration: $name', async ({ transforms }) => {
  const output = await transformSource(
    'for (const t of (u => { const r = u; return r; })(o)) void 0;',
    'input.js',
    { transforms },
  );
  expect(output).toContain('var r = u');
  expect(output).not.toContain('_loop');
  expect(output).not.toMatch(/\bconst\b/);
  if (transforms.forOf) expect(output).toContain('[Symbol.iterator]()');
});

test('uses the Babel runtime readOnlyError helper when runtime helpers are selected', async () => {
  const output = await transformSource(`const value = 1; value = sideEffect();`, 'input.js', {
    helpers: runtimeHelpers,
    transforms: { blockScoping: true },
  });
  expect(output).toContain("require('@babel/runtime/helpers/readOnlyError')");
  expect(output).toContain("sideEffect(), _readOnlyError('value')");
});
