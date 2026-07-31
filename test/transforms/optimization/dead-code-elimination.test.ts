import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('eliminates dead code', async () => {
  const source = `export function enabled() { if (false) return 'unreachable'; return 'reachable'; }`;
  expect(await transformSource(source, 'input.js', { optimize: { deadCodeElimination: true } }))
    .toMatchInlineSnapshot(`
    "export function enabled() {
      if (false) return 'unreachable';
      return 'reachable';
    }"
  `);
});
