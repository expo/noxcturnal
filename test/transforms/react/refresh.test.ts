import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('instruments components for React Refresh', async () => {
  const source = `export function Greeting() { return <Text>Hello</Text>; }`;
  expect(await transformSource(source, 'input.jsx', { reactRefresh: {}, jsx: 'preserve' }))
    .toMatchInlineSnapshot(`
    "export function Greeting() {
      return <Text>Hello</Text>;
    }
    _c = Greeting;
    var _c;
    $RefreshReg$(_c, 'Greeting');"
  `);
});
