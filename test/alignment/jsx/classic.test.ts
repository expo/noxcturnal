import reactJsx from '@babel/plugin-transform-react-jsx';
import { test } from 'vitest';

import { alignBabelTransform } from '../transform';

test('aligns classic JSX with Babel', () => {
  alignBabelTransform({
    source: `const view = <section id="value">text<span /></section>;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic' },
  });
});

test('aligns classic JSX pragmas with Babel', () => {
  alignBabelTransform({
    source: `/** @jsx h */ /** @jsxFrag Fragment */
const view = <><Widget /></>;`,
    filename: 'input.jsx',
    plugins: [[reactJsx, { pragma: 'h', pragmaFrag: 'Fragment', runtime: 'classic' }]],
    noxcturnal: { jsx: 'classic', jsxPragma: 'h', jsxPragmaFrag: 'Fragment' },
  });
});
