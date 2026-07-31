import reactJsx from '@babel/plugin-transform-react-jsx';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns automatic JSX with Babel', () => {
  alignBabelTransform({
    source: `export const view = <><span value={42} />text</>;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { importSource: 'react', pure: true, runtime: 'automatic' }]],
    noxcturnal: { jsx: 'automatic' },
  });
});

test('aligns Expo development automatic JSX without pure annotations', () => {
  const result = alignBabelTransform({
    source: `export const view = <Widget value={42} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { importSource: 'react', pure: false, runtime: 'automatic' }]],
    noxcturnal: { jsx: 'automatic', jsxPure: false },
  });
  expectNoPureAnnotation(result.babel);
  expectNoPureAnnotation(result.noxcturnal);
});

test('aligns a custom automatic JSX import source', () => {
  alignBabelTransform({
    source: `export const view = <Widget />;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { importSource: '@emotion/react', pure: true, runtime: 'automatic' }]],
    noxcturnal: { jsx: 'automatic', jsxImportSource: '@emotion/react' },
  });
});

test('aligns JSX namespaces when the Babel option permits them', () => {
  alignBabelTransform({
    source: `export const view = <f:image n:attr />;`,
    filename: 'input.jsx',
    plugins: [
      [
        reactJsx,
        { importSource: 'react', pure: true, runtime: 'automatic', throwIfNamespace: false },
      ],
    ],
    noxcturnal: { jsx: 'automatic', jsxThrowIfNamespace: false },
  });
});

test('aligns automatic-runtime key and spread fallback shapes', () => {
  alignBabelTransform({
    source: `export const before = <Widget key={readKey()} {...readProps()} />;
export const after = <Widget {...readProps()} key={readKey()} />;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { importSource: 'react', pure: true, runtime: 'automatic' }]],
    noxcturnal: { jsx: 'automatic' },
  });
});

function expectNoPureAnnotation(code: string) {
  if (/[@#]__PURE__/.test(code)) throw new Error(`unexpected pure annotation:\n${code}`);
}
