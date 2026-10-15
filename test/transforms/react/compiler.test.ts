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
      const $ = _c(3);
      if ($[0] !== 'fc62a1d58a79478e0c3bcfde8a6a08d838f2047a') {
        for (let i = 1; i < 3; i++) $[i] = Symbol.for('react.memo_cache_sentinel');
        $[0] = 'fc62a1d58a79478e0c3bcfde8a6a08d838f2047a';
      }
      const { name } = t0;
      const message = \`Hello, \${name}\`;
      let t1;
      if ($[1] !== message) {
        t1 = <Text>{message}</Text>;
        $[1] = message;
        $[2] = t1;
      } else {
        t1 = $[2];
      }
      return t1;
    }"
  `);
});
