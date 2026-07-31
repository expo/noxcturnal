import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('compiles React components', async () => {
  const source = `export function Greeting({ name }) {
  const message = \`Hello, ${'${name}'}\`;
  return <Text>{message}</Text>;
}`;
  expect(
    await transformSource(source, 'input.jsx', {
      reactCompiler: {
        compilationMode: 'infer',
        panicThreshold: 'none',
        target: '19',
        enableResetCacheOnSourceFileChanges: true,
      },
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = \`Hello, \${name}\`;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});
