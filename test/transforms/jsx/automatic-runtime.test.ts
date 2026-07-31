import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('uses the automatic JSX runtime', async () => {
  const source = `export function Greeting({ name }) {
  return <section className="greeting">Hello, {name}</section>;
}`;
  expect(await transformSource(source, 'input.jsx', { jsx: 'automatic' })).toMatchInlineSnapshot(`
    "import { jsxs as _jsxs } from 'react/jsx-runtime';
    export function Greeting({ name }) {
      return /* @__PURE__ */ _jsxs('section', {
        className: 'greeting',
        children: ['Hello, ', name],
      });
    }"
  `);
});
